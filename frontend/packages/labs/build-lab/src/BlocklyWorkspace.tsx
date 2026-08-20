import * as Blockly from 'blockly';
import {useEffect, useRef} from 'react';

import styles from './build-lab.module.scss';

interface Props {
  assetOptions: BuildlabDropdownOption[];
  elementOptions: BuildlabDropdownOption[];
  onWorkspaceChange: (workspaceState: BuildlabWorkspaceState) => void;
  readOnly?: boolean;
  screenOptions: BuildlabDropdownOption[];
  spriteOptions: BuildlabDropdownOption[];
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

export interface BuildlabBlockState {
  fields?: Record<string, string | number>;
  id: string;
  next?: {block: BuildlabBlockState};
  type: string;
  x?: number;
  y?: number;
}

export interface BuildlabWorkspaceState {
  blocks: {
    blocks: BuildlabBlockState[];
    languageVersion: number;
  };
}

const BLOCKS = [
  {
    type: 'buildlab_when_run',
    message0: 'when project starts',
    nextStatement: null,
    colour: 20,
    tooltip: 'Runs once when the project starts.',
  },
  {
    type: 'buildlab_on_click',
    message0: 'when %1 clicked',
    args0: [
      {
        type: 'field_dropdown',
        name: 'ELEMENT',
        options: [['button1', 'button1']],
      },
    ],
    nextStatement: null,
    colour: 20,
    tooltip: 'Runs when a stage element is clicked.',
  },
  {
    type: 'buildlab_set_text',
    message0: 'set %1 text to %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'ELEMENT',
        options: [['label1', 'label1']],
      },
      {type: 'field_input', name: 'TEXT', text: 'Hello!'},
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'Changes an element label.',
  },
  {
    type: 'buildlab_show_screen',
    message0: 'show screen %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'SCREEN',
        options: [['Screen 1', 'screen1']],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'Shows another screen on the stage.',
  },
  {
    type: 'buildlab_set_position',
    message0: 'set %1 position x %2 y %3',
    args0: [
      {
        type: 'field_dropdown',
        name: 'ELEMENT',
        options: [['label1', 'label1']],
      },
      {type: 'field_number', name: 'X', value: 200},
      {type: 'field_number', name: 'Y', value: 200},
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'Moves an element on the stage.',
  },
  {
    type: 'buildlab_set_visible',
    message0: 'set %1 to %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'ELEMENT',
        options: [['label1', 'label1']],
      },
      {
        type: 'field_dropdown',
        name: 'VISIBLE',
        options: [
          ['showing', 'true'],
          ['hidden', 'false'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'Shows or hides an element.',
  },
  {
    type: 'buildlab_move_with_arrow_keys',
    message0: 'make %1 move with arrow keys at speed %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'SPRITE',
        options: [['sprite1', 'sprite1']],
      },
      {type: 'field_number', name: 'SPEED', value: 5, min: 1, max: 20},
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 345,
    tooltip: 'Moves a sprite while an arrow key is held.',
  },
  {
    type: 'buildlab_predict_model',
    message0: 'predict with %1 and show result in %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'MODEL',
        options: [['No models imported', '']],
      },
      {
        type: 'field_dropdown',
        name: 'RESULT',
        options: [['label1', 'label1']],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 345,
    tooltip: 'Runs an imported model and puts its prediction in an element.',
  },
  {
    type: 'buildlab_generate_text',
    message0: 'ask AI %1 and show response in %2',
    args0: [
      {
        type: 'field_input',
        name: 'PROMPT',
        text: 'Write a friendly greeting',
      },
      {
        type: 'field_dropdown',
        name: 'RESULT',
        options: [['label1', 'label1']],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 290,
    tooltip: 'Generates text and puts the response in an element.',
  },
  {
    type: 'buildlab_create_sprite',
    message0: 'create %1 sprite at x %2 y %3',
    args0: [
      {
        type: 'field_dropdown',
        name: 'ASSET',
        options: [['bear', 'bear']],
      },
      {type: 'field_number', name: 'X', value: 200},
      {type: 'field_number', name: 'Y', value: 200},
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 345,
    tooltip: 'Adds a sprite to the stage.',
  },
];

const TOOLBOX: Blockly.utils.toolbox.ToolboxInfo = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Stage',
      colour: '#5578d4',
      contents: [
        {kind: 'block', type: 'buildlab_when_run'},
        {kind: 'block', type: 'buildlab_create_sprite'},
      ],
    },
    {
      kind: 'category',
      name: 'Elements',
      colour: '#8c52c7',
      contents: [
        {kind: 'block', type: 'buildlab_set_text'},
        {kind: 'block', type: 'buildlab_show_screen'},
        {kind: 'block', type: 'buildlab_set_position'},
        {kind: 'block', type: 'buildlab_set_visible'},
      ],
    },
    {
      kind: 'category',
      name: 'Behaviors',
      colour: '#e08528',
      contents: [
        {kind: 'block', type: 'buildlab_move_with_arrow_keys'},
        {kind: 'block', type: 'buildlab_predict_model'},
      ],
    },
    {
      kind: 'category',
      name: 'AI',
      colour: '#6f5bd3',
      contents: [{kind: 'block', type: 'buildlab_generate_text'}],
    },
    {
      kind: 'category',
      name: 'Events',
      colour: '#d45c3a',
      contents: [{kind: 'block', type: 'buildlab_on_click'}],
    },
  ],
};

export const INITIAL_WORKSPACE_STATE: BuildlabWorkspaceState = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'buildlab_when_run',
        id: 'project-start',
        x: 48,
        y: 48,
        next: {
          block: {
            type: 'buildlab_create_sprite',
            id: 'starter-sprite',
            fields: {ASSET: 'bear', X: 200, Y: 200},
          },
        },
      },
    ],
  },
};

