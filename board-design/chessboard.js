var board;

function loginFunc() {
	console.log('loginFunc running');
	$('#user-name').html(state.nickname);
}
function logoutFunc() {
}
function saveFunc(boardName) {
	$('#board-name').html(boardName);
}

$(document).ready(function() {

	login(loginFunc);
	board = new Board(8, 8, 100);
	$('body').append(board.$board);
	board.setEditMode();
	Board.gameBoard = board;
	//$canvas = $('#piece-canvas'); //'<canvas id="piece-canvas"></canvas>');
	//$canvas.detach();
	setPaintPanel($('#piece-canvas-container'));

});
