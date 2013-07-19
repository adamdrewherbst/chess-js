var colors = ['Black', 'White'], ranks = ['Pawn', 'Rook', 'Knight', 'Bishop', 'Queen', 'King'];
var blankPieceFile = filePath('images/BLANK_PIECE.svg'), blankPiece = '';

//constructor
function Board(rows, cols, squareLength) {

	//make sure we have the SVG code for the default piece image
	if(blankPiece == '') $.ajax({
		url: blankPieceFile,
		async: false,
		success: function(data) {
			var svg = data.activeElement.outerHTML;
			blankPiece = svg;
		}
	});
	
	//set up the board
	this.numPlayers = 2;
	this.rows = rows;
	this.cols = cols;
	this.squareLength = squareLength;
	this.initSquareLength = squareLength; //board may be resized by the user
	this.showingOwnPieces = {};
	this.colorSwitched = {};
	for(var c = 0; c < colors.length; c++) {
		this.showingOwnPieces[colors[c]] = true; //whether my or my opponent's pieces are being shown
		this.colorSwitched[colors[c]] = false; //whether black and white have been switched for the given team
	}
	this.$board = $('<div class="board_outer"></div>');
	for(var n = 0; n < rows; n++) this.$board.append('<div class="board_row"></div>');
	for(var n = 0; n < rows*cols; n++) {
		//generate the square
		var col = n % cols, row = Math.floor(n / cols);
		var tag = '<div class="square ';
		//tag += ((row + col) % 2 == 0) ? 'black' : 'white';
		if(col == 0) tag += ' left';
		else if(col == cols-1) tag += ' right';
		if(row == 0) tag += ' top';
		else if(row == rows-1) tag += ' bottom';
		tag += '"></div>';
		var $square = $(tag);
		$square.attr('row', ''+row);
		$square.attr('col', ''+col);
		$square.attr('select', 'false');
		$square.attr('valid', 'false');
		$square.css('width', ''+squareLength+'px');
		$square.css('height', ''+squareLength+'px');
		
		//determine if a piece belongs here
		if(row < 2 || row > rows-3) {
			var team = row < 2 ? 'White' : 'Black', pieceID;
			if(row == 1 || row == rows-2) {
				piece = 'Pawn';
				pieceID = 'P' + (col+1);
			}
			else {
				switch(col) {
					case 0:
					case cols-1:
						piece = 'Rook';
						break;
					case 1:
					case cols-2:
						piece = 'Knight';
						break;
					case 2:
					case cols-3:
						piece = 'Bishop';
						break;
					case 3:
						piece = 'King';
						break;
					case cols-4:
						piece = 'Queen';
						break;
					default:
						piece = 'Unknown';
						break;
				}
				if(Math.floor(col / 4) === 0) pieceID = 'K';
				else pieceID = 'Q';
				if(piece !== 'King' && piece !== 'Queen') pieceID += piece.charAt(0);
			}
			
			var $piece = $('<div></div>');
			$piece.attr('class', 'piece_img'); //addClass('piece_img');
			$piece.attr('imgFile', blankPieceFile);
			$piece.attr('color', team);
			$piece.attr('rank', piece);
			$piece.attr('piece', team + ' ' + piece);
			$piece.attr('title', team + ' ' + piece);
			$piece.attr('pieceID', pieceID);
			$piece.append($(blankPiece));
			$square.append($piece);
		}
		this.$board.children(':nth-child('+(row+1)+')').append($square);
	}
	this.$board.append('<div class="board-taken-pieces"></div>');
	this.boardObj = new BoardObj(this);
}

//static members
Board.gameBoard = null; //should be set by the main script

//methods
Board.prototype.setSquareLength = function(squareLength) {
	var _self = this;
	_self.squareLength = squareLength;
	_self.find('.square').css({
		width: _self.squareLength + 'px',
		height: _self.squareLength + 'px'
	});
	_self.find('.board_row').css({
		width: (_self.cols * _self.squareLength) + 'px'
	});
};

