<?php

include_once 'dbconnect.php';
include_once 'validate_client.php';
include_once 'pusher_connect.php';
global $mysqli, $response, $player, $playerID, $pusher, $roomChannel, $gameChannel;

$game = $_GET['game'];
$gameID = single('ID', GAME_TBL, 'Name="'.$game.'"');

lock(PLAYER_TBL, 'WRITE');
update(PLAYER_TBL, 'GameRequest='.$gameID, 'ID='.$playerID);
unlock();

pusher_trigger(game_channel($game), 'joinRequest', array('player' => $player));

succeed(array('success' => true));

?>
