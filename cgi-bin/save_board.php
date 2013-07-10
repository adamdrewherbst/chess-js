<?php

include_once 'dbconnect.php';
$file = fopen(filePath('images/debug.txt'), 'w');
fwrite($file, 'aloha amigo');
fclose($file);
include_once 'validate_client.php';
global $player, $response;

addResponse('saving board');

$user = $player;
addResponse('user = ' . $user);
$board = $_POST['board'];
addResponse('board = ' . $board);
$contents = $_POST['contents'];
addResponse('contents = ' . $contents);
$basefile = 'images/' . urlencode($user . '_' . $board) . '_thumb.png';
$file = __DIR__ . '/' . $basefile;
addResponse('file = ' . $basefile);

//render the board div to a thumbnail png file
//include_once '/var/www/html/chessboard/painty/painty.php';

//save the file reference to the DB
lock(BOARD_TBL, 'WRITE');
insert(BOARD_TBL, 'User,Board,ThumbFile', '("'.$user.'","'.$board.'","'.$basefile.'")');
unlock();

succeed(array('success' => true));

?>

