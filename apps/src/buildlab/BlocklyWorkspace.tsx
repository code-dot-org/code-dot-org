import type * as BlocklyCore from 'blockly/core';
import React, {useEffect, useRef} from 'react';

import {
  normalizeBuildlabFieldValue,
  normalizeBuildlabWorkspaceState,
} from './blocklyTypes';
import {
  BUILD_LAB_TOOLBOX,
  CDO_BLOCKLY_THEME,
  CDO_RENDERER,
  type BuildlabBlockState,
  type BuildlabWorkspaceState,
  setupBuildLabBlocklyEnvironment,
} from './buildlabBlockly';

export type {
  BuildlabBlockState,
  BuildlabWorkspaceState,
} from './buildlabBlockly';

import styles from './buildlab-view.module.scss';

interface Props {
  assetOptions: BuildlabDropdownOption[];
  elementOptions: BuildlabDropdownOption[];
  onWorkspaceChange: (workspaceState: BuildlabWorkspaceState) => void;
  readOnly?: boolean;
  screenOptions: BuildlabDropdownOption[];
  spriteOptions: BuildlabDropdownOption[];
  touchTargetOptions: BuildlabDropdownOption[];
  modelOptions: BuildlabDropdownOption[];
  workspaceState: BuildlabWorkspaceState;
}

export type BuildlabDropdownOption = [string, string];

export interface BuildlabDesignEvent {
  action: 'changeText' | 'generateText' | 'goToScreen' | 'predictModel';
  eventType: 'click';
  id: string;
  modelId?: string;
  prompt?: string;
  screenId?: string;
  targetElementId?: string;
  text?: string;
  elementId: string;
}

export const INITIAL_WORKSPACE_STATE: BuildlabWorkspaceState = {
  blocks: {
    languageVersion: 0,
    blocks: [],
  },
};

export function getDesignEventsFromWorkspace(
  workspaceState: BuildlabWorkspaceState
): BuildlabDesignEvent[] {
  const normalizedWorkspaceState =
    normalizeBuildlabWorkspaceState(workspaceState);
  return normalizedWorkspaceState.blocks.blocks.flatMap<BuildlabDesignEvent>(
    block => {
      if (block.type !== 'buildlab_on_click') {
        return [];
      }

      const actionBlock = block.next?.block;
      if (actionBlock?.type === 'buildlab_show_screen') {
        return [
          {
            action: 'goToScreen',
            elementId: String(block.fields?.ELEMENT ?? 'button1'),
            eventType: 'click',
            id: block.id,
            screenId: String(actionBlock.fields?.SCREEN ?? 'screen1'),
          },
        ];
      }

      if (actionBlock?.type === 'buildlab_predict_model') {
        return [
          {
            action: 'predictModel',
            elementId: String(block.fields?.ELEMENT ?? 'button1'),
            eventType: 'click',
            id: block.id,
            modelId: String(actionBlock.fields?.MODEL ?? ''),
            targetElementId: String(actionBlock.fields?.RESULT ?? ''),
          },
        ];
      }

      if (actionBlock?.type === 'buildlab_generate_text') {
        return [
          {
            action: 'generateText',
            elementId: String(block.fields?.ELEMENT ?? 'button1'),
            eventType: 'click',
            id: block.id,
            prompt: String(
              actionBlock.fields?.PROMPT ?? 'Write a friendly greeting'
            ),
            targetElementId: String(actionBlock.fields?.RESULT ?? 'label1'),
          },
        ];
      }

      if (actionBlock?.type !== 'buildlab_set_text') {
        return [];
      }

      return [
        {
          action: 'changeText',
          elementId: String(block.fields?.ELEMENT ?? 'button1'),
          eventType: 'click',
          id: block.id,
          targetElementId: String(actionBlock.fields?.ELEMENT ?? 'label1'),
          text: String(actionBlock.fields?.TEXT ?? 'Hello!'),
        },
      ];
    }
  );
}

