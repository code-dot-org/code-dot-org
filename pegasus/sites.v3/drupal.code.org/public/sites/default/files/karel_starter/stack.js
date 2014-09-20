// Implementation for a LIFO stack
function Stack() {
	this.stack = [];
}

// returns the number of objects in the stack
Stack.prototype.size = function() {
	return this.stack.length;
}

// Clears the contents of the stack
Stack.prototype.clear = function() {
	this.stack = [];
}

// Adds the given object to the stack
Stack.prototype.push = function(obj) {
	this.stack.push(obj);
}

// removes and returns the top object in the stack
Stack.prototype.pop = function() {
	var len = this.stack.length;
	var obj = this.stack[len-1];
	this.stack.splice(len-1,1);
	return obj;
}

// Returns the top object without removing it
Stack.prototype.peek = function() {
	var len = this.stack.length;
	var obj = this.stack[len-1];
	return obj;
}

// True if there are more items in the stack
Stack.prototype.hasNext = function() {
	return this.stack.length != 0;
}

// True if there are no more items in the stack
Stack.prototype.isEmpty = function() {
	return this.stack.length == 0;
}