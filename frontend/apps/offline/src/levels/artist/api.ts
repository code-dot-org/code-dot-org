/*
 * Artist level API that is used to run the student projects.
 */

export type Command =
  | 'FD'
  | 'MV'
  | 'JT'
  | 'MD'
  | 'JD'
  | 'JF'
  | 'RT'
  | 'PT'
  | 'GA'
  | 'PU'
  | 'PD'
  | 'PW'
  | 'PC'
  | 'PS'
  | 'HT'
  | 'ST'
  | 'shape'
  | 'sticker'
  | 'setArtist';

export interface Action {
  /** Action command that identifies what action to take */
  command: Command;
  arguments: {
    /** Block identifier */
    id: string;
    [key: string]: string | number;
  };
}

export interface ForwardAction extends Action {
  command: 'FD';
  arguments: {
    id: string;
    /** Distance to travel */
    distance: number;
  };
}

export interface MoveAction extends Action {
  command: 'MV';
  arguments: {
    id: string;
    /** Distance to travel */
    distance: number;
    /** Angle to move */
    heading: number;
  };
}

export interface MoveDiagonallyAction extends Action {
  command: 'MD';
  arguments: {
    id: string;
    /** Distance to travel */
    distance: number;
    /** Angle to move */
    heading: number;
  };
}

export interface JumpForwardAction extends Action {
  command: 'JF';
  arguments: {
    id: string;
    /** Distance to travel */
    distance: number;
  };
}

export interface JumpDirectionAction extends Action {
  command: 'JD';
  arguments: {
    id: string;
    /** Distance to travel */
    distance: number;
    /** Angle to move */
    heading: number;
  };
}

export interface JumpToAction extends Action {
  command: 'JT';
  arguments: {
    id: string;
    /** X position to go to */
    x: number;
    /** Y position to go to */
    y: number;
  };
}

export interface RotateAction extends Action {
  command: 'RT';
  arguments: {
    id: string;
    /** Angle to rotate in degrees */
    angle: number;
  };
}

export interface PointToAction extends Action {
  command: 'PT';
  arguments: {
    id: string;
    /** Angle to face */
    angle: number;
  };
}

export interface GlobalAlphaAction extends Action {
  command: 'GA';
  arguments: {
    id: string;
    /** Alpha value (percentage from 0 to 100 inclusive) */
    alpha: number;
  };
}

export interface PenUpAction extends Action {
  command: 'PU';
  arguments: {
    id: string;
  };
}

export interface PenDownAction extends Action {
  command: 'PD';
  arguments: {
    id: string;
  };
}

export interface PenWidthAction extends Action {
  command: 'PW';
  arguments: {
    id: string;
    /** Width of the pen stroke in pixels */
    width: number;
  };
}

export interface PenColourAction extends Action {
  command: 'PC';
  arguments: {
    id: string;
    /** Color of the pen stroke */
    colour: string;
  };
}

export interface PenStyleAction extends Action {
  command: 'PS';
  arguments: {
    id: string;
    /** Pattern for the pen stroke */
    pattern: string;
  };
}

export interface HideAction extends Action {
  command: 'HT';
  arguments: {
    id: string;
  };
}

export interface ShowAction extends Action {
  command: 'ST';
  arguments: {
    id: string;
  };
}

export interface DrawShapeAction extends Action {
  command: 'shape';
  arguments: {
    id: string;
    shape: string;
    size: number;
  };
}

export interface DrawStickerAction extends Action {
  command: 'sticker';
  arguments: {
    id: string;
    sticker: string;
    size: number;
  };
}

export interface SetArtistAction extends Action {
  command: 'setArtist';
  arguments: {
    id: string;
    artist: string;
  };
}

export interface APIGlobals {
  log: Action[];
  width: number;
  height: number;
  moveForward: (this: APIGlobals, distance: number, id: string) => void;
}

export function moveForward(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'FD',
    arguments: {
      id,
      distance,
    },
  } as ForwardAction);
}

export function moveBackward(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'FD',
    arguments: {
      id,
      distance: -distance,
    },
  } as ForwardAction);
}

export function moveUp(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'MV',
    arguments: {
      id,
      distance,
      heading: 0,
    },
  } as MoveAction);
}

export function moveDown(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'MV',
    arguments: {
      id,
      distance,
      heading: 180,
    },
  } as MoveAction);
}

export function moveLeft(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'MV',
    arguments: {
      id,
      distance,
      heading: 270,
    },
  } as MoveAction);
}

export function moveRight(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'MV',
    arguments: {
      id,
      distance,
      heading: 90,
    },
  } as MoveAction);
}

export function jumpTo(this: APIGlobals, position: number, id: string) {
  // Determine position from dimensions
  this.log.push({
    command: 'JT',
    arguments: {
      id,
      x: position,
      y: position,
    },
  } as JumpToAction);
}

export function jumpToXY(this: APIGlobals, x: number, y: number, id: string) {
  this.log.push({
    command: 'JT',
    arguments: {
      id,
      x,
      y,
    },
  } as JumpToAction);
}

