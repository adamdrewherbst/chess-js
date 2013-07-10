<?php

$roomChannel = 'roomChannel';

global $gameID, $gameName; //assumes validate_client has been called
function game_channel($game) {
	return 'game-'.$game.'-channel';
}
if($gameName != null) $gameChannel = game_channel($gameName);

function pusher_trigger($channel, $event, $data) {
	if(!USE_PUSHER) return;
	global $pusher;
	$pusher->trigger($channel, $event, $data);
}
if(!USE_PUSHER) return;

require('../../pusher/vendor/pusher/pusher-php-server/lib/Pusher.php');

$app_id = '43469';
$key = '44822bc310990bb763a1';
$secret = '3ac67d9db7ddd89e28ce';

addResponse('initializing pusher');
$pusher = new Pusher($key, $secret, $app_id);

?>

