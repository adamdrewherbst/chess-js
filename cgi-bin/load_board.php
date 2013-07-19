<?php

include_once 'dbconnect.php';
$validate_lax = true;
include_once 'validate_client.php';
global $player, $gameName;

$user = $_GET['user'];
$board = $_GET['board'];
$replace = $_GET['replace'];

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

//if user is setting his own board to these pieces, not just retrieving his opponent's pieces, then update his DB entry
if($replace && $player != '') {
	lock(PLAYER_TBL, 'WRITE');
	update(PLAYER_TBL, 'User="'.$user.'",Board="'.$board.'"', 'NickName="'.$player.'"');
	unlock();
	include_once 'pusher_connect.php';
	global $gameChannel;
	if($gameChannel != null) pusher_trigger($gameChannel, 'changePieces', array('player' => $player, 'user' => $user, 'board' => $board));
}

succeed(array('pieces' => $pieces));

?>

