import React from 'react';
import MovingBot from './MovingBot';

interface BehaviorBotProps {
  danceState: any;
}

const BehaviorBot: React.FunctionComponent<BehaviorBotProps> = ({danceState}) => {
  // Convert danceState into the relevant moves.

  const moves = [
    {
      type: "head",
      steps: [
        {x: 100, y: 0, time: 0},
        {x: 130, y: 20, time: 1}
      ]
    }
  ];

  return (
    <div id="behavior-bot">
      <MovingBot moves={moves}/>
    </div>
  );
};

export default BehaviorBot;
