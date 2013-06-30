<html>
	<head>
		<?php include '../cgi-bin/init.php'; ?> <!--ensure required SQL tables exist-->
		<!--jQuery scripts stored locally for working offline - they are copies of the below commented URLs-->
		<link type="text/css" rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css"></link>
		<!--<link type="text/css" rel="stylesheet" href="../shared/jquery-ui.css"></link>-->
		<link type="text/css" rel="stylesheet" href="../../aPaint/wColorPicker/wColorPicker.css"></link>
		<link type="text/css" rel="stylesheet" href="../../aPaint/wPaint/wPaint.css"></link>
		<link type="text/css" rel="stylesheet" href="../shared/Board.css"></link>
		<link type="text/css" rel="stylesheet" href="style.css"></link>
		<!--<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>-->
		<script type="text/javascript" src="../shared/jquery.min.js"></script>
		<script type="text/javascript" src="../shared/jquery-ui.min.js"></script>
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
		<div id="player_info">
			<div id="controls">
				<button type="button" id="select_board" onclick="selectBoard()">Select Board</button>
				<button type="button" id="save_board" onclick="board.save(); $('#board-name').html(Board.gameBoard.boardName)">Save Board</button>
			</div>
			<div id="logout_msg">
				You are logged out.
				<button type="button" onclick="login(loginFunc)">Log In</button>
			</div>
			<div id="login_msg">
				You are logged in as <span id="nickname"></span>.
				<button type="button" onclick="logout(logoutFunc)">Log Out</button>
			</div>
		</div>
		
		<p id="instructions"> Editing board &quot;<span id="board-name">Untitled</span>&quot;
		<br/>Click on a square to edit the piece.</p>

		<div id="board_panel"></div>

		<div id="piece-window">
			<div id="piece-canvas-container"></div>
			<div id="piece-canvas-controls">
				<form enctype="multipart/form-data" id="piece-canvas-image-form">
				  <input name="file" type="file" id="piece-canvas-image-file"/>
				  <input type="button" value="Upload" id="piece-canvas-image-upload"/>
				</form>
			</div>
		</div>
	</body>
</html>

