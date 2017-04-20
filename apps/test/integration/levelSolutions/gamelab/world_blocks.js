import tickWrapper from '../../util/tickWrapper';
import {TestResults} from '@cdo/apps/constants';
/* global Gamelab */

var levelDefinition = {
  "skin": "gamelab",
  "code_functions": {
    "drawSprites": null,
    "var sprite = createSprite": null,
    "setAnimation": null,
    "fill": null,
    "noFill": null,
    "stroke": null,
    "noStroke": null,
    "rgb": null,
    "ellipse": null,
    "line": null,
    "rect": null,
    "randomNumber_min_max": null,
    "background": null,
    "text": null,
    "textSize": null,
    "declareAssign_x": null,
    "comment_Drawing": null,
    "comment_Math": null,
    "comment_GameLab": null,
    "comment_Sprites": null
  },
  "show_d_pad": "false",
  "edit_code": true,
  "embed": "false",
  "markdown_instructions": "# Resizing with Scale\r\n\r\nIn the _Sprites_ drawer of the toolbox you'll see a new block called `sprite.scale`. This command lets you change the size of a sprite in relation to its original size. `sprite.scale = 1` is the normal size. `sprite.scale = 0.5` would make your sprite half as big, while `sprite.scale = 2` would make it twice as big.\r\n\r\n# Do This\r\n\r\nAt this point the program should include your newly uploaded image, but it's probably not the _perfect_ size. Add a `sprite.scale` block to change the size of your `kite` sprite.\r\n\r\n_Hint: the order of your code matters! You need to add `sprite.scale` **after** you've created the sprite, but **before** you draw the sprite with `drawSprites()`. For clarity, try to keep all of your sprite code together at the top of your program._",
  "is_k1": "false",
  "skip_instructions_popup": "false",
  "never_autoplay_video": "false",
  "disable_param_editing": "true",
  "disable_variable_editing": "false",
  "use_modal_function_editor": "false",
  "use_contract_editor": "false",
  "contract_highlight": "false",
  "contract_collapse": "false",
  "examples_highlight": "false",
  "examples_collapse": "false",
  "examples_required": "false",
  "definition_highlight": "false",
  "definition_collapse": "false",
  "disable_examples": "false",
  "droplet_tooltips_disabled": "false",
  "lock_zero_param_functions": "false",
  "free_play": "true",
  "text_mode_at_start": "false",
  "submittable": "false",
  "hide_view_data_button": "false",
  "debugger_disabled": "false",
  "project_template_level_name": "CSD U3 kite template v2",
  "instructions_important": "false",
  "hide_animation_mode": "false",
  "start_in_animation_tab": "false",
  "all_animations_single_frame": "true",
  "pause_animations_by_default": "false",
  "show_debug_watch": "true",
  "editCode": "true"
};

module.exports = {
  app: "gamelab",
  skinId: "gamelab",
  levelDefinition: levelDefinition,
  tests: [
    // These exercise the blocks in World category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    {
      description: "World blocks",
      editCode: true,
      xml:
        'var a = World.allSprites;\n' +
        'var b = World.width;\n' +
        'var c = World.height;\n' +
        'var d = World.mouseX;\n' +
        'var e = World.mouseY;\n' +
        'var f = World.frameRate;\n' +
        'var g = World.frameCount;\n' +
        'var h = World.seconds;\n' +
        'console.log("done")',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.tickAppUntil(Gamelab, function () {
          var debugOutput = document.getElementById('debug-output');
          return debugOutput.textContent !== "";
        }).then(function () {
          Gamelab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "done");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'Deprecated Game. still works',
      editCode: true,
      xml:
        'var a = Game.allSprites;\n' +
        'var b = Game.width;\n' +
        'var c = Game.height;\n' +
        'var d = Game.mouseX;\n' +
        'var e = Game.mouseY;\n' +
        'var f = Game.frameRate;\n' +
        'var g = Game.frameCount;\n' +
        'var h = Game.seconds;\n' +
        'console.log("done")',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.tickAppUntil(Gamelab, function () {
          var debugOutput = document.getElementById('debug-output');
          return debugOutput.textContent !== "";
        }).then(function () {
          Gamelab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "done");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
