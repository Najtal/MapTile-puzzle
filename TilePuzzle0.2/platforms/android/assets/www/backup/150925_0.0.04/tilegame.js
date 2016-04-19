
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

  var levelDelta = [3, 5, 10];
  var level = 2;
  var terrain = 0;
  var terrains = ["roadmap", "satellite", "hybrid", "terrain"];

  var clickLoc = new Object;
  clickLoc.x = 0;
  clickLoc.y = 0;

  var emptyLoc = new Object;
  emptyLoc.x = 0;
  emptyLoc.y = 0;

  var tileCount = 0;  // nombre de tuiles
  var tilePuzzleSizeX = 0;  // taille pièce (nav)
  var tilePuzzleSizeY = 0;  // taille pièce (nav)
  var tileImageSizeX = 0;  // taille pièce (image)
  var tileImageSizeY = 0;  // taille pièce (image)


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

  //tileCount = document.getElementById('scale').value;
  setTileSize();

  img.addEventListener('load', drawTiles, false);
  setBoard();
}


/*  
 *  EVENT HANDLERS
 */

$(".nbt").click(function() {
  tileCount = $(this).attr("val");
  start();
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


document.getElementById('puzzle').onclick = function(e) {
  clickLoc.x = Math.floor((e.pageX - this.offsetLeft) / Math.floor(this.offsetWidth/tileCount));
  clickLoc.y = Math.floor((e.pageY - this.offsetTop) / Math.floor(this.offsetHeight/tileCount));
  if (distance(clickLoc.x, clickLoc.y, emptyLoc.x, emptyLoc.y) == 1) {
    slideTile(emptyLoc, clickLoc, true);
    //drawTiles();
  }
  if (solved) {
    setTimeout(reinit(), 200);
  }
};

function setTileSize() {
  // On défini le nombre de tuiles et leurs tailles

  boardSizeW = document.getElementById('puzzle').width;
  boardSizeH = document.getElementById('puzzle').height;
  //boardSizeW = context.width;
  //boardSizeH = context.height;
  tilePuzzleSizeX = Math.floor(boardSizeW / tileCount);
  tilePuzzleSizeY = Math.floor(boardSizeH / tileCount);

  tileImageSizeX = Math.floor(mapSizeW / tileCount);
  tileImageSizeY = Math.floor(mapSizeH / tileCount);
}



/*
 *  Crée le plateau de jeu
 */
function setBoard() {
  tileCount = parseInt(tileCount);
  boardParts = new Array();
  for (var i = 0; i < tileCount; ++i) {
    boardParts[i] = new Array(tileCount);
    for (var j = 0; j < tileCount; ++j) {
      boardParts[i][j] = new Object;
      boardParts[i][j].x = i;//(tileCount - 1) - i;
      boardParts[i][j].y = j;//(tileCount - 1) - j;
    }
  }

  emptyLoc.x = boardParts[tileCount - 1][tileCount - 1].x;
  emptyLoc.y = boardParts[tileCount - 1][tileCount - 1].y;
  solved = false;

  for (var k = 0; k < levelDelta[level]; k++) {

      var possibility = [];
      // test des possibilités de l'axe X
      if (emptyLoc.x != 0) { possibility.push(boardParts[emptyLoc.x-1][emptyLoc.y]);}
      if (emptyLoc.x != tileCount-1) { possibility.push(boardParts[emptyLoc.x+1][emptyLoc.y]);}
      // test des possibilités de l'axe Y
      if (emptyLoc.y != 0) { possibility.push(boardParts[emptyLoc.x][emptyLoc.y-1]);}
      if (emptyLoc.y != tileCount-1) { possibility.push(boardParts[emptyLoc.x][emptyLoc.y+1]);}

      slideTile(emptyLoc, possibility[Math.floor(Math.random() * possibility.length)], false);
  }
  console.log(boardParts)

}

function drawTiles() {

  var ratioX = tileImageSizeX/tilePuzzleSizeX;
  var ratioY = tileImageSizeY/tilePuzzleSizeY;

  //context.clearRect(0, 0, boardSizeH, boardSizeW );
  for (var i = 0; i < tileCount; ++i) {
    for (var j = 0; j < tileCount; ++j) {
      
      var x = boardParts[i][j].x;
      var y = boardParts[i][j].y;
      
      if(i != emptyLoc.x || j != emptyLoc.y || solved == true) {
        context.drawImage(img, //Specifies the image, canvas, or video element to use
          x * tileImageSizeX, //Optional. The x coordinate where to start clipping
          y * tileImageSizeY, //Optional. The y coordinate where to start clipping
          tileImageSizeX,  //Optional. The width of the clipped image
          tileImageSizeY,  //Optional. The height of the clipped image
          i * tilePuzzleSizeX, //The x coordinate where to place the image on the canvas
          j * tilePuzzleSizeY, //The y coordinate where to place the image on the canvas
          Math.floor(tileImageSizeX / ratioX), //Optional. The width of the image to use (stretch or reduce the image)
          Math.floor(tileImageSizeY / ratioY)); //Optional. The height of the image to use (stretch or reduce the image)
        // source: http://www.w3schools.com/tags/canvas_drawimage.asp
      }
    }
  }
  context.fillRect(emptyLoc.x * tilePuzzleSizeX, emptyLoc.y * tilePuzzleSizeY, tilePuzzleSizeX, tilePuzzleSizeY);
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
  if (zoom > 3) {
    zoom = zoom-Math.floor(diff);
  }
  var urlImage = 'https://maps.googleapis.com/maps/api/staticmap?center='+latitude+','+longitude+'&zoom='+zoom+'&size='+mapSizeW+'x'+mapSizeH+'&scale=2&maptype='+terrains[terrain]+'&format=jpeg&key=AIzaSyDs4S29HhwYIfmr3cNpuMji0V6NZuoGGUk';

  mapSizeW = mapSizeW*2;
  mapSizeH = mapSizeH*2;

  // Récupération et initialisation de l'image
  img = new Image();
  img.src = urlImage;
}



function slideTile(toLoc, fromLoc, check) {
  if (!solved) {

    

    boardParts[toLoc.x][toLoc.y].x = boardParts[fromLoc.x][fromLoc.y].x;
    boardParts[toLoc.x][toLoc.y].y = boardParts[fromLoc.x][fromLoc.y].y;
    boardParts[fromLoc.x][fromLoc.y].x = tileCount - 1;
    boardParts[fromLoc.x][fromLoc.y].y = tileCount - 1;
    toLoc.x = fromLoc.x;
    toLoc.y = fromLoc.y;

    // Si mouvement vertical
    if(toLoc.x==fromLoc.x) {

      var x = fromLoc.x;
      var y = fromLoc.y;

      var ratioX = tileImageSizeX/tilePuzzleSizeX;
      var ratioY = tileImageSizeY/tilePuzzleSizeY;

      var ips = 30;
      var Hz = 1000/3;

      var dir = 1;
      var up = 0;
      if(fromLoc.y > toLoc.y) {
        dir = -1;
        up = 1;
      }

      context.fillRect(
        fromLoc.x * tilePuzzleSizeX, 
        fromLoc.y * tilePuzzleSizeY, 
        tilePuzzleSizeX, 
        tilePuzzleSizeY
      );


      for(var i=0; i<=ips; i++) {

            setTimeout(function(){

              if (i<ips) {

                context.fillRect(250,250,Math.floor(255/ips*i),100); 

                context.fillRect(
                  toLoc.x * tilePuzzleSizeX, // Position de base X
                  toLoc.y * tilePuzzleSizeY + 2*up*tilePuzzleSizeY + (dir*i*Math.floor(tilePuzzleSizeY/ips)), // position de base Y
                  tilePuzzleSizeX, // Longueur W
                  Math.floor(tilePuzzleSizeY/ips)); // Longueur H
              }

              context.drawImage(img, //Specifies the image, canvas, or video element to use
                x * tileImageSizeX, //Optional. The x coordinate where to start clipping
                y * tileImageSizeY, //Optional. The y coordinate where to start clipping
                tileImageSizeX,  //Optional. The width of the clipped image
                tileImageSizeY,  //Optional. The height of the clipped image
                x * tilePuzzleSizeX, //The x coordinate where to place the image on the canvas
                y * tilePuzzleSizeY + i*dir*Math.floor(tilePuzzleSizeY/ips), //The y coordinate where to place the image on the canvas
                Math.floor(tileImageSizeX / ratioX), //Optional. The width of the image to use (stretch or reduce the image)
                Math.floor(tileImageSizeY / ratioY)); //Optional. The height of the image to use (stretch or reduce the image)
            }, Hz*i);
      }

    } else {
      drawTiles();
    }

    setTimeout(drawTiles(), Hz*ips);
    /*
    emptyLoc.x = fromLoc.x;
    emptyLoc.y = fromLoc.y;
*/
    if (check==true) {
      checkSolved();  
    }
  }
}

function checkSolved() {
  var flag = true;
  for (var i = 0; i < tileCount; ++i) {
    for (var j = 0; j < tileCount; ++j) {
      if (boardParts[i][j].x != i || boardParts[i][j].y != j) {
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
  $("#gameMenu").css("display", "initial");

}
