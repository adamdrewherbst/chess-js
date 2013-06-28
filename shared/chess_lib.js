function filePath(basePath) {
	return '../' + basePath;
}

//what I think is the current game state, so the server can tell me when it changes
var state = {
	nickname:'', //my state.nickname in the game room
	game:'', //game I am part of
	color:'', //my team's color, white or black
	opponent: '', //the other player in my game
	owner:'', //owner of my game
	turn:'', //player whose turn it is
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
			else console.log('Response: ' + data.response);
			success(data);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('ajax - ' + textStatus + ': ' + errorThrown);
		}
	}, additional);
	$.ajax(opts);
}

function login(func) { //func is executed after logging in
	var promptStr = 'Enter your nickname.', nickname = '';
	while(state.nickname == '') {
		state.nickname = nickname = prompt(promptStr);
		if(nickname == '') return false;
		do_ajax('register', {'name': state.nickname}, function(data) {
			console.info('reg result');
			console.info(data);
			if(!data.success) state.nickname = '';
			else func();
		}, {async: false});
		promptStr = 'Name is already taken. Enter your nickname.';
	}
	return true;
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


