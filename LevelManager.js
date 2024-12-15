/* -----

	a small class to manage level gameplay
	display score & lifes
		
	------									*/


var LevelManager =
{	

	// constants
	NUM_LEVEL:				1,
	MAX_LIFE:				3,
	
	// Physical limit of the game
	row_lbound:				[null, 120,  88,  56,  24],
	row_rbound:				[null, 304, 334, 368, 400],
	
	// define the default ypos position for each row
	row_ypos:				[null,  80, 176, 272, 368],


	// private stuff
	
	_imageLevel:			[this.NUM_LEVEL+1],
	
	_currentLevel:			1,
	
	_score:					0,
	
	_life:					0,
	
	_difficulty:			1,
	
	_wave:					1, // to manage the "wave of incoming customer
	
	_lastrow:				-1,
	
	
	/* Time Management */
	_timecounter:			0,
	
	_time_step:				3, // secondes
	
	TIME_COUNTER_MAX:		60, // every max counter we increase the difficulty
	
	
	
	_fontImage:				null,
	_miscImage:				null,
	
	_gameTitleImage:		null,
	_readyToPlayImage:	null,
	
	_gameTitlelogoWidth:		416,
	_gameTitlelogoHeigth:	160,
	
	_copyright1:				"Based on the Original Tapper Game",
	_copyright2:				"(c) 1983 Bally Midway MFG",
	
	_gameOver:					"GAME OVER !",
	
	
	LIFE_ICON_OFF:			0,		// offset of the life icon 
	ICON_SIZE:				16,	// sprite size of the font
	
		
	FONT_Y_OFF:				0,		// y offset of the font
	FONT_NUM_OFF:			0,		// numerical offset
	FONT_SIZE:				16,	// sprite size of the font
			
	_SCORE_XPOS:			100,
	_SCORE_YPOS:			8,
	
	_LIFE_YPOS:				24,
	
	_DIFF_XPOS:				376,
	
	// SCORE TABLE :
	
	SCORE_BONUS:			1500,
	SCORE_EMPTY_BEER:		100,
	SCORE_CUSTOMER:		50,
		
		

	/* ---
	
		Initialize required stuff...
		---									*/
		
	init: function()
	{
		
		this._gameTitleImage		= RessourceMngr.getImageRessource("game_title");
		this._readyToPlayImage	= RessourceMngr.getImageRessource("pregame");
		this._imageLevel[1]		= RessourceMngr.getImageRessource("level-1");
		this._fontImage			= RessourceMngr.getImageRessource("font");
		this._miscImage			= RessourceMngr.getImageRessource("misc");
		
	

		this._currentLevel	=	1;
		this._score				=	0;
		this._life				=	this.MAX_LIFE;
		this._difficulty		=	1;
		this._wave				=	1;
		this._timecounter		=	0;
					
	},
	
	/* ---
	
		add customer periodically
		
		every x sec (defined by timestep) we add customers :
		
		if we have less or 1 customer, we add (difficulty * 1) customer on each row
		
		customer then arrive per wave 
		level 1 : 2 waves
		level 2 : 4 waves
		level 3 : 6 waves
		level 4 : 8 waves
		level 5 : 10 waves (I bet you'll never reach this point)
		
		---									*/
		
	addCustomer: function ()
	{
		if (g_game_state == g_STATE_PLAY)
		{
			
			// if less than 1 customer, we add diff * 1 customer per row
			if (Customers.isAnyCustomer() < 2)
			{
				//this._difficulty++;
				
				if (this._wave++ == (this._difficulty * 2)) this._difficulty++;
			
				for (var i=1 ; i<=this._difficulty ;i++)
				{
					Customers.add (1, i, Customers.CUST_GREEN_HAT_COWBOY); // row, pos, type
					Customers.add (2, i, Customers.CUST_WOMEM);
					Customers.add (3, i, Customers.CUST_BLACK_GUY);
					Customers.add (4, i, Customers.CUST_GRAY_HAT_COWBOY);
					SoundMngr.play(SoundMngr.POP_OUT, false);
				}
				
			}
			else // 1 random customer
			{
		
				var randomrow = Math.floor(Math.random()*5);
		
				if ((randomrow != 0) && (randomrow != this._lastrow))
				{
					var randomcusttype = Math.floor(Math.random() * (Customers.MAX_CUSTOMER_TYPE));
					
					Customers.add (randomrow, 1, randomcusttype); // row, pos, type
					
					SoundMngr.play(SoundMngr.POP_OUT, false);
					
					this._lastrow = randomrow; 
						
				}	
			}
			
			setTimeout('LevelManager.addCustomer()', (this._time_step * 1000));
		}
	},

	
	

	/* ---
	
		increase the score
		---									*/
		
	addScore: function (points)
	{
		this._score += points;
	},
	
	/* ---
	
		life lost
		---									*/
		

	lifeLost: function (type)
	{
		this._life -= 1;
		//console.log ("one life lost");
	},


	/* ---
	
		display the score
		---									*/
		

	displayScore: function(context)
	{
		var scoreText = ''+ this._score;

		var xpos = this._SCORE_XPOS;
				
		var offset;
		
						
		for (var i = scoreText.length ; i-- ;)
		{
				
				
				offset = (scoreText.charAt(i) * this.FONT_SIZE) + this.FONT_NUM_OFF;
				
				
				context.drawImage(this._fontImage,	
										offset,				this.FONT_Y_OFF, 
										this.FONT_SIZE,	this.FONT_SIZE, 
										xpos,					this._SCORE_YPOS,
										this.FONT_SIZE,	this.FONT_SIZE );
				
				
				xpos -= this.FONT_SIZE;
		}
	
	},
	
	

	/* ---
	
		display the difficulty
		
		---									*/
		

	displayDifficulty: function(context)
	{
		var diffText = ''+ this._difficulty;
		var xpos = this._DIFF_XPOS; // aligned on the score x pos
				
		var offset;
		
		for (var i = diffText.length ; i-- ;)
		{
				
				offset = (diffText.charAt(i) * this.FONT_SIZE) + this.FONT_NUM_OFF;
				context.drawImage(this._fontImage,	
										offset,				this.FONT_Y_OFF, 
										this.FONT_SIZE,	this.FONT_SIZE, 
										xpos,					this._SCORE_YPOS, // aligned on the score y pos
										this.FONT_SIZE,	this.FONT_SIZE );
				
				
				xpos -= this.FONT_SIZE;
		}
	
	},

	
	

	/* ---
	
		display the life remaining
		---									*/
		

	displayLife: function(context)
	{
		var xpos = this._SCORE_XPOS; // aligned on the score x pos
	
		if (this._life <= 0) 
			return; // should never happen
		
		for (var i=this._life ; i-- ;)
		{
				
				context.drawImage(this._miscImage,	
										this.LIFE_ICON_OFF,	0, 
										this.ICON_SIZE,		this.ICON_SIZE, 
										xpos,						this._LIFE_YPOS,
										this.ICON_SIZE,		this.ICON_SIZE );
				
				xpos -= this.FONT_SIZE;
		}

		
		
	},
	
	/* ---
	
		display the game title
		a loading screen
		
		---										*/
	
	displayGameTitle: function(context)
	{	
		
		context.fillStyle = "rgb(0,0,0)";
		context.fillRect (0, 0, context.canvas.width, context.canvas.height);
		context.fill();
		
		context.drawImage(this._gameTitleImage, 
								(context.canvas.width - this._gameTitlelogoWidth) / 2, 
								(280 - this._gameTitlelogoHeigth));
			
		context.fillStyle    = "rgb(255,255,255)";
		context.font         = 'bold 14px Courier';
		context.textBaseline = 'top';
		
		// display some copyright text
		context.fillText  (this._copyright1, 122, 290);
		context.fillText  (this._copyright2, 154, 310);
		
		context.fillText  ('Press [ENTER] to play', 172, 400);
			
	},
	
	
	/* ---
	
		display the pre game image
		a loading screen
		
		---										*/
	
	displayReadyToPlay: function(context)
	{	
		
		context.drawImage(this._readyToPlayImage, 0,0);
	
	},

	
	/* ---
	
		display the game title
		a loading screen
		
		---										*/
	
	displayGameOver: function(context)
	{	
		
		// Display the "Game Over" message
		context.fillStyle = "rgb(0,0,0)";
		context.fillRect ((context.canvas.width - 180) / 2, (context.canvas.height - 32) / 2, 
								180, 32); // h, w
		context.fill();
			
		context.fillStyle    = "rgb(255,255,255)";
		context.font         = 'bold 14px Courier';
		context.textBaseline = 'top';
		
		// display some copyright text
		context.fillText  (this._gameOver, ((context.canvas.width - 180) / 2) + 48, ((context.canvas.height - 32) / 2) + 8);
	
	},

	

	/* ---
	
		reset 
		
		---									*/
	reset: function()
	{
		
		for (var i=1 ; i<=this._difficulty ;i++)
		{
			Customers.add (1, i, Customers.CUST_GREEN_HAT_COWBOY); // row, pos, type
			Customers.add (2, i, Customers.CUST_WOMEM);
			Customers.add (3, i, Customers.CUST_BLACK_GUY);
			Customers.add (4, i, Customers.CUST_GRAY_HAT_COWBOY);
		}
		
		// restart the wave !
		//this._wave	=	this._difficulty;
		
		this._lastrow		= -1;
		
		setTimeout('LevelManager.addCustomer()', (this._time_step * 1000));

	},

	
	
	/* ---
	
		reset 
		
		---									*/
	newGame: function()
	{
		
		this._currentLevel	=	1;
		this._score				=	0;
		this._life				=	this.MAX_LIFE;
		this._difficulty		=	1;
		this._wave				=	1;
		this._timecounter		=	0;
		this._lastrow			= -1;
		
		
						
	},



	/* ---
	
		draw the foreground stuff of the current level
		(score, life, difficulty)
		---										*/
	
	drawGameHUD: function(context)
	{	
		LevelManager.displayScore(context);
		LevelManager.displayLife(context);
		LevelManager.displayDifficulty(context);
		
	},


	/* ---
	
		draw the background of the current level
		---										*/
	
	drawLevelBackground: function(context)
	{	
		var bgimage = this._imageLevel[this._currentLevel]
		context.drawImage(bgimage, 0, 0);
	}
	

}