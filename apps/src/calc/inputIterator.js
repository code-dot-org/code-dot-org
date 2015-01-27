/**
 * Given a set of values (i.e. [1,2,3], and a number of parameters, generates
 * all possible combinations of values.
 */
var InputIterator = function (values, numParams) {
  this.numParams_ = numParams;
  this.remaining_ = Math.pow(values.length, numParams);
  this.values_ = values;
  this.indices_ = [-1];
  for (var i = 1; i < numParams; i++) {
    this.indices_[i] = 0;
  }
};
module.exports = InputIterator;

/**
 * Get the next value, throwing if none remaing
 */
InputIterator.prototype.next = function () {
  debugger;
  if (this.remaining_ === 0) {
    throw new Error('empty');
  }

  var wrapped;
  var paramNum = 0;
  do {
    wrapped = false;
    this.indices_[paramNum]++;
    if (this.indices_[paramNum] === this.values_.length) {
      this.indices_[paramNum] = 0;
      paramNum++;
      wrapped = true;
    }
  } while(wrapped && paramNum < this.numParams_);
  this.remaining_--;

  return this.indices_.map(function (index) {
    return this.values_[index];
  }, this);
};

/**
 * @returns How many values are left
 */
InputIterator.prototype.remaining = function () {
  return this.remaining_;
};
