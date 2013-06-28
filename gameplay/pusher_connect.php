<?php

global $gameID, $gameName; //assumes validate_client has been called

require('../pusher/vendor/pusher/pusher-php-server/lib/Pusher.php');

$app_id = '43469';
$key = '44822bc310990bb763a1';
$secret = '3ac67d9db7ddd89e28ce';

$pusher = new Pusher($key, $secret, $app_id);
$roomChannel = 'roomChannel';
function game_channel($game) {
	return 'game-'.$game.'-channel';
}
if($gameName != null) $gameChannel = game_channel($gameName);

?>
