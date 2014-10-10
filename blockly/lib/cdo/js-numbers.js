// Customizations to the js-numbers lib

(function () {
  // Allow Rationals to be cast to a Number with loss of precision
  jsnums.Rational.prototype.valueOf = function () { return this.toInexact().n; };

  // Make the default Rational toString return the decimal representation
  jsnums.Rational.prototype.toString = function () { return (+this).toString(); };

  // Ensure objects returned by Rational operations are always Rational instances
  var _ref = jsnums.Rational.makeInstance;
  jsnums.makeRational = jsnums.Rational.makeInstance = function () {
    var result = _ref.apply(this, arguments);
    return typeof result === 'number' ? new jsnums.Rational(result, 1) : result;
  }
})();
