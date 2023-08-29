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
  variations: any;
}

function easeInExpo(t: number, b: number, c: number, d: number) {
  return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
}

const MovingBot: React.FunctionComponent<MovingBotProps> = ({
  currentTick,
  moves,
  variations,
}) => {
  let botState = {
    head: [110, 10],
    headVariant: variations.head,
    headSubVariant: 0,
    body: [140, 150],
    bodyVariant: variations.body,
    hand0: [25, 130],
    hand1: [250, 130],
    foot0: [60, 290],
    foot1: [210, 290],
  };

  // Convert moves into current coordinates of each piece, based on current time.

  for (const partKey of Object.keys(moves)) {
    pairwise(moves[partKey], (move: any, nextMove: any) => {
      if (move.time <= currentTick && nextMove.time > currentTick) {
        const startX = move.x;
        const startY = move.y;
        const endX = nextMove.x;
        const endY = nextMove.y;

        const progress =
          (currentTick - move.time) / (nextMove.time - move.time);

        const easedProgress = easeInExpo(progress, 0, 1, 1);

        const x = startX + (endX - startX) * easedProgress;
        const y = startY + (endY - startY) * easedProgress;

        if (partKey === 'head') {
          botState.head = [x, y];
        } else if (partKey === 'hand0') {
          botState.hand0 = [x, y];
        } else if (partKey === 'hand1') {
          botState.hand1 = [x, y];
        } else if (partKey === 'body') {
          botState.body = [x, y];
        } else if (partKey === 'foot1') {
          botState.foot1 = [x, y];
        }
      }
    });
    if (currentTick > 12) {
      botState.headSubVariant = 2;
    } else if (currentTick > 6) {
      botState.headSubVariant = 1;
    } else {
      botState.headSubVariant = 0;
    }

    //botState.bodyVariant = Math.floor(currentTick % 5);
    //botState.headVariant = Math.floor(currentTick % 6);
  }

  return (
    <div id="moving-bot">
      <Bot botState={botState} />
    </div>
  );
};

export default MovingBot;