function createDesignEventActionBlock(
  event: BuildlabDesignEvent
): BuildlabBlockState {
  if (event.action === 'goToScreen') {
    return {
      fields: {SCREEN: event.screenId ?? 'screen1'},
      id: `${event.id}-action`,
      type: 'buildlab_show_screen',
    };
  }

  if (event.action === 'predictModel') {
    return {
      fields: {
        MODEL: event.modelId ?? '',
        RESULT: event.targetElementId ?? 'label1',
      },
      id: `${event.id}-action`,
      type: 'buildlab_predict_model',
    };
  }

  if (event.action === 'generateText') {
    return {
      fields: {
        PROMPT: event.prompt ?? 'Write a friendly greeting',
        RESULT: event.targetElementId ?? 'label1',
      },
      id: `${event.id}-action`,
      type: 'buildlab_generate_text',
    };
  }

  return {
    fields: {
      ELEMENT: event.targetElementId ?? 'label1',
      TEXT: event.text ?? 'Hello!',
    },
    id: `${event.id}-action`,
    type: 'buildlab_set_text',
  };
}

export function appendDesignEventToWorkspace(
  workspaceState: BuildlabWorkspaceState,
  event: BuildlabDesignEvent
): BuildlabWorkspaceState {
  const eventCount = getDesignEventsFromWorkspace(workspaceState).length;
  const actionBlock = createDesignEventActionBlock(event);

  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: [
        ...workspaceState.blocks.blocks,
        {
          fields: {ELEMENT: event.elementId},
          id: event.id,
          next: {block: actionBlock},
          type: 'buildlab_on_click',
          x: 88 + eventCount * 24,
          y: 244 + eventCount * 88,
        },
      ],
    },
  };
}

export function updateDesignEventInWorkspace(
  workspaceState: BuildlabWorkspaceState,
  event: BuildlabDesignEvent
): BuildlabWorkspaceState {
  const eventBlockIndex = workspaceState.blocks.blocks.findIndex(
    block => block.id === event.id && block.type === 'buildlab_on_click'
  );
  if (eventBlockIndex === -1) {
    return appendDesignEventToWorkspace(workspaceState, event);
  }

  const currentEventBlock = workspaceState.blocks.blocks[eventBlockIndex];
  const updatedEventBlock: BuildlabBlockState = {
    ...currentEventBlock,
    fields: {ELEMENT: event.elementId},
    next: {block: createDesignEventActionBlock(event)},
  };

  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: workspaceState.blocks.blocks.map((block, index) =>
        index === eventBlockIndex ? updatedEventBlock : block
      ),
    },
  };
}

export function removeDesignEventFromWorkspace(
  workspaceState: BuildlabWorkspaceState,
  eventId: string
): BuildlabWorkspaceState {
  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: workspaceState.blocks.blocks.filter(
        block => block.id !== eventId
      ),
    },
  };
}

export function renameElementReferencesInWorkspace(
  workspaceState: BuildlabWorkspaceState,
  previousElementId: string,
  nextElementId: string
): BuildlabWorkspaceState {
  const renameReferences = (block: BuildlabBlockState): BuildlabBlockState => {
    const fields = {...block.fields};
    if (
      (block.type === 'buildlab_on_click' ||
        block.type === 'buildlab_set_text' ||
        block.type === 'buildlab_set_text_from_variable' ||
        block.type === 'buildlab_set_position' ||
        block.type === 'buildlab_set_visible') &&
      fields.ELEMENT === previousElementId
    ) {
      fields.ELEMENT = nextElementId;
    }
    if (
      block.type === 'buildlab_move_with_arrow_keys' &&
      fields.SPRITE === previousElementId
    ) {
      fields.SPRITE = nextElementId;
    }
    if (
      (block.type === 'buildlab_on_touch' ||
        block.type === 'buildlab_set_sprite_size' ||
        block.type === 'buildlab_change_sprite_position') &&
      fields.SPRITE === previousElementId
    ) {
      fields.SPRITE = nextElementId;
    }
    if (
      block.type === 'buildlab_on_touch' &&
      fields.TARGET === previousElementId
    ) {
      fields.TARGET = nextElementId;
    }
    if (
      (block.type === 'buildlab_predict_model' ||
        block.type === 'buildlab_generate_text') &&
      fields.RESULT === previousElementId
    ) {
      fields.RESULT = nextElementId;
    }

    return {
      ...block,
      fields,
      next: block.next
        ? {block: renameReferences(block.next.block)}
        : undefined,
    };
  };

  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: workspaceState.blocks.blocks.map(renameReferences),
    },
  };
}

