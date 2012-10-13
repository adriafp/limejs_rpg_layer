
var core = {
    //GENERAL OPTIONS
    size : null,
    cellSize : null,
    WIDTH : null,
    HEIGHT : null,
    showGrid : false,
    showPath : false,

    //CHARACTERS
    characters: [],
    loadSprite: function(name, callback) {
        $.getJSON('assets/sprites/'+name+'.json', function(data) {
            console.debug('loading sprite: ' + name);
            core.characters[name] = data;
            callback();
        });
    },
    getCharacterAnimation : function(options) {
        options = $.extend({},{character:null, animationName:null, move:null}, options);
        var character = options.character;
        var animationName = options.animationName;
        animationName = (animationName.endsWith('_left'))?animationName.replace('_left','_right'):animationName;

        var move = options.move;

        var obj = core.characters[character.type];
        var w = obj.width;
        var h = obj.height;
        var anim_length = obj.animations[animationName].length;
        var anim_row = obj.animations[animationName].row;

        // show animation
        var anim = new lime.animation.KeyframeAnimation();
        for(var i = 0; i < anim_length; i++) {
//            anim.addFrame(new lime.fill.Frame('assets/'+core.size+'/'+character.type+'.png',i*w*core.size,h*anim_row*core.size,w*core.size,h*core.size).setSize(1,1,true));
            anim.addFrame(core.getCharacterFrame({characterType: character.type, animationName: animationName, frameNumber:i}));
        }
        if(move==null) {
            anim.setDelay(.12*anim_length);
        } else {
            anim.setDelay(.12);
        }
        character.runAction(anim.enableOptimizations());

        if(move!=null) {
            goog.events.listen(move,lime.animation.Event.STOP,function(){
                anim.stop();
            });
        }
        if(options.animationName.endsWith('_left')) {
            hero.setScale(-1,1);
        } else {
            hero.setScale(1,1);
        }
    },
    getCharacterFrame:function(options){
        options = $.extend({},{characterType: null, animationName: null, frameNumber: 0},options);
        if(options.animationName.endsWith('_left')) {
            options.animationName = options.animationName.replace('_left','_right');
        }
        var obj = core.characters[options.characterType];
        var w = obj.width;
        var h = obj.height;
        var anim_row = obj.animations[options.animationName].row;

        return new lime.fill.Frame('assets/'+core.size+'/'+options.characterType+'.png',options.frameNumber*w*core.size,h*anim_row*core.size,w*core.size,h*core.size).setSize(1,1,true)
    },
    createCharacter : function(type) {
        var obj = core.characters[type];
        var w = obj.width;
        var h = obj.height;

        var frame = core.getCharacterFrame({characterType: type, animationName: 'walk_down'});
        frame.setSize(1,1,true);

        var sprite = new lime.Sprite().setSize(w*core.size,h*core.size).setFill(frame);
        core.setCharacterPosition(sprite, 5, 5);
//        sprite.setPosition(5*core.cellSize/2 , 5 * core.cellSize/2-(4*core.size));
        sprite.type = type;
        return sprite;
    },
    setCharacterPosition: function(character, cellx, celly) {
//        character.setPosition(cellx * core.cellSize/2 , celly * core.cellSize/2-(4*core.size));
//        character.setPosition(1 * core.cellSize/2 , 1 * core.cellSize/2-(4*core.size));
        character.setPosition((cellx * core.cellSize) - (core.cellSize/2) , celly * core.cellSize-(core.cellSize/2)-(4*core.size));
    },
    getAsset : function(asset, x, y) {
        var assetX = core.cellSize*assets[asset].x;
        var assetY = core.cellSize*assets[asset].y;
        var assetW = core.cellSize*assets[asset].w;
        var assetH = core.cellSize*assets[asset].h;
    
        var frame = new lime.fill.Frame('assets/'+core.size+'/tilesheet.png', assetX, assetY, assetW, assetH); //x , y, width, height
        frame.setSize(1,1,true);
        var sprite = new lime.Sprite().setSize(assetW,assetH).setFill(frame);
        sprite.setPosition(x+assetW/2,y+assetH/2);
        sprite.type = asset;
        objects.push(sprite);
        return sprite;
    },

    getTile : function(x, y, posx, posy) {
        var frame = new lime.fill.Frame('assets/'+core.size+'/tilesheet.png', x, y, core.cellSize, core.cellSize); //x , y, width, height
        frame.setSize(1,1,true);
        var sprite = new lime.Sprite().setSize(core.cellSize,core.cellSize).setFill(frame);
        sprite.setPosition(posx+core.cellSize/2,posy+core.cellSize/2);
        return sprite;
    },

    //MOVEMENT
    pathStep : -1,
    currentPath : null,
    destinySquare : null,
    
    isMovingToPath : function() {
        return core.pathStep!=-1;
    },
    
    movePath : function(obj,pos,layer,scene, callback) {
        if(core.currentPath==null) {
            core.currentPath = core.calculatePath(pos);
            var xcell = parseInt(pos.x/core.cellSize);
            var ycell = parseInt(pos.y/core.cellSize);
            if(core.currentPath.length==0) {
                if(core.showPath) console.debug('x: '+(xcell)+', y: '+(ycell));
                //add error square
                var errorSquare = new lime.Sprite()
                    .setSize(core.cellSize,core.cellSize)
                    .setAnchorPoint(0,0)
                    .setPosition(xcell*core.cellSize,ycell*core.cellSize)
                    .setOpacity(.5)
                    .setStroke(3,'#f00');
                scene.appendChild(errorSquare);
                var errorMovement = new lime.animation.Sequence(
                    new lime.animation.MoveTo(xcell*core.cellSize-2,ycell*core.cellSize).setDuration(.25),
                    new lime.animation.MoveTo(xcell*core.cellSize+4,ycell*core.cellSize).setDuration(.25),
                    new lime.animation.MoveTo(xcell*core.cellSize-4,ycell*core.cellSize).setDuration(.25),
                    new lime.animation.MoveTo(xcell*core.cellSize+2,ycell*core.cellSize).setDuration(.25),
                    new lime.animation.MoveTo(xcell*core.cellSize,ycell*core.cellSize).setDuration(.25),
                    new lime.animation.FadeTo(0).setDuration(.25)
                );
                errorSquare.runAction(errorMovement);
                goog.events.listen(errorMovement,lime.animation.Event.STOP,function(){
                    scene.removeChild(errorSquare);
                });
                //destinyIndex = scene.getChildIndex(square);
            } else {
                //add destiny square
                var square = new lime.Sprite()
                    .setSize(core.cellSize,core.cellSize)
                    .setAnchorPoint(0,0)
                    .setPosition(xcell*core.cellSize,ycell*core.cellSize)
                    .setOpacity(.5)
                    .setStroke(core.size,'#fff');
                scene.appendChild(square);
                core.destinySquare = square;
            }
        }
        var path = core.currentPath;
        if(core.pathStep<path.length-1){
            core.pathStep++;
//            var coor = new goog.math.Coordinate(path[core.pathStep].x*core.cellSize+(core.cellSize/2),path[core.pathStep].y*core.cellSize+(core.cellSize/2));
            var coor = new goog.math.Coordinate(path[core.pathStep].x*core.cellSize+(core.cellSize/2),path[core.pathStep].y*core.cellSize+(core.cellSize/2));
            var move = core.moveToPosition(obj,scene.localToNode(coor,layer));
            goog.events.listen(move,lime.animation.Event.STOP,function() {
                core.movePath(obj,pos,layer,scene,callback);
            });
        } else {
            //show hero correctly
            hero.setFill(core.getCharacterFrame({characterType:hero.type,animationName:'walk_down'}));
            //show end animation
            core.getCharacterAnimation({character:hero,animationName:'idle_down'});

            //remove destiny square
            scene.removeChild(core.destinySquare);

            //reset move path params
            core.pathStep = -1;
            core.currentPath = null;
            core.destinySquare = null;
            if(callback!==undefined)
                callback();
        }
    },
    
    moveToPosition : function(character,pos){
    
        var delta = goog.math.Coordinate.difference(pos,character.getPosition()),
            angle = Math.atan2(-delta.y,delta.x);
    
        //determine the direction    
        var dir = Math.round(angle/(Math.PI*2)*4);
        var animsName = ['walk_right','walk_up','walk_left','walk_down'];
        if(dir<0) dir=4+dir;
        var animName = animsName[dir];
    
        //show correctly due to flip
        character.setFill(core.getCharacterFrame({characterType:character.type, animationName:animName}));
    
        //move
//        var move = new lime.animation.MoveTo(Math.round(pos.x),Math.round(pos.y-(4*core.size))).setEasing(lime.animation.Easing.LINEAR).setSpeed(2/core.size);
        var move = new lime.animation.MoveTo(Math.round(pos.x),Math.round(pos.y-(4*core.size))).setEasing(lime.animation.Easing.LINEAR).setSpeed(.5);
        character.runAction(move.enableOptimizations());
    
        core.getCharacterAnimation({character:character,animationName:animName,move:move});
    
        return move;
    
    },
    
    calculatePath : function(pos) {
        var graph = new Graph(core.grid);
    
        var start = graph.nodes[parseInt(hero.getPosition().x/core.cellSize)][parseInt(hero.getPosition().y/core.cellSize)];
        //var end = graph.nodes[1][2];
        var end = graph.nodes[parseInt(pos.x/core.cellSize)][parseInt(pos.y/core.cellSize)];
        var path = astar.search(graph.nodes, start, end);
        return core.optimizePath(start, path);
    },
    
    pathStepsSquares : [],
    
    optimizePath : function(start, path) {
    
        if(core.pathStepsSquares.length>0) {
            for(var index = 0; index < core.pathStepsSquares.length; index++) {
                gameScene.removeChild(core.pathStepsSquares[index]);
            }
        }
        if(core.showPath) {
            for(i =0; i < path.length; i++) {
                console.debug('old path: ['+path[i].x+','+path[i].y+']');
                var greenSquare = new lime.Sprite().setSize(core.cellSize,core.cellSize).setAnchorPoint(0,0).setPosition(path[i].x*core.cellSize,path[i].y*core.cellSize);
                greenSquare.setStroke(1,'#0c0');
                core.pathStepsSquares.push(greenSquare);
                gameScene.appendChild(greenSquare);
            }
        }
    
        path.unshift(start);
    
        var toRemove = [0];
    
        //Finding and removing repetitive x positions:
        for(var i = 1; i < path.length; i++) {
            if(i+1<path.length) {
                if(path[i].x==path[i-1].x && path[i].x==path[i+1].x) {
                    toRemove.push(i);
                } else if(path[i].y==path[i-1].y && path[i].y==path[i+1].y) {
                    toRemove.push(i);
                }
    
            }
        }
    
        for(i=0; i<toRemove.length; i++) {
            var indexToRemove = toRemove[i];
            path.splice(indexToRemove-i,1);
        }
    
        if(core.showPath) {
            for(i =0; i < path.length; i++) {
                console.debug('new path: ['+path[i].x+','+path[i].y+']');
                var square = new lime.Sprite().setSize(core.cellSize,core.cellSize).setAnchorPoint(0,0).setPosition(path[i].x*core.cellSize,path[i].y*core.cellSize);
                square.setStroke(1,'#00c');
                core.pathStepsSquares.push(square);
                gameScene.appendChild(square);
            }
        }
        return path;
    },
    //GRID CALCULATION
    grid : null,
    prepareGrid : function() {
        var grid = [];
    
        var t2 = parseInt(core.WIDTH/core.cellSize);
        var t = parseInt(core.HEIGHT/core.cellSize);
    
        for(var i = 0; i<t2; i++) {
            var arr = [];
            for(var j = 0; j<t; j++) {
                arr.push(0);
            }
            grid.push(arr);
        }
        core.grid = grid;
        for(i = 0; i < objects.length; i++) {
            core.addObjectToGrid(objects[i]);
        }
    },
    
    addObjectToGrid : function(obj) {
        var hx = obj.getPosition().x;
        var hy = obj.getPosition().y;
        var hw = obj.getSize().width;
        var hh = obj.getSize().height;
    
        var s2 = Math.round(hw/core.cellSize);
        var s1 = Math.round(hh/core.cellSize);
        var p2 = Math.round(hx/core.cellSize-s2/2);
        var p1 = Math.round(hy/core.cellSize-s1/2);
    
        p2+=assets[obj.type].forbiddenArea.x;
        p1+=assets[obj.type].forbiddenArea.y;
        s1=assets[obj.type].forbiddenArea.h;
        s2=assets[obj.type].forbiddenArea.w;
    
    
        for(var i = p2; i<p2+s2; i++) {
            for(var j = p1; j<p1+s1; j++) {
                core.grid[i][j] = 1;
            }
        }
    },
    addGridForbiddenCells: function(array) {
        for(var j = 0; j<array.length; j++) {
            var o = array[j];
            if(o.x<core.WIDTH/core.cellSize && o.y<=core.HEIGHT/core.cellSize)
                core.grid[o.x][o.y-1] = 1;
        }
    }

};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

core.isiPhone = navigator.userAgent.toLowerCase().indexOf("iphone") > -1;
/*
jQuery(window).bind('orientationchange', function(e) {

    switch ( window.orientation ) {

        case 0:
            alert('portrait mode');
            break;

        case 90:
            alert('landscape mode screen turned to the left');
            break;

        case -90:
            alert('landscape mode screen turned to the right');
            break;

    }

});
*/