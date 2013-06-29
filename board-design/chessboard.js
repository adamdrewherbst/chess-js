var board;

function loginFunc() {
	setLoggedIn(true);
}
function logoutFunc() {
	setLoggedIn(false);
}
function saveFunc(boardName) {
	$('#board-name').html(boardName);
}

function setLoggedIn(isLoggedIn) {
	if(isLoggedIn) {
		$('#logout_msg').hide();
		$('#login_msg').show();
		$('#controls').show();
		$('#instructions').show();
		$('#board_panel').show();
		setState('nickname', state.nickname);
	}else {
		$('#login_msg').hide();
		$('#logout_msg').show();
		$('#controls').hide();
		$('#instructions').hide();
		$('#board_panel').hide();
		setState('nickname', '');
		if(Board.gameBoard) Board.gameBoard.reset();
		$('#board-name').html('Untitled');
	}
}

function setState(attr, val) {

	if(val == '') switch(attr) {
		default: break;
	}
	
	state[attr] = val;

	if(val != '') switch(attr) {
		case 'nickname':
			$('#nickname').html(state.nickname);
			break;
		default: break;
	}
}


$(document).ready(function() {

	setLoggedIn(false);
	board = new Board(8, 8, 100);
	$('#board_panel').append(board.$board);
	board.setEditMode();
	Board.gameBoard = board;
	addResizeSlider($('#controls'));
	setPaintPanel($('#piece-canvas-container'));
	login(loginFunc);

});
