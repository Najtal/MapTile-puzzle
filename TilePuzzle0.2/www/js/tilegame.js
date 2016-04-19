    $("#puzzle").hide();

    // INITIALISATION des variables globales
    var context;  // le canvas
    var boardSizeW; // taille plateau de jeu (nav)
    var boardSizeH; // taille plateau de jeu (nav)
    var mapSizeW;
    var mapSizeH;
    var img; // image récup
    var boardParts; // tableau des parties de jeu
    var solved = false;
    var ingame = false;

    // Difficulty
    var diffVoc = ["NOOB", "EASY", "NORMAL", "GOOD", "WARRIOR", "INSANE"];
    var diffData = [2, 3, 4, 5, 6];
    var difficulty = 0;
    // Level
    var levelDelta = [10, 30, 60, 100, 200, 500];
    var level = 0;
    // Terrains
    var terrain = 0;
    var terrains = ["roadmap", "satellite", "hybrid", "terrain"];

    $('.diff').first().text(diffVoc[difficulty]);
    $('.lvl').first().text('LVL ' + (level+1));

    var clickLoc = new Object;
    clickLoc.x = 0;
    clickLoc.y = 0;

    var emptyLoc;

    var tileCount = 0;  // nombre de tuiles
    var tilePuzzleSizeX = 0;  // taille pièce (nav)
    var tilePuzzleSizeY = 0;  // taille pièce (nav)
    var tileImageSizeX = 0;  // taille pièce (image)
    var tileImageSizeY = 0;  // taille pièce (image)
    var ratioY;
    var ratioX;



  /*  
   *  EVENT HANDLERS
   */
     
  $(".start").click(function(){
    tileCount = diffData[difficulty];
    start();
  });

  $(".lvl").click(function() {
  	if (level == levelDelta.length) {
  		level = 0;
  	} else {
  		level++;
  	}

    $('.lvl').first().text('LVL ' + (level+1));
  });

  $(".diff").click(function() {
  	if (difficulty == diffVoc.length) {
  		difficulty = 0;
  	} else {
  		difficulty++;
  	}

    $('.diff').first().text(diffVoc[difficulty]);
  });

  $(".terrain").click(function() {
    if (terrain == 3) { 
      terrain = 0;
    } else {
      terrain = terrain+1;
    }

    switch(terrain) {
        case 0:
            map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
            break;
        case 1:
            map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
            break;
        case 2:
            map.setMapTypeId(google.maps.MapTypeId.HYBRID);
            break;
        case 3:
            map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
            break;
    }  
  });

  $(".again").click(function() {
    setBoard();
  });

  $(".back").click(function() {
    reinit();
  });

  document.getElementById('puzzle').onclick = function(e) {
    clickLoc.x = Math.floor((e.pageX - this.offsetLeft) / Math.floor(this.offsetWidth/tileCount));
    clickLoc.y = Math.floor((e.pageY - this.offsetTop) / Math.floor(this.offsetHeight/tileCount));
    if (distance(clickLoc.x, clickLoc.y, emptyLoc.x, emptyLoc.y) == 1) {
      slideTile(boardParts[emptyLoc.x][emptyLoc.y], boardParts[clickLoc.x][clickLoc.y], true, true);
    }
    if (solved) {
      setTimeout(reinit(), 200);
    }
  };



  function start() {
    
    // on récupère la taille du la map
    mapSizeW = document.getElementById('map').offsetWidth;
    mapSizeH = document.getElementById('map').offsetHeight;

    // on cache la map et on affiche le plateau de jeu (canvas)
    $("#map").hide(); // cache la map
    $("#puzzle").show(); // cache la map

    $("#puzzle").css("height", $(window).height()*0.8);
    $("#puzzle").css("width", $(window).width());

    $("#selectMenu").css("display", "none");
    $("#gameMenu").css("display", "inline");

    // on initialise le tableau de jeu
    context = document.getElementById('puzzle').getContext('2d');

    // On récupère l'image static
    getMapImage();

	$("#map").hide(); // cache la map
    $("#puzzle").show(); // Afficher le jeu

    $("#puzzle").css("height", $(window).height()*0.8);
    $("#puzzle").css("width", $(window).width());

    $("#selectMenu").css("display", "none");
    $("#gameMenu").css("display", "inline");


    setTileSize();
    setBoard();
  }

  function setTileSize() {
    // On défini le nombre de tuiles et leurs tailles

    boardSizeW = document.getElementById('puzzle').width;
    boardSizeH = document.getElementById('puzzle').height;

    tilePuzzleSizeX = Math.floor(boardSizeW / tileCount);
    tilePuzzleSizeY = Math.floor(boardSizeH / tileCount);

    tileImageSizeX = Math.floor(mapSizeW / tileCount);
    tileImageSizeY = Math.floor(mapSizeH / tileCount);

    ratioX = tileImageSizeX/tilePuzzleSizeX;
    ratioY = tileImageSizeY/tilePuzzleSizeY;
  }

  // Crée le plateau de jeu
  function setBoard() {
    tileCount = tileCount;
    boardParts = new Array(tileCount);
    for (var i = 0; i < tileCount; i++) {
      boardParts[i] = new Array(tileCount);
      for (var j = 0; j < tileCount; j++) {
        var newtile = new Object();
        newtile.x = i;
        newtile.y = j;
        newtile.ox = i;
        newtile.oy = j;
        boardParts[i][j] = newtile;
      }
    }

    // on décide de la case a vider
    emptyLoc = new Object();
    emptyLoc.x = Math.floor(Math.random() * diffData[difficulty]);
    emptyLoc.y = Math.floor(Math.random() * diffData[difficulty]);
    emptyLoc.ox = emptyLoc.x;
    emptyLoc.oy = emptyLoc.y;

    solved = false;

    do {
      // On mélange le jeu
      for (var k = 0; k < levelDelta[level]; k++) {
          var possibility = new Array();
          // test des possibilités de l'axe X
          if (emptyLoc.x != 0) { possibility.push(boardParts[emptyLoc.x-1][emptyLoc.y]);}
          if (emptyLoc.x != tileCount-1) { possibility.push(boardParts[emptyLoc.x+1][emptyLoc.y]);}
          // test des possibilités de l'axe Y
          if (emptyLoc.y != 0) { possibility.push(boardParts[emptyLoc.x][emptyLoc.y-1]);}
          if (emptyLoc.y != tileCount-1) { possibility.push(boardParts[emptyLoc.x][emptyLoc.y+1]);}
          
          slideTile(boardParts[emptyLoc.x][emptyLoc.y], possibility[Math.floor(Math.random() * possibility.length)], false, false);
      }
      checkSolved();
    } while (solved);


    // On dessine le tableau
    drawBoard();
  }


  function drawTile(tile) {

    if (emptyLoc.x != tile.x || emptyLoc.y != tile.y) {
      context.drawImage(img, //Specifies the image, canvas, or video element to use
              tile.ox * tileImageSizeX, //Optional. The x coordinate where to start clipping
              tile.oy * tileImageSizeY, //Optional. The y coordinate where to start clipping
              tileImageSizeX,  //Optional. The width of the clipped image
              tileImageSizeY,  //Optional. The height of the clipped image
              tile.x * tilePuzzleSizeX, //The x coordinate where to place the image on the canvas
              tile.y * tilePuzzleSizeY, //The y coordinate where to place the image on the canvas
              Math.floor(tileImageSizeX / ratioX), //Optional. The width of the image to use (stretch or reduce the image)
              Math.floor(tileImageSizeY / ratioY));
    } else {
      context.fillRect(
        emptyLoc.x * tilePuzzleSizeX, 
        emptyLoc.y * tilePuzzleSizeY, 
        tilePuzzleSizeX, 
        tilePuzzleSizeY
      );
    }
  }

  function drawBoard() {
    for(var i=0;i<tileCount;i++) {
      for (var j=0; j<tileCount; j++) {
        drawTile(boardParts[i][j]);
      }
    }
  }

  function slideTile(toLoc, fromLoc, paint, check) {
    // ! toLoc est emptyLoc

    if (!solved) {

      var totile = new Object();
      totile.ox = toLoc.ox;
      totile.oy = toLoc.oy;
      totile.x = fromLoc.x;
      totile.y = fromLoc.y;

      var fromtile = new Object();
      fromtile.ox = fromLoc.ox;
      fromtile.oy = fromLoc.oy;
      fromtile.x = toLoc.x;
      fromtile.y = toLoc.y;

      boardParts[fromtile.x][fromtile.y] = fromtile;
      boardParts[totile.x][totile.y] = totile;

      emptyLoc.x = fromLoc.x;
      emptyLoc.y = fromLoc.y;

      if (paint) {
        drawTile(totile);
        drawTile(fromtile);
      }

      if (check==true) {
        checkSolved();  
      }
    }
  }

  function distance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  function getMapImage() {
    var NewMapCenter = map.getCenter();
    var latitude = NewMapCenter.lat();
    var longitude = NewMapCenter.lng();
    var zoom = map.getZoom();
    var mapWrap = mapSizeW/640;
    var mapHrap = mapSizeH/640;
    var diff;

    if (mapHrap > mapWrap) {
      diff = mapHrap;
    } else {
      diff = mapWrap;
    }
    if (diff > 1) {
      mapSizeW = Math.floor(mapSizeW/diff);
      mapSizeH = Math.floor(mapSizeH/diff);
    }
    /*if (zoom > 3) {
      zoom = zoom-Math.floor(diff);
    }*/
    var urlImage = 'https://maps.googleapis.com/maps/api/staticmap?center='+latitude+','+longitude+'&zoom='+zoom+'&size='+mapSizeW+'x'+mapSizeH+'&scale=2&maptype='+terrains[terrain]+'&format=jpeg&key=AIzaSyDs4S29HhwYIfmr3cNpuMji0V6NZuoGGUk';

    mapSizeW = mapSizeW*2;
    mapSizeH = mapSizeH*2;

    // Récupération et initialisation de l'image
    img = new Image();
    img.src = urlImage;
  }


  function checkSolved() {
    var flag = true;
    for (var i = 0; i < tileCount; ++i) {
      for (var j = 0; j < tileCount; ++j) {
        if (boardParts[i][j].ox != i || boardParts[i][j].oy != j) {
          flag = false;
        }
      }
    }
    solved = flag;
  }

  function reinit() {
    $('#butstart').html('Start game');
    $("#puzzle").hide();
    $("#map").show();
    $("#selectMenu").css("display", "initial");
    $("#gameMenu").css("display", "none");
  }

