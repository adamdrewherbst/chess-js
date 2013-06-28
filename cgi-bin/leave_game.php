<?php

global $indirect; //if set, we are being called from logout.php, so we don't need to clean up the connection

include_once 'dbconnect.php';
include_once 'validate_client.php';
include_once 'pusher_connect.php';
global $mysqli, $response, $player, $playerID, $gameID, $gameName, $isOwner, $pusher, $roomChannel, $gameChannel;

//check if this player is even in a game
if($gameID === NULL) {
	if($indirect) return;
	else fail('You are not part of a game');
}

//check if this is the last player in the game
$nextPlayer = NULL;
$othersPresent = false;
lock(PLAYER_TBL, 'WRITE');
$players = multiple('NickName', PLAYER_TBL, 'GameID='.$gameID);
foreach($players as $p) if($p !== $player) {
	$nextPlayer = $p;
	$othersPresent = true;
	addResponse('still present: ' . $p . ' != ' . $player);
	break;
}
update(PLAYER_TBL, 'GameID=NULL,GameRequest=NULL', 'ID='.$playerID);
unlock();
if($othersPresent) {
	lock(ROLE_TBL, 'WRITE');
	//if I am the game owner, advance that to the next player
	if($isOwner) {
		update(ROLE_TBL, 'PlayerID="'.$nextPlayer.'"', 'GameID='.$gameID.' AND Role="OWNER"');
	}
	//if it's my turn, advance that to the next player
	if(single('PlayerID', ROLE_TBL, 'GameID='.$gameID.' AND Role="TURN"') === $player) {
		update(ROLE_TBL, 'PlayerID="'.$nextPlayer.'"', 'GameID='.$gameID.' AND Role="TURN"');
	}
	unlock();
	$pusher->trigger($gameChannel, 'playerLeave', array('player' => $player));
}
else { //delete this game altogether
	lock(GAME_TBL.','.ROLE_TBL, 'WRITE');
	delete(ROLE_TBL, 'GameID='.$gameID);
	delete(GAME_TBL, 'ID='.$gameID);
	unlock();
	$pusher->trigger($roomChannel, 'removeGame', array('game' => $gameName));
}

if(!$indirect) succeed(array('success' => true));

?>
