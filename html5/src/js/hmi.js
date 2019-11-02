/**
 * @file hmi.js
 * @author Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * @date 2019 September 23
 *
 * @section LICENSE
 *
 * Copyright 2019, Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * All rights reserved.
 *
 * Released under the MIT license.
 *
 * @section DESCRIPTION
 *
 * @brief Class Hmi.
 *
 * Class representing the view or Hmi of PolyominoBlocks.
 * PolyominoBlocks is a solitaire tile placing game.
 *
 */

const EMPTY = ' ';
const BLOCK = 'X';
const BLOCKSRC = [
  // '552411211112114',
  '110',
  '2101',
  '1202',
  '2203',
  '2211',
  '22012',
  '22011',
  '22021',
  '22111',
  '31011',
  '13011',
  '33044',
  '33222',
  '410111',
  '140111',
  '220111',
  '320131',
  '321111',
  '230212',
  '231111',
  '230112',
  '230122',
  '230221',
  '231211',
  '320111',
  '320113',
  '320311',
  '322111',
  '321211',
  '320112',
  '230211',
  '231112',
  '5101111',
  '1501111',
  '3201112',
  '3202111',
  '2301121',
  '2301211',
  '3301113',
  '3301133',
  '3303311',
  '3323111',
  '3311112',
  '3301313',
  '3322111',
  '3303131',
  '3301331',
  '3311221',
  '3303113',
  '3321111',
];

function Hmi() {
  this.panel = { x: 260, y: 400 };
  this.boardPos = { x: 40, y: 200 };
}

Hmi.prototype.buildBlockPositions = function( i ) {
  var b = BLOCKSRC[i].split('');
  var dim = { x: Number(b[0]), y: Number(b[1]) };
  var result = [ dim ];
  var p = { x:0, y:0 };
  for (var n=2; n<b.length; ++n) {
    p.x += Number(b[n]);
    if (p.x >= dim.x) {
      p.x = p.x % dim.x;
      ++p.y;
    }
    result[result.length] = { x: p.x, y: p.y };
  }
  return result;
};

Hmi.prototype.renderPath = function( n ) {
  var path = '';
  var b = this.buildBlockPositions( n );
  for (var i=1; i<b.length; ++i) {
    path += 'M' + (b[i].x*20) + ',' + (b[i].y*20) +
      ' l20,0l0,20l-20,0l0,-20z ';
  }
  return { 'dim': { x: b[0].x, y: b[0].y }, 'path': path };
};

Hmi.prototype.buildGridPositions = function() {
  var result = [];
  for (var y=0; y<9; ++y) {
    for (var x=0; x<9; ++x) {
      if (this.grid[y][x]==BLOCK) {
        result[result.length] = { x: x, y: y };
      }
    }
  }
  return result;
};

Hmi.prototype.renderGrid = function() {
  this.gridPath.remove();
  var path = '';
  var b = this.buildGridPositions();
  for (var i=0; i<b.length; ++i) {
    path += 'M' + (b[i].x*20) + ',' + (b[i].y*20) +
      ' l20,0l0,20l-20,0l0,-20z ';
  }
  this.gridPath = this.paper.path( path ).attr({
    'fill': 'red', 'stroke-width': 5
  }).transform( 'T' + this.boardPos.x + ',' + this.boardPos.y );
};

Hmi.prototype.scoreLinesAndBlocks = function() {
  var column = new Array(9).fill(0);
  var row    = new Array(9).fill(0);
  var block  = new Array(9).fill(0);
  for(var x=0; x<9; ++x) {
    for(var y=0; y<9; ++y) {
      if (this.grid[y][x]==BLOCK) {
        ++column[x];
        ++row[y];
        ++block[Math.floor(y/3)*3+Math.floor(x/3)];
      }
    }
  }
  for(var i=0; i<9; ++i) {
    if (column[i]==9) {
      for(var y=0; y<9; ++y) {
        this.grid[y][i]=EMPTY;
        ++this.score;
      }
    }
    if (row[i]==9) {
      for(var x=0; x<9; ++x) {
        this.grid[i][x]=EMPTY;
        ++this.score;
      }
    }
    if (block[i]==9) {
      var xs=(i%3)*3;
      var ys=Math.floor(i/3)*3;
      for(var y=0; y<3; ++y) {
        for(var x=0; x<3; ++x) {
          this.grid[y+ys][x+xs]=EMPTY;
          ++this.score;
        }
      }
    }
  }
};

Hmi.prototype.dragstart = function(x, y, e) {
  this.dragElement = this.paper.getById(Number(e.target.raphaelid));
  var tmp = (this.dragElement.transform().split('t'))[1].split(',');
  this.oldTransform = { 'x': Number(tmp[0]), 'y': Number(tmp[1]) };
  this.newTransform = { 'x': Number(tmp[0]), 'y': Number(tmp[1]) };
  this.dragElement.attr('fill', 'yellow');
  this.dragElement.toFront();
};

Hmi.prototype.dragmove = function(dx, dy, x, y, e) {
  tmpX = this.oldTransform.x + dx * this.panel.x / this.size.x;
  tmpY = this.oldTransform.y + dy * this.panel.y / this.size.y;
  this.newTransform = { 'x': tmpX - (tmpX % 20), 'y': tmpY - (tmpY % 20) };
  this.dragElement.transform('T' + this.newTransform.x + ',' + this.newTransform.y );
};

