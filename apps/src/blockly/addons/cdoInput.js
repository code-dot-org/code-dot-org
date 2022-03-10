import GoogleBlockly from 'blockly/core';

GoogleBlockly.Input.prototype.setStrictCheck = function(check) {
  return this.setCheck(check);
};

// Technically we can just use fieldRow since it is public.
GoogleBlockly.Input.prototype.getFieldRow = function() {
  return this.fieldRow;
};