Board.prototype.setEditMode = function() {
	this.find('.piece_img').each(function(i) {
		setEditMode($(this));
	});
};
function setEditMode($piece) {
	$piece.tooltip({
		track: true
	});//*/
	
	//allow the user to edit the piece image by clicking on this square
	var $dialog = $('#piece-window');
	$piece.click(function(event) {
		var $tgt = $(this);
		var pieceTitle = $tgt.attr('piece'), pieceColor = $tgt.attr('color'), pieceRank = $tgt.attr('rank');
		console.log('making dialog ' + pieceTitle + ' for ' + $tgt[0].tagName + ' .' + $tgt[0].className);
		$dialog.dialog({
			dialogClass: 'piece-window-dialog',
			title: pieceTitle,
			position: 'top',
			modal: true,
			width: 700,
			height: 550,
			maxWidth: 1000,
			maxHeight: 1000,
			closeOnEscape: true,
			buttons: [
				{
					text: 'Cancel',
					click: function() {
						$dialog.dialog('close');
					}
				},
				{
					text: 'Save',
					click: function() {
						var svg = fabricCanvas.toSVG(), json = fabricCanvas.toJSON();
						//console.info('JSON SENDING:');
						//console.info(json);
						do_ajax('save_piece', {
								nickname: state.nickname, user: state.nickname, board: Board.gameBoard.boardName, color: pieceColor, rank: pieceRank,
								imageSVG: svg, imageJSON: JSON.stringify(json)
							},
							function(data) {
								//console.info('JSON GOT:');
								//console.log(data.response);
								//console.info(data.jsonGot);
								//console.info(data);
								//insert the returned svg file into all squares of the same color and rank
								var $pieces = $('.piece_img[piece="'+pieceTitle+'"]');
								$pieces.empty().append($(svg));
								$pieces.attr('imgFile', filePath(data.filename));
								$pieces.data('imgSVG', svg);
								$pieces.data('imgJSON', json);
								$dialog.dialog('close');
							}, {type: 'POST'});
					}
				},
			],
			close: function(event, ui) {
				wPaintCanvas.removeMyListeners();
				fabricCanvas.removeMyListeners();
			}
		});
		wPaintCanvas.calcOffset();
		fabricCanvas.calcOffset();

		//load this piece's current image into the canvas
		/*var group = [];
		fabricCanvas.clear();
		console.log('fabric loading ' + $tgt.attr('src'));
		fabric.loadSVGFromURL($tgt.attr('src'), function(objects,options) {
			//fabricCanvas.add(objects);
			//var loadedObjects = new fabric.Group(group);
			//fabricCanvas.add(loadedObjects);
			fabricCanvas.renderAll();
			},function(item, object) {
				object.set('id',item.getAttribute('id'));
				object.set({
					top: 100,
					left: 100
				});
				group.push(object);
				console.log('got object:');
				console.info(object);
				fabricCanvas.add(object);
			});
		fabricCanvas.renderAll();//*/

		fabricCanvas.clear();
		var curImg = $tgt.data('imgJSON');
		if(curImg) {
			fabricCanvas.loadFromJSON(curImg);
		}
		fabricCanvas.renderAll();
		wPaintCanvas.mainMenu.set_mode(wPaintCanvas.mainMenu, wPaintCanvas, 'Pencil');
		//console.info($(wPaintCanvas.canvas).offset());
		//console.info($(fabricCanvas.upperCanvasEl).offset());
	});
}

Board.prototype.setPlayMode = function() {
	var _self = this;
	_self.find('.square').each(function(i) {
		_self.setSquarePlayMode($(this));
	});
};
Board.prototype.setSquarePlayMode = function($square) {
	var _self = this;
	var $piece = $square.children('.piece_img');
	if($piece.length > 0) $piece.click(function(event) {
		var $this = $(this);
		//console.log(pieceName($this) + ' clicked');
		if(_self.numPlayers === 1 || (state.turn === state.nickname && $this.attr('color') === state.color && !state.moved)) {
			//if king is castling, he may move to a space where his own rook is - so when the rook is clicked, pass the event to it's square
			var $parent = $this.parent('.square');
			if($parent.attr('valid') === 'true') {
				console.log('passing click from piece to square');
				$parent.click();
				return true;
			}
			//otherwise the user is selecting this piece to see what squares are available to move to
			_self.toggleSelect($this);
			return true;
		}
		else {
			console.log('not my turn/piece');
			return true;
		}
	});
	$square.click(function(event) {
		if(state.moved) return;
		var $selectedPiece = $('.piece_img[select="true"]'), $selectedSquare = $('.square[select="true"]'), $this = $(this);
		if($selectedPiece.length < 1 || $this.attr('valid') !== 'true') return;
		var newRow = parseInt($this.attr('row')), newCol = parseInt($this.attr('col'));
		_self.doMove($selectedPiece, newRow, newCol);
		_self.unselect();
	});
};

