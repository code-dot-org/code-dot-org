import * as Blockly from 'blockly';
import {useEffect, useRef} from 'react';

import styles from './build-lab.module.scss';

interface Props {
  onWorkspaceChange: (workspaceState: BuildlabWorkspaceState) => void;
  workspaceState: BuildlabWorkspaceState;
}

export interface BuildlabDesignEvent {
  action: 'changeText' | 'goToScreen';
  eventType: 'click';
  id: string;
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
    args0: [{type: 'field_input', name: 'ELEMENT', text: 'button1'}],
    nextStatement: null,
    colour: 20,
    tooltip: 'Runs when a stage element is clicked.',
  },
  {
    type: 'buildlab_set_text',
    message0: 'set %1 text to %2',
    args0: [
      {type: 'field_input', name: 'ELEMENT', text: 'label1'},
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
    args0: [{type: 'field_input', name: 'SCREEN', text: 'screen1'}],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'Shows another screen on the stage.',
  },
  {
    type: 'buildlab_create_sprite',
    message0: 'create sprite at x %1 y %2',
    args0: [
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
      ],
    },
    {
      kind: 'category',
      name: 'Events',
      colour: '#e08528',
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
            fields: {X: 200, Y: 200},
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

export function appendDesignEventToWorkspace(
  workspaceState: BuildlabWorkspaceState,
  event: BuildlabDesignEvent,
): BuildlabWorkspaceState {
  const eventCount = getDesignEventsFromWorkspace(workspaceState).length;
  const actionBlock: BuildlabBlockState =
    event.action === 'goToScreen'
      ? {
          fields: {SCREEN: event.screenId ?? 'screen1'},
          id: `${event.id}-action`,
          type: 'buildlab_show_screen',
        }
      : {
          fields: {
            ELEMENT: event.targetElementId ?? 'label1',
            TEXT: 'Hello!',
          },
          id: `${event.id}-action`,
          type: 'buildlab_set_text',
        };

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

export function renameElementReferencesInWorkspace(
  workspaceState: BuildlabWorkspaceState,
  previousElementId: string,
  nextElementId: string,
): BuildlabWorkspaceState {
  const renameReferences = (block: BuildlabBlockState): BuildlabBlockState => {
    const fields = {...block.fields};
    if (
      (block.type === 'buildlab_on_click' ||
        block.type === 'buildlab_set_text') &&
      fields.ELEMENT === previousElementId
    ) {
      fields.ELEMENT = nextElementId;
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
        if (block.type !== 'buildlab_on_click') {
          return true;
        }

        return (
          block.fields?.ELEMENT !== elementId &&
          block.next?.block.fields?.ELEMENT !== elementId
        );
      }),
    },
  };
}

function registerBlocks() {
  const missingBlocks = BLOCKS.filter(block => !Blockly.Blocks[block.type]);
  if (missingBlocks.length > 0) {
    Blockly.common.defineBlocksWithJsonArray(missingBlocks);
  }
}

export default function BlocklyWorkspace({
  onWorkspaceChange,
  workspaceState,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialWorkspaceStateRef = useRef(workspaceState);
  const onWorkspaceChangeRef = useRef(onWorkspaceChange);
  onWorkspaceChangeRef.current = onWorkspaceChange;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    registerBlocks();
    const workspace = Blockly.inject(containerRef.current, {
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
    Blockly.serialization.workspaces.load(
      initialWorkspaceStateRef.current,
      workspace,
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
    };
  }, []);

  return <div className={styles.blocklyWorkspace} ref={containerRef} />;
}
