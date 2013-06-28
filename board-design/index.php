<html>
	<head>
		<?php include '../cgi-bin/init.php'; ?> <!--ensure required SQL tables exist-->
		<link type="text/css" rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css"></link>
		<link type="text/css" rel="stylesheet" href="../../aPaint/wColorPicker/wColorPicker.css"></link>
		<link type="text/css" rel="stylesheet" href="../../aPaint/wPaint/wPaint.css"></link>
		<link type="text/css" rel="stylesheet" href="../shared/Board.css"></link>
		<link type="text/css" rel="stylesheet" href="style.css"></link>
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.js"></script>
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
		<script type="text/javascript" src="../../aPaint/fabric-js/dist/all2.js"></script>
		<script type="text/javascript" src="../../aPaint/wColorPicker/wColorPicker.js"></script>
		<script type="text/javascript" src="../../aPaint/wPaint/wPaint2.js"></script>
		<script type="text/javascript" src="../../aPaint/aPaint.js"></script>
		<script type="text/javascript" src="../shared/Debug.js"></script>
		<script type="text/javascript" src="../shared/chess_lib.js"></script>
		<script type="text/javascript" src="../shared/Board.js"></script>
		<script type="text/javascript" src="chessboard.js"></script>
	</head>
	<body>
		<p> Editing <span id="board-name">Untitled</span> as user <span id="user-name"></span>
		<br/>Click on a square to edit the piece.</p>
		<div id="controls">
			<button type="button" id="select_board" onclick="selectBoard()">Select Board</button>
			<button type="button" id="save_board" onclick="board.save(); $('board-name').html(board.boardName)">Save Board</button>
			<button type="button" onclick="logout(logoutFunc)">Log Out</button>
		</div>
		<div id="piece-window">
			<div id="piece-canvas-container">
				<!--<canvas id="piece-canvas"></canvas>-->
			</div>
			<div id="piece-fabric-controls">
				<button class="piece-fabric-control" id="pfc-draw" type="button"></button>
				<button class="piece-fabric-control" id="pfc-fill" type="button"></button>
				<button class="piece-fabric-control" id="pfc-img" type="button"></button>
			</div>
		</div>
	</body>
</html>