//perform a move including all logic eg. castling, pawns becoming queens, broadcasting move via AJAX
Board.prototype.doMove = function($piece, newRow, newCol) {
	var _self = this;
	var $oldSpace = $piece.parent('.square'), oldRow = parseInt($oldSpace.attr('row')), oldCol = parseInt($oldSpace.attr('col'));

	//check if the king is castling - if so, move the rook first to make sure the space is free for the king
	if($piece.attr('rank') === 'King' && Math.abs(newCol - oldCol) === 2) {
		var dir = newCol-oldCol > 0 ? 1 : -1;
		for(var c = oldCol+dir; c >= 0 && c < _self.rows; c += dir) {
			var $curSpace = _self.find('.square[row="'+oldRow+'"][col="'+c+'"]');
			var $occ = $curSpace.find('.piece_img');
			if($occ.length > 0 && $occ.attr('color') === $piece.attr('color') && $occ.attr('rank') === 'Rook') {
				console.log('found rook at ' + oldRow + ',' + c + ' - moving to ' + oldRow + ',' + (oldCol+dir));
				_self.movePiece($occ, oldRow, oldCol+dir, true);
				break;
			}
		}
	}

	//go ahead and move the piece on my board - assumes the AJAX call will succeed so that my board is synced with the other player's
	_self.movePiece($piece, newRow, newCol, true);
	//make the AJAX call for all pieces moved on this turn (2 if castling)
	if(_self.numPlayers > 1) {
		do_ajax('move_piece', {'nickname': state.nickname, 'move': _self.boardObj.currentMove},
			//'color': state.color, 'piece': $piece.attr('pieceID'), 'oldRow': oldRow, 'oldCol': oldCol,	'row': newRow, 'col': newCol},
			function(data){}, {type: 'POST'});
	}
	
	//add this move to the move history
	_self.resetMove();
	
	if(_self.numPlayers === 1) { //if 1-player, do tasks that would otherwise be broadcast via Pusher
		var color = $piece.attr('color'), rank = $piece.attr('rank');
		//promote pawn to queen
		if(rank === 'Pawn' && ((color === 'White' && newRow === 7) || (color === 'Black' && newRow === 0)))
			_self.changePiece(color, $piece.attr('pieceID'), 'Queen');
		var other = otherColor(color), check = _self.checkCheck(other), msg = '';
		if(check) {
			var mate = _self.checkCheckmate(other);
			if(mate) {
				console.log(other + ' in checkmate');
				msg += 'CHECKMATE! ' + color.toUpperCase() + ' WINS!';
			} else {
				console.log(other + ' now in check!');
				msg += 'CHECK! ' + check[0].color + ' ' + check[0].pieceID;
			}
		}
		if(check) $('#game_alert').html(msg);
	}else { //if 2-player, mark that I have moved so an incidental click doesn't give me another move
		setState('moved', true);
	}
	_self.checkBoardSync();	
};

//for debugging - make sure the Board and BoardObj are in sync
Board.prototype.checkBoardSync = function() {
	var _self = this, numChecked = 0;
	_self.find('.square .piece_img').each(function(ind) {
		var $this = $(this), color = $this.attr('color'), pieceID = $this.attr('pieceID'), rank = $this.attr('rank');
		var $square = $this.parents('.square'), row = parseInt($square.attr('row')), col = parseInt($square.attr('col'));
		var square = _self.boardObj.squares[row][col], piece = _self.boardObj.pieces[color][pieceID];
		if(square.color !== color || square.pieceID !== pieceID || square.rank !== rank) {
			console.log(row+','+col + ': ' + color+','+pieceID+','+rank + ' <=> ' + square.color+','+square.pieceID+','+square.rank);
		}
		if(piece.row !== row || piece.col !== col) {
			console.log(color+','+pieceID + ': ' + row+','+col + ' <=> ' + piece.row+','+piece.col);
		}
		numChecked++;
	});
	console.log('checked ' + numChecked + ' pieces');
};

function otherColor(color) {
	return color === 'White' ? 'Black' : 'White';
}

//undo the last move
Board.prototype.undoMove = function() {
	var _self = this;
	var allMoves = _self.boardObj.history;
	if(allMoves.length < 1) return false;
	var lastMove = allMoves[allMoves.length-1];
	console.log('undoing move ' + lastMove);
	_self.doCodedMove(lastMove, true);
	_self.boardObj.history.pop();
};

