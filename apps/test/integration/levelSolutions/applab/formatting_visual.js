import {TestResults} from '@cdo/apps/constants';
export default {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "old-sized app is scaled to new size on edit page",
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
      runBeforeClick: function (assert) {
        var screens = document.getElementsByClassName('screen');
        for (var i = 0; i < screens.length; i++) {
          if (screens[i].getBoundingClientRect().height === 0) {
            assert.equal(screens[i].getBoundingClientRect().height, 0);
          } else {
            assert.equal(screens[i].getBoundingClientRect().height, 450);
          }
        }
        assert.equal(document.getElementsByClassName('small-footer-base').getBoundingClientRect().width, 318.75);
        //assert.equal(document.getElementById('phoneFrameWrapper').getPropertyValue('transform'), 'scale(0.9375)');
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
  ]
};
