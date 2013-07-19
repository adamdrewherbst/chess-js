function filePath(basePath) {
	return '../' + basePath;
}

//what I think is the current game state, so the server can tell me when it changes
var state = {
	nickname:'', //my state.nickname in the game room
	pieces: {user: '', board: ''}, //user and board whose pieces I am using
	game:'', //game I am part of
	color:'', //my team's color, white or black
	opponent: '', //the other player in my game
	opponentPieces: {user: '', board: ''}, //...and the set of pieces he is using
	owner:'', //owner of my game
	turn:'', //player whose turn it is
	moved: false, //if it's my turn, marks whether I have gone already to prevent double-moves
	winner:'', //player who has won my game
	request: '', //game I am requesting to join
	players: {},
	games: {}
};

function isNull(val) {
	return val === null || typeof val === 'undefined' || val === '' || val === 0 || val === '0';
}
function isFalse(val) {
	return isNull(val) || val === false;
}

function do_ajax(action, data, success, additional) {
	var opts = $.extend({
		url: filePath('cgi-bin/'+action+'.php'),
		data: data,
		dataType: 'json',
		success: function(data) {
			if(typeof serverLog === 'function') serverLog(data.response);
			//else console.log('Response: ' + data.response);
			success(data);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('ajax - ' + action + ' - ' + textStatus + ': ' + errorThrown);
			console.info(data);
		}
	}, additional);
	$.ajax(opts);
}

function login(func) { //func is executed after logging in
	var promptStr = 'Enter your nickname.', nickname = '', tries = 0;
	while(state.nickname == '' && tries < 3) {
		state.nickname = nickname = prompt(promptStr);
		tries++;
		if(nickname == '') {
			promptStr = 'Please re-enter.';
			continue;
		}
		console.log('attempting register as ' + state.nickname);
		do_ajax('register', {'name': state.nickname}, function(data) {
			console.info('reg result');
			console.info(data);
			if(!data.success) state.nickname = '';
			else func();
		}, {async: false});
		promptStr = 'Name is already taken. Enter your nickname.';
	}
	return state.nickname != '';
}
function logout(func) {
	do_ajax('logout', {'nickname': state.nickname}, function(data) {
		if(data.success) {
			func();
		}
	}, {});
}

function pieceName($piece) {
	return $piece.attr('color') + ' ' + $piece.attr('rank');
}
function color($square) {
	var row = parseInt($square.attr('row')), col = parseInt($square.attr('col'));
	return ((row + col) % 2 == 0) ? 'black' : 'white';
}
function spaceName(row, col) {
	return String.fromCharCode(65+col) + (row+1)
}

