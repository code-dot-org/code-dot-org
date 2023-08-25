import React, {useState} from 'react';
import Bot, {BotState} from './Bot';

interface MovingBotProps {
  moves: any;
}

const MovingBot: React.FunctionComponent<MovingBotProps> = ({moves}) => {
  const [botState, setBotState] = useState({
    head: [100, 0],
    hand0: [25, 130],
    hand1: [250, 130],
    foot0: [60, 290],
    foot1: [210, 290],
  });

  React.useEffect(() => {
    console.log(`initializing interval`);
    const interval = setInterval(() => {
      updateTime();
    }, 1000 / 60);

    return () => {
      console.log(`clearing interval`);
      clearInterval(interval);
    };
  }, []); // has no dependency - this will be called on-component-mount

  function easeInExpo(t: number, b: number, c: number, d: number) {
    return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
  }

  const updateTime = () => {
    const ticks = new Date().getTime() % 500;

    let headX, headY;

    for (const move of moves) {
      if (move.type !== 'head') {
        continue;
      }

      const firstStep = ticks < 250 ? move.steps[0] : move.steps[1];
      const secondStep = ticks < 250 ? move.steps[1] : move.steps[0];

      const startX = firstStep.x;
      const startY = firstStep.y;
      const endX = secondStep.x;
      const endY = secondStep.y;

      const progress = ticks < 250 ? ticks / 250 : (ticks - 250) / 250;

      const easedProgress = easeInExpo(progress, 0, 1, 1);

      headX = startX + (endX - startX) * easedProgress;
      headY = startY + (endY - startY) * easedProgress;
    }

    setBotState({
      head: [headX, headY],
      hand0: [25, 130],
      hand1: [250, 130],
      foot0: [60, 290],
      foot1: [210, 290],
    });
  };

  // Convert moves into current coordinates of each piece, based on current time.

  return (
    <div id="moving-bot">
      <Bot botState={botState} />
    </div>
  );
};

export default MovingBot;
