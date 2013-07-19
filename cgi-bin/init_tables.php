<?php //assumes dbconnect has been called

global $mysqli, $response;

function initTable($tbl, $cols, $keycol, $extra = '') {
	global $mysqli, $response;
	
	$query = 'CREATE TABLE ' . $tbl . '(';
	foreach($cols as $col) {
		$query .= $col['name'] . ' ' . strtoupper($col['type']) . ', ';
	}
	$query .= 'PRIMARY KEY (' . $keycol . ')';
	if(strlen($extra) > 0) $query .= ', ' . $extra;
	$query .= ')';
	if($mysqli->query($query) === TRUE) addResponse("Table ".$tbl." successfully created.\n");
	else addResponse("Could not create table ".$tbl.': '.$mysqli->error.' ['.$mysqli->errno.']');
}

//board design table
$cols = array(
	array('name' => 'ID', 'type' => 'SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT'),
	array('name' => 'User', 'type' => 'VARCHAR(30)'),
	array('name' => 'Board', 'type' => 'VARCHAR(30)'),
	array('name' => 'ThumbFile', 'type' => 'VARCHAR(100)'),
);
initTable(BOARD_TBL, $cols, 'ID', 'UNIQUE(User,Board)');

//piece design table
$cols = array(
	array('name' => 'ID', 'type' => 'SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT'),
	array('name' => 'User', 'type' => 'VARCHAR(30)'),
	array('name' => 'Board', 'type' => 'VARCHAR(30)'),
	array('name' => 'Color', 'type' => 'VARCHAR(25)'),
	array('name' => 'Rank', 'type' => 'VARCHAR(25)'),
	array('name' => 'Filename', 'type' => 'VARCHAR(100)'),
);
initTable(DESIGN_TBL, $cols, 'ID', 'UNIQUE(User,Board,Color,Rank)');

//game table
$cols = array(
	array('name' => 'ID', 'type' => 'SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT'),
	array('name' => 'Name', 'type' => 'VARCHAR(30)'),
	array('name' => 'InProgress', 'type' => 'BOOL'),
);
initTable(GAME_TBL, $cols, 'ID', 'UNIQUE(Name)');

//player table
$cols = array(
	array('name' => 'ID', 'type' => 'SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT'),
	array('name' => 'NickName', 'type' => 'VARCHAR(30)'),
	array('name' => 'ClientIP', 'type' => 'VARCHAR(45)'), //allow for IPv6
	array('name' => 'GameID', 'type' => 'SMALLINT UNSIGNED'),
	array('name' => 'Color', 'type' => 'VARCHAR(30)'),
	array('name' => 'GameRequest', 'type' => 'SMALLINT UNSIGNED'),
	array('name' => 'User', 'type' => 'VARCHAR(30)'),
	array('name' => 'Board', 'type' => 'VARCHAR(30)'),
);
initTable(PLAYER_TBL, $cols, 'ID', 'UNIQUE(NickName)');

//role table
$cols = array(
	array('name' => 'GameID', 'type' => 'SMALLINT UNSIGNED'),
	array('name' => 'Role', 'type' => 'VARCHAR(30)'),
	array('name' => 'PlayerID', 'type' => 'SMALLINT UNSIGNED'),
);
initTable(ROLE_TBL, $cols, 'GameID,Role');

//table for a player's pieces within a game
$cols = array(
	array('name' => 'GameID', 'type' => 'SMALLINT UNSIGNED'),
	array('name' => 'Color', 'type' => 'VARCHAR(30)'),
	array('name' => 'PieceID', 'type' => 'VARCHAR(5)'),
	array('name' => 'Row', 'type' => 'TINYINT UNSIGNED'),
	array('name' => 'Col', 'type' => 'TINYINT UNSIGNED'),
);
initTable(PIECE_TBL, $cols, 'GameID,Color,PieceID');

//echo str_replace(PHP_EOL, '<br/>', $response);

?>
