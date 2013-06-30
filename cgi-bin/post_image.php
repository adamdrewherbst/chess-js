<?php

include_once 'dbconnect.php';
//include_once 'validate_client.php';

addResponse('PHP file data:');

foreach($_FILES as $field => $value) {
	addResponse($field.': '.var_export($value, TRUE));
}
foreach($_POST as $field => $value) {
	addResponse($field.': '.var_export($value, TRUE));
}

$client = $_SERVER['REMOTE_ADDR'];
$filename = $_FILES['file-0']['name'];
$tmpname = $_FILES['file-0']['tmp_name'];
$extension = pathinfo($filename, PATHINFO_EXTENSION);
$basename = filePath('images/client-' . $client . '-tmp-');
$ind = 0;
addResponse('finding next available filename');
do {
	$savename = $basename . strval($ind) . '.' . $extension;
	$ind++;
}while(file_exists($savename));
move_uploaded_file($tmpname, $savename);
addResponse('saved ' . $filename . ' to ' . $savename);

$srcname = str_replace($_SERVER['DOCUMENT_ROOT'] . '/chess/', '', $savename);
succeed(array('success' => true, 'filename' => $srcname));

?>

