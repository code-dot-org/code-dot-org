/*
 * Creates a BouncingBall object
 *
 * It is a circle that moves and bounces off things
 * that are in its bouncers array. You can add or remove
 * things it bounces off.
 * 
 * It also has an onBounce function that lets you provide
 * a callback function for when the ball bounces.
 * 
 */
function BouncingBall(radius) {
	Circle.call(this);
	this.radius = radius;
	this.dx = 4;
	this.dy = 4;
	this.bouncers = [];
	this.bounceFN = function(){};
	
	
	var self = this;
	this.moveBall = function() {
		self.checkWallCollisions();
		self.checkBouncers();
		self.move(self.dx,self.dy);
	}
}

BouncingBall.prototype = new Circle;
BouncingBall.prototype.constructor = BouncingBall;

// Add the given object to the objects that the ball bounces off of
BouncingBall.prototype.addBouncer = function(object) {
	this.bouncers.push(object);
}

BouncingBall.prototype.removeBouncer = function(object) {
	for (var i=0; i < this.bouncers.length; i++) {
		var bouncer = this.bouncers[i];
		if (bouncer == object) {
			this.bouncers.splice(i,1);
			return;
		}
	}
}

// Set the function to be run when the ball bounces
BouncingBall.prototype.onBounce = function(fn) {
	this.bounceFN = fn;
}

// Starts ball movement
BouncingBall.prototype.go = function() {
	setTimer(this.moveBall, 10);
}

// Stops ball movement
BouncingBall.prototype.stop = function() {
	stopTimer(this.moveBall);
}

// Getters and Setters
BouncingBall.prototype.getXSpeed = function() {
	return this.dx;
}
BouncingBall.prototype.getYSpeed = function() {
	return this.dy;
}
BouncingBall.prototype.setXSpeed = function(dx) {
	this.dx = dx;
}
BouncingBall.prototype.setYSpeed = function(dy) {
	this.dy = dy;
}
BouncingBall.prototype.setSpeed = function(dx, dy) {
	this.dx = dx;
	this.dy = dy;
}

// Checks if the ball is hitting the wall and bounces it appropriately
BouncingBall.prototype.checkWallCollisions = function(){
	if(this.getX() - this.getRadius() < 0 || this.getX() + this.getRadius() > getWidth()){
		this.dx = -this.dx;
	}
	if(this.getY() - this.getRadius() < 0 || this.getY() + this.getRadius() > getHeight()){
		this.dy = -this.dy;
	}
}


// Returns the element at the top, bottom, left or right of the ball
// Also returns the direction the ball should bounce
BouncingBall.prototype.getCollidingObject = function(){
	var left = this.getX() - this.getRadius();
	var right = this.getX() + this.getRadius();
	
	var top = this.getY() - this.getRadius();
	var bottom = this.getY() + this.getRadius();
	
	var topElem = getElementAt(this.getX(), top);
	if(topElem) return {collider:topElem, direction:"DOWN"};
	
	var bottomElem = getElementAt(this.getX(), bottom);
	if(bottomElem) return {collider:bottomElem, direction:"UP"};
	
	var rightElem = getElementAt(right, this.getY());
	if(rightElem) return {collider:rightElem, direction:"LEFT"};
	
	var leftElem = getElementAt(left, this.getY());
	if(leftElem) return {collider:leftElem, direction:"RIGHT"};
	
	return {collider:null, direction:null};
}

// Checks if the ball is colliding with an object in its bouncers
// If so, bounces the ball the appropriate direction
BouncingBall.prototype.checkBouncers = function(){
	var obj = this.getCollidingObject();
	if(obj.collider != null){
		for (var i=0; i < this.bouncers.length; i++) {
			var bouncer = this.bouncers[i];
			if (bouncer == obj.collider) {
				var oldDX = this.dx;
				var oldDY = this.dy;
				if (obj.direction == "DOWN") {
					this.dy = Math.abs(this.dy);
				} else if (obj.direction == "UP") {
					this.dy = -Math.abs(this.dy);
				} else if (obj.direction == "LEFT") {
					this.dx = -Math.abs(this.dx);
				} else if (obj.direction == "RIGHT") {
					this.dx = Math.abs(this.dx);
				}
				if (this.dx != oldDX || this.dy != oldDY) {
					// call the bounceFN if it actually changes direction
					this.bounceFN();
				}
				return;
			}
		}
	}
}