Hmi.prototype.dragend = function(e) {
  var targetPos = {
    x: (this.newTransform.x-this.boardPos.x) / 20 ,
    y: (this.newTransform.y-this.boardPos.y) / 20
  };
  var b = this.buildBlockPositions( Number(this.dragElement.data('type')) );
  var onBoard = targetPos.x >= 0 && targetPos.y >= 0 &&
    targetPos.x + b[0].x <= 9 && targetPos.y + b[0].y <= 9;
  var fits = onBoard;
  if (onBoard) {
    for(var i=1; i<b.length && fits; ++i) {
      fits = this.grid[targetPos.y + b[i].y][targetPos.x + b[i].x] == EMPTY;
    }
    if (fits) {
      for(var i=1; i<b.length; ++i) {
        this.grid[targetPos.y + b[i].y][targetPos.x + b[i].x] = BLOCK;
      }
      this.dragElement.undrag();
      this.dragElement.remove();
      this.score += b.length;
      this.scoreLinesAndBlocks();
      this.setHeader();
      --this.remaining;
      if (this.remaining<1) {
        this.prepareRound();
      }
      this.renderGrid();
    }
  }
  if(!onBoard || !fits) {
    this.dragElement.transform('T' + this.oldTransform.x + ',' + this.oldTransform.y );
  }
  this.dragElement.attr('fill', 'red');
};

Hmi.prototype.prepareRound = function() {
  var initialTilePos = [
    { x:  70, y: 10 },
    { x:  10, y: 80 },
    { x: 130, y: 80 }
  ];
  this.remaining = 3;
  for (var a = 0; a<this.remaining; ++a) {
    var n = Math.floor(Math.random() * BLOCKSRC.length );
    // n = 0;
    var p = this.renderPath(n);
    var t = { x: (60 - 10 * p.dim.x), y: (60 - 10 * p.dim.y) };
    this.tile[a] = this.paper.path( p.path ).attr({
      'fill': 'red', 'stroke-width': 5
    }).transform( 'T' + (t.x + initialTilePos[a].x) +
      ',' + (t.y + initialTilePos[a].y) );
    this.tile[a].data('type', n);
    this.tile[a].data('tile', a)
    this.tile[a].drag(this.dragmove.bind(this),
      this.dragstart.bind(this), this.dragend.bind(this));
  }
};

Hmi.prototype.resize = function () {
  var offsetHeight = 64,
    availableWidth = window.innerWidth - 64,
    availableHeight = window.innerHeight - offsetHeight;
  this.size = availableWidth/availableHeight < this.panel.x/this.panel.y ?
    { x: availableWidth, y: availableWidth * this.panel.y/this.panel.x } :
    { x: availableHeight * this.panel.x/this.panel.y, y: availableHeight } ;
  this.paper.setSize( this.size.x, this.size.y );
  this.paper.setViewBox( 0, 0, this.panel.x, this.panel.y, false );
  var boardMarginTop = (availableHeight - this.size.y) / 2;
  $('#board').css({ 'margin-top': boardMarginTop + 'px' });
  $('#selectmenu').css({ 'margin-top': boardMarginTop + 'px' });
  $('#game-page').css({
    'background-size': 'auto ' + (this.size.x * 9 / 6) + 'px',
  });
  var size = (this.size.x + this.size.y) / 2 / 9;
  var minSize = 60;
  var iconSize = size < minSize ? minSize : size;
  var maxSize = 120;
  iconSize = maxSize < iconSize ? maxSize : iconSize;
  $('#customMenu').css({
    'width': iconSize+'px', 'height': iconSize+'px',
    'background-size': iconSize+'px ' + iconSize+'px',
  });
  var backAttributes = {
    'width': iconSize+'px', 'height': iconSize+'px',
    'background-size': iconSize+'px ' + iconSize+'px',
  };
  $('#customBackRules').css(backAttributes);
  $('#customBackAbout').css(backAttributes);
};

Hmi.prototype.initBoard = function () {
  this.paper = Raphael( 'board', this.panel.x, this.panel.y);
  this.paper.setViewBox(0, 0, this.panel.x, this.panel.y, false );
  this.resize();
};

Hmi.prototype.initGame = function () {
  this.paper.rect( 0, 0, this.panel.x, this.panel.y ).attr({
    stroke: '#444', 'stroke-width': 0.2, 'stroke-linecap': 'round',
    fill: 'darkslategrey'
  });
  for(var y=0; y<10; ++y) {
    this.paper.path(
      'M0,' + y*20 + 'l180,0' +
      'M' + y*20 + ',0l0,180'
    ).attr({
      'fill' : 'none',
      'stroke-width' : (y%3) == 0 ? 3 : 1
    }).transform( 'T' + this.boardPos.x + ',' + this.boardPos.y );
  }
  this.gridPath = this.paper.path('');
  this.grid = [];
  for (var y=0; y<9; ++y) {
    this.grid[y] = new Array(9).fill(EMPTY);
  }
  this.score = 0;
  this.remaining = 0;
  this.tile = new Array(3);
  this.prepareRound();
  this.setHeader();
};

Hmi.prototype.init = function () {
  this.initBoard();
  this.initGame();
  var $window = $(window);
  // window.onorientationchange( this.resize.bind( this ) );
  window.addEventListener("orientationchange", this.resize.bind( this ));
  $window.resize( this.resize.bind( this ) );
  $window.resize();
  $('#restart').on( 'click', this.startChallenge.bind(this) );
};

Hmi.prototype.startChallenge = function() {
  this.paper.clear();
  this.initGame();
  $('#left-panel').panel('close');
};

Hmi.prototype.setHeader = function() {
  $('#myheader').html( "Polyomino Blocks - score: " + this.score );
};

var g_Hmi = new Hmi();
$(document).ready( function () { g_Hmi.init(); });
