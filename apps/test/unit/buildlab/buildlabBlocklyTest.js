import * as BlocklyCore from 'blockly/core';

import initializeBlocklyWrapper from '@cdo/apps/blockly/blocklyWrapper';
import {
  compileBuildLabWorkspace,
  setupBuildLabBlocklyEnvironment,
} from '@cdo/apps/buildlab/buildlabBlockly';

describe('Build Lab sprite data blocks', () => {
  let consoleWarnSpy;

  beforeAll(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    global.Blockly = initializeBlocklyWrapper(BlocklyCore);
    setupBuildLabBlocklyEnvironment();
  });

  afterAll(() => consoleWarnSpy.mockRestore());

  it('generates a sprite prediction and completion handler', () => {
    const source = compileBuildLabWorkspace({
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            fields: {ELEMENT: 'scientist'},
            id: 'click-scientist',
            next: {
              block: {
                fields: {
                  MODEL: 'model123456',
                  PREDICTOR: 'scientist',
                  SOURCE: 'class:planet',
                },
                id: 'predict-flower',
                type: 'buildlab_predict_sprite',
              },
            },
            type: 'buildlab_on_click',
          },
          {
            fields: {PREDICTOR: 'scientist'},
            id: 'prediction-ready',
            next: {
              block: {
                fields: {
                  ELEMENT: 'result',
                  KEY: 'prediction',
                  SPRITE: 'scientist',
                },
                id: 'show-prediction',
                type: 'buildlab_set_text_from_sprite_data',
              },
            },
            type: 'buildlab_when_prediction_ready',
          },
          {
            fields: {PREDICTOR: 'scientist'},
            id: 'prediction-failed',
            next: {
              block: {
                fields: {
                  ELEMENT: 'result',
                  KEY: 'predictionError',
                  SPRITE: 'scientist',
                },
                id: 'show-prediction-error',
                type: 'buildlab_set_text_from_sprite_data',
              },
            },
            type: 'buildlab_when_prediction_fails',
          },
        ],
      },
    });

    expect(source).toContain(
      'engine.predictSprite("scientist", "model123456", "class:planet");'
    );
    expect(source).toContain('engine.onPredictionReady("scientist"');
    expect(source).toContain('engine.onPredictionFailed("scientist"');
    expect(source).toContain(
      'engine.setTextFromSpriteData("result", "scientist", "prediction");'
    );
  });

  it('generates a sprite data mutation', () => {
    const source = compileBuildLabWorkspace({
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            id: 'when-run',
            next: {
              block: {
                fields: {KEY: 'height', SPRITE: 'flower', VALUE: '12'},
                id: 'set-height',
                type: 'buildlab_set_sprite_data',
              },
            },
            type: 'buildlab_when_run',
          },
        ],
      },
    });

    expect(source).toContain('engine.setSpriteData("flower", "height", "12");');
  });

  it('generates animation playback and AI generation animation behavior', () => {
    const source = compileBuildLabWorkspace({
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            fields: {
              ANIMATION: 'loading-animation',
              SPRITE: 'scientist',
            },
            id: 'animate-while-generating',
            type: 'buildlab_animate_while_generating',
          },
          {
            id: 'when-run',
            next: {
              block: {
                fields: {
                  ANIMATION: 'walking-animation',
                  SPRITE: 'scientist',
                },
                id: 'play-animation',
                next: {
                  block: {
                    fields: {SPRITE: 'scientist'},
                    id: 'stop-animation',
                    type: 'buildlab_stop_animation',
                  },
                },
                type: 'buildlab_play_animation',
              },
            },
            type: 'buildlab_when_run',
          },
        ],
      },
    });

    expect(source).toContain(
      'engine.animateWhileGenerating("scientist", "loading-animation");'
    );
    expect(source).toContain(
      'engine.playAnimation("scientist", "walking-animation");'
    );
    expect(source).toContain('engine.stopAnimation("scientist");');
  });
});
