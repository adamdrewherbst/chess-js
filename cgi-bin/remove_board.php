<?php

include_once 'dbconnect.php';
$user = $_GET['user'];
$board = $_GET['board'];
lock(BOARD_TBL.','.DESIGN_TBL, 'WRITE');
delete(BOARD_TBL, 'User="'.$user.'" AND Board="'.$board.'"');
delete(DESIGN_TBL, 'User="'.$user.'" AND Board="'.$board.'"');
unlock();

?>
