import $ from 'jquery';

import {TestResults} from '../../constants';
import {sourceForLevel} from '../clientState';

import {onAnswerChanged, resetContainedLevel} from './codeStudioLevels';

export default class FreeResponse {
  constructor(levelId, optional, allowMultipleAttempts) {
    this.levelId = levelId;
    // Levelbuilder booleans are undefined, 'true', or 'false'.
    this.optional = [true, 'true'].includes(optional);
    this.allowMultipleAttempts = [true, 'true'].includes(allowMultipleAttempts);

    $(document).ready(function () {
      var textarea = $(`textarea#level_${levelId}.response`);
      if (!textarea.val()) {
        const lastAttempt = sourceForLevel(
          window.appOptions.scriptName,
          levelId
        );
        if (lastAttempt) {
          textarea.val(lastAttempt);
        }
      }
      textarea.blur(function () {
        onAnswerChanged(levelId, true);
      });
      textarea.on('input', null, null, function () {
        onAnswerChanged(levelId, false);
      });

      var resetButton = $('#reset-predict-progress-button');
      if (resetButton) {
        resetButton.click(() => resetContainedLevel());
      }
    });
  }

  getOptional() {
    return this.optional;
  }

  getResult() {
    var response = $(`#level_${this.levelId}`).val();
    return {
      response: response,
      valid: response.length > 0,
      result: true,
      testResult: TestResults.FREE_PLAY,
    };
  }

  getAppName() {
    return 'free_response';
  }

  lockAnswers() {
    if (this.allowMultipleAttempts) {
      return;
    }
    $(`textarea#level_${this.levelId}.response`).prop('disabled', true);
    $('#reset-predict-progress-button')?.prop('disabled', false);
  }

  resetAnswers() {
    $(`textarea#level_${this.levelId}.response`).prop('disabled', false);
    $(`textarea#level_${this.levelId}.response`).val('');
    $('#reset-predict-progress-button')?.prop('disabled', true);
  }

  getCurrentAnswerFeedback() {
    // Not used by free response
  }
}