//given array of strings of format "Color PieceID OldRow,OldCol NewRow,NewCol", make the corresponding moves on the board
Board.prototype.doCodedMove = function(moveArr, undo) {
	var _self = this;
	for(var i = 0; i < moveArr.length; i++) {
		var ind = undo ? moveArr.length-i-1 : i, move = moveArr[ind].split(' ');
		var color = move[0], pieceID = move[1], newSquare = (undo ? move[2] : move[3]).split(',');
		var $piece = _self.find('.piece_img[color="'+color+'"][pieceID="'+pieceID+'"]');
		if(newSquare[0] == 'null') {
			_self.takePiece($piece);
		} else {
			var newRow = parseInt(newSquare[0]), newCol = parseInt(newSquare[1]);
			_self.movePiece($piece, newRow, newCol, !undo);
		}
	}
}

//remove the last move from the cache, ie. upon starting a new turn, since it will no longer be undone
Board.prototype.resetMove = function() {
	this.boardObj.resetMove();
}

//find child elements within the board
Board.prototype.find = function(selector) {
	return this.$board.find(selector);
};
//set element data for the board
Board.prototype.setData = function(key, val) {
	this.$board.data(key, val);
}

//physically move a piece from one square to another on my board
//-if save = true, save this move so it can be undone
Board.prototype.movePiece = function($piece, newRow, newCol, save) {
	var _self = this;
	var $curSpace = $piece.parents('.square'), curRow = parseInt($curSpace.attr('row')), curCol = parseInt($curSpace.attr('col'));
	if(curRow === newRow && curCol === newCol) return;
	console.log('moving ' + pieceName($piece) + ' to ' + newRow + ',' + newCol);
	$piece.each(function(ind) {
		var $this = $(this), $board = $this.parents('.board_outer');
		var $space = $board.find('.square[row="'+newRow+'"][col="'+newCol+'"]');
		var $occupant = $space.find('.piece_img');
		if($occupant.length > 0 && $occupant.attr('color') !== $this.attr('color')) {
			_self.takePiece($occupant);
		}
		$this.detach().appendTo($space);
	});
	//make the move on the board object
	_self.boardObj.movePiece($piece.attr('color'), $piece.attr('pieceID'), newRow, newCol, true, save);
};

Board.prototype.takePiece = function($piece) {
	var _self = this;
	$piece.detach().appendTo(_self.find('.board-taken-pieces'));
	_self.boardObj.takePiece($piece.attr('color'), $piece.attr('pieceID'));
}

Board.prototype.toggleSelect = function($piece) {
	var _self = this;
	var wasSelected = $piece.attr('select') === 'true';
	_self.unselect();
	if(wasSelected) {
		//console.log('was selected');
		return;
	}
	_self.select($piece);
};

//select a piece and highlight all spaces it can move to
Board.prototype.select = function($piece) {

	var _self = this, $board = $piece.parents('.board_outer');
	//select the piece and its square
	$piece.attr('select', 'true');
	var $square = $piece.parents('.square'), curRow = parseInt($square.attr('row')), curCol = parseInt($square.attr('col'));
	$square.attr('select', 'true');

	//highlight all the squares this piece can move to
	_self.boardObj.getValidSquares($piece.attr('color'), $piece.attr('pieceID'), true);
	for(var row in _self.boardObj.validSquares['valid'])
		for(var col in _self.boardObj.validSquares['valid'][row]) {
			_self.find('.square[row="'+row+'"][col="'+col+'"]').attr('valid', 'true');
		}
	return true;
};

Board.prototype.unselect = function() {
	$('.piece_img[select="true"]').attr('select', 'false');
	$('.square[select="true"]').attr('select', 'false');
	//un-highlight the spaces this piece could move to
	$('.square[valid="true"]').attr('valid', 'false');
	this.boardObj.clearValid(true);
}
Board.prototype.getSelected = function() {
	return $('.piece_img[select="true"]');
}
Board.prototype.getValid = function() {
	return $('.square[valid="true"]');
}

//function for promoting a pawn
Board.prototype.changePiece = function(color, pieceID, newRank) {
	console.log('changing ' + color + ' ' + pieceID + ' to ' + newRank);
	var $piece = this.find('.piece_img[color="'+color+'"][pieceID="'+pieceID+'"]');
	var $dup = this.find('.piece_img[color="'+color+'"][rank="'+newRank+'"]');
	$piece.html($dup.html());
	$piece.attr('imgFile', $dup.attr('imgFile'));
	$piece.data('imgJSON', $dup.data('imgJSON'));
	$piece.data('imgSVG', $dup.data('imgSVG'));
	$piece.attr('rank', newRank);
	this.boardObj.changePiece(color, pieceID, newRank);
}

