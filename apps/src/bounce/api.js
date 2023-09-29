import * as tiles from './tiles';
import {singleton as studioApp} from '../StudioApp';

export const PaddleSpeed = {
  VERY_SLOW: 0.04,
  SLOW: 0.06,
  NORMAL: 0.1,
  FAST: 0.15,
  VERY_FAST: 0.23,
};

export const BallSpeed = {
  VERY_SLOW: 0.04,
  SLOW: 0.06,
  NORMAL: 0.1,
  FAST: 0.15,
  VERY_FAST: 0.23,
};

export const random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

export const setBallSpeed = function (id, value) {
  studioApp().highlight(id);
  Bounce.currentBallSpeed = value;
  for (var i = 0; i < Bounce.ballCount; i++) {
    Bounce.ballSpeed[i] = value;
  }
};

export const setTeam = function (id, value) {
  studioApp().highlight(id);
  Bounce.setTeam(value);
};

export const setBall = function (id, value) {
  studioApp().highlight(id);
  Bounce.setBall(value);
};

export const setPaddle = function (id, value) {
  studioApp().highlight(id);
  Bounce.setPaddle(value);
};

export const setBackground = function (id, value) {
  studioApp().highlight(id);
  Bounce.setBackground(value);
};

export const setPaddleSpeed = function (id, value) {
  studioApp().highlight(id);
  Bounce.paddleSpeed = value;
};

export const playSound = function (id, soundName) {
  studioApp().highlight(id);
  studioApp().playAudio(soundName);
};

export const moveLeft = function (id) {
  studioApp().highlight(id);
  Bounce.paddleX -= Bounce.paddleSpeed;
  if (Bounce.paddleX < 0) {
    Bounce.paddleX = 0;
  }
};

export const moveRight = function (id) {
  studioApp().highlight(id);
  Bounce.paddleX += Bounce.paddleSpeed;
  if (Bounce.paddleX > Bounce.COLS - 1) {
    Bounce.paddleX = Bounce.COLS - 1;
  }
};

export const moveUp = function (id) {
  studioApp().highlight(id);
  Bounce.paddleY -= Bounce.paddleSpeed;
  if (Bounce.paddleY < 0) {
    Bounce.paddleY = 0;
  }
};

export const moveDown = function (id) {
  studioApp().highlight(id);
  Bounce.paddleY += Bounce.paddleSpeed;
  if (Bounce.paddleY > Bounce.ROWS - 1) {
    Bounce.paddleY = Bounce.ROWS - 1;
  }
};

export const incrementOpponentScore = function (id) {
  studioApp().highlight(id);
  Bounce.opponentScore++;
  Bounce.displayScore();
};

export const incrementPlayerScore = function (id) {
  studioApp().highlight(id);
  Bounce.playerScore++;
  Bounce.displayScore();
};

export const launchBall = function (id) {
  studioApp().highlight(id);

  // look for an "out of play" ball to re-launch:
  for (var i = 0; i < Bounce.ballCount; i++) {
    if (
      Bounce.isBallOutOfBounds(i) &&
      0 === (Bounce.ballFlags[i] & Bounce.BallFlags.LAUNCHING)
    ) {
      // found an out-of-bounds ball that is not already launching...
      Bounce.launchBall(i);
      return;
    }
  }

  // we didn't find an "out of play" ball, so create and launch a new one:
  i = Bounce.ballCount;
  Bounce.ballCount++;
  Bounce.createBallElements(i);
  Bounce.playSoundAndResetBall(i);
};

export const bounceBall = function (id) {
  studioApp().highlight(id);

  var i;
  for (i = 0; i < Bounce.ballCount; i++) {
    if (
      0 ===
      (Bounce.ballFlags[i] &
        (Bounce.BallFlags.MISSED_PADDLE | Bounce.BallFlags.IN_GOAL))
    ) {
      if (Bounce.ballX[i] < 0) {
        Bounce.ballX[i] = 0;
        Bounce.ballDir[i] = 2 * Math.PI - Bounce.ballDir[i];
      } else if (Bounce.ballX[i] > Bounce.COLS - 1) {
        Bounce.ballX[i] = Bounce.COLS - 1;
        Bounce.ballDir[i] = 2 * Math.PI - Bounce.ballDir[i];
      }

      if (Bounce.ballY[i] < tiles.Y_TOP_BOUNDARY) {
        Bounce.ballY[i] = tiles.Y_TOP_BOUNDARY;
        Bounce.ballDir[i] = Math.PI - Bounce.ballDir[i];
      }

      var xPaddleBall = Bounce.ballX[i] - Bounce.paddleX;
      var yPaddleBall = Bounce.ballY[i] - Bounce.paddleY;
      var distPaddleBall = Bounce.calcDistance(xPaddleBall, yPaddleBall);

      if (distPaddleBall < tiles.PADDLE_BALL_COLLIDE_DISTANCE) {
        // paddle ball collision
        if (Math.cos(Bounce.ballDir[i]) < 0) {
          // rather than just bounce the ball off a flat paddle, we offset the
          // angle after collision based on whether you hit the left or right
          // side of the paddle.  And then we cap the resulting angle to be in a
          // certain range of radians so the resulting angle isn't too flat
          var paddleAngleBias =
            ((3 * Math.PI) / 8) *
            (xPaddleBall / tiles.PADDLE_BALL_COLLIDE_DISTANCE);
          // Add 5 PI instead of PI to ensure that the resulting angle is
          // positive to simplify the ternary operation in the next statement
          Bounce.ballDir[i] =
            (Math.PI * 5 + paddleAngleBias - Bounce.ballDir[i]) % (Math.PI * 2);
          Bounce.ballDir[i] =
            Bounce.ballDir[i] < Math.PI
              ? Math.min(Math.PI / 2 - 0.2, Bounce.ballDir[i])
              : Math.max((3 * Math.PI) / 2 + 0.2, Bounce.ballDir[i]);
        }
      }
    }
  }
};
