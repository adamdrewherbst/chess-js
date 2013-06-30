<?php

include_once 'dbconnect.php';
include_once 'validate_client.php';
global $mysqli, $response, $player, $playerID;

//add the game to the game table
insert(GAME_TBL, 'Name,InProgress', '("' . $player . '", FALSE)');
$gameID = single('ID', GAME_TBL, 'Name="'.$player.'"');

//add all the pieces to the piece table
lock(PIECE_TBL, 'WRITE');
foreach(array('White', 'Black') as $color) {
	for($i = 0; $i < 16; $i++) {
		if($i > 7) $name = 'P'.strval($i-7);
		else {
			$name = (int)($i / 4) == 0 ? 'K' : 'Q';
			switch($i) {
				case 0: case 7: $name .= 'R'; break;
				case 1: case 6: $name .= 'K'; break;
				case 2: case 5: $name .= 'B'; break;
				default: break;
			}
		}
		$row = (int)($i / 8);
		$col = $i % 8;
		if($color === 'Black') $row = 7 - $row;
		insert(PIECE_TBL, 'GameID,Color,PieceID,Row,Col', '('.$gameID.',"'.$color.'","'.$name.'",'.strval($row).','.strval($col).')');
	}
}
unlock();

//update this player to be the owner of this game
update(PLAYER_TBL, 'GameID='.$gameID, 'ID='.$playerID);
insert(ROLE_TBL, 'GameID,Role,PlayerID',
	'('.$gameID.',"TURN",NULL),('.$gameID.',"WINNER",NULL),('.$gameID.',"OWNER","' . $playerID . '")');

include_once 'pusher_connect.php';
global $pusher, $roomChannel;
pusher_trigger($roomChannel, 'addGame', array('game' => $player));

succeed(array('success' => true, 'game' => $player, 'gameID' => $gameID));

?>
