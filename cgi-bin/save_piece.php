<?php

include_once 'dbconnect.php';
include_once 'validate_client.php';

$user = $_POST['user'];
$board = $_POST['board'];
$color = $_POST['color'];
$rank = $_POST['rank'];
$imageSVG = $_POST['imageSVG'];
$imageJSON = $_POST['imageJSON'];

if($board != '') {
	//save the SVG and JSON files - SVG as the image, JSON for loading the editing canvas
	$basefile = 'images/' . urlencode($user.'_'.$board.'_'.$color.'_'.$rank);
	$filename = filePath($basefile);
	$file = fopen($filename.'.json', 'w');
	fwrite($file, $imageJSON);
	fclose($file);
	$file = fopen($filename.'.svg', 'w');
	fwrite($file, $imageSVG);
	fclose($file);
	//reference the filename for this user/board combo in the database
	lock(DESIGN_TBL, 'WRITE');
	if(insert(DESIGN_TBL, 'User,Board,Color,Rank,Filename',
		'("'.$user.'","'.$board.'","'.$color.'","'.$rank.'","'.$basefile.'")', false) === false)
			update(DESIGN_TBL, 'Filename="'.$basefile.'"', 'User="'.$user.'" AND Board="'.$board.'" AND Color="'.$color.'" AND Rank="'.$rank.'"');
	unlock();
}

succeed(array('jsonGot' => $imageJSON, 'filename' => $basefile.'.svg'));

?>

