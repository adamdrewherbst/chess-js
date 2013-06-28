<?php

include_once 'dbconnect.php';
global $mysqli, $response;

$tables = array(PIECE_TBL, PLAYER_TBL, GAME_TBL, ROLE_TBL);
if($_GET['all']) {
	array_push($tables, BOARD_TBL);
	array_push($tables, DESIGN_TBL);
}

foreach($tables as $table) {
	$query = 'SELECT * FROM '.$table;
	$result = $mysqli->query($query);
	addResponse($table.' initially has '.$result->num_rows.' rows');
	$result->free();
	$query = 'DELETE FROM '.$table;
	$mysqli->query($query);
	$query = 'SELECT * FROM '.$table;
	$result = $mysqli->query($query);
	addResponse($table.' now has '.$result->num_rows.' rows');
	$result->free();
}

$mysqli->close();
echo str_replace(PHP_EOL, '<br/>', $response);

?>
