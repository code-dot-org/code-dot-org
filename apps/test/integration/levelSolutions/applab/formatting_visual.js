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
            </div>
          </div>
          <div id="designModeViz" class="appModern withCrosshair clip-content" data-radium="true"
          style="width: 320px; height: 450px; display: block;">
            <div class="screen" tabindex="1" id="screen2" style=
            "display: block; height: 480px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">
            </div>
          </div>`,
      runBeforeClick: function (assert) {
        assert.equal(document.getElementById('screen1').getBoundingClientRect().height, 450);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
  ]
};