export function getDesignEventsFromWorkspace(
  workspaceState: BuildlabWorkspaceState,
): BuildlabDesignEvent[] {
  return workspaceState.blocks.blocks.flatMap<BuildlabDesignEvent>(block => {
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
            actionBlock.fields?.PROMPT ?? 'Write a friendly greeting',
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
  });
}

function createDesignEventActionBlock(
  event: BuildlabDesignEvent,
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
  event: BuildlabDesignEvent,
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
  event: BuildlabDesignEvent,
): BuildlabWorkspaceState {
  const eventBlockIndex = workspaceState.blocks.blocks.findIndex(
    block => block.id === event.id && block.type === 'buildlab_on_click',
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
        index === eventBlockIndex ? updatedEventBlock : block,
      ),
    },
  };
}

export function removeDesignEventFromWorkspace(
  workspaceState: BuildlabWorkspaceState,
  eventId: string,
): BuildlabWorkspaceState {
  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: workspaceState.blocks.blocks.filter(
        block => block.id !== eventId,
      ),
    },
  };
}

export function renameElementReferencesInWorkspace(
  workspaceState: BuildlabWorkspaceState,
  previousElementId: string,
  nextElementId: string,
): BuildlabWorkspaceState {
  const renameReferences = (block: BuildlabBlockState): BuildlabBlockState => {
    const fields = {...block.fields};
    if (
      (block.type === 'buildlab_on_click' ||
        block.type === 'buildlab_set_text' ||
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
  nextScreenId: string,
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
  elementId: string,
): BuildlabWorkspaceState {
  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: workspaceState.blocks.blocks.filter(block => {
        if (
          block.type === 'buildlab_move_with_arrow_keys' &&
          block.fields?.SPRITE === elementId
        ) {
          return false;
        }

        if (block.type !== 'buildlab_on_click') {
          return true;
        }

        const actionBlock = block.next?.block;
        const actionTarget =
          actionBlock?.type === 'buildlab_set_text'
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
  elementIds: string[],
): BuildlabWorkspaceState {
  const removedElementIds = new Set(elementIds);

  return {
    ...workspaceState,
    blocks: {
      ...workspaceState.blocks,
      blocks: workspaceState.blocks.blocks.filter(block => {
        if (
          block.type === 'buildlab_move_with_arrow_keys' &&
          removedElementIds.has(String(block.fields?.SPRITE ?? ''))
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
  replacementAssetId = '',
): BuildlabWorkspaceState {
  const removeAssetReference = (
    block: BuildlabBlockState,
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

function registerBlocks() {
  const missingBlocks = BLOCKS.filter(block => !Blockly.Blocks[block.type]);
  if (missingBlocks.length > 0) {
    Blockly.common.defineBlocksWithJsonArray(missingBlocks);
  }
}

function updateDropdownOptions(
  workspace: Blockly.WorkspaceSvg,
  fieldName: string,
  options: BuildlabDropdownOption[],
  emptyLabel: string,
) {
  workspace.getAllBlocks(false).forEach(block => {
    const field = block.getField(fieldName);
    if (!(field instanceof Blockly.FieldDropdown)) {
      return;
    }

    const currentValue = field.getValue();
    const nextOptions = options.length
      ? options
      : [[emptyLabel, ''] as BuildlabDropdownOption];
    const hasCurrentValue = nextOptions.some(
      ([, value]) => value === currentValue,
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
  workspace: Blockly.WorkspaceSvg,
  elementOptions: BuildlabDropdownOption[],
  screenOptions: BuildlabDropdownOption[],
  assetOptions: BuildlabDropdownOption[],
  spriteOptions: BuildlabDropdownOption[],
  modelOptions: BuildlabDropdownOption[],
) {
  updateDropdownOptions(
    workspace,
    'ELEMENT',
    elementOptions,
    'No elements available',
  );
  updateDropdownOptions(
    workspace,
    'SCREEN',
    screenOptions,
    'No screens available',
  );
  updateDropdownOptions(
    workspace,
    'ASSET',
    assetOptions,
    'No sprite assets available',
  );
  updateDropdownOptions(
    workspace,
    'SPRITE',
    spriteOptions,
    'No sprites available',
  );
  updateDropdownOptions(workspace, 'MODEL', modelOptions, 'No models imported');
  updateDropdownOptions(
    workspace,
    'RESULT',
    elementOptions,
    'No elements available',
  );
}

function restoreDropdownValues(
  workspace: Blockly.WorkspaceSvg,
  workspaceState: BuildlabWorkspaceState,
) {
  const restoreBlockFields = (blockState: BuildlabBlockState) => {
    const block = workspace.getBlockById(blockState.id);
    if (block) {
      Object.entries(blockState.fields ?? {}).forEach(([fieldName, value]) => {
        const field = block.getField(fieldName);
        if (!(field instanceof Blockly.FieldDropdown)) {
          return;
        }

        const expectedValue = String(value);
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

  workspaceState.blocks.blocks.forEach(restoreBlockFields);
}

function loadWorkspaceState(
  workspace: Blockly.WorkspaceSvg,
  workspaceState: BuildlabWorkspaceState,
  elementOptions: BuildlabDropdownOption[],
  screenOptions: BuildlabDropdownOption[],
  assetOptions: BuildlabDropdownOption[],
  spriteOptions: BuildlabDropdownOption[],
  modelOptions: BuildlabDropdownOption[],
) {
  workspace.clear();
  Blockly.serialization.workspaces.load(workspaceState, workspace);
  updateWorkspaceDropdowns(
    workspace,
    elementOptions,
    screenOptions,
    assetOptions,
    spriteOptions,
    modelOptions,
  );
  restoreDropdownValues(workspace, workspaceState);
}

export default function BlocklyWorkspace({
  assetOptions,
  elementOptions,
  onWorkspaceChange,
  readOnly = false,
  screenOptions,
  spriteOptions,
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
    modelOptions,
  });
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const onWorkspaceChangeRef = useRef(onWorkspaceChange);
  dropdownOptionsRef.current = {
    assetOptions,
    elementOptions,
    screenOptions,
    spriteOptions,
    modelOptions,
  };
  onWorkspaceChangeRef.current = onWorkspaceChange;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    registerBlocks();
    const workspace = Blockly.inject(containerRef.current, {
      readOnly,
      toolbox: TOOLBOX,
      theme: Blockly.Themes.Classic,
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
    loadWorkspaceState(
      workspace,
      initialWorkspaceStateRef.current,
      dropdownOptionsRef.current.elementOptions,
      dropdownOptionsRef.current.screenOptions,
      dropdownOptionsRef.current.assetOptions,
      dropdownOptionsRef.current.spriteOptions,
      dropdownOptionsRef.current.modelOptions,
    );

    const onChange = (event: Blockly.Events.Abstract) => {
      if (
        event.type !== Blockly.Events.BLOCK_CHANGE &&
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_DELETE
      ) {
        return;
      }

      Blockly.Events.disable();
      try {
        updateWorkspaceDropdowns(
          workspace,
          dropdownOptionsRef.current.elementOptions,
          dropdownOptionsRef.current.screenOptions,
          dropdownOptionsRef.current.assetOptions,
          dropdownOptionsRef.current.spriteOptions,
          dropdownOptionsRef.current.modelOptions,
        );
      } finally {
        Blockly.Events.enable();
      }
      onWorkspaceChangeRef.current(
        Blockly.serialization.workspaces.save(
          workspace,
        ) as BuildlabWorkspaceState,
      );
    };
    workspace.addChangeListener(onChange);

    const observer = new ResizeObserver(() => Blockly.svgResize(workspace));
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      workspace.removeChangeListener(onChange);
      workspace.dispose();
      workspaceRef.current = null;
    };
  }, [readOnly]);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }

    const currentState = Blockly.serialization.workspaces.save(
      workspace,
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
        dropdownOptionsRef.current.modelOptions,
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
        modelOptions,
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
  ]);

  return <div className={styles.blocklyWorkspace} ref={containerRef} />;
}
