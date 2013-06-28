$(document).ready(function() {
	$('body').prepend('<div id="debug"><input id="debug_text" type="text" size="70"></input></div>');

	$('#debug_text').keypress(function(e) {
		switch(e.which) {
			case 10:
			case 13:
				console.log(eval($(this).val()));
				break;
			default:
				break;
		}
	});
});
