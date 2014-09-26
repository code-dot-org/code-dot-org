$(document).ready(function() {
  var platinum = $(".platinum");
  var gold = $(".gold");

  var masterIndex = 2; // The number of badges that have been shown this cycle
  var combinedLength = platinum.length + gold.length;
  var interval = 8000;
  var timer = setInterval(setManager, interval);

  function setManager () {
    // If you've shown all the badges, start from the beginning.
    if (masterIndex > combinedLength) {
      masterIndex = 0;
    }

    // Check if you've gone through all the platinum donors
    if (masterIndex < platinum.length) {
      gold.hide();
      $("#level_indicator").text("Platinum Supporters ($3,000,000+ contribution)");
      scrollBadges(platinum, masterIndex);
    } else {
      platinum.hide();
      $("#level_indicator").text("Gold Supporters ($1,000,000+ contribution)");
      scrollBadges(gold, masterIndex - platinum.length);
    }
  }

  // Takes a jQuery array of badges and an index. Hides the current badges and shows the next ones.
  // Only two platinum sponsors are shown at once, while up to three gold sponsors are shown.
  function scrollBadges (items, index) {
    if (items === platinum) {
      // Old items are faded out. New items are faded in on the completion of the fade out.
      items.eq(index - 1).fadeOut("slow");
      items.eq(index - 2).fadeOut("slow", function () {
        items.eq(index).fadeIn("slow");
        items.eq(index + 1).fadeIn("slow");
        // If you've only shown a single donor this call (odd number of platinum donors) then only increment masterIndex by one.
        if (masterIndex + 2 > platinum.length) {
          masterIndex++;
        } else {
          masterIndex += 2;
        }
      });
    } else {
      items.eq(index - 1).fadeOut("slow");
      items.eq(index - 2).fadeOut("slow");
      items.eq(index - 3).fadeOut("slow", function () {
        items.eq(index).fadeIn("slow");
        items.eq(index + 1).fadeIn("slow");
        items.eq(index + 2).fadeIn("slow");
        masterIndex += 3;
      });
    }
  }

  // Reveal the initial two platinum donors before cycle starts.
  platinum.first().css("display", "inline-block");
  platinum.eq(1).css("display", "inline-block");

  // Pause the timer and cycling when a badge is hovered over.
  $('.badge').hover(function () { clearInterval(timer); }, function () { timer = setInterval(setManager, interval); });
});