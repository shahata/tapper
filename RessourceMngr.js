/* -----

	a small class to manage loading of stuff
	and manage ressourses
	(that's a quick&dirty one...)
		
	------									*/

var g_imageData = [	{name: "game_title", src: "images/game_title.png"},
							{name: "pregame",		src: "images/pregame.png"},
							{name: "level-1",		src: "images/level-1.png"},
							{name: "barman",		src: "images/barman.png"},
							{name: "beerglass",	src: "images/beerglass.png"},
							{name: "customers",	src: "images/customers.png"},
							{name: "font",			src: "images/font.png"},
							{name: "misc",			src: "images/misc.png"}
						];


var g_soundData = [	{name: "zip_up",					src: "sounds/zip_up.mp3",					channel : 4},	// 0
							{name: "zip_down",				src: "sounds/zip_down.mp3",				channel : 4},	// 1
							{name: "oh_suzanna",				src: "sounds/oh_suzanna.mp3",				channel : 1},	// 2
							{name: "grab_mug",				src: "sounds/grab_mug.mp3",				channel : 2},	// 3
							{name: "throw_mug",				src: "sounds/throw_mug.mp3",				channel : 4},	// 4
							{name: "mug_fill1",				src: "sounds/mug_fill1.mp3",				channel : 2},	// 5
							{name: "mug_fill2",				src: "sounds/mug_fill2.mp3",				channel : 2},	// 6
							{name: "full_mug",				src: "sounds/full_mug.mp3",				channel : 1},	// 7
							{name: "pop_out",					src: "sounds/pop_out.mp3",					channel : 4},	// 8
							{name: "out_door",				src: "sounds/out_door.mp3",				channel : 4},	// 9
							{name: "laughing",				src: "sounds/laughing.mp3",				channel : 1},	// 10
							{name: "get_ready_to_serve",	src: "sounds/get_ready_to_serve.mp3",	channel : 1},	// 11
							{name: "you_lose",				src: "sounds/you_lose.mp3",				channel : 1},	// 12
							{name: "collect_tip",			src: "sounds/collect_tip.mp3",			channel : 1},	// 13
							{name: "tip_appear",				src: "sounds/tip_appear.mp3",				channel : 1},	// 14
						];
						

var RessourceMngr =
{	

	// contains all the images of the game
	imageList:					null,
	
	
	loadCount:					0,
	
	loadingscreenLogo:		null,
		
	loadingTitleName:			"images/loading_title.png",
	logoWidth:					234,
	logoHeight:					104,
	
	ressourceCount:			0,
	
	_loadedCallBack:			undefined,
	
	
	/* ---
	
		check the loading status
		
		---										*/
	checkLoadStatus:	function () 
	{
		
		//console.log ("%d/%d", RessourceMngr.loadCount, RessourceMngr.ressourceCount);
		if (RessourceMngr.loadCount == RessourceMngr.ressourceCount)
		{
			// callback function when loaded is finished
			RessourceMngr._loadedCallBack();
		}
		else
		{
			setTimeout("RessourceMngr.checkLoadStatus()", 100);
		}
	},
	

	
	/* ---
	
		load all the game ressources and display
		a loading screen
		
		---										*/
	
	loadAllRessources: function(loadCallBack)
	{	
		
	
		/* load all images & sprites */
		RessourceMngr.ressourceCount = RessourceMngr.preloadImages(g_imageData);
												
		// load all sounds										
		RessourceMngr.ressourceCount += RessourceMngr.preLoadSounds(g_soundData);
		
		// init our "loaded" callback
		RessourceMngr._loadedCallBack = loadCallBack;
		
		// check the status every 100ms
		setTimeout("RessourceMngr.checkLoadStatus()", 100);
		
	},
		
	

	/* ---
	
		just increment the number of already loaded ressources
		
		---										*/
	
	ressourceLoaded: function()
	{
		RessourceMngr.loadCount++;
	},
	
	
	/* ---
	
		load Images
		
		call example : 
		
		doLoadAll(
                [{name: 'image1', src: 'images/image1.png'},
                 {name: 'image1', src: 'images/image1.png'},
                 {name: 'image1', src: 'images/image1.png'},
                 {name: 'image1', src: 'images/image1.png'}]);
		
		---										*/
		
	preloadImages: function(/* Array */ images)
	{
		this.imageList = new Array();
		
		// for each image, call preload()
		for ( var i = 0; i < images.length; i++ )
		{
			// create new Image object and add to array
			var newImage = new Image();
			
			this.imageList.push(images[i].name);
	
			newImage.src = images[i].src;
			
			newImage.onLoad = RessourceMngr.ressourceLoaded();
					
			// assign our new image to the array element
			this.imageList[images[i].name] = newImage;
			
		}
		
		return images.length;
	},
	
	
	/* ---
	
		preload all sounds...
		---									*/

	preLoadSounds: function(soundData)
	{
		for ( var i = 0; i < soundData.length; ++i )
		{
			SoundMngr.load(i, soundData[i], RessourceMngr.ressourceLoaded);

		}
		return soundData.length;
	},


	/* ---
	
		display a loading screen
		
		---										*/
	displayLoadingScreen: function(context)
	{	
		
		// First we load our loading screen
		this.loadingscreenLogo = new Image();
		this.loadingscreenLogo.src = this.loadingTitleName;
		
		context.fillStyle = "black";
		context.fillRect (0, 0, context.canvas.width, context.canvas.height);
		context.fill();
		context.drawImage(this.loadingscreenLogo, (context.canvas.width - this.logoWidth) / 2, (context.canvas.height - this.logoHeight) / 2);
			
		
		// display a progressive loading bar
		var percent = RessourceMngr.loadCount / RessourceMngr.ressourceCount;
		var width = Math.floor(percent * context.canvas.width);
		
		context.strokeStyle = "gray";
		context.strokeRect(0,299, context.canvas.width,20);
		context.fillStyle = "gray";
		context.fillRect(0,299, width,20);
		
		// loading text on top of it
		context.fillStyle    = "white";
		context.font         = 'bold 14px Courier';
		context.textBaseline = 'top';
		context.fillText  ('Loading...', 218, 300);
	},


	/* ---
	
		Return the specified image
		param : name of the image ("game title");
		
		---										*/
	
	getImageRessource: function(name)
	{	
		return this.imageList[name];
	},
	

}