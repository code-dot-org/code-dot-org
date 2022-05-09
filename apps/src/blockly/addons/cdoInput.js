import GoogleBlockly from 'blockly/core';

GoogleBlockly.Input.prototype.setStrictCheck = function(check) {
  return this.setCheck(check);
};

// We can just use fieldRow because it is public.
GoogleBlockly.Input.prototype.getFieldRow = function() {
  return this.fieldRow;
};
