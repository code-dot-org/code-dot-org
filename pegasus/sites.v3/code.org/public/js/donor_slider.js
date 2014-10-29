$(document).ready(function() {
  var platinum = randomizeOrder($(".platinum"));
  var gold = randomizeOrder($(".gold"));

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
  // Only two platinum sponsors are shown at once, while up to three gold sponsors are shown.
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

//Takes a jQuery list. Two items are randomly selected and swapped. Repeat 50 times. Items are switched in DOM and an equivalently restructured list is returned.
function randomizeOrder(items) {
  var length = items.length;
  for (var i = 0; i < 50; i++) {
    var index1 = Math.floor(Math.random() * length);
    var index2 = Math.floor(Math.random() * length);
    swapElements(items.eq(index1)[0], items.eq(index2)[0]);
    var temp = items[index1];
    items[index1] = items[index2];
    items[index2] = temp;
  }
  return items;
}

// Take two jQuery DOM elements and swaps their position in the DOM.
function swapElements(elm1, elm2) {
  var parent1, next1, parent2, next2;

  parent1 = elm1.parentNode;
  next1   = elm1.nextSibling;
  parent2 = elm2.parentNode;
  next2   = elm2.nextSibling;

  parent1.insertBefore(elm2, next1);
  parent2.insertBefore(elm1, next2);
}