import React, {useState} from 'react';
import MovingBot from './MovingBot';
import DanceTimeline from './DanceTimeline';

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface SequenceBotProps {
  currentTick: number;
  danceState: any;
  showTimeline: boolean;
  variations: any;
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
  /*{
    id: 'slowbop',
    part: 'head',
    steps: [
      {x: 110, y: 0, time: 0},
      {x: 130, y: 20, time: 1},
      {x: 110, y: 0, time: 2},
      {x: 130, y: 20, time: 3},
    ],
  },*/
  /*
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
  },*/
  {
    id: 'fasthand0',
    part: 'hand0',
    steps: [
      {x: 25, y: 130, time: 0},
      {x: 45, y: 130, time: 0.25},
      {x: 25, y: 130, time: 0.5},
      {x: 45, y: 130, time: 0.75},
      {x: 25, y: 130, time: 1},
      {x: 45, y: 130, time: 1.25},
      {x: 25, y: 130, time: 1.5},
      {x: 45, y: 130, time: 1.75},
      {x: 25, y: 130, time: 2},
      {x: 45, y: 130, time: 2.25},
      {x: 25, y: 130, time: 2.5},
      {x: 45, y: 130, time: 2.75},
      {x: 25, y: 130, time: 3},
      {x: 45, y: 130, time: 3.25},
      {x: 25, y: 130, time: 3.5},
      {x: 45, y: 130, time: 3.75},
      {x: 25, y: 130, time: 4},
    ],
  },
  {
    id: 'fasthand1',
    part: 'hand1',
    steps: [
      {x: 225, y: 130, time: 0},
      {x: 245, y: 130, time: 0.25},
      {x: 225, y: 130, time: 0.5},
      {x: 245, y: 130, time: 0.75},
      {x: 225, y: 130, time: 1},
      {x: 245, y: 130, time: 1.25},
      {x: 225, y: 130, time: 1.5},
      {x: 245, y: 130, time: 1.75},
      {x: 225, y: 130, time: 2},
      {x: 245, y: 130, time: 2.25},
      {x: 225, y: 130, time: 2.5},
      {x: 245, y: 130, time: 2.75},
      {x: 225, y: 130, time: 3},
      {x: 245, y: 130, time: 3.25},
      {x: 225, y: 130, time: 3.5},
      {x: 245, y: 130, time: 3.75},
      {x: 225, y: 130, time: 4},
    ],
  },
  {
    id: 'fastbop',
    part: 'head',
    steps: [
      {x: 110, y: 0, time: 0},
      {x: 100, y: 30, time: 0.5},
      {x: 110, y: 0, time: 1},
      {x: 110, y: 30, time: 1.5},
      {x: 110, y: 0, time: 2},
      {x: 110, y: 30, time: 2.5},
      {x: 110, y: 0, time: 3},
      {x: 100, y: 30, time: 3.5},
      {x: 110, y: 0, time: 4},
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
    id: 'wobblebodyupdown',
    part: 'body',
    steps: [
      {x: 140, y: 150, time: 0},
      {x: 140, y: 130, time: 0.5},
      {x: 140, y: 150, time: 1},
      {x: 140, y: 170, time: 1.5},
      {x: 140, y: 150, time: 2},
      {x: 140, y: 130, time: 2.5},
      {x: 140, y: 150, time: 3},
      {x: 140, y: 170, time: 3.5},
      {x: 140, y: 150, time: 4},
    ],
  },
  {
    id: 'wobblehand0updown',
    part: 'hand0',
    steps: [
      {x: 25, y: 130, time: 0},
      {x: 25, y: 110, time: 0.5},
      {x: 25, y: 130, time: 1},
      {x: 25, y: 150, time: 1.5},
      {x: 25, y: 130, time: 2},
      {x: 25, y: 110, time: 2.5},
      {x: 25, y: 130, time: 3},
      {x: 25, y: 150, time: 3.5},
      {x: 25, y: 130, time: 4},
    ],
  },
  {
    id: 'wobblehead',
    part: 'head',
    steps: [
      {x: 140, y: 0, time: 0},
      {x: 130, y: 0, time: 0.5},
      {x: 140, y: 0, time: 1},
      {x: 150, y: 0, time: 1.5},
      {x: 140, y: 0, time: 2},
      {x: 130, y: 0, time: 2.5},
      {x: 140, y: 0, time: 3},
      {x: 150, y: 0, time: 3.5},
      {x: 140, y: 0, time: 4},
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

const timelineEntries_static = [
  {
    blockId: 'wobblehead',
    when: 0,
  },
  {
    blockId: 'wobblehead',
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

const generateMoves: () => [any[], {[index: string]: any}] = () => {
  // randomly generate our entries
  let timelineEntries: any[] = [];
  for (let i = 0; i < 25; i++) {
    timelineEntries.push({
      blockId: moveBlocks[getRandomInt(0, moveBlocks.length - 1)].id,
      when: 4 * getRandomInt(0, 4),
    });
  }

  const timeline: {[index: string]: any} = {};

  // convert that timeline + moves into a stream.
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

  return [timelineEntries, timeline];
};

const SequenceBot: React.FunctionComponent<SequenceBotProps> = ({
  currentTick,
  danceState,
  showTimeline,
  variations,
}) => {
  // generate a random set of timeline entries
  const [timelineEntries, setTimelineEntries] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<{[index: string]: any}>([]);

  React.useEffect(() => {
    const [actualTimelineEntries, actualTimeline] = generateMoves();
    setTimelineEntries(actualTimelineEntries);
    setTimeline(actualTimeline);
  }, []); // has no dependency - this will be called on-component-mount

  return (
    <div id="sequence-bot">
      <MovingBot
        currentTick={currentTick}
        moves={timeline}
        variations={variations}
      />
      {showTimeline && (
        <DanceTimeline
          currentTick={currentTick}
          moveBlocks={moveBlocks}
          timelineEntries={timelineEntries}
        />
      )}
    </div>
  );
};

export default SequenceBot;