//given an object representing a potential next move, see if it puts the moving team's king in check
Board.prototype.checkMoveCheck = function(move, color) {
	this.movePiece(move.$piece, move.newRow, move.newCol, true);
	var ret = this.checkCheck(color);
	this.undoMove(true);
	return ret;
};
//see if the specified king is in check
Board.prototype.checkCheck = function(color) {
	var ret = this.boardObj.checkCheck(color);
	this.boardObj.inCheck[color] = ret;
	return ret;	
};

Board.prototype.checkCheckmate = function(color) {
	return this.boardObj.checkCheckmate(color);
};

//cache all board data in the database at the outset
Board.prototype.getBoardData = function() {
	var _self = this;
	do_ajax('get_boards', {'nickname': state.nickname}, function(data) {
		for(var user in data.boards) {
			for(var board in data.boards[user]) {
				_self.loadBoard(user, board, false);
			}
		}
	}, {});
};

function selectBoard() {
	var $dialog = $('#board-select'), $boardPanel = $('#board-select-display');
	//get the list of existing boards - server will return just a thumbnail of each, for efficiency
	do_ajax('get_boards', {'nickname': state.nickname}, function(data) {
		//console.info(data);
		$boardPanel.empty();
		for(var user in data.boards) {
			for(var board in data.boards[user]) {
				var thumbFile = data.boards[user][board];
				var $board = $('<div class="board-thumb" select="false">'
					+ '<div class="board-title"><span class="board-name">' + board + '</span>'
					+ ' (by <span class="board-user">' + user + '</span>)</div></div>');
				var b = new Board(8, 8, 25);
				b.loadBoard(user, board, true);
				$board.append(b.$board);
				$board.click(function(event) {
					$('.board-thumb[select="true"]').attr('select', 'false');
					$(this).attr('select', 'true');
				});
				$boardPanel.append($board);//*/
			}
		}
	}, {});
	//prompt the user which board they want
	$dialog.dialog({
		dialogClass: 'board-select-dialog',
		title: 'Select Board',
		position: 'top',
		modal: true,
		width: 600,
		height: 480,
		maxWidth: 1000,
		maxHeight: 1000,
		closeOnEscape: true,
		buttons: [
			{
				text: 'Cancel',
				click: function() {
					$boardPanel.empty();
					$dialog.dialog('close');
				}
			},
			{
				text: 'Select',
				click: function() {
					var $board = $('.board-thumb[select="true"]');
					if($board.length < 0) return;
					console.log('user selected ' + $board.length + ' boards');
					var user = $board.find('.board-user').html(), board = $board.find('.board-name').html();
					Board.gameBoard.loadBoard(user, board, true);
					//if user is loading their own board, assume they want to edit it rather than save under a new name
					if(user === state.nickname && $('#board-name').length > 0) {
						Board.gameBoard.boardName = board;
						$('#board-name').html(board);
					}
					$boardPanel.empty();
					$dialog.dialog('close');
				}
			},
		],
		close: function(event, ui) {
		}
	});
}

Board.prototype.reset = function() {
	this.boardName = '';
	this.find('.piece_img').each(function(i) {
		var $this = $(this);
		$this.html($(blankPiece)[0].innerHTML);
		$this.attr('imgFile', blankPieceFile);
		$this.data('imgSVG', '');
		$this.data('imgJSON', '');
	});
}

//get the pieces from the specified chessboard from the database
//-if replaceAll, set the board to these pieces - otherwise, just cache them for possible use
Board.prototype.loadBoard = function(user, board, replaceAll) {
	var _self = this;
	var success = function (data) {
		//console.info(data);
		if(replaceAll) for(var c = 0; c < colors.length; c++) {
			var color = colors[c];
			if(_self.showingOwnPieces[color])
				_self.setPieces(color, data, _self.colorSwitched[color]);
		}
		//make sure this board gets cached for future use
		Board.gameBoard.$board.data('cache_'+user+'_'+board, data.pieces);
	};
	//first see if we have the pieces for this board cached
	var $board = Board.gameBoard.$board;
	if(typeof $board.data('cache_'+user+'_'+board) !== 'undefined') {
		if(!replaceAll) return; //board is already cached, which is all we wanted to do anyway
		var data = {pieces: $board.data('cache_'+user+'_'+board)};
		success(data);
		//update my DB entry to reflect the board change
		do_ajax('set_board', {'nickname': state.nickname, 'user': user, 'board': board}, function(data){}, {});
	}
	else { //otherwise make the AJAX call to load them
		console.log('loading ' + user + ',' + board + ' as ' + state.nickname);
		do_ajax('load_board', {'nickname': state.nickname, 'user': user, 'board': board, 'replace': replaceAll && _self === Board.gameBoard},
			success, {});
	}
	if(replaceAll && _self === Board.gameBoard) {
		state.pieces.user = user;
		state.pieces.board = board;
	}
};

