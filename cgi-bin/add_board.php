<?php

include_once 'dbconnect.php';
global $response;

$user = $_GET['user'];
$board = $_GET['board'];

lock(BOARD_TBL.','.DESIGN_TBL, 'WRITE');
insert(BOARD_TBL, 'User,Board,ThumbFile', '("'.$user.'","'.$board.'","none")');
foreach(array('Black', 'White') as $color) {
	foreach(array('Pawn', 'Rook', 'Knight', 'Bishop', 'Queen', 'King') as $rank) {
		$filename = 'images/' . urlencode($user.'_'.$board.'_'.$color.'_'.$rank);
		if(file_exists(filePath($filename.'.svg')))
			insert(DESIGN_TBL, 'User,Board,Color,Rank,Filename', '("'.$user.'","'.$board.'","'.$color.'","'.$rank.'","'.$filename.'")');
	}
}
unlock();

echo 'Hello<br/>' . str_replace(PHP_EOL, '<br/>'.PHP_EOL, $response);

?>

