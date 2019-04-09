/* global jQuery, CDOSounds */
jQuery.fn.swap = function(b) {
  // method from: http://blog.pengoworks.com/index.cfm/2008/9/24/A-quick-and-dirty-swap-method-for-jQuery
  b = jQuery(b)[0];
  var a = this[0];
  var t = a.parentNode.insertBefore(document.createTextNode(''), a);
  b.parentNode.insertBefore(a, b);
  t.parentNode.insertBefore(b, t);
  t.parentNode.removeChild(t);
  return this;
};

// Initialize drag and drop for all match elements (answers and slots) within
// the container. Answers are made draggable and slots are made droppable. The
// container limits this as follows:
//   * only elements within the container are marked draggable / droppable
//   * answers are only droppable on slots within the same container
//   * answers cannot be dragged outside of the container.
export function initMatch(container, enableSounds = false) {
  $(container)
    .find('.mainblock #answers li')
    .draggable({revert: 'invalid', stack: '.answer', containment: container});

  // set up the central list of empty slots.
  $(container)
    .find('.mainblock #slots li')
    .droppable({
      activeClass: 'active',
      hoverClass: 'hover',
      accept: element =>
        $(element).is('.answerlist,.answerslot') &&
        $(container).find(element[0]).length,
      drop: function(event, ui) {
        if (enableSounds) {
          CDOSounds.play('click');
        }
        // once an answer is in the central list of slots, it will just swap with whatever it's dragged onto
        if (ui.draggable.hasClass('answerslot')) {
          // swap this empty slot and the answer dragged onto it
          ui.draggable.swap(event.target);

          // remove offset coordinates from this item
          ui.draggable.css({top: 'auto', left: 'auto'});
        } else {
          // when an answer is in the rightmost list of answers, it can be dragged in to replace an empty slot
          // in the central list of slots.

          var movingItem = ui.draggable.detach();

          // replace target with this new item
          $(event.target).replaceWith(movingItem);

          // the new item is now droppable
          movingItem.droppable();

          // remove offset coordinates from the dragged item
          movingItem.css({top: 'auto', left: 'auto'});

          // this class is no longer in the answer list
          movingItem.removeClass('answerlist');

          // this class can now be both dragged and a drop target for fellow answers in slots
          movingItem.addClass('answerslot');

          // this new item can now be dropped onto by other answers in the central list
          movingItem.droppable({
            accept: '.answerslot',
            activeClass: 'active',
            drop: function(event, ui) {
              if (enableSounds) {
                CDOSounds.play('whoosh');
              }

              // remove offset coordinates from the dragged item
              ui.draggable.css({top: '0px', left: '0px'});

              // determine y difference between old location and new location of item that will be swapped out
              var origY = $(event.target).offset().top;
              var destY = $(ui.draggable).offset().top;
              var diffY = destY - origY;

              // swap this answer with the answer dropped onto it
              ui.draggable.swap(event.target);

              // move the target object back to its old location for a moment
              $(event.target).css({top: -diffY + 'px'});

              // and animate back to its new location
              $(event.target).animate({top: '0px'});
            }
          });
        }
      }
    });
}
