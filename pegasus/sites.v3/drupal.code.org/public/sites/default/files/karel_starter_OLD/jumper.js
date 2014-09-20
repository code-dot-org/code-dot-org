function Jumper() {
	Rectangle.call(this);
	this.width = 20;
	this.height = 40;
	this.color = Color.RED;
	this.dx = 0;
	this.dy = 10;
	this.acceleration = 0.3;
	this.deceleration = 0.3;
	this.gravity = 1;
	this.jumpStrength = 20;
	this.MAX_SPEED = 3;
	this.MAX_GRAVITY = 15;
	this.jumpKey = Keyboard.SPACE;
	this.platforms = [];	// You can jump up through platforms
	this.obstacles = [];	// Obstacles block you from all sides
	
	var self = this;
	
	
	/*
	 * When using the Jumper object in a game,
	 * You must call jumper.update in your gameLoop,
	 * so it updates it's position and checks for collisions.
	 */
	this.update = function() {
		self.dy = Math.min(self.dy + self.gravity, self.MAX_GRAVITY);
		var platform = self.footCollision();
		if (platform) {
			if (self.dy > 0) {
				self.dy = 0;
			}
			// Adjust the position of the jumper, so it doesn't sink in the platform
			self.setPosition(self.getX(), platform.getY() - self.getHeight());
			if (isKeyPressed(self.jumpKey) && self.dy >= 0) {
				self.dy = -self.jumpStrength;
			}
		}
		self.horizontalMovement();
		
		var obstacle = self.obstacleCollision();
		if (obstacle.direction == "RIGHT") {
			self.dx = -0.1;
		} else if (obstacle.direction == "LEFT") {
			self.dx = 0.1;
		}
		obstacle = self.headCollision();
		if (obstacle.direction == "TOP") {
			self.dy = 1;
			self.setPosition(self.getX(), obstacle.obj.getY() + obstacle.obj.getHeight() + 1)
		}
		self.move(self.dx, self.dy);
	}
	
	this.horizontalMovement = function() {
		if (isKeyPressed(Keyboard.RIGHT)) {
		    self.dx = Math.min(self.dx + self.acceleration, self.MAX_SPEED);
		} else if (isKeyPressed(Keyboard.LEFT)) {
		    self.dx = Math.max(self.dx - self.acceleration, -1*self.MAX_SPEED);
		} else {
			if (self.dx > self.deceleration) {
				self.dx = self.dx - self.deceleration;
			} else if (self.dx < -self.deceleration) {
				self.dx = self.dx + self.deceleration;
			} else {
				self.dx = 0;
			}
		}
	}
}

Jumper.prototype = new Rectangle;
Jumper.prototype.constructor = Jumper;


// Getters
Jumper.prototype.getXSpeed = function() {
	return this.dx;
}
Jumper.prototype.getYSpeed = function() {
	return this.dy;
}
Jumper.prototype.getMaxSpeed = function() {
	return this.MAX_SPEED;
}
Jumper.prototype.getMaxGravity = function() {
	return this.MAX_GRAVITY;
}
Jumper.prototype.getAcceleration = function() {
	return this.acceleration;
}
Jumper.prototype.getDeceleration = function() {
	return this.deceleration;
}
Jumper.prototype.getGravity = function() {
	return this.gravity;
}
Jumper.prototype.getJumpStrength = function() {
	return this.jumpStrength;
}
Jumper.prototype.getJumpKey = function() {
	return this.jumpKey;
}

// Setters
Jumper.prototype.setXSpeed = function(speed) {
	this.dx = speed;
}
Jumper.prototype.setYSpeed = function(speed) {
	this.dy = speed;
}
Jumper.prototype.setMaxSpeed = function(speed) {
	this.MAX_SPEED = speed;
}
Jumper.prototype.setMaxGravity = function(gravity) {
	this.MAX_GRAVITY = gravity;
}
Jumper.prototype.setAcceleration = function(acceleration) {
	this.acceleration = acceleration;
}
Jumper.prototype.setDeceleration = function(deceleration) {
	this.deceleration = deceleration;
}
Jumper.prototype.setGravity = function(gravity) {
	this.gravity = gravity;
}
Jumper.prototype.setJumpStrength = function(strength) {
	this.jumpStrength = strength;
}
Jumper.prototype.setJumpKey = function(key) {
	this.jumpKey = key;
}

