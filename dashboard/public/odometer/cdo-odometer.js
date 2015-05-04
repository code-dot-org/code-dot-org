function Odometer(config) {

  var DIGIT_HEIGHT = 32;
  var digits = [];
  var last = null;

  // Create DOM.
  var odometer = $("<div class='odometer'>");
  for (var i = 0; i < config.digits; i++) {
    var digit = $("<div class='digit'><div class='digit-current'>0</div><div class='digit-next'>1</div>");
    digits.push(digit);
    odometer.append(digit);
  }
  $(config.parent).addClass('odometerParent').append(odometer);

  this.set = function(value) {
    var scrollAmount = (value % 1) * DIGIT_HEIGHT;
    value = Math.floor(value);
    if (value !== last) {
      console.log('updating');
      last = value;
      var current = value.toString(config.radix);
      var next = (value + 1).toString(config.radix);
      for (var i = 0; i < config.digits; i++) {
        digits[i].find('.digit-current').text(current[i - (config.digits - current.length)] || 0);
        digits[i].find('.digit-next').text(next[i - (config.digits - next.length)] || 0);
      }
    }
  }
}
