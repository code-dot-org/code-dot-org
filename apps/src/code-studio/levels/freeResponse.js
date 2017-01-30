import $ from 'jquery';
import { TestResults } from '../../constants';
import { onAnswerChanged } from './codeStudioLevels';
import { sourceForLevel } from '../clientState';

export default class FreeResponse {
  constructor(levelId) {
    this.levelId = levelId;

    $(document).ready(function () {
      var textarea = $(`textarea#level_${levelId}.response`);
      if (!textarea.val()) {
        const lastAttempt = sourceForLevel(window.appOptions.scriptName, levelId);
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
    });
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
    $(`textarea#level_${this.levelId}.response`).prop('disabled', true);
  }

  getCurrentAnswerFeedback() {
    // Not used by free response
  }
}
