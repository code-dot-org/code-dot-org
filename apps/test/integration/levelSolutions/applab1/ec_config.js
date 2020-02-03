import tickWrapper from '../../util/tickWrapper';
import {TestResults} from '@cdo/apps/constants';
import $ from 'jquery';

/**
 * @fileoverview Test various level configuration parameters.
 */

export default {
  app: 'applab',
  skinId: 'applab',
  levelFile: 'levels',
  levelId: 'ec_simple',
  tests: [
    {
      description: 'startHtml is visible when levelHtml is absent',
      editCode: true,
      xml: '',
      startHtml: `
          <div id="designModeViz" class="appModern withCrosshair clip-content" data-radium="true"
          style="width: 320px; height: 450px; display: block;">
            <div class="screen" tabindex="1" id="screen1" style=
            "display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            <label style=
            "margin: 0px; padding: 2px; line-height: 1; font-size: 14px; overflow: hidden; word-wrap: break-word; color: rgb(51, 51, 51); max-width: 320px; width: 68px; height: 19px; position: absolute; left: 40px; top: 55px;"
              id="label1">start html</label>
            </div>
          </div>`,
      runBeforeClick: function(assert) {
        assert.equal(
          $('#divApplab label').text(),
          'start html',
          'divApplab contains startHtml'
        );

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'levelHtml overrides startHtml for normal levels',
      editCode: true,
      xml: '',
      startHtml: `
          <div id="designModeViz" class="appModern withCrosshair clip-content" data-radium="true"
          style="width: 320px; height: 450px; display: block;">
            <div class="screen" tabindex="1" id="screen1" style=
            "display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            <label style=
            "margin: 0px; padding: 2px; line-height: 1; font-size: 14px; overflow: hidden; word-wrap: break-word; color: rgb(51, 51, 51); max-width: 320px; width: 68px; height: 19px; position: absolute; left: 40px; top: 55px;"
              id="label1">start html</label>
            </div>
          </div>`,
      levelHtml: `
          <div id="designModeViz" class="appModern withCrosshair clip-content" data-radium="true"
          style="width: 320px; height: 450px; display: block;">
            <div class="screen" tabindex="1" id="screen1" style=
            "display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            <label style=
            "margin: 0px; padding: 2px; line-height: 1; font-size: 14px; overflow: hidden; word-wrap: break-word; color: rgb(51, 51, 51); max-width: 320px; width: 68px; height: 19px; position: absolute; left: 40px; top: 55px;"
              id="label1">level html</label>
            </div>
          </div>`,
      runBeforeClick: function(assert) {
        assert.equal(
          $('#divApplab label').text(),
          'level html',
          'divApplab contains levelHtml'
        );

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'levelHtml does not override startHtml for embedded levels',
      editCode: true,
      xml: '',
      startHtml: `
          <div id="designModeViz" class="appModern withCrosshair clip-content" data-radium="true"
          style="width: 320px; height: 450px; display: block;">
            <div class="screen" tabindex="1" id="screen1" style=
            "display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            <label style=
            "margin: 0px; padding: 2px; line-height: 1; font-size: 14px; overflow: hidden; word-wrap: break-word; color: rgb(51, 51, 51); max-width: 320px; width: 68px; height: 19px; position: absolute; left: 40px; top: 55px;"
              id="label1">start html</label>
            </div>
          </div>`,
      levelHtml: `
          <div id="designModeViz" class="appModern withCrosshair clip-content" data-radium="true"
          style="width: 320px; height: 450px; display: block;">
            <div class="screen" tabindex="1" id="screen1" style=
            "display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            <label style=
            "margin: 0px; padding: 2px; line-height: 1; font-size: 14px; overflow: hidden; word-wrap: break-word; color: rgb(51, 51, 51); max-width: 320px; width: 68px; height: 19px; position: absolute; left: 40px; top: 55px;"
              id="label1">level html</label>
            </div>
          </div>`,
      embed: true,
      runBeforeClick: function(assert) {
        assert.equal(
          $('#divApplab label').text(),
          'start html',
          'divApplab contains startHtml'
        );

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'start code visible when user code is absent',
      editCode: true,
      xml: "textLabel('id', 'start code');",
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 5, () => {
          assert.equal(
            $('#divApplab label').text(),
            'start code',
            'start code is visible'
          );

          Applab.onPuzzleComplete();
        });
      },
      customValidator(assert) {
        // No errors in output console
        const debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'user code overrides start code for normal levels',
      editCode: true,
      xml: "textLabel('id', 'start code');",
      lastAttempt: "textLabel('id', 'user code');",
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 5, () => {
          assert.equal(
            $('#divApplab label').text(),
            'user code',
            'user code is visible'
          );

          Applab.onPuzzleComplete();
        });
      },
      customValidator(assert) {
        // No errors in output console
        const debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'user code does not override start code for embedded levels',
      editCode: true,
      xml: "textLabel('id', 'start code');",
      lastAttempt: "textLabel('id', 'user code');",
      embed: true,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 5, () => {
          assert.equal(
            $('#divApplab label').text(),
            'start code',
            'start code is visible'
          );

          Applab.onPuzzleComplete();
        });
      },
      customValidator(assert) {
        // No errors in output console
        const debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
