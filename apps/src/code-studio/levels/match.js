/* global jQuery, CDOSounds */

import React from 'react';
import {MatchErrorDialog} from '@cdo/apps/lib/ui/LegacyDialogContents';
import {registerGetResult, onAnswerChanged} from './codeStudioLevels';

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

export default class Match {
  constructor(levelId, id, standalone) {
    // The dashboard levelId.
    this.levelId = levelId;

    // The DOM id.
    this.id = id;

    // Whether this is the only puzzle on a page, or part of a group of them.
    this.standalone = standalone;

    $(document).ready(() => this.ready());
  }

  ready() {
    if (this.standalone) {
      registerGetResult(this.getResult.bind(this));
    }

    this.initMatch();
  }

  getResult() {
    let wrongAnswer = false;

    const container = document.getElementById(this.id);
    const elements = $(container).find('.match_slots li');

    const response = [];

    for (let index = 0; index < elements.length; index++) {
      const xmark = $(`#xmark_${this.levelId}_${index}`);
      const originalIndex = elements[index].getAttribute('originalIndex');
      response.push(originalIndex);
      if (originalIndex === null) {
        // nothing dragged in this slot yet
        wrongAnswer = true;

        xmark.hide();
      } else if (originalIndex !== String(index)) {
        // wrong answer
        wrongAnswer = true;

        if (this.standalone) {
          xmark.show();
        }
      } else {
        // correct answer
        xmark.hide();
      }
    }
    return {
      response: response,
      result: !wrongAnswer,
      errorDialog: wrongAnswer ? <MatchErrorDialog /> : null
    };
  }
  getAppName() {
    return 'match';
  }
  lockAnswers() {
    throw 'lockAnswers not implemented';
  }
  getCurrentAnswerFeedback() {
    throw 'getCurrentAnswerFeedback not implemented';
  }

  // Initialize drag and drop for all match elements (answers and slots) within
  // the container. Answers are made draggable and slots are made droppable. The
  // container limits this as follows:
  //   * only elements within the container are marked draggable / droppable
  //   * answers are only droppable on slots within the same container
  //   * answers cannot be dragged outside of the container.
  initMatch() {
    const container = document.getElementById(this.id);
    const enableSounds = this.standalone;

    $(container)
      .find('.mainblock .match_answers li')
      .draggable({revert: 'invalid', stack: '.answer', containment: container});

    this.makeInitialAnswersDroppable(container, enableSounds);
  }

  // set up the central list of empty slots.
  makeInitialAnswersDroppable(container, enableSounds) {
    $(container)
      .find('.mainblock .match_slots li')
      .droppable({
        activeClass: 'active',
        hoverClass: 'hover',
        accept: element =>
          $(element).is('.answerlist,.answerslot') &&
          $(container).find(element[0]).length,
        drop: (event, ui) => {
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
            this.makeItemDroppable(movingItem);

            // Once all answers have been dropped into a slot, let anyone
            // listening know that an answer has been selected.
            if ($(container).find('.match_answers .answer').length === 0) {
              onAnswerChanged(this.levelId, true);
            }
          }
        }
      });
  }

  makeItemDroppable(item) {
    const enableSounds = this.standalone;
    const container = document.getElementById(this.id);
    item.droppable({
      accept: element =>
        $(element).is('.answerslot') && $(container).find(element[0]).length,
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
