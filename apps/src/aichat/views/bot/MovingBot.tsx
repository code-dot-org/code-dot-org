import React, {useState} from 'react';
import Bot, {BotState} from './Bot';

function pairwise(arr: [], func: Function) {
  for (var i = 0; i < arr.length - 1; i++) {
    func(arr[i], arr[i + 1]);
  }
}

interface MovingBotProps {
  currentTick: number;
  moves: any;
}

const MovingBot: React.FunctionComponent<MovingBotProps> = ({
  currentTick,
  moves,
}) => {
  function easeInExpo(t: number, b: number, c: number, d: number) {
    return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
  }

  let headX, headY;

  pairwise(moves[0].steps, (move: any, nextMove: any) => {
   /* if (move.type !== 'head') {
      return;
    }*/

    if (move.time <= currentTick && nextMove.time > currentTick) {
      /*const firstStep = ticks < 250 ? move.steps[0] : move.steps[1];
      const secondStep = ticks < 250 ? move.steps[1] : move.steps[0];*/

      const startX = move.x;
      const startY = move.y;
      const endX = nextMove.x;
      const endY = nextMove.y;

      const progress = (currentTick - move.time) / (nextMove.time - move.time);

      const easedProgress = easeInExpo(progress, 0, 1, 1);

      headX = startX + (endX - startX) * easedProgress;
      headY = startY + (endY - startY) * easedProgress;
    }
  });

  const botState = {
    head: [headX, headY],
    hand0: [25, 130],
    hand1: [250, 130],
    foot0: [60, 290],
    foot1: [210, 290],
  };

  // Convert moves into current coordinates of each piece, based on current time.

  return (
    <div id="moving-bot">
      <Bot botState={botState} />
    </div>
  );
};

export default MovingBot;
