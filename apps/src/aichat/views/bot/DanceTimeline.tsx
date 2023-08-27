import React from 'react';
import {MoveBlockStep, MoveBlock} from './BehaviorBot';

interface DanceTimelineProps {
  currentTick: number;
  moveBlocks: MoveBlock[];
  timelineEntries: any[];
}

const measureWidth = 50;

const DanceTimeline: React.FunctionComponent<DanceTimelineProps> = ({
  currentTick,
  moveBlocks,
  timelineEntries,
}) => {
  const getMoveBlockRow = (id: string): number => {
    return moveBlocks.findIndex(block => block.id === id);
  };

  const getMoveBlockData = (id: string): MoveBlock | undefined => {
    return moveBlocks.find(block => block.id === id);
  };

  const padding = 4;

  return (
    <div id="dance-timeline">
      <div
        style={{
          width: 1000,
          height: 180,
          backgroundColor: '#505050',
          position: 'relative',
          padding: 4,
        }}
      >
        {timelineEntries.map((timelineEntry, index) => {
          return (
            <div
              key={index}
              style={{
                left: padding + timelineEntry.when * measureWidth,
                top: padding + 34 * getMoveBlockRow(timelineEntry.blockId),
                color: 'white',
                backgroundColor: '#848484',
                position: 'absolute',
                width: 4 * measureWidth,
                borderRadius: 4,
                padding: padding,
                border: 'solid 1px #505050',
                boxSizing: 'border-box',
              }}
            >
              {timelineEntry.blockId} (
              {getMoveBlockData(timelineEntry.blockId)?.part})
            </div>
          );
        })}
        <div
          style={{
            left: padding + currentTick * measureWidth,
            top: padding + 0,
            height: 100,
            width: 4,
            backgroundColor: 'yellow',
            position: 'absolute',
          }}
        >
          &nbsp;
        </div>
      </div>
    </div>
  );
};

export default DanceTimeline;
