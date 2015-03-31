$(document).ready(function() {
  var badges = $(".badge");

  var totalDonors = badges.length;
 
  // We will update one dest slot at a time, with the next source slot to be shown.
  var destIndex = -1;
  var donorIndex = 0;

  var interval = 3000;
  setInterval(updateDonorSlides, interval);
  updateDonorSlides();

  var hoverIndex = -1;

  function updateDonorSlides() {

    // There are 1 or 3 slots showing.
    var numberSlotsShowing = $("#badgedest_1").css("display") == "none" ? 1 : 3;

    // If we are hovering on the 1 slot, then there's nothing to do
    if (numberSlotsShowing == 1 && hoverIndex == 0) {
      return;
    }

    // Don't use a destination if user is hovering over it.
    do {
      destIndex = (destIndex + 1) % numberSlotsShowing;
    } while (destIndex == hoverIndex);

    donorIndex = (donorIndex + 1) % totalDonors;

    //console.log("updating slot", destIndex, "to source item", donorIndex);

    var srcClone = $("#donorbadge_" + donorIndex).clone();
    var badgeDest = $("#badgedest_" + destIndex);

    // Fade out the current badge, and then discard it.
    // Copy the next badge into that place, and fade it on.

    badgeDest.animate({opacity:0}, {complete: function() {
      badgeDest.empty();
      srcClone.appendTo(badgeDest);
      badgeDest.animate({opacity:1});
    }});
  }

  // Don't change a slot if the viewer is hovering over it.

  function donorHoverStart(index) { hoverIndex = index; };
  function donorHoverEnd()        { hoverIndex = -1; };

  for (var i = 0; i < 3; i++) {
    // bind will fail on IE8 but that's okay, this is kind of optional functionality.
    $("#badgedest_" + i).hover(donorHoverStart.bind(null, i), donorHoverEnd);
  }

});
