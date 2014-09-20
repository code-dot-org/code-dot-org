// Displays one Boggle Cube
function BoggleCube(size) {
	this.rect = new Rectangle(size,size);
	this.color = "#73D6FF";
	this.rect.setColor(this.color);
	this.highlightColor = "#006CFF";
	add(this.rect);
	this.letter = "";
	this.letterText = new Text("");
	add(this.letterText);
}

BoggleCube.prototype = new Rectangle;
BoggleCube.prototype.constructor = BoggleCube;

BoggleCube.prototype.draw = function() {
	this.rect.draw();
	this.letterText.draw();
}

BoggleCube.prototype.setPosition = function(x,y) {
	this.rect.setPosition(x,y);
	this.letterText.setPosition(x + this.getWidth()/2 - this.letterText.getWidth()/2, y + this.getHeight()/2 + this.letterText.getHeight()/2 - 5);
}

BoggleCube.prototype.setLetter = function(letter) {
	this.letter = letter;
	this.letterText.setLabel(letter);
	this.setPosition(this.getX(), this.getY());
}

BoggleCube.prototype.setColor = function(color) {
	this.rect.setColor(color);
}

BoggleCube.prototype.getLetter = function() {
	return this.letter;
}

BoggleCube.prototype.getX = function() {
	return this.rect.getX();
}

BoggleCube.prototype.getY = function() {
	return this.rect.getY();
}

BoggleCube.prototype.getWidth = function() {
	return this.rect.getWidth();
}

BoggleCube.prototype.getHeight = function() {
	return this.rect.getHeight();
}



/*
 * Handles the display of the Boggle Board made up of many BoggleCubes
 *
 * Usage: 	var board = new BoggleBoard(4);
 *			board.setPosition(80,60);
 *			add(board);
 */
function BoggleBoard(dimension, x, y) {
	Rectangle.call(this);
	this.dimension = dimension;
	this.x = x == undefined ? 0 : x;
	this.y = y == undefined ? 0 : y;
	
	this.CUBE_SPACING = dimension == 4 ? 5 : 4;
	this.CUBE_SIZE = dimension == 4 ? 50 : 40;
	this.SCORE_OFFSET = 20;
	this.WORDS_PER_COLUMN = 25;
	this.WORD_HEIGHT = 11;
	
	this.cubes = new Grid(dimension, dimension);
	this.cubes.init("");
	
	this.numWordsScored = 0;
	this.score = 0;
	this.scoreLabel = new Text("Score: 0", "8pt Verdana");
	this.scoreLabel.setPosition(this.getX() + this.getDimension()*(this.CUBE_SPACING + this.CUBE_SIZE) + this.SCORE_OFFSET, this.SCORE_OFFSET);
	add(this.scoreLabel);
	
	var cube;
	for (var i = 0; i < dimension; i++) {
		for (var j = 0; j < dimension; j++) {
			cube = new BoggleCube(this.CUBE_SIZE);
			this.cubes.set(i,j, cube);
		}
	}
	this.setPosition(this.x, this.y);
}

BoggleBoard.prototype = new Rectangle;
BoggleBoard.prototype.constructor = BoggleBoard;

BoggleBoard.prototype.setPosition = function(x,y) {
	this.x = x;
	this.y = y;
	for (var i = 0; i < this.getDimension(); i++) {
		for (var j = 0; j < this.getDimension(); j++) {
			var cube = this.cubes.get(i,j);
			cube.setPosition(x + i*(cube.getHeight() + this.CUBE_SPACING), y + j*(cube.getWidth() + this.CUBE_SPACING));
		}
	}
}

BoggleBoard.prototype.labelCube = function(row, col, letter) {
	this.cubes.get(row,col).setLetter(letter);
}

BoggleBoard.prototype.letterAt = function(row, col) {
	return this.cubes.get(row,col).getLetter();
}

BoggleBoard.prototype.onBoard = function(row, col) {
	if (row < 0 || col < 0) {
		return false;
	}
	return (row < this.dimension && col < this.dimension);
}

BoggleBoard.prototype.highlightCube = function(row, col, bool) {
	var cube = this.cubes.get(row,col);
	var color = bool ? cube.highlightColor : cube.color;
	cube.setColor(color);
}

BoggleBoard.prototype.unhighlightAll = function() {
	for (var i = 0; i < this.getDimension(); i++) {
		for (var j = 0; j < this.getDimension(); j++) {
			var cube = this.cubes.get(i,j);
			cube.setColor(cube.color);
		}
	}
}

BoggleBoard.prototype.draw = function() {
	Rectangle.call(this);
	for (var i = 0; i < this.getDimension(); i++) {
		for (var j = 0; j < this.getDimension(); j++) {
			this.cubes.get(i,j).draw();
		}
	}
}

BoggleBoard.prototype.getDimension = function() {
	return this.dimension;
}

BoggleBoard.prototype.recordWord = function(word) {
	var label = new Text(word, "8pt Verdana");
	var x = this.getX() + this.getDimension()*(this.CUBE_SIZE + this.CUBE_SPACING) + this.SCORE_OFFSET + Math.floor(this.numWordsScored / this.WORDS_PER_COLUMN)*(3*this.SCORE_OFFSET);
	var y = this.SCORE_OFFSET + this.WORD_HEIGHT + Math.floor(this.numWordsScored % this.WORDS_PER_COLUMN)*this.WORD_HEIGHT;
	label.setPosition(x,y);
	add(label);
	this.numWordsScored++;
}

BoggleBoard.prototype.addToScore = function(points) {
	this.score += points;
	this.scoreLabel.setLabel("Score: " + this.score);
}

Boggle = {};

Boggle.CUBE_SIDES = 6;

Boggle.STANDARD_CUBES = [
   "AAEEGN", "ABBJOO", "ACHOPS", "AFFKPS",
   "AOOTTW", "CIMOTU", "DEILRX", "DELRVY",
   "DISTTY", "EEGHNW", "EEINSU", "EHRTVW",
   "EIOSST", "ELRTTY", "HIMNQU", "HLNNRZ"
];

Boggle.BIG_BOGGLE_CUBES = [
   "AAAFRS", "AAEEEE", "AAFIRS", "ADENNN", "AEEEEM",
   "AEEGMU", "AEGMNN", "AFIRSY", "BJKQXZ", "CCNSTW",
   "CEIILT", "CEILPT", "CEIPST", "DDLNOR", "DDHNOT",
   "DHHLOR", "DHLNOR", "EIIITT", "EMOTTT", "ENSSSU",
   "FIPRSY", "GORRVW", "HIPRRY", "NOOTUW", "OOOTTU"
];