export function renameScreenReferencesInWorkspace(
  workspaceState: BuildlabWorkspaceState,
  previousScreenId: string,
  nextScreenId: string
): BuildlabWorkspaceState {
  const renameReferences = (block: BuildlabBlockState): BuildlabBlockState => {
    const fields = {...block.fields};
    if (
      block.type === 'buildlab_show_screen' &&
      fields.SCREEN === previousScreenId
    ) {
      fields.SCREEN = nextScreenId;
    }

    return {
      ...block,
      fields,
      next: block.next
        ? {block: renameReferences(block.next.block)}
        : undefined,
    };
  };

  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: workspaceState.blocks.blocks.map(renameReferences),
    },
  };
}

export function removeDesignEventsForElement(
  workspaceState: BuildlabWorkspaceState,
  elementId: string
): BuildlabWorkspaceState {
  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: workspaceState.blocks.blocks.filter(block => {
        if (
          (block.type === 'buildlab_move_with_arrow_keys' ||
            block.type === 'buildlab_set_sprite_size' ||
            block.type === 'buildlab_change_sprite_position') &&
          block.fields?.SPRITE === elementId
        ) {
          return false;
        }

        if (
          block.type === 'buildlab_on_touch' &&
          (block.fields?.SPRITE === elementId ||
            block.fields?.TARGET === elementId)
        ) {
          return false;
        }

        if (
          block.type === 'buildlab_set_text_from_variable' &&
          block.fields?.ELEMENT === elementId
        ) {
          return false;
        }

        if (block.type !== 'buildlab_on_click') {
          return true;
        }

        const actionBlock = block.next?.block;
        const actionTarget =
          actionBlock?.type === 'buildlab_set_text' ||
          actionBlock?.type === 'buildlab_set_text_from_variable'
            ? actionBlock.fields?.ELEMENT
            : actionBlock?.type === 'buildlab_predict_model' ||
              actionBlock?.type === 'buildlab_generate_text'
            ? actionBlock.fields?.RESULT
            : undefined;

        return (
          block.fields?.ELEMENT !== elementId && actionTarget !== elementId
        );
      }),
    },
  };
}

export function removeDesignEventsForScreen(
  workspaceState: BuildlabWorkspaceState,
  screenId: string,
  elementIds: string[]
): BuildlabWorkspaceState {
  const removedElementIds = new Set(elementIds);

  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: workspaceState.blocks.blocks.filter(block => {
        if (
          (block.type === 'buildlab_move_with_arrow_keys' ||
            block.type === 'buildlab_set_sprite_size' ||
            block.type === 'buildlab_change_sprite_position') &&
          removedElementIds.has(String(block.fields?.SPRITE ?? ''))
        ) {
          return false;
        }

        if (
          block.type === 'buildlab_on_touch' &&
          (removedElementIds.has(String(block.fields?.SPRITE ?? '')) ||
            removedElementIds.has(String(block.fields?.TARGET ?? '')))
        ) {
          return false;
        }

        if (
          block.type === 'buildlab_set_text_from_variable' &&
          removedElementIds.has(String(block.fields?.ELEMENT ?? ''))
        ) {
          return false;
        }

        if (block.type !== 'buildlab_on_click') {
          return true;
        }

        if (removedElementIds.has(String(block.fields?.ELEMENT ?? ''))) {
          return false;
        }

        const actionBlock = block.next?.block;
        if (
          actionBlock?.type === 'buildlab_show_screen' &&
          String(actionBlock.fields?.SCREEN ?? '') === screenId
        ) {
          return false;
        }

        return (
          !(
            actionBlock?.type === 'buildlab_set_text' &&
            removedElementIds.has(String(actionBlock.fields?.ELEMENT ?? ''))
          ) &&
          !(
            actionBlock?.type === 'buildlab_set_text_from_variable' &&
            removedElementIds.has(String(actionBlock.fields?.ELEMENT ?? ''))
          ) &&
          !(
            (actionBlock?.type === 'buildlab_predict_model' ||
              actionBlock?.type === 'buildlab_generate_text') &&
            removedElementIds.has(String(actionBlock.fields?.RESULT ?? ''))
          )
        );
      }),
    },
  };
}

