$(document).ready(function() {
  var badges = $(".badge");

  var numberSlotsShowing = 3; // How many slots are shown at a time
  var totalDonors = badges.length;
 
  // We will update one dest slot at a time, with the next source slot to be shown.
  var destIndex = -1;
  var donorIndex = numberSlotsShowing;

  var interval = 3000;
  var timer = setInterval(updateDonorSlides, interval);
  updateDonorSlides();

  var hoverIndex = -1;

  function updateDonorSlides() {
    // Fade out the current badge, and then discard it.
    // Copy the next badge into that place, and fade it on.

    do {
      destIndex = (destIndex + 1) % numberSlotsShowing;
    } while (destIndex == hoverIndex);

    donorIndex = (donorIndex + 1) % totalDonors;

    //console.log("updating slot", destIndex, "to source item", donorIndex);

    var srcClone = $("#donorbadge_" + donorIndex).clone();
    var badgeDest = $("#badgedest_" + destIndex);

    badgeDest.animate({opacity:0}, {complete: function() {
      badgeDest.empty();
      srcClone.appendTo(badgeDest);
      badgeDest.animate({opacity:1});
    }});
  }

  // Don't change a slot if the viewer is hovering over it.

  function donorHoverStart(index) { hoverIndex = index; };
  function donorHoverEnd()        { hoverIndex = -1; };

  for (var i = 0; i < numberSlotsShowing; i++) {
    // bind will fail on IE8 but that's okay, this is kind of optional functionality.
    $("#badgedest_" + i).hover(donorHoverStart.bind(null, i), donorHoverEnd);
  }

});
