var pusher, roomChannel, gameChannel;
var board;

function pusher_init() {
	pusher = new Pusher('44822bc310990bb763a1');
	var channel = roomChannel = pusher.subscribe('roomChannel');
	channel.bind('addPlayer', function(data) {
		addPlayer(data.player);
	});
	channel.bind('removePlayer', function(data) {
		removePlayer(data.player);
	});
	channel.bind('addGame', function(data) {
		addGame(data.game);
	});
	channel.bind('setGame', function(data) {
		if(data.hasOwnProperty('inProgress')) {
			setInProgress(data.game, data.inProgress);
		}
	});
	channel.bind('removeGame', function(data) {
		removeGame(data.game);
	});
	
	channel.bind_all(function(event, data) {
		for(var attr in data) {
			serverLog('  ' + attr + ' => ' + data[attr]);
		}
		serverLog('pusher - ' + event);
		serverLog('');
	});
}

function addPlayer(player) {
	if(state.players.hasOwnProperty(player)) return;
	if(state.nickname === player) return;
	$('#player_list').append('<li>' + player + '</li>');
	state.players[player] = 1;
}
function removePlayer(player) {
	$('#player_list li').filter(function() { return this.textContent === player; }).remove();
	delete state.players[player];
}

function addGame(name) {
	if(state.games.hasOwnProperty(name)) return;
	var $gameEntry = $('<li game="'+name+'" inProgress="false">' + name + '</li>');
	var $joinBtn = $('<button type="button">Request to Join</button>');
	$joinBtn.click(function(event) {
		if(state.request != '') {
			alert('already requesting to join game ' + state.request);
			return;
		}
		var game = this.parentNode.firstChild.textContent;
		setState('game', game);
		do_ajax('place_request', {'nickname': state.nickname, 'game': game}, function(data) {
		}, {});
		setState('request', game);
		$('#game_list button').hide();
	});
	$gameEntry.append($joinBtn);
	$('#game_list').append($gameEntry);
	if(name === state.game) $joinBtn.hide();
	state.games[name] = 0; //value is whether it is in progress
}
function setInProgress(game, inProgress) {
	inProgress = !isFalse(inProgress);
	state.games[game] = inProgress;
	var $li = $('#game_list li[game="'+game+'"]');
	$li.attr('inProgress', inProgress ? 'true' : 'false');
	var $joinBtn = $li.children('button');
	if(inProgress) $joinBtn.hide();
	else $joinBtn.show();
}
function removeGame(game) {
	$('#game_list li[game="'+game+'"]').remove();
	delete state.games[game];
}
function joinButton(game) {
	return $('#game_list li[game="'+game+'"]').children('button');
}

function serverLog(str) {
	var arr = str.split('\n'), div = $('#server_msg')[0];
	for(var i = 0; i < arr.length; i++) {
		div.innerHTML = arr[i] + '<br />' + div.innerHTML;
	}
}

function setState(attr, val) {

	if(val == '') switch(attr) {
		case 'game':
			pusher.unsubscribe('game-' + state.game + '-channel');
			gameChannel = undefined;
			endGame();
			break;
	}
	
	state[attr] = val;

	if(val != '') switch(attr) {
		case 'nickname':
			$('#nickname').html(state.nickname);
			$('#create_game').show();
			break;
		case 'game':
			joinButton(state.game).hide();
			$('#create_game').hide();
			$('#leave_game').show();
			gameChannel = pusher.subscribe('game-' + state.game + '-channel');
			if(state.owner === state.nickname) {
				gameChannel.bind('joinRequest', function(data) {
					serverLog(data.player + ' requesting');
					showDialog(data.player + ' is requesting to join your game.', {
						'Accept': function() { processRequest(data.player, 'accept'); },
						'Reject': function() { processRequest(data.player, 'reject'); }
					});
				});
			}
			else {
				gameChannel.bind('processRequest', function(data) {
					if(data.game === state.request && data.player === state.nickname) {
						setState('request', '');
						if(data.accept) {
							setState('owner', data.owner);
							setState('opponent', data.owner);
							beginGame();
						}else {
							setState('game', '');
							$('#game_list li[inProgress="false"] button').show();
						}
					}
				});
			}
			gameChannel.bind('setTurn', function(data) {
				setState('turn', data.player);
			});
			gameChannel.bind('movePiece', function(data) {
				var $piece = $('.piece_img[color="'+data.color+'"][pieceID="'+data.piece+'"]');
				var oldRow = parseInt(data.oldRow), oldCol = parseInt(data.oldCol);
				var row = parseInt(data.row), col = parseInt(data.col), $curSpace = $piece.parent();
				if($curSpace.attr('row') === row && $curSpace.attr('col') === col) return;
				var $space = $('.square[row="'+row+'"][col="'+col+'"]');
				$space.children('.piece_img').detach(); //if this space has an opposing piece, take it!
				$piece.detach().appendTo($space);
				var moveMsg = data.color + ' ' + data.piece + ' from ' + spaceName(oldRow, oldCol) + ' to ' + spaceName(row, col);
				$('#game_alert').html(moveMsg);
			});
			gameChannel.bind_all(function(event, data) {
				for(var attr in data) {
					serverLog('  ' + attr + ' => ' + data[attr]);
				}
				serverLog('game-'+state.game+' - ' + event);
				serverLog('');
			});
			break;
		case 'turn':
			$('#player_turn').html(state.turn);
			//$('#game_alert').html($('#game_alert').html() + ' ' + turnMessage());
			break;
	}
}