export function removeAssetReferencesInWorkspace(
  workspaceState: BuildlabWorkspaceState,
  assetId: string,
  replacementAssetId = ''
): BuildlabWorkspaceState {
  const removeAssetReference = (
    block: BuildlabBlockState
  ): BuildlabBlockState => {
    const fields = {...block.fields};
    if (
      block.type === 'buildlab_create_sprite' &&
      String(fields.ASSET ?? '') === assetId
    ) {
      fields.ASSET = replacementAssetId;
    }

    return {
      ...block,
      fields,
      next: block.next
        ? {block: removeAssetReference(block.next.block)}
        : undefined,
    };
  };

  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: workspaceState.blocks.blocks.map(removeAssetReference),
    },
  };
}

export function removeModelReferencesInWorkspace(
  workspaceState: BuildlabWorkspaceState,
  modelId: string
): BuildlabWorkspaceState {
  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: workspaceState.blocks.blocks.filter(block => {
        const actionBlock = block.next?.block;
        return !(
          block.type === 'buildlab_on_click' &&
          actionBlock?.type === 'buildlab_predict_model' &&
          String(actionBlock.fields?.MODEL ?? '') === modelId
        );
      }),
    },
  };
}

function updateDropdownOptions(
  workspace: BlocklyCore.WorkspaceSvg,
  fieldName: string,
  options: BuildlabDropdownOption[],
  emptyLabel: string
) {
  workspace.getAllBlocks(false).forEach(block => {
    const field = block.getField(fieldName);
    if (!(field instanceof Blockly.blockly_.FieldDropdown)) {
      return;
    }

    const currentValue = field.getValue();
    const nextOptions = options.length
      ? options
      : [[emptyLabel, ''] as BuildlabDropdownOption];
    const hasCurrentValue = nextOptions.some(
      ([, value]) => value === currentValue
    );
    const optionsWithLegacyValue =
      currentValue && !hasCurrentValue
        ? [
            [
              `Missing: ${currentValue}`,
              currentValue,
            ] as BuildlabDropdownOption,
            ...nextOptions,
          ]
        : nextOptions;

    field.setOptions(optionsWithLegacyValue);
    if (currentValue) {
      field.setValue(currentValue);
    }
  });
}

function updateWorkspaceDropdowns(
  workspace: BlocklyCore.WorkspaceSvg,
  elementOptions: BuildlabDropdownOption[],
  screenOptions: BuildlabDropdownOption[],
  assetOptions: BuildlabDropdownOption[],
  spriteOptions: BuildlabDropdownOption[],
  touchTargetOptions: BuildlabDropdownOption[],
  modelOptions: BuildlabDropdownOption[]
) {
  updateDropdownOptions(
    workspace,
    'ELEMENT',
    elementOptions,
    'No elements available'
  );
  updateDropdownOptions(
    workspace,
    'SCREEN',
    screenOptions,
    'No screens available'
  );
  updateDropdownOptions(
    workspace,
    'ASSET',
    assetOptions,
    'No sprite assets available'
  );
  updateDropdownOptions(
    workspace,
    'SPRITE',
    spriteOptions,
    'No sprites available'
  );
  updateDropdownOptions(
    workspace,
    'TARGET',
    touchTargetOptions,
    'No sprites available'
  );
  updateDropdownOptions(workspace, 'MODEL', modelOptions, 'No models imported');
  updateDropdownOptions(
    workspace,
    'RESULT',
    elementOptions,
    'No elements available'
  );
}

