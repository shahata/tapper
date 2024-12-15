/* -----

	Tapper Main Class 
	
	------									*/



// global constants

const g_STATE_PLAY			=		0;
const g_STATE_LIFELOST		=		1;
const g_STATE_MENU			=		2;
const g_STATE_GAMEOVER		=		3;
const g_STATE_READY			=		4;
const g_STATE_LOADING		=		5;
const g_STATE_PAUSE			=		6;

const g_FPS						=		60;

// global variables

var g_game_state;


//------------------------------------------


// game implementation

var Game	=
{
	
	// some variables..
	
	_keyPressAllowed: true,
	
	// reference to the framebuffer
	_frameBuffer:		null,
	
	
	/* ---
	
		Initialize the game
		
		---										*/
	initialize: function()
	{
		if (!System.initVideo('tapperJS', 512, 480, false, 1.0))
		{
			alert("Sorry but no beer for you, your browser does not support html 5 canvas. Please try with another one!");
         return;
		}
		
		this._frameBuffer = System.getFrameBuffer();
		
		// init sound manager (used during preloading)
		SoundMngr.init();

		g_game_state = g_STATE_LOADING;
			
		// start the drawing loop :)
		setInterval(function() { Game.onUpdateFrame() }, 1000/g_FPS);
		
		// load all ressources		
		RessourceMngr.loadAllRessources(Game.loaded);
	
	},
	
	
	/* ---
	
		callback when everything is loaded
		
		---										*/
	loaded: function (status)
	{
		
		// initialize all the other game elements.
		
		LevelManager.init();
	
		Player.init();
	
		Beerglass.init();
	
		Customers.init();
		
		// Event Management
		document.onkeydown	= function(e) { Game.onkeypress(e); };
		document.onkeyup		= function(e) { Game.onkeyrelease(e); };
		
		g_game_state = g_STATE_MENU;

	},

	
	/* ---
	
		Change the game Status with the specified one
		
		---										*/
	changeState: function (status)
	{
		g_game_state = status;

	},
	
	
	/* ---
	
		RESET THE GAME (LIFE LOST)
		
		---										*/
	reset: function()
	{
		/* per game initialization : to be set in a separata function later */
		g_game_state = g_STATE_READY;
		
		
		// start the player !
		Player.reset();
		
		// start the Beer !
		Beerglass.reset();
		
		// start the Customers !
		Customers.reset();
		
		// reset the level
		LevelManager.reset();
		
		
		SoundMngr.play(SoundMngr.GETREADYTOSERVE, false);
		
		// start the game in 2 secondes
		setTimeout('Game.changeState(g_STATE_PLAY);SoundMngr.play(SoundMngr.OH_SUZANNA, true)', 2.5 * 1000);
					
	},
	
	
	/* ---
	
		 oh noo... we lost !
		
		---										*/
	lost: function()
	{
		
		Player.lost();
		Beerglass.stop();
		Customers.stop();
		
		SoundMngr.stop(SoundMngr.OH_SUZANNA);
		
		
		// to be replace with a function ?
		if (LevelManager._life <= 0)
		{	
			g_game_state = g_STATE_GAMEOVER;
			
			SoundMngr.play(SoundMngr.YOU_LOSE, false);
		}
		else
		{	
			g_game_state = g_STATE_LIFELOST;

			SoundMngr.play(SoundMngr.LAUGHING, false);
		
			setTimeout('Game.reset()', 3 * 1000);
		}
	},

	
	/* ---
	
		 rendering loop
		
		---										*/
	onUpdateFrame: function()
	{
		switch (g_game_state)
		{
		
			case g_STATE_LOADING:
			{
				RessourceMngr.displayLoadingScreen(this._frameBuffer);
				break;
			}
			
			case g_STATE_MENU:
			{
				LevelManager.displayGameTitle(this._frameBuffer);
				break;
			}

			case g_STATE_READY:
			{
				LevelManager.displayReadyToPlay(this._frameBuffer);
				break;
			}
			default :
			{
		
				// draw background
				LevelManager.drawLevelBackground(this._frameBuffer);		
				
				// update & draw customers
				if (Customers.draw(this._frameBuffer) !=0)
				{
					Game.lost();
				}
						
				// update &  draw beers
				if (Beerglass.draw(this._frameBuffer) !=0)
				{
					//console.log("Glass broken on row %d",row);
					Game.lost();
				}
		
				//draw player
				this._keyPressAllowed = Player.draw(this._frameBuffer);
		
				// display HUD stuff (score, life,...)
				LevelManager.drawGameHUD(this._frameBuffer);

				// GameOver is written on the TOP of everything
				if (g_game_state == g_STATE_GAMEOVER)
				{
					LevelManager.displayGameOver(this._frameBuffer);
				}
			}
			break;
		}
		
		// draw our frame !
		System.drawFrameBuffer();
		
	},
	
	
	/* ---
	
		 event management (onkey press)
		
		---										*/    
	onkeypress: function(e)
	{
		var prevenEvent = false;
		
		if (!this._keyPressAllowed) return;
		
		switch (e.keyCode)
		{
			case 38:			// UP arrow
				{
					if (g_game_state == g_STATE_PLAY)
						Player.move(Player.UP);
					prevenEvent = true;
					break;
				}
			case 40:			// DOWN arrow
				{
					if (g_game_state == g_STATE_PLAY)
						Player.move (Player.DOWN);
					prevenEvent = true;
					break;
				}
			case 37:			// LEFT arrow
				{
					if (g_game_state == g_STATE_PLAY)
						Player.move(Player.LEFT);
					prevenEvent = true;
					break;
				}
			case 39:			// RIGHT arrow
				{
					if (g_game_state == g_STATE_PLAY)
						Player.move(Player.RIGHT);
					prevenEvent = true;
					break;
				}
			case 32:			// SPACE
				{
					if (g_game_state == g_STATE_PLAY)
						Player.move(Player.FIRE);
					prevenEvent = true;
					break;
				}
			
			
			case 13:	// Press ENTER
				{
					switch (g_game_state)
					{
						case g_STATE_MENU:
						{
							
							// reset the level to the first one
							LevelManager.newGame();
																			
							Game.reset();
														
							break;
						}
						
						case g_STATE_GAMEOVER:
						{
							g_game_state = g_STATE_MENU;
							break;
						}
						
						case g_STATE_PLAY:
						{
							break;
						}
												
						default:
						{
							break;
						}
													
					} // end switch
					prevenEvent = true;
					break;
				}
							
				default : break;
		};
		// prevent/stop event
		if (prevenEvent)
		{
			e.preventDefault();
			e.stopImmediatePropagation();
		}
		
		
	},
	
	/* ---
	
		 event management (onkey release)
		
		---										*/    
	onkeyrelease: function(e)
	{
		var prevenEvent = false;
		
		if (!this._keyPressAllowed) return;
		
		switch (e.keyCode)
		{
			case 38:		// UP
			case 40:		// DOWN
				{
					prevenEvent = true;				
					break;
				}
			case 37:			// LEFT arrow
				{
					//console.log("LEFT unpressed");
					if (g_game_state == g_STATE_PLAY)
						Player.move(Player.NONE);
					prevenEvent = true;				
					break;
				}
			case 39:			// RIGHT arrow
				{
					//console.log("RIGHT unpressed");
					if (g_game_state == g_STATE_PLAY)
						Player.move(Player.NONE);
					prevenEvent = true;
					break;
				}
			case 32:			// SPACE
				{
					//console.log("SPACE unpressed");
					if (g_game_state == g_STATE_PLAY)
						Player.move(Player.NONE);
					prevenEvent = true;
					break;
				}
			default : break;
		};
		// prevent/stop event
		if (prevenEvent)
		{
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	}


}

window.onload = function()
{
	Game.initialize();
}