function showState() {
	for(var attr in state) {
		serverLog(attr + ' => ' + state[attr]);
	}
	serverLog('State:');
}

function showDialog(message, buttons) {
	$('#dialog_text').html(message);
	$('#dialog_buttons').empty();
	$.each(buttons, function(name, fcn) {
		var click = function() {
			fcn();
			$('#dialog_overlay').css('visibility', 'hidden');
		};
		var props = {click: click, text: name, type: 'button'};
		$('<button></button>', props).appendTo('#dialog_buttons');
	});
	$('#dialog_buttons button').each(function(i) { console.info($(this).click); });
	$('#dialog_overlay').css('visibility', 'visible');
}

function getInitialState() {
	serverLog('getting state');
	console.info('getting initial state');
	do_ajax('get_state', {'nickname': state.nickname}, function(data) {
		console.info(data);
		if(!isNull(data.players)) for(var i = 0; i < data.players.length; i++) addPlayer(data.players[i]);
		if(!isNull(data.games)) for(var i = 0; i < data.games.length; i++) {
			var game = data.games[i];
			addGame(game[0]);
			setInProgress(game[0], game[1]);
		}
	}, {});
}

function loginFunc() {
	setLoggedIn(true);
	console.log('joining as ' + state.nickname);
	setState('nickname', state.nickname);
	//get the initial state of the game room
	getInitialState();
}
function logoutFunc() {
	setLoggedIn(false);
	endGame();
}

function setLoggedIn(isLoggedIn) {
	if(isLoggedIn) {
		$('#logout_msg').hide();
		$('#login_msg').show();
		$('#select_board').show();
		$('#resize_board').show();
		$('#resize_label').show();
	}else {
		$('#login_msg').hide();
		$('#logout_msg').show();
		$('#create_game').hide();
		$('#leave_game').hide();
		$('#select_board').hide();
		$('#resize_board').hide();
		$('#resize_label').hide();
		resetState();
	}
}

function resetState() {
	setState('nickname', '');
	setState('game', '');
	setState('opponent', '');
	setState('owner', '');
	setState('turn', '');
	setState('winner', '');
	setState('request', '');
}

function createGame() {
	if(state.game != '') {
		alert('Already part of a game');
		return;
	}
	do_ajax('new_game', {'nickname': state.nickname}, function(data) {
		$('#create_game').hide();
		$('#leave_game').show();
		setState('owner', state.nickname);
		setState('game', data.game);
	}, {});
}

function leaveGame() {
	if(state.game == '') {
		alert('Not in a game');
		return;
	}
	do_ajax('leave_game', {'nickname': state.nickname}, function(data) {
		$('#leave_game').hide();
		$('#create_game').show();
		setState('game', '');
		endGame();
	}, {});
}

function processRequest(player, decision) {
	do_ajax('process_request', {'nickname': state.nickname, 'name': player, 'decision': decision}, function(data) {
		if(data.success && decision == 'accept') {
			setState('opponent', player);
			beginGame();
		}
	}, {});
}