function restoreDropdownValues(
  workspace: BlocklyCore.WorkspaceSvg,
  workspaceState: BuildlabWorkspaceState
) {
  const normalizedWorkspaceState =
    normalizeBuildlabWorkspaceState(workspaceState);
  const restoreBlockFields = (blockState: BuildlabBlockState) => {
    const block = workspace.getBlockById(blockState.id);
    if (block) {
      Object.entries(blockState.fields ?? {}).forEach(([fieldName, value]) => {
        const field = block.getField(fieldName);
        if (!(field instanceof Blockly.blockly_.FieldDropdown)) {
          return;
        }

        const expectedValue = String(normalizeBuildlabFieldValue(value));
        const options = field.getOptions();
        if (!options.some(([, optionValue]) => optionValue === expectedValue)) {
          field.setOptions([
            [`Missing: ${expectedValue}`, expectedValue],
            ...options,
          ]);
        }
        field.setValue(expectedValue);
      });
    }

    if (blockState.next?.block) {
      restoreBlockFields(blockState.next.block);
    }
  };

  normalizedWorkspaceState.blocks.blocks.forEach(restoreBlockFields);
}

function loadWorkspaceState(
  workspace: BlocklyCore.WorkspaceSvg,
  workspaceState: BuildlabWorkspaceState,
  elementOptions: BuildlabDropdownOption[],
  screenOptions: BuildlabDropdownOption[],
  assetOptions: BuildlabDropdownOption[],
  spriteOptions: BuildlabDropdownOption[],
  touchTargetOptions: BuildlabDropdownOption[],
  modelOptions: BuildlabDropdownOption[]
) {
  const normalizedWorkspaceState =
    normalizeBuildlabWorkspaceState(workspaceState);
  workspace.clear();
  Blockly.serialization.workspaces.load(normalizedWorkspaceState, workspace);
  updateWorkspaceDropdowns(
    workspace,
    elementOptions,
    screenOptions,
    assetOptions,
    spriteOptions,
    touchTargetOptions,
    modelOptions
  );
  restoreDropdownValues(workspace, normalizedWorkspaceState);
}

