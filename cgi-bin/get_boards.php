<?php

include_once 'dbconnect.php';
include_once 'validate_client.php';

$boardsList = multiple_list('User,Board,ThumbFile', BOARD_TBL, 'ID > 0');
$boards = array();
foreach($boardsList as $board) {
	$boards[$board[0]][$board[1]] = $board[2];
}

succeed(array('boards' => $boards));

?>