function toggleSelect($piece) {
	var wasSelected = $piece.attr('select') === 'true';
	unselect();
	if(wasSelected) {
		console.log('was selected');
		return;
	}
	//select the piece
	console.log('selecting ' + pieceName($piece));
	$piece.attr('select', 'true');
	console.log('piece selected = ' + $piece.attr('select'));
	console.log('there are now ' + $('[select="true"]').length + ' selected pieces');
	var $square = $piece.parent('.square');
	$square.attr('select', 'true');
	//highlight all the squares this piece can move to
	var vectors, multiple = true; //possible directions for the chosen piece
	var rank = $piece.attr('rank'), color = $piece.attr('color');
	switch(rank) {
		case 'Pawn': vectors = color === 'White' ? [[0,1],[1,1],[-1,1]] : [[0,-1],[1,-1],[-1,-1]]; multiple = false; break;
		case 'Rook': vectors = [[0,1],[1,0],[0,-1],[-1,0]]; break;
		case 'Knight': vectors = [[1,2],[2,1],[1,-2],[2,-1],[-1,2],[-2,1],[-1,-2],[-2,-1]]; multiple = false; break;
		case 'Bishop': vectors = [[1,1],[1,-1],[-1,1],[-1,-1]]; break;
		case 'Queen': vectors = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]; break;
		case 'King': vectors = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],[2,0],[-2,0]]; multiple = false; break;
	}
	
	//function to see if the next space in a given direction is valid - return value is whether or not to continue checking in that direction
	var $space, row, col; //current space being checked and its coordinates
	var checkNextSpace = function(vec) {
		row = parseInt($space.attr('row')) + vec[1];
		col = parseInt($space.attr('col')) + vec[0];
		$space = $('.square[row=' + row + '][col=' + col + ']');
		console.log('  checking space ' + row + ',' + col);
		if($space.length < 1) return false; //outside the board
		var $occupant = $space.children('.piece_img');
		if($occupant.length > 0) {
			if($occupant.attr('color') === color) return false; //has one of my pieces
			if(rank === 'Pawn' && vec[0] === 0) return false; //pawn can only take when moving diagonally
		}
		else if(rank === 'Pawn' && vec[0] !== 0) return false; //pawn can only move diagonally when taking
		$space.attr('valid', 'true');
		if($occupant.length > 0) return false; //has an opponent's piece - so it is valid, but can't move past it

		//allow pawn to move 2 spaces on first move
		if(rank === 'Pawn' && ((color === 'White' && row === 2) || (color === 'Black' && row === 5))) return true; 
		return multiple;
	};

	for(var i = 0; i < vectors.length; i++) {
		var vec = vectors[i];
		console.log('checking vector ' + vec[0] + ',' + vec[1]);
		$space = $square;
		while(checkNextSpace(vec));
	}
}

function unselect() {
	$('.piece_img[select="true"]').attr('select', 'false');
	$('.square[select="true"]').attr('select', 'false');
	//un-highlight the spaces this piece could move to
	$('.square[valid="true"]').attr('valid', 'false');
}
function getSelected() {
	return $('.piece_img[select="true"]');
}
function getValid() {
	return $('.square[valid="true"]');
}

function beginGame() {
	state.color = state.nickname === state.owner ? 'Black' : 'White';
	$('#player_me').html(state.nickname);
	$('#player_opponent').html(state.opponent);
	$('#game_info').css('visibility', 'visible');
	$('#game_alert').html('Let the game begin!');
	$('#board_panel').append(board.$board);
}
function turnMessage() {
	return 'It is now ' + (state.turn === state.nickname ? 'YOUR' : state.turn+"'s") + ' turn.';
}
function endGame() {
	$('#game_info').css('visibility', 'hidden');
	board.$board.detach();
}

function debug() {
	console.log(eval($('#debug_text').val()));
}

$(document).ready(function() {
	
	pusher_init();
	board = new Board(8, 8, 100);
	board.setPlayMode();
	Board.gameBoard = board;
	addResizeSlider($('#controls'));
	$('#dialog_overlay').css('visibility', 'hidden');
	$('#game_info').css('visibility', 'hidden');
	setLoggedIn(false);
	
});

