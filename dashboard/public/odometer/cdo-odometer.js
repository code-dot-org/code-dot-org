function Odometer(config) {

  var DIGIT_HEIGHT = 32;
  var digits = [];
  var scrollingDigits = [];
  var last = null;

  // The current value of the odometer (call `set` to change).
  this.currentValue = config.initial || 0;

  // True if the current value and radix requires more digits than were set in the config.
  this.isOverflowing = false;

  // Create DOM elements.
  var odometer = $("<div class='odometer'>");
  for (var i = 0; i < config.digits; i++) {
    var digit = $("<div class='digit'><div class='digit-current'>0</div><div class='digit-next'>1</div></div>");
    digits.push(digit);
    odometer.append(digit);
  }
  $(config.parent).addClass('odometerParent').append(odometer).append("<div class='odometerGradient'>");

  // Set the odometer to a specific value.
  this.set = function(value) {
    this.currentValue = value;
    var scrollAmount = (value % 1) * -DIGIT_HEIGHT;
    value = Math.floor(value);

    // Only update the digits for non-fractional updates.
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
        var overflow = current.length > config.digits;
        if (!this.isOverflowing && overflow) {
          this.isOverflowing = true;
          $(config.overflowSelector).show();
        } else if (this.isOverflowing && !overflow) {
          this.isOverflowing = false;
          $(config.overflowSelector).hide();
        }
      }
    }

    // Always adjust the scroll of digits currently in transition.
    scrollingDigits.forEach(function (n) {
      digits[n].css('top', scrollAmount);
    });
  };

  // Change the radix and update the odometer.
  this.changeRadix = function(newRadix) {
    if (typeof newRadix === 'number' && newRadix >=2 && newRadix <= 36) {
      config.radix = newRadix;
      last = null;  
    }
  };

  this.set(this.currentValue);
}
