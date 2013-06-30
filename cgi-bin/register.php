<?php

include_once 'dbconnect.php';
include_once 'init_tables.php';
global $mysqli, $response;

$player = $_GET['name'];
$client = $_SERVER['REMOTE_ADDR'];

addResponse('attempting to register ' . $player . ' at ' . $client);

$existingClient = single('ID', PLAYER_TBL, 'NickName="'.$player.'"');
if($existingClient != null) fail('Name ' . $player . ' is already taken');
lock(PLAYER_TBL, 'WRITE');
insert(PLAYER_TBL, 'NickName,ClientIP', '("'.$player.'","'.$client.'")');
unlock();

include_once 'pusher_connect.php';
global $pusher, $roomChannel;
pusher_trigger($roomChannel, 'addPlayer', array('player' => $player));

succeed(array('success' => true));

?>
