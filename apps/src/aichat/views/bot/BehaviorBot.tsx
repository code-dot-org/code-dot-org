import React from 'react';
import MovingBot from './MovingBot';
import DanceTimeline from './DanceTimeline';

interface BehaviorBotProps {
  currentTick: number;
  danceState: any;
}

export interface MoveBlockStep {
  x: number;
  y: number;
  time: number;
}

export interface MoveBlock {
  id: string;
  part: string;
  steps: MoveBlockStep[];
}

const moveBlocks: MoveBlock[] = [
  {
    id: 'slowbop',
    part: 'head',
    steps: [
      {x: 110, y: 0, time: 0},
      {x: 130, y: 20, time: 1},
      {x: 110, y: 0, time: 2},
      {x: 130, y: 20, time: 3},
    ],
  },
  {
    id: 'slowhands',
    part: 'hand0',
    steps: [
      {x: 25, y: 130, time: 0},
      {x: 45, y: 120, time: 1},
      {x: 25, y: 130, time: 2},
      {x: 45, y: 90, time: 3},
      {x: 25, y: 130, time: 4},
    ],
  },
  {
    id: 'fastbop',
    part: 'head',
    steps: [
      {x: 110, y: 0, time: 0},
      {x: 90, y: 30, time: 0.5},
      {x: 110, y: 0, time: 1},
      {x: 90, y: 30, time: 1.5},
      {x: 110, y: 0, time: 2},
    ],
  },
  {
    id: 'wobblebody',
    part: 'body',
    steps: [
      {x: 140, y: 150, time: 0},
      {x: 150, y: 150, time: 0.5},
      {x: 140, y: 150, time: 1},
      {x: 130, y: 150, time: 1.5},
      {x: 140, y: 150, time: 2},
      {x: 150, y: 150, time: 2.5},
      {x: 140, y: 150, time: 3},
      {x: 130, y: 150, time: 3.5},
      {x: 140, y: 150, time: 4},
    ],
  },
  {
    id: 'footslide',
    part: 'foot1',
    steps: [
      {x: 210, y: 290, time: 0},
      {x: 230, y: 290, time: 1},
      {x: 210, y: 290, time: 2},
    ],
  },
];

const timelineEntries = [
  {
    blockId: 'slowbop',
    when: 0,
  },
  {
    blockId: 'fastbop',
    when: 4,
  },
  {
    blockId: 'fastbop',
    when: 8,
  },
  {
    blockId: 'slowbop',
    when: 12,
  },
  {
    blockId: 'slowhands',
    when: 12,
  },
  {
    blockId: 'fastbop',
    when: 16,
  },
  {
    blockId: 'wobblebody',
    when: 0,
  },
  {
    blockId: 'wobblebody',
    when: 4,
  },
  {
    blockId: 'wobblebody',
    when: 8,
  },
  {
    blockId: 'wobblebody',
    when: 12,
  },
  {
    blockId: 'footslide',
    when: 12,
  },
];

const generateMoves = () => {
  const timeline: {[index: string]: any} = {};

  for (const timelineEntry of timelineEntries) {
    const id = timelineEntry.blockId;
    const moveBlock = moveBlocks.find(moveBlock => moveBlock.id === id);
    if (!moveBlock) {
      continue;
    }
    for (const step of moveBlock.steps) {
      if (!timeline[moveBlock.part]) {
        timeline[moveBlock.part] = [];
      }
      timeline[moveBlock.part].push({
        x: step.x,
        y: step.y,
        time: step.time + timelineEntry.when,
      });
    }
  }

  return timeline;
};

const BehaviorBot: React.FunctionComponent<BehaviorBotProps> = ({
  currentTick,
  danceState,
}) => {
  // Convert danceState into the relevant moves.
  const moves = generateMoves();

  return (
    <div id="behavior-bot">
      <MovingBot currentTick={currentTick} moves={moves} />
      <DanceTimeline
        currentTick={currentTick}
        moveBlocks={moveBlocks}
        timelineEntries={timelineEntries}
      />
    </div>
  );
};

export default BehaviorBot;
