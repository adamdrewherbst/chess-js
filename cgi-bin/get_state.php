<?php

include_once 'dbconnect.php';
include_once 'validate_client.php';
global $player, $playerID, $gameName, $gameID;

$players = multiple('NickName', PLAYER_TBL, 'ID > 0');
$games = multiple_list('Name,InProgress', GAME_TBL, 'ID > 0');

succeed(array('players' => $players, 'games' => $games));

?>