export default function BlocklyWorkspace({
  assetOptions,
  elementOptions,
  onWorkspaceChange,
  readOnly = false,
  screenOptions,
  spriteOptions,
  touchTargetOptions,
  modelOptions,
  workspaceState,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialWorkspaceStateRef = useRef(workspaceState);
  const dropdownOptionsRef = useRef({
    assetOptions,
    elementOptions,
    screenOptions,
    spriteOptions,
    touchTargetOptions,
    modelOptions,
  });
  const workspaceRef = useRef<BlocklyCore.WorkspaceSvg | null>(null);
  const dragInProgressRef = useRef(false);
  const onWorkspaceChangeRef = useRef(onWorkspaceChange);
  dropdownOptionsRef.current = {
    assetOptions,
    elementOptions,
    screenOptions,
    spriteOptions,
    touchTargetOptions,
    modelOptions,
  };
  onWorkspaceChangeRef.current = onWorkspaceChange;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    setupBuildLabBlocklyEnvironment();
    containerRef.current.classList.add('notranslate');
    const workspace = Blockly.inject(containerRef.current, {
      readOnly,
      renderer: CDO_RENDERER,
      toolbox: BUILD_LAB_TOOLBOX,
      theme: CDO_BLOCKLY_THEME,
      grid: {spacing: 24, length: 3, colour: '#d4d8e1', snap: true},
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1,
        maxScale: 2,
        minScale: 0.6,
      },
    });
    workspaceRef.current = workspace;
    dragInProgressRef.current = false;
    loadWorkspaceState(
      workspace,
      initialWorkspaceStateRef.current,
      dropdownOptionsRef.current.elementOptions,
      dropdownOptionsRef.current.screenOptions,
      dropdownOptionsRef.current.assetOptions,
      dropdownOptionsRef.current.spriteOptions,
      dropdownOptionsRef.current.touchTargetOptions,
      dropdownOptionsRef.current.modelOptions
    );

    const publishWorkspaceState = () => {
      Blockly.Events.disable();
      try {
        updateWorkspaceDropdowns(
          workspace,
          dropdownOptionsRef.current.elementOptions,
          dropdownOptionsRef.current.screenOptions,
          dropdownOptionsRef.current.assetOptions,
          dropdownOptionsRef.current.spriteOptions,
          dropdownOptionsRef.current.touchTargetOptions,
          dropdownOptionsRef.current.modelOptions
        );
      } finally {
        Blockly.Events.enable();
      }
      onWorkspaceChangeRef.current(
        normalizeBuildlabWorkspaceState(
          Blockly.serialization.workspaces.save(
            workspace
          ) as BuildlabWorkspaceState
        )
      );
    };

    const onChange = (event: BlocklyCore.Events.Abstract) => {
      if (event.type === Blockly.Events.BLOCK_DRAG) {
        const dragEvent = event as BlocklyCore.Events.BlockDrag;
        const isDragStart = dragEvent.isStart === true;
        dragInProgressRef.current = isDragStart;
        if (!isDragStart) {
          // Let Blockly remove its insertion marker before React receives the
          // final workspace state and can trigger a render.
          requestAnimationFrame(publishWorkspaceState);
        }
        return;
      }

      if (
        event.type !== Blockly.Events.BLOCK_CHANGE &&
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_DELETE
      ) {
        return;
      }

      if (dragInProgressRef.current || workspace.isDragging()) {
        return;
      }

      const blockId =
        'blockId' in event && typeof event.blockId === 'string'
          ? event.blockId
          : undefined;
      if (blockId && workspace.getBlockById(blockId)?.isInsertionMarker()) {
        return;
      }

      publishWorkspaceState();
    };
    workspace.addChangeListener(onChange);

    const observer = new ResizeObserver(() => Blockly.svgResize(workspace));
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      workspace.removeChangeListener(onChange);
      dragInProgressRef.current = false;
      workspace.dispose();
      workspaceRef.current = null;
    };
  }, [readOnly]);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }

    // Blockly owns insertion markers while a drag is in progress. Do not
    // replace the workspace from React state until the drag has completed;
    // doing so disposes a marker that the native dragger still references.
    if (dragInProgressRef.current || workspace.isDragging()) {
      return;
    }

    const currentState = Blockly.serialization.workspaces.save(
      workspace
    ) as BuildlabWorkspaceState;
    if (JSON.stringify(currentState) === JSON.stringify(workspaceState)) {
      return;
    }

    Blockly.Events.disable();
    try {
      loadWorkspaceState(
        workspace,
        workspaceState,
        dropdownOptionsRef.current.elementOptions,
        dropdownOptionsRef.current.screenOptions,
        dropdownOptionsRef.current.assetOptions,
        dropdownOptionsRef.current.spriteOptions,
        dropdownOptionsRef.current.touchTargetOptions,
        dropdownOptionsRef.current.modelOptions
      );
    } finally {
      Blockly.Events.enable();
    }
  }, [workspaceState]);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }

    Blockly.Events.disable();
    try {
      updateWorkspaceDropdowns(
        workspace,
        elementOptions,
        screenOptions,
        assetOptions,
        spriteOptions,
        touchTargetOptions,
        modelOptions
      );
    } finally {
      Blockly.Events.enable();
    }
  }, [
    assetOptions,
    elementOptions,
    modelOptions,
    screenOptions,
    spriteOptions,
    touchTargetOptions,
  ]);

  return <div className={styles.blocklyWorkspace} ref={containerRef} />;
}
