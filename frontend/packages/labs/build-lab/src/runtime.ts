import type {BuildlabBlockState} from './BlocklyWorkspace';
import type {StageElement, StageScreen} from './project';

const STAGE_SIZE = 400;
const GRID_SIZE = 5;

export interface RuntimeState {
  elements: StageElement[];
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

function snapCoordinate(value: number) {
  const snapped = Math.round(value / GRID_SIZE) * GRID_SIZE;
  return Math.max(0, Math.min(STAGE_SIZE - 40, snapped));
}

export function executeBlockChain(
  firstBlock: BuildlabBlockState | undefined,
  runtimeState: RuntimeState,
  screens: StageScreen[],
  fallbackSpriteAssetId?: string,
): RuntimeState {
  let block = firstBlock;
  let nextState: RuntimeState = {
    ...runtimeState,
    keyboardMovements: runtimeState.keyboardMovements ?? [],
    pendingGeneration: undefined,
    pendingPrediction: undefined,
  };

  while (block) {
    if (block.type === 'buildlab_set_text') {
      const elementId = String(block.fields?.ELEMENT ?? '');
      const text = String(block.fields?.TEXT ?? '');
      nextState = {
        ...nextState,
        elements: nextState.elements.map(element =>
          element.id === elementId ? {...element, label: text} : element,
        ),
      };
    }

    if (block.type === 'buildlab_show_screen') {
      const screenId = String(block.fields?.SCREEN ?? '');
      if (screens.some(screen => screen.id === screenId)) {
        nextState = {...nextState, screenId};
      }
    }

    if (block.type === 'buildlab_set_position') {
      const elementId = String(block.fields?.ELEMENT ?? '');
      const x = snapCoordinate(Number(block.fields?.X ?? 200));
      const y = snapCoordinate(Number(block.fields?.Y ?? 200));
      nextState = {
        ...nextState,
        elements: nextState.elements.map(element =>
          element.id === elementId ? {...element, x, y} : element,
        ),
      };
    }

    if (block.type === 'buildlab_set_visible') {
      const elementId = String(block.fields?.ELEMENT ?? '');
      const visible = String(block.fields?.VISIBLE ?? 'true') !== 'false';
      nextState = {
        ...nextState,
        elements: nextState.elements.map(element =>
          element.id === elementId ? {...element, visible} : element,
        ),
      };
    }

    if (block.type === 'buildlab_move_with_arrow_keys') {
      const elementId = String(block.fields?.SPRITE ?? '');
      const rawSpeed = Number(block.fields?.SPEED ?? 5);
      const speed = Number.isFinite(rawSpeed)
        ? Math.max(1, Math.min(20, rawSpeed))
        : 5;
      const isSprite = nextState.elements.some(
        element => element.id === elementId && element.kind === 'sprite',
      );

      if (isSprite && elementId) {
        nextState = {
          ...nextState,
          keyboardMovements: [
            ...(nextState.keyboardMovements ?? []).filter(
              movement => movement.elementId !== elementId,
            ),
            {elementId, speed},
          ],
        };
      }
    }

    if (block.type === 'buildlab_predict_model') {
      const modelId = String(block.fields?.MODEL ?? '');
      const resultElementId = String(block.fields?.RESULT ?? '');
      if (modelId && resultElementId) {
        nextState = {
          ...nextState,
          pendingPrediction: {modelId, resultElementId},
        };
      }
    }

    if (block.type === 'buildlab_generate_text') {
      const prompt = String(block.fields?.PROMPT ?? '').trim();
      const resultElementId = String(block.fields?.RESULT ?? '');
      if (prompt && resultElementId) {
        nextState = {
          ...nextState,
          pendingGeneration: {prompt, resultElementId},
        };
      }
    }

    if (block.type === 'buildlab_create_sprite') {
      const spriteId = `runtime-sprite-${block.id}`;
      const assetId = String(
        block.fields?.ASSET ?? fallbackSpriteAssetId ?? '',
      );
      if (!nextState.elements.some(element => element.id === spriteId)) {
        nextState = {
          ...nextState,
          elements: [
            ...nextState.elements,
            {
              assetId: assetId || fallbackSpriteAssetId,
              id: spriteId,
              kind: 'sprite',
              label: 'Sprite',
              screenId: nextState.screenId,
              x: snapCoordinate(Number(block.fields?.X ?? 200)),
              y: snapCoordinate(Number(block.fields?.Y ?? 200)),
            },
          ],
        };
      }
    }

    block = block.next?.block;
  }

  return nextState;
}

export function moveWithArrowKeys(
  runtimeState: RuntimeState,
  directions: ReadonlySet<ArrowDirection>,
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
        candidate => candidate.elementId === element.id,
      );
      if (!movement) {
        return element;
      }

      return {
        ...element,
        x: clampCoordinate(element.x + horizontalDirection * movement.speed),
        y: clampCoordinate(element.y + verticalDirection * movement.speed),
      };
    }),
  };
}

function clampCoordinate(value: number) {
  return Math.max(0, Math.min(STAGE_SIZE - 40, value));
}
