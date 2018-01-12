import { expect } from 'chai';
import {replaceOnWindow, restoreOnWindow} from '../../../util/testUtils';
import FreeResponse from '@cdo/apps/code-studio/levels/freeResponse';
import { writeSourceForLevel } from '@cdo/apps/code-studio/clientState';

describe('Free Response', () => {
  const levelId = 1047;
  const scriptName = 'test-script';
  const lastAttemptString = 'This is my final answer';
  const otherLastAttemptString = 'This is some other answer';
  let textarea;

  beforeEach(() => {
    // FreeResponse expects to find a textarea element in the document with id
    // "level_<levelID>" and class "response"
    textarea = document.createElement('textarea');
    textarea.setAttribute('id', `level_${levelId}`);
    textarea.setAttribute('class', 'response');
    document.body.appendChild(textarea);

    replaceOnWindow('appOptions', {});
  });

  afterEach(() => {
    restoreOnWindow('appOptions');

    document.body.removeChild(textarea);
  });

  describe('Shows last attempt', () => {
    it('shows nothing if there was no last attempt', () => {
      const freeResponse = new FreeResponse(levelId);
      expect(freeResponse.getResult().response).to.be.empty;
    });

    it('shows client-side last attempt when available', () => {
      window.appOptions.scriptName = scriptName;
      writeSourceForLevel(scriptName, levelId, +new Date(2017, 1, 19), lastAttemptString);

      const freeResponse = new FreeResponse(levelId);
      expect(freeResponse.getResult().response).to.equal(lastAttemptString);
    });

    it('shows the server-side last attempt when both are available', () => {
      window.appOptions.scriptName = scriptName;
      writeSourceForLevel(scriptName, levelId, +new Date(2017, 1, 19), lastAttemptString);
      textarea.value = otherLastAttemptString;

      const freeResponse = new FreeResponse(levelId);
      expect(freeResponse.getResult().response).to.equal(otherLastAttemptString);
    });
  });
});
