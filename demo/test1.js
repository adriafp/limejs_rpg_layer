//set main namespace
goog.provide('test1');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.fill.Frame');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.KeyframeAnimation');
goog.require('lime.parser.TMX');

var objects = [];

var hero;

var gameScene;
var director;

test1.preLoad = function() {
    core.size = 1;
    core.cellSize = 16*core.size;
    core.WIDTH = core.cellSize*30;
    core.HEIGHT = core.cellSize*15;

    core.showGrid = false;
    core.showPath = false;

    core.prepareGrid();

    director = new lime.Director(document.body,core.WIDTH,core.HEIGHT);
    gameScene = new lime.Scene();

    test1.preLoadMainScene(function(){
        core.loadSprite('clotharmor',function(){
            test1.start();
        });
    });
    /*test1.preLoadHouseScene(function(){
        core.loadSprite('clotharmor',function(){
            core.loadSprite('deathknight',function(){
                test1.start();
            });
        });
    });*/
};

// entrypoint
test1.start = function(){
    $("#loading").hide();

    var layer = new lime.Layer();

    gameScene.appendChild(layer);

//    test1.preLoadMainScene();

    for(i=0; i < tmxLayers.length;i++) {
        var tmxLayer = tmxLayers[i];
        tmxLayer.setPosition(core.cellSize/2, core.cellSize/2);
        gameScene.appendChild(tmxLayer);
    }

//    var assetsLayer = new lime.Layer();

//    var frame = new lime.fill.Frame('assets/'+core.size+'/tilesheet.png', core.cellSize*17, core.cellSize*9, core.cellSize, core.cellSize); //x , y, width, height
//    frame.setSize(core.cellSize/core.WIDTH,core.cellSize/core.HEIGHT,true);

//    var test = new lime.Sprite().setSize(core.WIDTH,core.HEIGHT).setFill(frame).setPosition(core.WIDTH/2,core.HEIGHT/2);
//    gameScene.appendChild(test);

//    var stone = core.getAsset('stone',core.cellSize*9,core.cellSize*0);
//    gameScene.appendChild(stone);

//    var tree = core.getAsset('tree',core.cellSize*3,core.cellSize*5);
//    assetsLayer.appendChild(tree);

//    var tree2 = core.getAsset('tree',core.cellSize*23,core.cellSize*5);
//    assetsLayer.appendChild(tree2);

//    var house = core.getAsset('house',core.cellSize*13,core.cellSize*2);
//    assetsLayer.appendChild(house);

    hero = core.createCharacter('clotharmor');
//    hero = core.createCharacter('deathknight');
//    hero = core.createCharacter('redarmor');

    core.getCharacterAnimation({character:hero,animationName:'idle_down'});
    gameScene.appendChild(hero);
    console.debug(gameScene.getChildIndex(hero));
    gameScene.setChildIndex(hero, gameScene.getChildIndex(hero)-1);
    console.debug(gameScene.getChildIndex(hero));

//    gameScene.appendChild(assetsLayer);

    //gameScene.setRenderer(lime.Renderer.CANVAS);

    if(core.showGrid) {
        for(var i =0; i < core.grid.length; i++) {
            for(var j =0; j < core.grid[i].length; j++) {
                var filled = core.grid[i][j]==1;
                var square = new lime.Sprite().setSize(core.cellSize,core.cellSize).setAnchorPoint(0,0).setPosition(i*core.cellSize,j*core.cellSize);
                square.setStroke(1,(filled?'#c00':'#0c0')).setOpacity(.5);
                gameScene.appendChild(square);
            }
        }
    }
    
    goog.events.listen(gameScene,['mousedown','touchstart'],function(e){

        var xcell = parseInt(e.position.x/core.cellSize);
        var ycell = parseInt(e.position.y/core.cellSize);
        if(xcell==16 && ycell==10) {
            var coor = new goog.math.Coordinate(16*core.cellSize,12*core.cellSize);
            core.movePath(hero,coor,layer,gameScene, function(){
                test1.houseScene();
            });
            return;
        }

        if(!core.isMovingToPath()) {
            core.movePath(hero,e.position,layer,gameScene);
        }
    });

	director.makeMobileWebAppCapable();

	// set current scene active
	director.replaceScene(gameScene);

};

var tmx;
var tmxLayers = [];

