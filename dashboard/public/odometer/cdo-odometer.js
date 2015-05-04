function Odometer(config) {

  var DIGIT_HEIGHT = 32;
  var digits = [];
  var scrollingDigits = [];
  var last = null;
  var currentValue = config.initial || 0;

  // Create DOM.
  var odometer = $("<div class='odometer'>");
  for (var i = 0; i < config.digits; i++) {
    var digit = $("<div class='digit'><div class='digit-current'>0</div><div class='digit-next'>1</div>");
    digits.push(digit);
    odometer.append(digit);
  }
  $(config.parent).addClass('odometerParent').append(odometer);

  this.set = function(value) {
    var scrollAmount = (value % 1) * -DIGIT_HEIGHT;
    value = Math.floor(value);
    if (value !== last) {
      last = value;
      scrollingDigits = [];
      var current = value.toString(config.radix).toUpperCase();
      var next = (value + 1).toString(config.radix).toUpperCase();
      for (var i = 0; i < config.digits; i++) {
        var currentText = current[i - (config.digits - current.length)] || ' ';
        var nextText = next[i - (config.digits - next.length)] || ' ';
        digits[i].find('.digit-current').text(currentText);
        digits[i].find('.digit-next').text(nextText);
        digits[i].css('top', 0);
        if (currentText !== nextText) {
          scrollingDigits.push(i);
        }
      }
    }
    scrollingDigits.forEach(function (n) {
      digits[n].css('top', scrollAmount);
    });
  };

  this.changeRadix = function(newRadix) {
    config.radix = newRadix;
    this.set(currentValue);
  };

  this.set(currentValue);
}
