<?php
include_once 'dbconnect.php';
include_once 'validate_client.php';
include_once 'pusher_connect.php';
global $player, $gameChannel;
$user = $_GET['user'];
$board = $_GET['board'];

lock(PLAYER_TBL, 'WRITE');
update(PLAYER_TBL, 'User="'.$user.'",Board="'.$board.'"', 'NickName="'.$player.'"');
unlock();

if($gameChannel != null) pusher_trigger($gameChannel, 'changePieces', array('player' => $player, 'user' => $user, 'board' => $board));

succeed(array('success' => true));

?>
