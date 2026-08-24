import type {StageElement} from './project';

export const STAGE_SIZE = 400;
export const DEFAULT_SPRITE_SIZE = 76;

/**
 * Keep an element fully on the stage. `extent` is the element's size along the
 * axis being clamped, so a wide element stops further left than a narrow one.
 */
export function clampToStage(value: number, extent = DEFAULT_SPRITE_SIZE) {
  return Math.max(
    0,
    Math.min(STAGE_SIZE - Math.min(extent, STAGE_SIZE), value)
  );
}

export interface RuntimeState {
  elements: StageElement[];
  variables: Record<string, string>;
  pendingGeneration?: PendingGeneration;
  keyboardMovements?: KeyboardMovement[];
  pendingPrediction?: PendingPrediction;
  screenId: string;
}

export interface PendingGeneration {
  prompt: string;
  resultElementId: string;
}

export interface KeyboardMovement {
  elementId: string;
  speed: number;
}

export interface PendingPrediction {
  modelId: string;
  resultElementId: string;
}

export type ArrowDirection =
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp';

export function spritesAreTouching(
  elements: readonly StageElement[],
  firstId: string,
  secondId: string
) {
  if (firstId === secondId) {
    return false;
  }

  const first = elements.find(element => element.id === firstId);
  const second = elements.find(element => element.id === secondId);
  if (
    !first ||
    !second ||
    first.kind !== 'sprite' ||
    second.kind !== 'sprite' ||
    first.visible === false ||
    second.visible === false
  ) {
    return false;
  }

  const firstWidth = first.width ?? DEFAULT_SPRITE_SIZE;
  const firstHeight = first.height ?? DEFAULT_SPRITE_SIZE;
  const secondWidth = second.width ?? DEFAULT_SPRITE_SIZE;
  const secondHeight = second.height ?? DEFAULT_SPRITE_SIZE;

  return (
    first.x < second.x + secondWidth &&
    first.x + firstWidth > second.x &&
    first.y < second.y + secondHeight &&
    first.y + firstHeight > second.y
  );
}

export function moveWithArrowKeys(
  runtimeState: RuntimeState,
  directions: ReadonlySet<ArrowDirection>
): RuntimeState {
  if (!directions.size || !runtimeState.keyboardMovements?.length) {
    return runtimeState;
  }

  const horizontalDirection =
    (directions.has('ArrowRight') ? 1 : 0) -
    (directions.has('ArrowLeft') ? 1 : 0);
  const verticalDirection =
    (directions.has('ArrowDown') ? 1 : 0) - (directions.has('ArrowUp') ? 1 : 0);

  return {
    ...runtimeState,
    elements: runtimeState.elements.map(element => {
      if (element.kind !== 'sprite') {
        return element;
      }

      const movement = runtimeState.keyboardMovements?.find(
        candidate => candidate.elementId === element.id
      );
      if (!movement) {
        return element;
      }

      return {
        ...element,
        x: clampToStage(
          element.x + horizontalDirection * movement.speed,
          element.width ?? DEFAULT_SPRITE_SIZE
        ),
        y: clampToStage(
          element.y + verticalDirection * movement.speed,
          element.height ?? DEFAULT_SPRITE_SIZE
        ),
      };
    }),
  };
}
