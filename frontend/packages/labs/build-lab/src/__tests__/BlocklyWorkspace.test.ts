import {describe, expect, it} from 'vitest';

import {
  appendDesignEventToWorkspace,
  getDesignEventsFromWorkspace,
  removeAssetReferencesInWorkspace,
  removeDesignEventFromWorkspace,
  removeDesignEventsForScreen,
  updateDesignEventInWorkspace,
} from '../BlocklyWorkspace';
import type {BuildlabWorkspaceState} from '../BlocklyWorkspace';

const workspaceState: BuildlabWorkspaceState = {
  blocks: {languageVersion: 0, blocks: []},
};

describe('Build Lab design event projection', () => {
  it('preserves the text authored in Design mode', () => {
    const nextState = appendDesignEventToWorkspace(workspaceState, {
      action: 'changeText',
      elementId: 'button1',
      eventType: 'click',
      id: 'event-1',
      targetElementId: 'label1',
      text: 'Welcome back',
    });

    expect(getDesignEventsFromWorkspace(nextState)).toEqual([
      expect.objectContaining({
        action: 'changeText',
        text: 'Welcome back',
      }),
    ]);
  });

  it('preserves a sprite as the event source', () => {
    const nextState = appendDesignEventToWorkspace(workspaceState, {
      action: 'changeText',
      elementId: 'sprite1',
      eventType: 'click',
      id: 'sprite-event-1',
      targetElementId: 'label1',
      text: 'Orbit clicked',
    });

    expect(getDesignEventsFromWorkspace(nextState)).toEqual([
      expect.objectContaining({
        elementId: 'sprite1',
        targetElementId: 'label1',
      }),
    ]);
  });

  it('projects a model prediction event into Blockly state', () => {
    const nextState = appendDesignEventToWorkspace(workspaceState, {
      action: 'predictModel',
      elementId: 'button1',
      eventType: 'click',
      id: 'model-event-1',
      modelId: 'model-1',
      targetElementId: 'prediction-label',
    });

    expect(getDesignEventsFromWorkspace(nextState)).toEqual([
      expect.objectContaining({
        action: 'predictModel',
        modelId: 'model-1',
        targetElementId: 'prediction-label',
      }),
    ]);
    expect(nextState.blocks.blocks[0].next?.block.fields).toEqual({
      MODEL: 'model-1',
      RESULT: 'prediction-label',
    });
  });

  it('projects a generative AI event into Blockly state', () => {
    const nextState = appendDesignEventToWorkspace(workspaceState, {
      action: 'generateText',
      elementId: 'button1',
      eventType: 'click',
      id: 'generate-event-1',
      prompt: 'Write a short welcome message',
      targetElementId: 'welcome-label',
    });

    expect(getDesignEventsFromWorkspace(nextState)).toEqual([
      expect.objectContaining({
        action: 'generateText',
        prompt: 'Write a short welcome message',
        targetElementId: 'welcome-label',
      }),
    ]);
    expect(nextState.blocks.blocks[0].next?.block).toEqual({
      fields: {
        PROMPT: 'Write a short welcome message',
        RESULT: 'welcome-label',
      },
      id: 'generate-event-1-action',
      type: 'buildlab_generate_text',
    });
  });

  it('updates an existing event without changing its block identity', () => {
    const initialState = appendDesignEventToWorkspace(workspaceState, {
      action: 'changeText',
      elementId: 'sprite1',
      eventType: 'click',
      id: 'sprite-event-1',
      targetElementId: 'label1',
      text: 'Orbit clicked',
    });

    const nextState = updateDesignEventInWorkspace(initialState, {
      action: 'goToScreen',
      elementId: 'sprite1',
      eventType: 'click',
      id: 'sprite-event-1',
      screenId: 'screen2',
    });

    expect(nextState.blocks.blocks).toHaveLength(1);
    expect(nextState.blocks.blocks[0]).toEqual(
      expect.objectContaining({id: 'sprite-event-1', x: 88, y: 244}),
    );
    expect(getDesignEventsFromWorkspace(nextState)).toEqual([
      expect.objectContaining({
        action: 'goToScreen',
        elementId: 'sprite1',
        id: 'sprite-event-1',
        screenId: 'screen2',
      }),
    ]);
  });

  it('removes the matching event block without touching other blocks', () => {
    const withEvents = appendDesignEventToWorkspace(
      appendDesignEventToWorkspace(workspaceState, {
        action: 'changeText',
        elementId: 'button1',
        eventType: 'click',
        id: 'event-1',
        targetElementId: 'label1',
        text: 'One',
      }),
      {
        action: 'goToScreen',
        elementId: 'button1',
        eventType: 'click',
        id: 'event-2',
        screenId: 'screen2',
      },
    );

    const nextState = removeDesignEventFromWorkspace(withEvents, 'event-1');

    expect(getDesignEventsFromWorkspace(nextState)).toEqual([
      expect.objectContaining({id: 'event-2'}),
    ]);
  });

  it('removes events that target a deleted screen or its elements', () => {
    const withEvents = appendDesignEventToWorkspace(
      appendDesignEventToWorkspace(workspaceState, {
        action: 'goToScreen',
        elementId: 'button1',
        eventType: 'click',
        id: 'event-to-delete',
        screenId: 'screen2',
      }),
      {
        action: 'changeText',
        elementId: 'button1',
        eventType: 'click',
        id: 'event-from-deleted-element',
        targetElementId: 'label2',
        text: 'Gone',
      },
    );

    const nextState = removeDesignEventsForScreen(withEvents, 'screen2', [
      'label2',
    ]);

    expect(getDesignEventsFromWorkspace(nextState)).toEqual([]);
  });

  it('replaces deleted sprite assets in nested Blockly blocks', () => {
    const nextState = removeAssetReferencesInWorkspace(
      {
        blocks: {
          blocks: [
            {
              fields: {ASSET: 'gone'},
              id: 'create-gone',
              next: {
                block: {
                  fields: {ASSET: 'gone'},
                  id: 'create-nested-gone',
                  type: 'buildlab_create_sprite',
                },
              },
              type: 'buildlab_create_sprite',
            },
          ],
          languageVersion: 0,
        },
      },
      'gone',
      'replacement',
    );

    expect(nextState.blocks.blocks[0].fields?.ASSET).toBe('replacement');
    expect(nextState.blocks.blocks[0].next?.block.fields?.ASSET).toBe(
      'replacement',
    );
  });
});
