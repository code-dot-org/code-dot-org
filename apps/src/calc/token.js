// TODO - update comment
/**
 * A token is essentially just a string that may or may not be "marked". Marking
 * is done for two different reasons.
 * (1) We're comparing two expressions and want to mark where they differ.
 * (2) We're looking at a single expression and want to mark the deepest
 *     subexpression.
 * @param {} val
 * @param {boolean} marked
 */
var Token = function (val, marked) {
  if (jsnums.isSchemeNumber(val)) {
    var repeater = RepeaterString.fromJsnum(val);
    if (!repeater) {
      this.str = val.toFixnum().toString();
    } else {
      this.str = repeater;
    }
  } else {
    this.str = val.toString();
  }
  this.marked = marked;
};
module.exports = Token;
