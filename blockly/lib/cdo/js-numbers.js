// Customizations to the js-numbers lib

(function () {
  // Allow Rationals to be cast to a Number with loss of precision
  jsnums.Rational.prototype.valueOf = function () { return this.toInexact().n; };

  // Make the default Rational toString return the decimal representation
  // Construct fractions using the numerator (.n) and denominator (.d)
  jsnums.Rational.prototype.toString = function () { return (+this).toString(); };

  // Ensure objects returned by Rational operations are always Rational instances
  var _ref = jsnums.Rational.makeInstance;
  jsnums.makeRational = jsnums.Rational.makeInstance = function () {
    var result = _ref.apply(this, arguments);
    return jsnums.ensureExact(result);
  }

  // Returns a jsnum representation of the given JavaScript number that supports exact operations
  jsnums.ensureExact = function (n) {
    return typeof n === 'number' ? ensureRational(jsnums.makeFloat(n).toExact()) : n;
  }

  // Return a Rational instance of the given `n`, or `n` if already Rational
  ensureRational = function (n) {
    return typeof n === 'number' ? new jsnums.Rational(n, 1) : n;
  }
})();
