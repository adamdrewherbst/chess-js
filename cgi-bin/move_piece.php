<?php

include_once 'dbconnect.php';
include_once 'validate_client.php';
include_once 'pusher_connect.php';
global $pusher, $roomChannel, $gameChannel, $playerID, $gameID;

/*$color = $_GET['color'];
$pieceID = $_GET['piece'];
$oldRow = $_GET['oldRow'];
$oldCol = $_GET['oldCol'];
$newRow = $_GET['row'];
$newCol = $_GET['col'];//*/

lock(PIECE_TBL, 'WRITE');
$moves = $_POST['move'];
foreach($moves as $move) {
	$arr = explode(' ', $move);
	$color = $arr[0];
	$pieceID = $arr[1];
	$oldSquare = explode(',', $arr[2]);
	$newSquare = explode(',', $arr[3]);
	update(PIECE_TBL, 'Row='.$newSquare[0].',Col='.$newSquare[1],
		'Color="'.$color.'" AND GameID='.$gameID.' AND PieceID="'.$pieceID.'"');
	//if a pawn moved to the opposite end, change it to a queen
	if(strncmp($pieceID, 'P', 1) === 0 && (($color === 'Black' && $newSquare[0] === '0') || ($color === 'White' && $newSquare[0] === '7'))) {
		pusher_trigger($gameChannel, 'changePiece',	array('color' => $color, 'piece' => $pieceID, 'newRank' => 'Queen'));
	}
}
unlock();

pusher_trigger($gameChannel, 'movePiece',
	array(
		'move' => $_POST['move'],
		/*'color' => $color,
		'piece' => $pieceID,
		'oldRow' => $oldRow,
		'oldCol' => $oldCol,
		'row' => $newRow,
		'col' => $newCol//*/
	));

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

