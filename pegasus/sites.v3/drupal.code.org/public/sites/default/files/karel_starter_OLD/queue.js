// Implementation for a FIFO queue
function Queue() {
	this.q = [];
}

// returns the number of objects in the queue
Queue.prototype.size = function() {
	return this.q.length;
}

// Clears the contents of the queue
Queue.prototype.clear = function() {
	this.q = [];
}

// Adds the given object to the queue
Queue.prototype.enqueue = function(obj) {
	this.q.push(obj);
}

// removes and returns the first object in the queue
Queue.prototype.dequeue = function() {
	var obj = this.q[0];
	this.q.splice(0,1);
	return obj;
}

// returns the first object in the queue without removing it
Queue.prototype.peek = function() {
	var obj = this.q[0];
	return obj;
}

// True if there are more items in the queue
Queue.prototype.hasNext = function() {
	return this.q.length != 0;
}

// True if there are no more items in the queue
Queue.prototype.isEmpty = function() {
	return this.q.length == 0;
}
