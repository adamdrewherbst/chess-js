<?php

include_once 'dbconnect.php';
include_once 'validate_client.php';

$user = $_GET['user'];
$board = $_GET['board'];

$pieces = array();
$piecesList = multiple_list('Color,Rank,Filename', DESIGN_TBL, 'User="'.$user.'" AND Board="'.$board.'"');
foreach($piecesList as $row) {
	$pieces[$row[0]][$row[1]] = $row[2];
}

succeed(array('pieces' => $pieces));

?>