export function moveUpRight(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'MD',
    arguments: {
      id,
      distance,
      heading: 45,
    },
  } as MoveDiagonallyAction);
}

export function moveDownRight(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'MD',
    arguments: {
      id,
      distance,
      heading: 135,
    },
  } as MoveDiagonallyAction);
}

export function moveDownLeft(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'MD',
    arguments: {
      id,
      distance,
      heading: 225,
    },
  } as MoveDiagonallyAction);
}

export function moveUpLeft(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'MD',
    arguments: {
      id,
      distance,
      heading: 315,
    },
  } as MoveDiagonallyAction);
}

export function jumpUp(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'JD',
    arguments: {
      id,
      distance,
      heading: 0,
    },
  } as JumpDirectionAction);
}

export function jumpDown(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'JD',
    arguments: {
      id,
      distance,
      heading: 180,
    },
  } as JumpDirectionAction);
}

export function jumpLeft(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'JD',
    arguments: {
      id,
      distance,
      heading: 270,
    },
  } as JumpDirectionAction);
}

export function jumpRight(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'JD',
    arguments: {
      id,
      distance,
      heading: 90,
    },
  } as JumpDirectionAction);
}

export function jumpUpRight(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'JD',
    arguments: {
      id,
      distance,
      heading: 45,
    },
  } as JumpDirectionAction);
}

export function jumpDownRight(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'JD',
    arguments: {
      id,
      distance,
      heading: 135,
    },
  } as JumpDirectionAction);
}

export function jumpDownLeft(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'JD',
    arguments: {
      id,
      distance,
      heading: 225,
    },
  } as JumpDirectionAction);
}

export function jumpUpLeft(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'JD',
    arguments: {
      id,
      distance,
      heading: 315,
    },
  } as JumpDirectionAction);
}

export function jumpForward(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'JF',
    arguments: {
      id,
      distance: distance,
    },
  } as JumpForwardAction);
}

export function jumpBackward(this: APIGlobals, distance: number, id: string) {
  this.log.push({
    command: 'JF',
    arguments: {
      id,
      distance: -distance,
    },
  } as JumpForwardAction);
}

export function turnRight(this: APIGlobals, angle: number, id: string) {
  this.log.push({
    command: 'RT',
    arguments: {
      id,
      angle,
    },
  } as RotateAction);
}

export function turnLeft(this: APIGlobals, angle: number, id: string) {
  this.log.push({
    command: 'RT',
    arguments: {
      id,
      angle: -angle,
    },
  } as RotateAction);
}

export function pointTo(this: APIGlobals, angle: number, id: string) {
  this.log.push({
    command: 'PT',
    arguments: {
      id,
      angle,
    },
  } as PointToAction);
}

export function globalAlpha(this: APIGlobals, alpha: number, id: string) {
  this.log.push({
    command: 'GA',
    arguments: {
      id,
      alpha,
    },
  } as GlobalAlphaAction);
}

export function penUp(this: APIGlobals, id: string) {
  this.log.push({
    command: 'PU',
    arguments: {
      id,
    },
  } as PenUpAction);
}

export function penDown(this: APIGlobals, id: string) {
  this.log.push({
    command: 'PD',
    arguments: {
      id,
    },
  } as PenDownAction);
}

export function penWidth(this: APIGlobals, width: number, id: string) {
  this.log.push({
    command: 'PW',
    arguments: {
      id,
      width: Math.max(width, 0),
    },
  } as PenWidthAction);
}

export function penColour(this: APIGlobals, colour: string, id: string) {
  this.log.push({
    command: 'PC',
    arguments: {
      id,
      colour,
    },
  } as PenColourAction);
}

export function penPattern(this: APIGlobals, pattern: string, id: string) {
  this.log.push({
    command: 'PS',
    arguments: {
      id,
      pattern,
    },
  } as PenStyleAction);
}

export function hideTurtle(this: APIGlobals, id: string) {
  this.log.push({
    command: 'HT',
    arguments: {
      id,
    },
  } as HideAction);
}

export function showTurtle(this: APIGlobals, id: string) {
  this.log.push({
    command: 'ST',
    arguments: {
      id,
    },
  } as ShowAction);
}

export function drawShape(
  this: APIGlobals,
  shape: string,
  size: number,
  id: string,
) {
  this.log.push({
    command: 'shape',
    arguments: {
      id,
      shape,
      size,
    },
  } as DrawShapeAction);
}

export function drawSticker(
  this: APIGlobals,
  sticker: string,
  size: number,
  id: string,
) {
  this.log.push({
    command: 'sticker',
    arguments: {
      id,
      sticker,
      size,
    },
  } as DrawStickerAction);
}

export function setArtist(this: APIGlobals, artist: string, id: string) {
  this.log.push({
    command: 'setArtist',
    arguments: {
      id,
      artist,
    },
  } as SetArtistAction);
}
