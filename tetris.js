/*CONFIG*/
var WIDTH = 500;
var HEIGHT = 500;
var BLOCK_SIZE = 25; // 25*25
var FPS = 24; //draw frames per second
var clock = 4; //updates per second

var shapes = [
	// I
	[
		[1,0,0,0],
		[1,0,0,0],
		[1,0,0,0],
		[1,0,0,0]
	],

	// L
	[
		[0,0,0,0],
		[0,1,0,0],
		[0,1,0,0],
		[0,1,1,0]
	],

	// Z
	[
		[0,0,0,0],
		[1,1,0,0],
		[0,1,1,0],
		[0,0,0,0]
	],

	// O
	[
		[0,0,0,0],
		[0,1,1,0],
		[0,1,1,0],
		[0,0,0,0]
	]
];

function empty_matrix() {
	return 	[[0,0,0,0],
			[0,0,0,0],
			[0,0,0,0],
			[0,0,0,0]];
}

function Shape(grid, x, y, colour) {
	this.colour = colour || randomCol();
	this.grid = shapes[grid], shapes[0];
	this.x = x || 0;
	this.y = y || 0;
	this.downMost = null;
	this.leftMost = null;
	this.rightMost = null;

	function right() {
		this.x += BLOCK_SIZE;
	}

	function left() {
		this.x -= BLOCK_SIZE;
	}

	//Get the bounds of the active blocks in a shape
	this.bounds = function() {
		var downMost = 0;
		var leftMost = this.grid[0].length + 1;
		var rightMost = -1;
		for (var y = 0; y < this.grid.length; y++)
			for (var x = 0; x < this.grid[y].length; x++) {
				if (this.grid[y][x] != 0) {
					downMost = y;

					if (x < leftMost)
						leftMost = x;

					if (x > rightMost)
						rightMost = x;
				}
			}
		this.leftMost = leftMost;
		this.rightMost = rightMost;
		this.downMost = downMost;

		return this;
	};

	this.transpose = function() {
		var newMatrix = empty_matrix();
		for (var y = 0; y < this.grid.length; y++) {
			for (var x = 0; x < this.grid[y].length; x++) {
				newMatrix[x][y] = this.grid[y][x];
			}
		}
		this.grid = newMatrix;
	};

	this.rotateRight = function() {
		this.transpose();
		var newMatrix = empty_matrix();

		for (var y = 0; y < this.grid.length; y++) {
			newMatrix[newMatrix.length - 1 - y] = this.grid[y];
		}
		this.grid = newMatrix;
	}
}

function randomCol() {
	var hex = "0123456789ABCDEF";
	var ret = "";
	for (var i = 0; i < 6; i++)
		ret += hex[Math.floor(Math.random() * (hex.length - 1))];
	return "#" + ret;
}

function Tetris() {
	var canvas = document.getElementById("main"),
		ctx = canvas.getContext("2d"),
		activeShape = null,
		backroundGrid = [],
		backgroundShape = new Shape(0, 0, 0),
		tick = 0;

	function col(colour) {
		colour = colour || "#000000";
		ctx.fillStyle = colour;
	}

	function drawGrid() {
		col("#000000");	
		for(var x = 0.5; x < 501; x+=BLOCK_SIZE){
			ctx.moveTo(x, 0);
			ctx.lineTo(x, WIDTH);
		}
		for (var y = 0.5; y < 501; y+=BLOCK_SIZE) {
			ctx.moveTo(0, y);
			ctx.lineTo(HEIGHT, y);
		}
		ctx.stroke();
	}

	function drawShape(shape) {
		col(shape.colour);
		for(var i = 0; i < shape.grid.length; i++)
			for(var j = 0; j < shape.grid[i].length; j++) {
				if(shape.grid[i][j])
					ctx.fillRect(shape.x + BLOCK_SIZE * j, shape.y + BLOCK_SIZE * i, BLOCK_SIZE, BLOCK_SIZE);
			}
	}

	window.onkeydown = function(e) {
		if (activeShape === null)
			return;

		activeShape.bounds();
		if (e.keyCode == 37 && activeShape.x - activeShape.leftMost * BLOCK_SIZE > 0 && !willCollide(activeShape, activeShape.x - BLOCK_SIZE, activeShape.y)) {
			activeShape.x -= BLOCK_SIZE;
		} else if(e.keyCode == 39 & activeShape.x + (activeShape.rightMost + 1) * BLOCK_SIZE < WIDTH && !willCollide(activeShape, activeShape.x + BLOCK_SIZE, activeShape.y)) {
			activeShape.x += BLOCK_SIZE;
		} else if (e.keyCode == 38) {
			activeShape.rotateRight();
		}
	}

	function willCollide(shape, x, y) {
		var nextY = y + BLOCK_SIZE * (activeShape.downMost + 1);

		if (nextY >= HEIGHT)
			return true;

		var offsetX = Math.floor(x / BLOCK_SIZE);
		var offsetY = Math.floor(y / BLOCK_SIZE);
		for (var y = 0; y < shape.grid.length; y++)
			for (var x = 0; x < shape.grid[y].length; x++) {
				if (shape.grid[y][x] == 1 && backroundGrid[y + offsetY][x + offsetX])
					return true;
			}
		return false;
	}

	function moveToBack(shape) {
		var offsetX = Math.floor(shape.x / BLOCK_SIZE);
		var offsetY = Math.floor(shape.y / BLOCK_SIZE);
		for (var i = 0; i < shape.grid.length; i++)
			for(var j = 0; j < shape.grid[i].length; j++) {
				if (shape.grid[j][i])
					backgroundShape.grid[j + offsetY][i+offsetX] = 1;
			}
	}

	function dropNewShape() {
		activeShape = new Shape(Math.floor(Math.random() * 3), 0, 0);
	}

	function update() {
		activeShape.bounds();
		// console.log(activeShape.downMost, activeShape.leftMost, activeShape.rightMost);
		if (willCollide(activeShape, activeShape.x, activeShape.y + BLOCK_SIZE)) {
			moveToBack(activeShape);
			dropNewShape();
			return;
		}
		activeShape.y += BLOCK_SIZE;
	}

	for (var i = 0; i < Math.ceil(WIDTH/BLOCK_SIZE); i++) {
		var row = [];
		for(var j = 0; j < Math.ceil(HEIGHT/BLOCK_SIZE); j++)
			row.push(0);
		backroundGrid.push(row);
	}
	backgroundShape.grid = backroundGrid;
	// backgroundShape.colour = "#"

	activeShape = new Shape(1, 0, 0);
	function draw() {
		tick = (tick + 1) % FPS;
		if (tick % Math.floor(FPS/clock) == 0)
			update();
		ctx.clearRect(0, 0, WIDTH, HEIGHT);

		drawGrid();
		drawShape(backgroundShape);
		drawShape(activeShape);


	}
	draw();
	setInterval(draw, Math.ceil(1000/FPS));
}

document.addEventListener('DOMContentLoaded', Tetris);