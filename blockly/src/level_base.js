// Functions for checking required blocks.

/**
 * Generate a required blocks dictionary for a call to a procedure that does
 * not have a return value.
 * @param {string} name The name of the procedure being called.
 * @return {Object} A required blocks dictionary able to check for and
 *     generate the specified block.
 */
exports.call = function(name) {
  return {
    test: function(block) {
      return block.type == 'procedures_callnoreturn' &&
          block.getTitleValue('NAME').toLowerCase() == name.toLowerCase();
    },
    type: 'procedures_callnoreturn',
    titles: {'NAME': name}
  };
};

/**
 * Generate a required blocks dictionary for a call to a procedure with a
 * single argument.
 * @param {string} func_name The name of the procedure being called.
 * @return {Object} A required blocks dictionary able to check for and
 *     generate the specified block.
 */
exports.callWithArg = function(func_name, arg_name) {
  return {
    test: function(block) {
      return block.type == 'procedures_callnoreturn' &&
          block.getTitleValue('NAME').toLowerCase() == func_name.toLowerCase();
    },
    type: 'procedures_callnoreturn',
    extra: '<mutation name="' + func_name + '"><arg name="' + arg_name +
        '"></arg></mutation>'
  };
};

/**
 * Generate a required blocks dictionary for the definition of a procedure
 * that does not have a return value.  This does not check if any arguments
 * are defined for the procedure.
 * @param {string} name The name of the procedure being defined.
 * @return {Object} A required blocks dictionary able to check for and
 *     generate the specified block.
 */
exports.define = function(name) {
  return {
    test: function(block) {
      return block.type == 'procedures_defnoreturn' &&
          block.getTitleValue('NAME').toLowerCase() == name.toLowerCase();
    },
    type: 'procedures_defnoreturn',
    titles: {'NAME': name}
  };
};
