import React from 'react';
import MovingBot from './MovingBot';

interface BehaviorBotProps {
  currentTick: number;
  danceState: any;
}

const BehaviorBot: React.FunctionComponent<BehaviorBotProps> = ({
  currentTick,
  danceState,
}) => {
  // Convert danceState into the relevant moves.

  const moves = [
    {
      type: 'head',
      steps: [
        {x: 100, y: 0, time: 0},
        {x: 130, y: 20, time: 1},
        {x: 100, y: 0, time: 2},
        {x: 130, y: 20, time: 3},
        {x: 100, y: 0, time: 4},
        {x: 130, y: 20, time: 5},
        {x: 100, y: 0, time: 6},
        {x: 130, y: 20, time: 7},

        {x: 100, y: 0, time: 8},
        {x: 80, y: 30, time: 10},
        {x: 100, y: 0, time: 12},
        {x: 80, y: 30, time: 14},
        {x: 100, y: 0, time: 16},
        {x: 80, y: 30, time: 18},
        {x: 100, y: 0, time: 20},
        {x: 80, y: 30, time: 22},
      ],
    },
  ];

  return (
    <div id="behavior-bot">
      <MovingBot currentTick={currentTick} moves={moves} />
    </div>
  );
};

export default BehaviorBot;
