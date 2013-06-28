<?php

include_once 'dbconnect.php';
include_once 'validate_client.php';

$user = $_POST['user'];
$board = $_POST['board'];
$color = $_POST['color'];
$rank = $_POST['rank'];
$imageSVG = $_POST['imageSVG'];
$imageJSON = $_POST['imageJSON'];

addResponse('hello');
addResponse('type of left - ' . $imageJSON['objects'][0]['left'] . ' - is ' . gettype($imageJSON['objects'][0]['left']));

$basefile = 'images/' . $user.'_'.$board.'_'.$color.'_'.$rank;
$filename = filePath($basefile);
$file = fopen($filename.'.json', 'w');
fwrite($file, $imageJSON);
fclose($file);
$file = fopen($filename.'.svg', 'w');
fwrite($file, $imageSVG);
fclose($file);

lock(DESIGN_TBL, 'WRITE');
if(insert(DESIGN_TBL, 'User,Board,Color,Rank,Filename',
	'("'.$user.'","'.$board.'","'.$color.'","'.$rank.'","'.$basefile.'")', false) === false)
		update(DESIGN_TBL, 'Filename="'.$basefile.'"', 'User="'.$user.'" AND Board="'.$board.'" AND Color="'.$color.'" AND Rank="'.$rank.'"');
unlock();

succeed(array('jsonGot' => $imageJSON, 'filename' => $basefile.'.svg'));

?>
