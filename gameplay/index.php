<html>
	<head>
		<link type="text/css" rel="stylesheet" href="../shared/jquery-ui.css"></link>
		<link type="text/css" rel="stylesheet" href="../shared/Board.css"></link>
		<link type="text/css" rel="stylesheet" href="style.css"></link>
		<script type="text/javascript" src="../shared/jquery.min.js"></script>
		<script type="text/javascript" src="../shared/jquery-ui.min.js"></script>
		<script type="text/javascript" src="../shared/pusher.min.js"></script>
		<script type="text/javascript" src="../shared/chess_lib.js"></script>
		<script type="text/javascript" src="../shared/game_logic.js"></script>
		<script type="text/javascript" src="../shared/Board.js"></script>
		<script type="text/javascript" src="../shared/Debug.js"></script>
		<!--allow user to pass '?players=1' for one-player board-->
		<?php echo '<script type="text/javascript">var numPlayers = ' .
			((array_key_exists('players', $_GET) and $_GET['players'] == 1) ? '1' : '2') . ';</script>' . PHP_EOL; ?>
		<script type="text/javascript" src="chess.js"></script>
	</head>
	<body>
		<div id="player_info">
			<div id="controls">
				<button type="button" id="create_game" onclick="createGame()">Create Game</button>
				<button type="button" id="leave_game" onclick="leaveGame()">Leave Game</button>
				<button type="button" id="select_board" onclick="selectBoard()">Select Board</button>
				<button type="button" id="show_state" onclick="showState()">Show State</button>
				<div id="piece_display_options">
					<input type="checkbox" id="show_opponent" value="0">Show Opponent's Pieces</input>
					<input type="checkbox" id="switch_pieces" value="0">Switch My Colors</input>
					<input type="checkbox" id="switch_opponent" value="0">Switch Opponent's Colors</input>
				</div>
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
		<div id="game_info">
			<p>
				<div id="game_alert"></div>
			</p>
			<p>
				<div id="game_matchup"><span id="player_me"></span> vs. <span id="player_opponent"></span></div>
				<div id="game_turn">Turn: <span id="player_turn"></span></div>
			</p>
		</div>
		<div id="board_panel">
		</div>
		<div id="room_info">
			<div id="server_msg"></div>
			<div class="room_list">
				<h3>Other Players</h3>
				<ul id="player_list"></ul>
			</div>
			<div class="room_list">
				<h3>Games</h3>
				<ul id="game_list"></ul>
			</div>
		</div>
		<div id="dialog_overlay">
			<div id="dialog_box">
				<div id="dialog_text"></div>
				<div id="dialog_buttons"></div>
			</div>
		</div>
	</body>
</html>
