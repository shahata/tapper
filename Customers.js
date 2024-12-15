/* -----

	a small class to manage the customers
	
	------									*/


function oneCustomer (row, default_xpos, movingPattern, type)
{

	
	var CustomerObj = 
	{
		STATE_WAIT:				0,
		STATE_CATCH:			1,
		STATE_DRINK:			2,
	
		STEP:						Customers.STEP,
	
		state:					0,
		
		type:						type,
		
		sprite:					0,
		sprite2:					0,
		
		movingPattern:			movingPattern,
		animationCounter:		-1,
		
		// default position of the first sprite
		xpos:						default_xpos,
		ypos:						LevelManager.row_ypos[row],
		
		// default y position of the second sprite
		ypos2:					LevelManager.row_ypos[row],

		row:						row,
		l_bound:					LevelManager.row_lbound[row],
		r_bound:					LevelManager.row_rbound[row],
		
		fpscount:				0,
		fpsmax:					(g_FPS>>3),
		newxpos:					0,
		
		EndOfRow:				false,
		isOut:					false,
		
		
		update: function()
		{	
			
			switch (this.state)
			{	
			
				// customer is waiting for a beer :)
				case this.STATE_WAIT:
				{	
					if (this.fpscount++ > this.fpsmax)
					{
				
						this.animationCounter++;
					
						this.sprite = this.movingPattern[this.animationCounter] << 5; //* 32;
					
						if (this.animationCounter == this.movingPattern.length) 
							this.animationCounter = -1;
			  	
				
						this.fpscount = 0;
					}
			
					if (this.movingPattern[this.animationCounter] < 2)
					{
						if (this.xpos < this.r_bound)
							this.xpos += this.STEP;
						else
							this.EndOfRow = true;
			
					}
					break;
				}
				
				// customer catch a beer !
				case this.STATE_CATCH:
				{	
					this.xpos -= (this.STEP*2);
				
					// check is customer go out of the row
					if (this.xpos < this.l_bound)
					{
						this.isOut = true;
					}
					else if (this.xpos < this.newxpos)
					{
						this.fpscount = 0;
						this.animationCounter = 0;
						
						// Switch to DRINK STATE
						this.state = this.STATE_DRINK;
						
						// change sprites to driking beer
						this.sprite = Customers.DRINKING_BEER_1 << 5 ;
						this.sprite2 = Customers.DRINKING_BEER_2 << 5 ;
						
						this.ypos2 = this.ypos;
					}

					break;
				}
				
				case this.STATE_DRINK:
				{	
					
					if (this.fpscount++ > this.fpsmax)
					{
					
						// empty the glass
						this.animationCounter++;
										
						//if (this.animationCounter == this.movingPattern.length) 
						//	this.animationCounter = -1;
			  	
						this.fpscount = 0;
					}
					
					if (this.animationCounter == 3)
					{
					
						this.state = this.STATE_WAIT;
						
						this.animationCounter = -1;
						this.fpscount = 0;
						this.sprite = this.movingPattern[0] << 5;
						// add a new glass
						Beerglass.add(this.row, (this.xpos + Customers._spritewidth), Beerglass.EMPTY_MUG);
						
						// see if we give a bonus
						Customers.checkBonus(this.row, this.xpos);
						
					}

					break;
				}


			
			}
			
		},
		
		// called when collision detected with a fulll mug 
		
		catchBeer: function()
		{
			// switch to CATCH State
			this.newxpos = this.xpos - (((this.r_bound - this.l_bound) / 5)*2);
						
			this.state = this.STATE_CATCH;
			
			// change sprites to holding beer
			this.sprite  = Customers.HOLDING_BEER_1  << 5 ;
			this.sprite2 = Customers.HOLDING_BEER_2  << 5 ;
			
			this.ypos2 = this.ypos +  8;
			
		}
		
	}
	return CustomerObj;
}

/** CUSTOMERS  **/

