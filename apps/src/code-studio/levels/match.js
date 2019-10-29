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
  constructor(levelId, id, standalone, lastAttempt) {
    // The dashboard levelId.
    this.levelId = levelId;

    // A DOM element containing this match level and no others.
    this.container = document.getElementById(id);

    // Whether this is the only puzzle on a page, or part of a group of them.
    this.standalone = standalone;

    // Don't enable sounds until after initial moves reflecting lastAttempt.
    this.enableSounds = false;

    // An array indicating which answer belongs in each slot according to the
    // user's last submission, or null if no answer was selected. For example,
    // [null, null, 0, null] indicates that slot index 2 should hold answer
    // with originalIndex 0. originalIndex indicates each answer's position
    // when all answers are placed in the correct order.
    this.lastAttempt = lastAttempt ? lastAttempt.split(',') : [];

    this.readonly = !!window.appOptions.readonlyWorkspace;

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
    let valid = true;

    const elements = $(this.container).find('.match_slots li');

    const response = [];

    for (let index = 0; index < elements.length; index++) {
      const xmark = $(`#xmark_${this.levelId}_${index}`);
      const originalIndex = elements[index].getAttribute('originalIndex');
      response.push(originalIndex);
      if (originalIndex === null) {
        // nothing dragged in this slot yet
        wrongAnswer = true;
        valid = false;

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
      errorDialog: wrongAnswer ? <MatchErrorDialog /> : null,
      valid
    };
  }
  getAppName() {
    return 'match';
  }
  // Disable drag on all answers, including those which have been moved to the
  // .match_answersdest column.
  lockAnswers() {
    $(this.container)
      .find('.mainblock li.answer')
      .draggable('destroy');
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
    $(this.container)
      .find('.mainblock .match_answers li.answer')
      .draggable({
        revert: 'invalid',
        stack: '.answer',
        containment: this.container
      });

    this.makeInitialAnswersDroppable(this.container);

    this.makeInitialMoves();

    if (this.readonly) {
      this.lockAnswers();
    }

    this.enableSounds = this.standalone;
  }

  // set up the central list of empty slots.
  makeInitialAnswersDroppable() {
    $(this.container)
      .find('.mainblock .match_slots li')
      .droppable({
        activeClass: 'active',
        hoverClass: 'hover',
        accept: element =>
          $(element).is('.answerlist,.answerslot') &&
          $(this.container).find(element[0]).length,
        drop: (event, ui) => {
          if (this.enableSounds) {
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
            var answer = ui.draggable.detach();
            var slot = $(event.target);
            this.moveAnswerToSlot(slot, answer);
          }
        }
      });
  }

  moveAnswerToSlot(slot, answer) {
    // replace target with this new item
    slot.replaceWith(answer);

    // the new item is now droppable
    answer.droppable();

    // remove offset coordinates from the dragged item
    answer.css({top: 'auto', left: 'auto'});

    // this class is no longer in the answer list
    answer.removeClass('answerlist');

    // this class can now be both dragged and a drop target for fellow answers in slots
    answer.addClass('answerslot');

    // this new item can now be dropped onto by other answers in the central list
    this.makeItemDroppable(answer);

    // Once all answers have been dropped into a slot, let anyone
    // listening know that an answer has been selected.
    if ($(this.container).find('.match_answers .answer').length === 0) {
      onAnswerChanged(this.levelId, true);
    }
  }

  makeItemDroppable(item) {
    item.droppable({
      accept: element =>
        $(element).is('.answerslot') &&
        $(this.container).find(element[0]).length,
      activeClass: 'active',
      drop: (event, ui) => {
        if (this.enableSounds) {
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

  // Executes a series of moves from the answers column to the slots column
  // according to the user's last submission as represented in this.lastAttempt.
  makeInitialMoves() {
    // Obtain a list of html elements for slots ahead of time, so
    // that we don't misplace anything later when those indices change.

    const slots = $(this.container)
      .find('.match_slots .emptyslot')
      .toArray();

    for (let i = 0; i < this.lastAttempt.length; i++) {
      const slot = $(slots[i]);
      const originalIndex = parseInt(this.lastAttempt[i], 10);
      if (!isNaN(originalIndex)) {
        const answer = $(this.container).find(
          `.answer[originalIndex=${originalIndex}]`
        );
        this.moveAnswerToSlot(slot, answer);
      }
    }
  }
}
