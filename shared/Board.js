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
	this.rows = rows;
	this.cols = cols;
	this.squareLength = squareLength;
	this.initSquareLength = squareLength; //board may be resized by the user
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
}

//static members
Board.gameBoard = null; //should be set by the main script

//methods
Board.prototype.setSquareLength = function(squareLength) {
	var _self = this;
	_self.squareLength = squareLength;
	_self.$board.find('.square').css({
		width: _self.squareLength + 'px',
		height: _self.squareLength + 'px'
	});
	_self.$board.find('.board_row').css({
		width: (_self.cols * _self.squareLength) + 'px'
	});
};

Board.prototype.setEditMode = function() {
	this.$board.find('.piece_img').each(function(i) {
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
	this.$board.find('.square').each(function(i) {
		_self.setSquarePlayMode($(this));
	});
};
Board.prototype.setSquarePlayMode = function($square) {
	var _self = this;
	var $piece = $square.children('.piece_img');
	if($piece.length > 0) $piece.click(function(event) {
		var $this = $(this);
		console.log(pieceName($this) + ' clicked');
		if(state.turn === state.nickname && $this.attr('color') === state.color) {
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
		var $selectedPiece = $('.piece_img[select="true"]'), $selectedSquare = $('.square[select="true"]'), $this = $(this);
		var newRow = parseInt($this.attr('row')), newCol = parseInt($this.attr('col'));
		var $oldSpace = $selectedPiece.parent(), oldRow = parseInt($oldSpace.attr('row')), oldCol = parseInt($oldSpace.attr('col'));
		if($selectedPiece.length < 1 || $this.attr('valid') !== 'true') return;
		
		//check if the king is castling - if so, move the rook first to make sure the space is free for the king
		if($selectedPiece.attr('rank') === 'King' && Math.abs(newCol - oldCol) === 2) {
			var dir = newCol-oldCol > 0 ? 1 : -1;
			for(var c = oldCol+dir; c >= 0 && c < _self.rows; c += dir) {
				var $curSpace = $('.square[row="'+oldRow+'"][col="'+c+'"]');
				var $occ = $curSpace.find('.piece_img');
				if($occ.length > 0 && $occ.attr('color') === $selectedPiece.attr('color') && $occ.attr('rank') === 'Rook') {
					console.log('found rook at ' + oldRow + ',' + c + ' - moving to ' + oldRow + ',' + (oldCol+dir));
					_self.movePiece($occ, $('.square[row="'+oldRow+'"][col="'+(oldCol+dir)+'"]'));
					do_ajax('move_piece', {'nickname': state.nickname, 'color': state.color, 'piece': $occ.attr('pieceID'),
						'oldRow': oldRow, 'oldCol': c, 'row': oldRow, 'col': (oldCol+dir)}, function(data){}, {});
					break;
				}
			}
		}

		//go ahead and move the piece on my board - assumes the AJAX call will succeed so that my board is synced with the other player's
		_self.movePiece($selectedPiece, $this);
		do_ajax('move_piece', {'nickname': state.nickname, 'color': state.color, 'piece': $selectedPiece.attr('pieceID'),
				'oldRow': oldRow, 'oldCol': oldCol,	'row': newRow, 'col': newCol}, function(data){}, {});
	});
}

Board.prototype.movePiece = function($piece, $space) {
	var _self = this;
	var $curSpace = $piece.parent('.square'), curRow = parseInt($curSpace.attr('row')), curCol = parseInt($curSpace.attr('col'));
	var newRow = parseInt($space.attr('row')), newCol = parseInt($space.attr('col'));
	console.log('moving ' + pieceName($piece) + ' to ' + newRow + ',' + newCol);
	var $occupant = $space.find('.piece_img');
	if($occupant.attr('color') !== $piece.attr('color')) $occupant.detach(); //if this space has an opposing piece, take it!
	$piece.detach().appendTo($space);

	//make sure the selected and valid squares are no longer highlighted
	unselect();
}

Board.prototype.toggleSelect = function($piece) {
	var _self = this;
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
	var $square = $piece.parent('.square'), curRow = parseInt($square.attr('row')), curCol = parseInt($square.attr('col'));
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

		//allow king to castle
		if(rank === 'King' && Math.abs(vec[0]) > 1) {
			var castle = false; //whether allowed - must be empty space between king and rook in current row
			var dir = vec[0] < 0 ? -1 : 1, $curSpace, $curOccupant;
			for(var c = curCol+dir; c >= 0 && c < _self.cols; c += dir) {
				$curSpace = $('.square[row="'+curRow+'"][col="'+c+'"]');
				$curOccupant = $curSpace.find('.piece_img');
				if($curOccupant.length < 1) continue;
				castle = ($curOccupant.attr('color') === color && $curOccupant.attr('rank') === 'Rook');
				break;
			}
			if(castle) $space.attr('valid', 'true');
			return false;
		}

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
				b.loadBoard(user, board);
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
					var user = $board.find('.board-user').html(), board = $board.find('.board-name').html();
					Board.gameBoard.loadBoard(user, board);
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
	this.$board.find('.piece_img').each(function(i) {
		var $this = $(this);
		$this.html($(blankPiece)[0].innerHTML);
		$this.attr('imgFile', blankPieceFile);
		$this.data('imgSVG', '');
		$this.data('imgJSON', '');
	});
}

Board.prototype.loadBoard = function(user, board) {
	var _self = this;
	do_ajax('load_board', {'nickname': state.nickname, 'user': user, 'board': board}, function (data) {
		//console.info(data);
		for(var c = 0; c < colors.length; c++) {
			for(var r = 0; r < ranks.length; r++) {
				var color = colors[c], rank = ranks[r], file = '', svg = '', json = '';
				if(typeof data.pieces[color] === 'undefined' || typeof data.pieces[color][rank] === 'undefined') svg = blankPiece;
				else {
					file = filePath(data.pieces[color][rank][0]);
					svg = data.pieces[color][rank][1]
					json = data.pieces[color][rank][2];
					//console.log('got ' + color + ' ' + rank);
					//console.info(json);
				}
				var $pieces = _self.$board.find('.piece_img[color="'+color+'"][rank="'+rank+'"]');
				//console.log('setting file for ' + $pieces.length + ' ' + color + ' ' + rank + 's to ' + file);
				$pieces.empty().append($(svg));
				$pieces.attr('imgSVG', svg);
				if(json.length > 0) {
					$pieces.attr('imgFile', file);
					$pieces.data('imgJSON', JSON && JSON.parse(json) || $.parseJSON(json));
				}
			}
		}
	}, {});
}
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
}

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
}

$(document).ready(function() {
	//allow user to select a saved board from the database
	$('body').append('<div id="board-select"><div id="board-select-display"></div></div>');
});