//given a set of pieces as per loadBoard(), set the specified team to use those pieces
Board.prototype.setPieces = function(color, data, switched) {
	var _self = this;
	_self.colorSwitched[color] = switched;
	var dataColor = switched ? otherColor(color) : color;
	for(var r = 0; r < ranks.length; r++) {
		var rank = ranks[r], file = '', svg = '', json = '';
		if(typeof data.pieces[dataColor] === 'undefined' || typeof data.pieces[dataColor][rank] === 'undefined') svg = blankPiece;
		else {
			file = filePath(data.pieces[dataColor][rank][0]);
			svg = data.pieces[dataColor][rank][1]
			json = data.pieces[dataColor][rank][2];
			//console.log('got ' + color + ' ' + rank);
			//console.info(json);
		}
		var $pieces = _self.find('.piece_img[color="'+color+'"][rank="'+rank+'"]');
		//console.log('setting file for ' + $pieces.length + ' ' + color + ' ' + rank + 's to ' + file);
		$pieces.empty().append($(svg));
		$pieces.attr('imgSVG', svg);
		if(json.length > 0) {
			$pieces.attr('imgFile', file);
			$pieces.data('imgJSON', JSON && JSON.parse(json) || $.parseJSON(json));
		}
	}
}

//change the specified color to use the specified set of pieces, loading them from the DB first if necessary
//-if switched, exchange black and white pieces
Board.prototype.switchPieces = function(color, user, board, switched) {
	var _self = this;
	_self.loadBoard(user, board, false); //make sure we have the pieces
	var data = {pieces: Board.gameBoard.$board.data('cache_' + user + '_' + board)};
	_self.setPieces(color, data, switched);
};

Board.prototype.save = function() {
	if(!isNull(this.boardName)) {
		var overwrite = confirm('Overwrite board "' + this.boardName + '"?');
		if(!overwrite) this.boardName = '';
	}
	if(isNull(this.boardName)) this.boardName = prompt('Enter board name:');
	if(isNull(this.boardName)) return;

	//tried using 'painty' plugin to save thumbnail of entire board from its HTML content - not working so far
	var boardContents = this.$board[0].innerHTML;
	
	console.log('saving board ' + this.boardName);
	do_ajax('save_board', {'nickname': state.nickname, 'board': this.boardName, 'contents': boardContents}, function(data) {
		//console.log(data.response);
	}, {type: 'POST'});
	for(var c = 0; c < colors.length; c++) {
		for(var r = 0; r < ranks.length; r++) {
			var color = colors[c], rank = ranks[r];
			var $piece = $('.piece_img[color="'+color+'"][rank="'+rank+'"]');
			if($piece.attr('imgFile') !== blankPieceFile) {
				//console.log(pieceName($piece));
				//console.info($piece.data('imgSVG'));
				do_ajax('save_piece', {
						nickname: state.nickname, user: state.nickname, board: this.boardName, color: color, rank: rank,
						imageSVG: $piece.data('imgSVG'), imageJSON: JSON.stringify($piece.data('imgJSON'))
					},
					function(data) {}, {type: 'POST'});
			}
			//else console.log("don't need to save " + pieceName($piece));
		}
	}
};

function addResizeSlider($panel) {
	$panel.append('<div id="resize_board"></div><span id="resize_label">Board Size = 100%</span>');
	var $slider = $('#resize_board');
	$slider.slider({
		min: 0,
		max: 200,
		step: 1,
		value: 100,
		change: function(event, ui) {
			var newLength = Math.round(Board.gameBoard.initSquareLength * ui.value / 100);
			Board.gameBoard.setSquareLength(newLength);
			$('#resize_label').html('Board Size = ' + ui.value + '%');
		}
	});//*/
	$slider.slider('value', 40);
}

$(document).ready(function() {
	//allow user to select a saved board from the database
	$('body').append('<div id="board-select"><div id="board-select-display"></div></div>');
	console.log('BOARD DONE');
});
