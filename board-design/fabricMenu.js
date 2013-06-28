/**
 * Main Menu
 */
function MainMenu(canvas)
{
	this.menu = null;
	
	return this;
}

MainMenu.prototype = 
{
	generate: function(canvas, settings)
	{
		var $canvas = canvas;
		var _self = this;
		
		//setup the line width select
		var options = '';
		for(var i=settings.lineWidthMin; i<=settings.lineWidthMax; i++) options += '<option value="' + i + '" ' + (settings.lineWidth == i ? 'selected="selected"' : '') + '>' + i + '</option>';
		
		var lineWidth = $('<div class="_wPaint_lineWidth _wPaint_dropDown" title="' + settings.menuTitles.lineWidth + '"></div>').append(
			$('<select>' + options + '</select>')
			.change(function(e){ canvas.freeDrawingBrush.width = parseInt($(this).val()); })
		)
		
		//content
		var menuContent = $('<div class="_wPaint_options"></div>');
		
		$.each(settings.menu, function(i, item)
		{
			switch(item)
			{
				case 'undo': menuContent.append($('<div class="_wPaint_icon _wPaint_undo" title="' + $canvas.settings.menuTitles.undo + '"></div>').click(function(){  })); break;
                case 'redo': menuContent.append($('<div class="_wPaint_icon _wPaint_redo" title="' + $canvas.settings.menuTitles.redo + '"></div>').click(function(){  })); break;
				case 'clear': menuContent.append($('<div class="_wPaint_icon _wPaint_clear" title="' + $canvas.settings.menuTitles.clear + '"></div>').click(function(){ canvas.clear(); })); break;
				case 'rectangle': menuContent.append($('<div class="_wPaint_icon _wPaint_rectangle" title="' + $canvas.settings.menuTitles.rectangle + '"></div>').click(function(){ _self.set_mode(_self, $canvas, 'Rectangle'); })); break;
				case 'ellipse': menuContent.append($('<div class="_wPaint_icon _wPaint_ellipse" title="' + $canvas.settings.menuTitles.ellipse + '"></div>').click(function(){ _self.set_mode(_self, $canvas, 'Ellipse'); })); break;
				case 'line': menuContent.append($('<div class="_wPaint_icon _wPaint_line" title="' + $canvas.settings.menuTitles.line + '"></div>').click(function(){ _self.set_mode(_self, $canvas, 'Line'); })); break;
				case 'pencil': menuContent.append($('<div class="_wPaint_icon _wPaint_pencil" title="' + $canvas.settings.menuTitles.pencil + '"></div>').click(function(){ _self.set_mode(_self, $canvas, 'Pencil'); })); break;
				case 'text': menuContent.append($('<div class="_wPaint_icon _wPaint_text" title="' + $canvas.settings.menuTitles.text + '"></div>').click(function(){ _self.set_mode(_self, $canvas, 'Text'); })); break;
				case 'eraser': menuContent.append($('<div class="_wPaint_icon _wPaint_eraser" title="' + $canvas.settings.menuTitles.eraser + '"></div>').click(function(e){ _self.set_mode(_self, $canvas, 'Eraser'); })); break;
				case 'fillColor': menuContent.append($('<div class="_wPaint_fillColorPicker _wPaint_colorPicker" title="' + $canvas.settings.menuTitles.fillColor + '"></div>')); break;
				case 'lineWidth': menuContent.append(lineWidth); break;
				case 'strokeColor': menuContent.append($('<div class="_wPaint_strokeColorPicker _wPaint_colorPicker" title="' + $canvas.settings.menuTitles.strokeColor + 'r"></div>')); break;
			}
		});

		//handle
		var menuHandle = $('<div class="_wPaint_handle"></div>')
		
		//get position of canvas
		//var offset = $($canvas.canvas).offset();
		
		//menu
		return this.menu = 
		$('<div class="_wPaint_menu _wPaint_menu_' + $canvas.settings.menuOrientation + '"></div>')
		.css({position: 'absolute', left: $canvas.settings.menuOffsetX, top: $canvas.settings.menuOffsetY})
		.draggable({
			handle: menuHandle, 
			drag: function(){_self.moveTextMenu(_self, _self.textMenu)}, 
			stop: function(){_self.moveTextMenu(_self, _self.textMenu)}
		})
		.append(menuHandle)
		.append(menuContent);
	},
	
	moveTextMenu: function(mainMenu, textMenu)
	{
		if(textMenu.docked)
		{
			textMenu.menu.css({left: parseInt(mainMenu.menu.css('left')) + textMenu.dockOffsetLeft, top: parseInt(mainMenu.menu.css('top')) + textMenu.dockOffsetTop});
		}
	},
	
	set_mode: function(_self, $canvas, mode)
	{
		$canvas.settings.mode = mode;
		
		if(mode == 'Text')
		{
			_self.textMenu.menu.show();
			_self.setWidth($canvas, _self.textMenu.menu);
		}
		else
		{
			$canvas.drawTextUp(null, $canvas);
			_self.textMenu.menu.hide();
			$canvas.textInput.hide();
		}
		
		_self.menu.find("._wPaint_icon").removeClass('active');
		_self.menu.find("._wPaint_" + mode.toLowerCase()).addClass('active');
	},

	setWidth: function(canvas, menu)
	{
		var options = menu.find('._wPaint_options');

		if(canvas.settings.menuOrientation === 'vertical')
		{
			// set proper width
			var width = menu.find('._wPaint_options > div:first').outerWidth(true);
			width += (options.outerWidth(true) - options.width());

			//set proper height
		}
		else
		{
			var width = menu.find('._wPaint_handle').outerWidth(true);
			width += menu.outerWidth(true) - menu.width();
			
			menu.find('._wPaint_options').children().each(function()
			{
				width += $(this).outerWidth(true);
			});
		}


		menu.width(width);
	}
}
