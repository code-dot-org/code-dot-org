import {
  removeDesignEventsForElement,
  removeModelReferencesInWorkspace,
  renameElementReferencesInWorkspace,
} from '@cdo/apps/buildlab/BlocklyWorkspace';

function workspaceWithPredictionBlocks() {
  return {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          fields: {ELEMENT: 'trigger'},
          id: 'click-trigger',
          next: {
            block: {
              fields: {
                MODEL: 'model123456',
                PREDICTOR: 'scientist',
                SOURCE: 'flower',
              },
              id: 'predict-flower',
              next: {
                block: {
                  fields: {KEY: 'height', SPRITE: 'flower', VALUE: '12'},
                  id: 'set-height',
                  type: 'buildlab_set_sprite_data',
                },
              },
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
          type: 'buildlab_when_prediction_fails',
        },
      ],
    },
  };
}

describe('Build Lab sprite data workspace references', () => {
  it('renames sprite data and prediction references through block chains', () => {
    const renamed = renameElementReferencesInWorkspace(
      workspaceWithPredictionBlocks(),
      'scientist',
      'researcher'
    );

    const predictionBlock = renamed.blocks.blocks[0].next.block;
    const readyBlock = renamed.blocks.blocks[1];
    const failedBlock = renamed.blocks.blocks[2];
    expect(predictionBlock.fields.PREDICTOR).toBe('researcher');
    expect(readyBlock.fields.PREDICTOR).toBe('researcher');
    expect(readyBlock.next.block.fields.SPRITE).toBe('researcher');
    expect(failedBlock.fields.PREDICTOR).toBe('researcher');
  });

  it('removes chains that reference a deleted sprite or model', () => {
    const workspace = workspaceWithPredictionBlocks();

    expect(
      removeDesignEventsForElement(workspace, 'flower').blocks.blocks
    ).toHaveLength(2);
    expect(
      removeModelReferencesInWorkspace(workspace, 'model123456').blocks.blocks
    ).toHaveLength(2);
  });
});