// Starts movement
Jumper.prototype.go = function() {
	setTimer(this.update, 10);
}

// Stops movement
Jumper.prototype.stop = function() {
	stopTimer(this.update);
}

Jumper.prototype.addPlatform = function(platform) {
	this.platforms.push(platform);
}

Jumper.prototype.removePlatform = function(object) {
	for (var i=0; i < this.platforms.length; i++) {
		var platform = this.platforms[i];
		if (platform == object) {
			this.platforms.splice(i,1);
			return;
		}
	}
}

Jumper.prototype.addObstacle = function(platform) {
	this.obstacles.push(platform);
}

Jumper.prototype.removeObstacle = function(object) {
	for (var i=0; i < this.obstacles.length; i++) {
		var obstacle = this.obstacles[i];
		if (obstacle == object) {
			this.obstacles.splice(i,1);
			return;
		}
	}
}

Jumper.prototype.getObjectAtFeet = function(){
	var bottom = this.getY() + this.getHeight() + 1;
	var leftFoot = getElementAt(this.getX(), bottom);
	if (leftFoot) {
		return leftFoot;
	}
	return getElementAt(this.getX() + this.getWidth(), bottom);
}

Jumper.prototype.getObjectAtHead = function(){
	var top = this.getY() - 1;
	var leftTop = getElementAt(this.getX(), top);
	if (leftTop) {
		return leftTop;
	}
	return getElementAt(this.getX() + this.getWidth(), top);
}

Jumper.prototype.getObjectAtLeft = function(){
	var left = this.getX() - 1;
	var leftTop = getElementAt(left, this.getY());
	if (leftTop) {
		return leftTop;
	}
	var leftMiddle = getElementAt(left, this.getY() + this.getHeight()/2);
	if (leftMiddle) {
		return leftMiddle;
	}
	return getElementAt(left, this.getY() + this.getHeight() - 1);
}

Jumper.prototype.getObjectAtRight = function(){
	var right = this.getX() + this.getWidth() + 1;
	var rightTop = getElementAt(right, this.getY());
	if (rightTop) {
		return rightTop;
	}
	var rightMiddle = getElementAt(right, this.getY() + this.getHeight()/2);
	if (rightMiddle) {
		return rightMiddle;
	}
	return getElementAt(right, this.getY() + this.getHeight() - 1);
}

// Checks if the jumper is colliding with an object in its platforms
Jumper.prototype.footCollision = function(){
	var obj = this.getObjectAtFeet();
	for (var i=0; i < this.platforms.length; i++) {
		var platform = this.platforms[i];
		if (platform == obj) {
			return obj;
		}
	}
	for (var i=0; i < this.obstacles.length; i++) {
		var obstacle = this.obstacles[i];
		if (obstacle == obj) {
			return obj;
		}
	}
	return null;
}

// Checks if the jumper is colliding with an object in its obstacles
Jumper.prototype.headCollision = function(){
	var obj = this.getObjectAtHead();
	for (var i=0; i < this.obstacles.length; i++) {
		var obstacle = this.obstacles[i];
		if (obstacle == obj) {
			return {direction:"TOP", obj:obj};
		}
	}
	return {direction:null, obj:null};
}

// Checks if the jumper is colliding with an object in its obstacles
Jumper.prototype.obstacleCollision = function(){
	var obj = this.getObjectAtHead();
	for (var i=0; i < this.obstacles.length; i++) {
		var obstacle = this.obstacles[i];
		if (obstacle == obj) {
			return {direction:"TOP", obj:obj};
		}
	}
	
	obj = this.getObjectAtLeft();
	for (var i=0; i < this.obstacles.length; i++) {
		var obstacle = this.obstacles[i];
		if (obstacle == obj) {
			return {direction:"LEFT", obj:obj};
		}
	}
	obj = this.getObjectAtRight();
	for (var i=0; i < this.obstacles.length; i++) {
		var obstacle = this.obstacles[i];
		if (obstacle == obj) {
			return {direction:"RIGHT", obj:obj};
		}
	}
	
	return {direction:null, obj:null};
}

Jumper.prototype.bounce = function(strength) {
	this.dy = -1*strength;
}

Jumper.prototype.landsOn = function(object) {
	return this.getObjectAtFeet() == object && this.dy > 0
}
