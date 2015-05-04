function Odometer(parent, digits, radix) {

  // Create DOM.
  var odometer = $("<div class='odometer'>");
  for (var i = 0; i < digits; i++) {
    odometer.append("<div class='digit'><div class='digit-current'>0</div><div class='digit-next'>1</div>")
  }
  $(parent).append(odometer);

  this.set = function() {
    //
  }
}
