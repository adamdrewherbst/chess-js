<?php

include_once 'dbconnect.php';
//include_once 'validate_client.php';

$user = $_GET['user'];
$board = $_GET['board'];

$pieces = array();
$piecesList = multiple_list('Color,Rank,Filename', DESIGN_TBL, 'User="'.$user.'" AND Board="'.$board.'"');
foreach($piecesList as $row) {
	$basefile = $row[2];
	$svgfile = filePath($basefile . '.svg');
	$file = fopen($svgfile, 'r');
	$svg = fread($file, filesize($svgfile));
	fclose($file);
	$jsonfile = filePath($basefile . '.json');
	$file = fopen($jsonfile, 'r');
	$json = fread($file, filesize($jsonfile));
	fclose($file);
	$pieces[$row[0]][$row[1]] = array($basefile.'.svg', $svg, $json);
}

succeed(array('pieces' => $pieces));

?>
