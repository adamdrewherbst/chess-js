<?php

include_once 'dbconnect.php';
include_once 'validate_client.php';
include_once 'pusher_connect.php';
global $pusher, $roomChannel, $gameChannel, $playerID, $gameID;

$color = $_GET['color'];
$pieceID = $_GET['piece'];
$newRow = $_GET['row'];
$newCol = $_GET['col'];

lock(PIECE_TBL, 'WRITE');
update(PIECE_TBL, 'Row='.strval($newRow).',Col='.strval($newCol),
	'Color="'.$color.'" AND GameID='.$gameID.' AND PieceID="'.$pieceID.'"');
unlock();

pusher_trigger($gameChannel, 'movePiece', array('color' => $color, 'piece' => $pieceID, 'row' => $newRow, 'col' => $newCol));

//get the next player in the table, or first if there is no next
$nextID = single('MIN(ID)', PLAYER_TBL, 'GameID='.$gameID.' AND ID > '.$playerID);
if($nextID == NULL) $nextID = single('ID', PLAYER_TBL, 'GameID='.$gameID.' ORDER BY ID LIMIT 1');
if($nextID == NULL) fail('Could not get next player index');
lock(ROLE_TBL, 'WRITE');
update(ROLE_TBL, 'PlayerID="'.$nextID.'"', 'GameID='.$gameID.' AND Role="TURN"');
unlock();

$nextPlayer = single('NickName', PLAYER_TBL, 'ID='.$nextID);
pusher_trigger($gameChannel, 'setTurn', array('player' => $nextPlayer));

succeed(array('success' => true));

?>