test1.houseScene = function(){

    objects = [];

    gameScene = new lime.Scene();

    var layerMovement = new lime.Layer();
    gameScene.appendChild(layerMovement);

    var background = new lime.Sprite();
    background.setFill('#42321a');
    background.setPosition(core.WIDTH/2,core.HEIGHT/2).setSize(core.WIDTH,core.HEIGHT);
    gameScene.appendChild(background);
    for(i=0; i < tmxLayers.length;i++) {
        var tmxLayer = tmxLayers[i];
        tmxLayer.setPosition(core.cellSize/2, core.cellSize/2);
        gameScene.appendChild(tmxLayer);
    }

    hero = core.createCharacter('deathknight');
    core.setCharacterPosition(hero, 15, 10);
    gameScene.appendChild(hero);

    core.getCharacterAnimation({character:hero,animationName:'idle_down'});

    goog.events.listen(gameScene,['mousedown','touchstart'],function(e){

        var xcell = parseInt(e.position.x/core.cellSize);
        var ycell = parseInt(e.position.y/core.cellSize);
        if(xcell==16 && ycell==10) {
            var coor = new goog.math.Coordinate(16*core.cellSize,12*core.cellSize);
            core.movePath(hero,coor,layerMovement,gameScene, function(){
                test1.houseScene();
            });
            return;
        }

        if(!core.isMovingToPath()) {
            core.movePath(hero,e.position,layerMovement,gameScene);
        }
    });



    core.prepareGrid();
    if(core.showGrid) {
        for(var i =0; i < core.grid.length; i++) {
            for(var j =0; j < core.grid[i].length; j++) {
                var filled = core.grid[i][j]==1;
                var square = new lime.Sprite().setSize(core.cellSize,core.cellSize).setAnchorPoint(0,0).setPosition(i*core.cellSize,j*core.cellSize);
                square.setStroke(1,(filled?'#c00':'#0c0')).setOpacity(.5);
                gameScene.appendChild(square);
            }
        }
    }

    // set current scene active
    director.replaceScene(gameScene);
};

test1.preLoadHouseScene = function(callback) {
    tmx = new lime.parser.TMX('assets/1/cave1.tmx');
    for(var j = 0; j < tmx.layers.length; j++)
    {
        //canvas renderer is recommended for tiled maps. much faster in most cases
        var tmxLayer = new lime.Layer().setRenderer(lime.Renderer.CANVAS);
        tmxLayers.push(tmxLayer);
        for(var i = 0; i < tmx.layers[j].tiles.length; i++)
        {
            tile = tmx.layers[j].tiles[i];
            sprite = new lime.Sprite().setPosition(tile.px,tile.py);
            sprite.setFill(tile.tile.frame);
            tmxLayer.appendChild(sprite);
        }
    }

    for(i=0;i<tmx.objects.length;i++) {
        console.debug("tmx objects = " + tmx.objects[i].name);
        for(j=0;j<tmx.objects[i].length;j++){
            console.debug("tmx objects[i] = " + tmx.objects[i][j]);
        }
    }
    callback();
};

test1.preLoadMainScene = function(callback) {
    tmx = new lime.parser.TMX('assets/1/mainhouse.tmx');
    for(var j = 0; j < tmx.layers.length; j++)
    {
        //canvas renderer is recommended for tiled maps. much faster in most cases
        var tmxLayer;
        if(j==0 || j==tmx.layers.length-1) {
            tmxLayer = new lime.Layer();
//            if(!core.isiPhone) {
                tmxLayer.setRenderer(lime.Renderer.CANVAS);
//            }
            tmxLayers.push(tmxLayer);
        }
        for(var i = 0; i < tmx.layers[j].tiles.length; i++)
        {
            tile = tmx.layers[j].tiles[i];
            sprite = new lime.Sprite().setPosition(tile.px,tile.py);
            sprite.setFill(tile.tile.frame);
            tmxLayer.appendChild(sprite);
        }
    }
    var forbiddenCells = [];
    for(i=0;i<tmx.objects.length;i++) {
        var o = tmx.objects[i];
        if(o.name=='noCell') {
            var coordinate = {x:o.x/core.cellSize, y:o.y/core.cellSize};
            forbiddenCells.push(coordinate);
        }
    }
    core.addGridForbiddenCells(forbiddenCells);

//    for(i=0;i<tmx.objects.length;i++) {
//        console.debug("tmx objects = " + tmx.objects[i].name);
//    }
    if(callback!==undefined) callback();
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('test1.start', test1.start);
