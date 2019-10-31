import {TestResults} from '@cdo/apps/constants';
export default {
  app: 'applab',
  skinId: 'applab',
  levelFile: 'levels',
  levelId: 'ec_simple',
  tests: [
    {
      description: 'old-sized app is scaled to new size',
      editCode: true,
      xml: '',
      startHtml: `
          <div id="divApplab" class="appModern running" tabindex="1" style="width: 320px; height: 450px;">
            <div class="screen" tabindex="1" id="screen1" style=
            "display: block; height: 480px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            <div class="screen" tabindex="1" id="screen2" style=
            "display: block; height: 480px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            </div>
          </div>
          <div id="designModeViz" class="appModern withCrosshair clip-content" data-radium="true"
          style="width: 320px; height: 450px; display: block;">
            <div class="screen" tabindex="1" id="design_screen2" style=
            "display: block; height: 480px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            </div>
          </div>`,
      runBeforeClick: function(assert) {
        //Correct transform applied
        assert.equal(
          $('#phoneFrameWrapper').css('transform'),
          'matrix(0.9375, 0, 0, 0.9375, 0, 0)'
        );

        //Screens appear at correct height
        const screens = document.getElementsByClassName('screen');
        for (let i = 0; i < screens.length; i++) {
          //If screen had original height of 0, expect no scaling
          if (screens[i].getBoundingClientRect().height === 0) {
            assert.equal(screens[i].getBoundingClientRect().height, 0);
          } else {
            // Height has been scaled down correctly
            assert.equal(screens[i].getBoundingClientRect().height, 450);
          }
        }

        //Footer only scaled in x direction
        const bases = document.getElementsByClassName('small-footer-base');
        for (let j = 0; j < bases.length; j++) {
          assert.equal(bases[j].getBoundingClientRect().width, 318.75);
          assert.equal(
            bases[j].css('transform'),
            'matrix(0.9375, 0, 0, 0, 0, 0)'
          );
        }

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'new-sized app does not scale',
      editCode: true,
      xml: '',
      startHtml: `
          <div id="divApplab" class="appModern running" tabindex="1" style="width: 320px; height: 450px;">
            <div class="screen" tabindex="1" id="screen1" style=
            "display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            <div class="screen" tabindex="1" id="screen2" style=
            "display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            </div>
          </div>
          <div id="designModeViz" class="appModern withCrosshair clip-content" data-radium="true"
          style="width: 320px; height: 450px; display: block;">
            <div class="screen" tabindex="1" id="design_screen2" style=
            "display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            </div>
          </div>`,
      runBeforeClick: function(assert) {
        //Transform is not applied
        assert.notEqual(
          $('#phoneFrameWrapper').css('transform'),
          'matrix(0.9375, 0, 0, 0.9375, 0, 0)'
        );

        //Screens appear at correct height
        const screens = document.getElementsByClassName('screen');
        for (let i = 0; i < screens.length; i++) {
          //If screen had original height of 0, expect no scaling
          if (screens[i].getBoundingClientRect().height === 0) {
            assert.equal(screens[i].getBoundingClientRect().height, 0);
          } else {
            // Height has been scaled or not scaled correctly
            assert.equal(screens[i].getBoundingClientRect().height, 450);
          }
        }

        //Footer not scaled in x direction
        const bases = document.getElementsByClassName('small-footer-base');
        for (let j = 0; j < bases.length; j++) {
          assert.notEqual(bases[j].getBoundingClientRect().width, 318.75);
          assert.notEqual(
            bases[j].css('transform'),
            'matrix(0.9375, 0, 0, 0, 0, 0)'
          );
        }

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