var Customers =
{
	
	// defaut moving speed
	
	STEP:							1,
	
	// Customer Types
	CUST_GREEN_HAT_COWBOY:	0,
	CUST_WOMEM:					1,
	CUST_BLACK_GUY:			2,
	CUST_GRAY_HAT_COWBOY:	3,
	
	MAX_CUSTOMER_TYPE:		4,
	
	
	
	// sprites position within the PNG file
	REGULAR_1:					0,
	REGULAR_2:					1,
	
	ANGRY_1:						2,
	ANGRY_2:						3,
	
	HOLDING_BEER_1:			4,
	HOLDING_BEER_2:			7,
	
	DRINKING_BEER_1:			5,
	DRINKING_BEER_2:			8,
	
	// sprites position in the misc file
	BONUS_OFF:					5,
	
	
	// define the y offset in the customer image
	_cust_y_offset:			[0, 32, 64, 96],
	



	// animation & moving pattern for each row
	
	_movingPatternArray:		[ null, // no row 0
									  [0, 1, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],	// row 1
									  [0, 1, 0, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],				// row 2
									  [0, 1, 0, 2, 3, 2, 3, 2, 3],								// row 3
									  [0, 1, 0, 1, 2, 3, 2, 3]										// row 4
									],								
																																							
	
	// contains the more advanced customer pos for each line
	_customerxpos:				[5],
	_maxpos:						[5],
		
	_customersList:			new Array(), // [row, Cust Obj]
	
	
	_endOfTheRowCustomer:	null,


	_spriteimage:				null,
	_miscImage:					null,
	
	
	_spritewidth:				32,
   _spriteheight:				32,
	
	
	// to manage the bonus
	_bonus :
	{
		visible: false,
		timeout:	10 * 1000, // 10ms
		timeout_reached: true,
		row:		1,
		xpos:		100,
	
	},
	
	
	/* ---
		
		Initialize required stuff...
		---									*/
		
	init: function()
	{
		// get the customer sprites
		this._spriteimage = RessourceMngr.getImageRessource("customers");
		
		// contains the bonus image
		this._miscImage	= RessourceMngr.getImageRessource("beerglass");

	
	},
	
	/* ---
	
		to be called before each new game
		
		---										*/
		
	reset: function()
	{	
		// reset our arrays.
		for (var count = 1; count < 5; count++)
		{
			// is this freeing memory when object have been allocated before ?
			this._customersList[count] = [];
			this._customerxpos[count] = -1;
		}
		
		this.oneReachEndOfRow		= false;
		this._endOfTheRowCustomer  = false;
		
		// byebye Bonus :)
		this._bonus.visible = false;
	},
	
	
	/* ---
	
		add a new customer
		
		row (row number 1-4)
		pos (starting from 1)
		type (customer type)
		---										*/
	
	add: function(row, pos, type)
	{
		//add a customer !
		//console.log("adding customer %d on row %d !", type, row);
			
		// new customer (starting x position as parameter)
		var cust = new oneCustomer(row, LevelManager.row_lbound[row], this._movingPatternArray[row], type);
		
		cust.xpos += (pos - 1) * this._spritewidth;
				
		// add it to our array
		this._customersList[row].push(cust);
		
	},
	
	
	
	/* ---
	
		check if we add a bonus to the game
		
		---										*/
	checkBonus: function(row, customerxpos)
	{
		if ((!this._bonus.visible) && (this._bonus.timeout_reached))
		{
			// if the first third part of the row
			if (customerxpos < (LevelManager.row_lbound[row] + ((LevelManager.row_rbound[row] - LevelManager.row_lbound[row])/3)) )
			{	
				// add some random :)
				var randomrow=Math.floor(Math.random()*6);
				if (randomrow == row)
				{	
					this._bonus.visible				= true;
					this._bonus.row					= row;
					this._bonus.xpos					= customerxpos;
					this._bonus.ypos					= LevelManager.row_ypos[row] + 16;
					this._bonus.timeout_reached	= false;
					
					// remove the bonus after the defined time
					setTimeout('Customers._bonus.visible = false; Customers._bonus.timeout_reached = true', this._bonus.timeout);
					// tip tap sounds..
					SoundMngr.play(SoundMngr.TIP_APPEAR, false);
				}
			}
		}
		// only one bonus at a time
	},
	
	
	/* ---
	
		called to see if we meet a bonus :)
		
		---										*/
	checkBonusCollision: function(row, xpos)
	{
		if ( (this._bonus.visible) && (this._bonus.row == row) && (xpos <= this._bonus.xpos + this._spritewidth))
		{	
			// AHA AHHH
			this._bonus.visible = false;
			// gimme some points baby !
			LevelManager.addScore(LevelManager.SCORE_BONUS);
			// and ring your small bell :)
			SoundMngr.play(SoundMngr.COLLECT_TIP, false);
		}
	},
	
	
	/* ---
	
		draw a Bonus (if exist)
		
		---										*/
	drawBonus: function(context)
	{
		if (this._bonus.visible)
		{
			context.drawImage(this._miscImage,	
									this.BONUS_OFF << 5,	0, 
									this._spritewidth,	this._spriteheight,  
									this._bonus.xpos,		this._bonus.ypos,
									this._spritewidth,	this._spriteheight );
		}
	},
	
	/* ---
	
		function called when a live is lost
		
		---										*/
	stop: function()
	{  
		// to be optimized.... :)
	},
	
	/* ---
	
		return the xpos position of the first customer
		
		---										*/
	getFirstCustomerPos: function(row)
	{
		/// there is a bug somewhere that cause an execption if the second condition is not checked
		if ((this._customerxpos[row] != -1) && (this._customersList[row][this._customerxpos[row]]))
			return this._customersList[row][this._customerxpos[row]].xpos;
	},


	/* ---
	
		called when a collision is detected by a beer :)
		
		---										*/
	beerCollisionDetected: function(row)
	{
		// only validate the collision if the customer is in wait state
		if (this._customersList[row][this._customerxpos[row]].state == 0)
		{
			// change the customer status
			this._customersList[row][this._customerxpos[row]].catchBeer();
			return true;
		}
		else
			return false;
	},
	
	
	
	/* ---
	
		return the total numbers of customers on all rows
		
		---
											*/
	isAnyCustomer: function ()
	{
		return (this._customersList[1].length + this._customersList[2].length + this._customersList[3].length + this._customersList[4].length  )
	},
	
	/* ---
		
		draw the customers in the specified canvas context
		return the current row if a customer reach the end of the line
		
		---														*/
	
	draw: function(context /*2D Canvas context*/ )
	{
		
		var cust;
		var ret = 0;
		var custArrayCopy = null;
		var copyFlag = false;
				
		// reset the max pos counters
		this._customerxpos =[-1,-1,-1,-1,-1];
		this._maxpos =[0,0,0,0,0];
		
		for (var rowcount=1; rowcount < 5; rowcount++)
		{
			
			// we copy the array, since we will maybe remove some customers
			custArrayCopy = this._customersList[rowcount].slice();
			
			for (var i=this._customersList[rowcount].length; i--;)
			{
				cust = this._customersList[rowcount][i];
				
				if ((!this.oneReachEndOfRow) && (g_game_state == g_STATE_PLAY))
				{
					cust.update();
					
					if (cust.isOut)
					{
						// remove this customer for the list
						custArrayCopy.splice(i,1);
						copyFlag = true;
						// play the out songs
						SoundMngr.play(SoundMngr.OUT_DOOR, false);
						// add points !
						LevelManager.addScore(LevelManager.SCORE_CUSTOMER);
						
						// we finished here, SKIP to next customer :)
						continue;

					}
					else
					{
						// save position if the first one on the row
						if ((cust.xpos > this._maxpos[rowcount]) && (cust.state == cust.STATE_WAIT))
						{
							// save the index of the customer within the row
							this._customerxpos[rowcount] = i;
							this._maxpos[rowcount] = cust.xpos;
						}
					}
				
				}
				
				
				if ((cust.EndOfRow) && (this.oneReachEndOfRow == false))
				{
						this.oneReachEndOfRow = true;
						this._endOfTheRowCustomer = cust;
						LevelManager.lifeLost();
						ret = rowcount;

				}
			
				// draw our customer
				context.drawImage(this._spriteimage,	
										cust.sprite,			this._cust_y_offset[cust.type], 
										this._spritewidth,	this._spriteheight, 
										cust.xpos,				cust.ypos,
										this._spritewidth,	this._spriteheight );

				
				// draw the second part for the other states
				if (cust.state != cust.STATE_WAIT)
				{
					context.drawImage(this._spriteimage,	
											cust.sprite2,			this._cust_y_offset[cust.type], 
											this._spritewidth,	this._spriteheight, 
											cust.xpos + 32,		cust.ypos2,
											this._spritewidth,	this._spriteheight );
				}

			} // end for
			
			// if we customer went out we update the array
			if (copyFlag)
			{
				// copy over the new array
				this._customersList[rowcount] = custArrayCopy.slice();
			}

		}
		
		// and draw the Bonus if any
		this.drawBonus(context);
		
		return ret;

	}
	
}