// Customizations to the js-numbers lib

(function () {
  // Allow Rationals to be cast to a Number with loss of precision
  jsnums.Rational.prototype.valueOf = function () { return this.toInexact().n; };

  // Ensure objects returned by jsnums.makeRational are always Rational instances
  var _ref = jsnums.makeRational;
  jsnums.makeRational = function () {
    var result = _ref.apply(this, arguments);
    return typeof result === 'number' ? jsnums.makeBignum(result) : result;
  }
})();
