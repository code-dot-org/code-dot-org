$(document).ready(function() {
  var platinum = randomizeOrderBetter($(".platinum"));
  var gold = randomizeOrderBetter($(".gold"));

  var masterIndex = 3; // The number of badges that have been shown this cycle
  var combinedLength = platinum.length + gold.length;
  var interval = 8000;
  var timer = setInterval(setManager, interval);

  function setManager () {
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
  function scrollBadges (items, index) {
    if (items === platinum) {
      // Old items are faded out. New items are faded in on the completion of the fade out.
      items.eq(index - 1).fadeOut("slow");
      items.eq(index - 2).fadeOut("slow");
      items.eq(index - 3).fadeOut("slow", function () {
        items.eq(index).fadeIn("slow");
        items.eq(index + 1).fadeIn("slow");
        items.eq(index + 2).fadeIn("slow");
        // If you've only shown a single donor this call (odd number of platinum donors) then only increment masterIndex by one.
        if (masterIndex + 3 > platinum.length) {
          masterIndex++;
        } else {
          masterIndex += 3;
        }
      });
    } else {
      items.eq(index - 1).fadeOut("slow");
      items.eq(index - 2).fadeOut("slow");
      items.eq(index - 3).fadeOut("slow", function () {
        items.eq(index).fadeIn("slow");
        items.eq(index + 1).fadeIn("slow");
        items.eq(index + 2).fadeIn("slow");
        if (masterIndex + 3 < combinedLength) {
          masterIndex += 3;
        } else {
          masterIndex = 0;
        }
      });
    }
  }

  // Reveal the initial two platinum donors before cycle starts.
  platinum.first().css("display", "inline-block");
  platinum.eq(1).css("display", "inline-block");
  platinum.eq(2).css("display", "inline-block");

  // Pause the timer and cycling when a badge is hovered over.
  $('.badge').hover(function () { clearInterval(timer); }, function () { timer = setInterval(setManager, interval); });
});

// Takes a list of badges, randomizes (based on Fisher–Yates shuffle) their order in the DOM, and returns a list of badges in the new order.
function randomizeOrderBetter (items) {
  for (var i = items.children().length; i >= 0; i--) {
    var randomIndex = Math.random() * i | 0;
    var temp = items.eq(randomIndex).parent().detach(); // Remove the badge (and the containing anchor) from the DOM
    items.append(temp.children()[0]); // Add the badge to the end of the list of badges
    temp.appendTo(".badge-container"); // Re-add the badge (and the containing anchor) to thd DOM.
  }
  return items;
}