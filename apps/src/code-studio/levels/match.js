import React from 'react';

import {LegacyMatchErrorDialog} from '@cdo/apps/legacySharedComponents/LegacyDialogContents';

import {registerGetResult, onAnswerChanged} from './codeStudioLevels';

jQuery.fn.swap = function (b) {
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
      errorDialog: wrongAnswer ? <LegacyMatchErrorDialog /> : null,
      valid,
    };
  }
  getAppName() {
    return 'match';
  }
  // Disable drag on all answers, including those which have been moved to the
  // .match_answersdest column.
  lockAnswers() {
    $(this.container).find('.mainblock li.answer').draggable('destroy');
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
    const answers = $(this.container).find(
      '.mainblock .match_answers li.answer'
    );

    // Make answers focusable and set up keyboard navigation
    answers
      .attr('tabindex', '0') // Make focusable
      .on('keydown', event => this.handleAnswerKeydown(event));
    answers.draggable({
      revert: 'invalid',
      stack: '.answer',
      containment: this.container,
    });

    this.makeInitialAnswersDroppable(this.container);

    this.makeInitialMoves();

    if (this.readonly) {
      this.lockAnswers();
    }

    this.enableSounds = this.standalone;
  }

  // A method for the 'answer options' that start in the right-most column.
  // Allows answers to be selected and deselected with the keyboard and moved
  // between using arrow keys.
  handleAnswerKeydown(event) {
    const answer = $(event.currentTarget);
    const slots = $(this.container).find('.ui-droppable');

    switch (event.key) {
      // Enter and spacebar are used to select an answer
      case 'Enter':
      case ' ':
        event.preventDefault();
        // If there is a different answer already selected and it is not the same as the current one,
        // ignore this key event.
        if (this.selectedAnswer && this.selectedAnswer !== answer) {
          return;
        }
        // In this case, clicking on the selected answer should deselect it, moving the user out of
        // move mode (as in, make the slots not tab navigable again).
        if (answer.hasClass('selected')) {
          answer.removeClass('selected');
          this.selectedAnswer = null;
          slots.attr('tabindex', '-1');
        } else {
          // We are selecting a new answer, which means we want to make the slots tab navigable and move
          // focus there so a user can choose where this answer should be dropped.
          answer.addClass('selected');
          this.selectedAnswer = answer;
          slots.attr('tabindex', '0');
          slots.first().focus();
          this.enableSlotNavigation(slots);
        }
        break;

      case 'ArrowDown': // Move focus to the next answer
        event.preventDefault();
        answer.next().focus();
        break;

      case 'ArrowUp': // Move focus to the previous answer
        event.preventDefault();
        answer.prev().focus();
        break;

      case 'Escape': // Deselect the answer and remove visual feedback
        event.preventDefault();
        if (this.selectedAnswer) {
          this.selectedAnswer.removeClass('selected');
          this.selectedAnswer = null;
        }
        break;

      default:
        break;
    }
  }

  // This enables tab navigation for the 'slots' or 'droppable' components. This becomes a
  // bit confusing because answers can be become 'droppables' once they have been placed in
  // a slot. That is, both keyDown functions can be called at once if a user is dropping an answer
  // into a slot that already has an answer. There is logic near line 147 to prevent the second
  // keyboard nav handler call and keep the action focused here.
  enableSlotNavigation(slots) {
    const firstSlot = slots.first();
    const lastSlot = slots.last();

    const handleKeydown = event => {
      if (this.selectedAnswer) {
        if (
          event.key === 'ArrowUp' ||
          (event.key === 'Tab' && event.shiftKey)
        ) {
          event.preventDefault();
          // Move focus to the previous slot or loop to the last slot
          if ($(event.currentTarget).is(firstSlot)) {
            lastSlot.focus();
          } else {
            $(event.currentTarget).prev().focus();
          }
        } else if (event.key === 'ArrowDown' || event.key === 'Tab') {
          event.preventDefault();
          // Move focus to the next slot or loop to the first slot
          if ($(event.currentTarget).is(lastSlot)) {
            firstSlot.focus();
          } else {
            $(event.currentTarget).next().focus();
          }
        } else if (event.key === 'Enter' || event.key === ' ') {
          // Here is the bulk of this function: a user is trying to place an answer into a slot!
          event.preventDefault();
          const slot = $(event.currentTarget);
          const incomingAnswer = $(this.selectedAnswer);
          const existingElement = $(event.target);

          // This is to find out if the answer is being moved from an existing slot,
          // as in not from the answer bank on the right.
          const isFromDifferentSlot =
            $(incomingAnswer).closest('.match_slots').length === 1;
          // We only want to do a swap if the answer is coming from a different slot
          if (isFromDifferentSlot) {
            // Simulate the drop call
            const dropHandler =
              existingElement.data('ui-droppable').options.drop;

            // Create mock event and ui
            const fakeEvent = $.Event('drop', {target: existingElement[0]});
            const ui = {draggable: incomingAnswer};

            // Manually call the drop function
            dropHandler.call(existingElement[0], fakeEvent, ui);
          } else if ($(existingElement).hasClass('answer')) {
            // We do nothing if the answer is coming from the bank on the far right
            // and there's already an answer
          } else {
            // We are moving an answer from the far right into a brand new slot, so
            // place the incoming answer into the slot!
            this.moveAnswerToSlot(slot, incomingAnswer);
          }
          // Now, we have moved or rejected the answer move, so call cleanup function.
          this.cleanupSelectionsAndSlots();
          slots.off('keydown', handleKeydown);
        } else if (event.key === 'Escape') {
          // We are abandoning an answer positioning: call cleanup function.
          event.preventDefault();
          this.cleanupSelectionsAndSlots();
          slots.off('keydown', handleKeydown);
        }
      }
    };
    slots.on('keydown', handleKeydown);
  }

  // This method is a helper to clear a selected answer, remove tab navigability
  // of the slots, and move focus back to the submit button.
  cleanupSelectionsAndSlots() {
    if (this.selectedAnswer) {
      this.selectedAnswer.removeClass('selected');
      this.selectedAnswer = null;
    }
    $('.submitButton').focus();
    const emptySlots = $(this.container).find('.emptyslot');
    emptySlots.attr('tabindex', '-1');
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
        },
      });
  }

  moveAnswerToSlot(slot, answer, updateSavedAnswer = true) {
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
      onAnswerChanged(this.levelId, updateSavedAnswer);
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
      },
    });
  }

  // Executes a series of moves from the answers column to the slots column
  // according to the user's last submission as represented in this.lastAttempt.
  makeInitialMoves() {
    // Obtain a list of html elements for slots ahead of time, so
    // that we don't misplace anything later when those indices change.

    const slots = $(this.container).find('.match_slots .emptyslot').toArray();

    for (let i = 0; i < this.lastAttempt.length; i++) {
      const slot = $(slots[i]);
      const originalIndex = parseInt(this.lastAttempt[i], 10);
      if (!isNaN(originalIndex)) {
        const answer = $(this.container).find(
          `.answer[originalIndex=${originalIndex}]`
        );
        this.moveAnswerToSlot(slot, answer, false);
      }
    }
  }
}
