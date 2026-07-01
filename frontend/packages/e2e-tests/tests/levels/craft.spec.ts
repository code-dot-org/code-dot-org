/**
 * Craft lab integration tests — faithful port of the original Karma/tape
 * browser tests. Each test instantiates GameController with inline level data
 * via the Vite dev server harness (no Rails).
 *
 * Prerequisites:
 *   cd frontend/packages/labs/craft && yarn dev
 *
 * Run:
 *   npx playwright test tests/levels/craft.spec.ts
 */
import {expect, test} from '@playwright/test';

import {gotoCraftHarness, isCraftDevServerUp} from '../pages/craft-lab';

// Browser-side types for the craft test harness (window.__craftTest).
// These describe the shape visible inside page.evaluate() callbacks.

interface CraftEvent {
  targetIdentifier: string;
}

interface CraftApi {
  moveForward(cb: null, entity: string, done?: () => void): void;
  turnLeft(cb: null, entity: string): void;
  turnRight(cb: null, entity: string): void;
  use(cb: null, entity: string): void;
  destroyBlock(cb: null, entity: string): void;
  placeBlock(cb: null, blockType: string, entity: string): void;
  placeInFront(cb: null, blockType: string, entity: string): void;
  drop(cb: null, item: string, entity: string): void;
  attack(cb: null, entity: string): void;
  wait(cb: null, duration: string, entity: string): void;
  moveDirection(cb: null, entity: string, direction: number): void;
  moveToward(cb: null, entity: string, target: string): void;
  turnRandom(cb: null, entity: string): void;
  flashEntity(cb: null, entity: string): void;
  explodeEntity(cb: null, entity: string): void;
  spawnEntity(cb: null, entityType: string, position: string): void;
  ifBlockAhead(
    cb: null,
    blockType: string,
    entity: string,
    thenFn: () => void,
  ): void;
  onEventTriggered(
    cb: null,
    entityType: string,
    eventType: number,
    handler: (event: CraftEvent) => void,
  ): void;
  repeat(cb: null, body: () => void, count: number, entity: string): void;
  resetAttempt(): void;
  startAttempt(): Promise<boolean>;
}

interface CraftPosition {
  x: number;
  y: number;
}

interface CraftBlock {
  blockType: string;
  isPowered: boolean;
}

interface CraftLevelModel {
  player: {position: CraftPosition};
  agent: {position: CraftPosition};
  usingAgent: boolean;
  isPlayerStandingInWater(): boolean;
  isPlayerStandingInLava(): boolean;
  actionPlane: {
    _data: CraftBlock[];
    getBlockAt(pos: CraftPosition): CraftBlock | null;
  };
  getEntityAt(pos: CraftPosition): unknown;
}

interface CraftPositionClass {
  new (x: number, y: number): CraftPosition;
  equals(a: CraftPosition, b: CraftPosition): boolean;
}

interface CraftTestHarness {
  ready: boolean;
  runLevel<T>(
    key: string,
    commands: (api: CraftApi, levelModel: CraftLevelModel) => Promise<T>,
    step?: number,
  ): Promise<T>;
  Position: CraftPositionClass;
}

test.beforeAll(async () => {
  const up = await isCraftDevServerUp();
  test.skip(
    !up,
    'Craft Vite dev server not running — start with: cd frontend/packages/labs/craft && yarn dev',
  );
});

// These tests mutate shared game state per-page; run sequentially within each
// group but allow groups to run in parallel across workers.
test.describe.configure({mode: 'serial'});

// Generous timeout — Phaser asset loading + game simulation can be slow.
test.setTimeout(120_000);

// ---------------------------------------------------------------------------
// Adventurer
// ---------------------------------------------------------------------------
test.describe('Craft: Adventurer', () => {
  test('Adventurer 1: Move to Sheep (fail)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer01',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(3, 4),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(false);
  });

  test('Adventurer 1: Move to Sheep (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer01',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(5, 4),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 2: Chop Tree', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer02',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          api.destroyBlock(null, 'Player');
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(4, 5),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 3: Shear Sheep', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer03',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          api.use(null, 'Player');
          api.turnRight(null, 'Player');
          api.moveForward(null, 'Player');
          api.use(null, 'Player');
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(4, 4),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 4: Chop Trees', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer04',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 3; i++) {
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            api.destroyBlock(null, 'Player');
            api.turnLeft(null, 'Player');
          }
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(3, 4),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 5: Place Wall', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer05',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 4; i++) {
            api.placeBlock(null, 'planksBirch', 'Player');
            api.moveForward(null, 'Player');
          }
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(2, 6),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 6: House Frame Chosen', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer06',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              api.placeBlock(null, 'planksBirch', 'Player');
              api.moveForward(null, 'Player');
            }
            api.turnRight(null, 'Player');
          }
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(6, 6),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 7: Plant Crops (fail)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer07',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.turnRight(null, 'Player');
          api.moveForward(null, 'Player');
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(5, 7),
            ),
            inWater: levelModel.isPlayerStandingInWater(),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.inWater).toBe(true);
    expect(r.success).toBe(false);
  });

  test('Adventurer 7: Plant Crops (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer07',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 6; j++) {
              api.placeBlock(null, 'cropWheat', 'Player');
              api.moveForward(null, 'Player');
            }
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
          }
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(4, 7),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 8: Avoid Monsters', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer08',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 4; i++) api.moveForward(null, 'Player');
          api.turnLeft(null, 'Player');
          for (let i = 0; i < 4; i++) api.moveForward(null, 'Player');
          api.turnLeft(null, 'Player');
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(4, 2),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 9: Mining Coal', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer09',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.turnLeft(null, 'Player');
          for (let i = 0; i < 2; i++) {
            api.placeBlock(null, 'torch', 'Player');
            api.destroyBlock(null, 'Player');
            api.moveForward(null, 'Player');
          }
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(3, 6),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 10: Iron (fail)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer10',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(3, 4),
            ),
            inLava: levelModel.isPlayerStandingInLava(),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.inLava).toBe(true);
    expect(r.success).toBe(false);
  });

  test('Adventurer 10: Iron (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer10',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.moveForward(null, 'Player');
          api.placeInFront(null, 'cobblestone', 'Player');
          for (let i = 0; i < 3; i++) {
            api.moveForward(null, 'Player');
            api.destroyBlock(null, 'Player');
          }
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(3, 2),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 11: Avoiding Lava', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer11',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 7; i++) {
            api.destroyBlock(null, 'Player');
            api.ifBlockAhead(null, 'lava', 'Player', () => {
              api.placeInFront(null, 'cobblestone', 'Player');
            });
            api.moveForward(null, 'Player');
          }
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(8, 4),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 12: If Statements', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer12',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 3; i++) {
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            api.destroyBlock(null, 'Player');
            api.ifBlockAhead(null, 'lava', 'Player', () => {
              api.placeInFront(null, 'cobblestone', 'Player');
            });
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
          }
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(3, 2),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 13: Powered Minecart', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer13',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 2; i++) {
            api.turnRight(null, 'Player');
            for (let j = 0; j < 6; j++) {
              api.placeBlock(null, 'rail', 'Player');
              api.moveForward(null, 'Player');
            }
          }
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(11, 7),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Adventurer 14: Free Play 20x20', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'adventurer14',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.moveForward(null, 'Player');
          api.turnLeft(null, 'Player');
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          api.placeBlock(null, 'tnt', 'Player');
          const success = await api.startAttempt();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(7, 9),
            ),
            success,
          };
        },
      );
    });
    expect(r.posOk).toBe(true);
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------
test.describe('Craft: Agent', () => {
  test('Agent 1: Leave House', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'agent01',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.moveForward(null, 'PlayerAgent');

          setTimeout(() => {
            for (let i = 0; i < 4; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 5; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 4; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 2; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 3; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 3; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 3; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 3; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 2; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 5; ++i) api.moveForward(null, 'Player');
          }, 1000);

          const success = await api.startAttempt();
          return {
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(3, 8),
            ),
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(8, 8),
            ),
            success,
          };
        },
      );
    });
    expect(r.agentPosOk).toBe(true);
    expect(r.playerPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Agent 2: Open Doors', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'agent02',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 4; ++i) api.moveForward(null, 'PlayerAgent');
          api.turnLeft(null, 'PlayerAgent');
          for (let i = 0; i < 4; ++i) api.moveForward(null, 'PlayerAgent');

          setTimeout(() => {
            for (let i = 0; i < 9; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 3; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 4; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 2; ++i) api.moveForward(null, 'Player');
          }, 2000);

          const success = await api.startAttempt();
          return {
            usingAgent: levelModel.usingAgent,
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(2, 5),
            ),
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(6, 1),
            ),
            success,
          };
        },
      );
    });
    expect(r.usingAgent).toBe(true);
    expect(r.agentPosOk).toBe(true);
    expect(r.playerPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Agent 3: Open Doors 2.0', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'agent03',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 4; ++i) api.moveForward(null, 'PlayerAgent');
          api.turnLeft(null, 'PlayerAgent');
          for (let i = 0; i < 4; ++i) api.moveForward(null, 'PlayerAgent');

          setTimeout(() => {
            api.turnLeft(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 9; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 4; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 3; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 2; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 2; ++i) api.moveForward(null, 'Player');
          }, 1000);

          const success = await api.startAttempt();
          return {
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(0, 5),
            ),
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(9, 2),
            ),
            success,
          };
        },
      );
    });
    expect(r.agentPosOk).toBe(true);
    expect(r.playerPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Agent 4: Walk on Water', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'agent04',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 6; ++i) api.moveForward(null, 'PlayerAgent');
          api.turnLeft(null, 'PlayerAgent');
          for (let i = 0; i < 2; ++i) api.moveForward(null, 'PlayerAgent');

          setTimeout(() => {
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 3; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 5; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 7; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
          }, 1000);

          const success = await api.startAttempt();
          return {
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(3, 1),
            ),
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(9, 1),
            ),
            success,
          };
        },
      );
    });
    expect(r.agentPosOk).toBe(true);
    expect(r.playerPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Agent 5: Open Doors 2.0', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'agent05',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 5; ++i) api.moveForward(null, 'PlayerAgent');
          api.turnRight(null, 'PlayerAgent');
          for (let i = 0; i < 4; ++i) api.moveForward(null, 'PlayerAgent');
          api.turnRight(null, 'PlayerAgent');
          api.moveForward(null, 'PlayerAgent');

          setTimeout(() => {
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 3; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            for (let i = 0; i < 2; ++i) {
              api.turnRight(null, 'Player');
              for (let j = 0; j < 5; ++j) api.moveForward(null, 'Player');
            }
            api.turnLeft(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 7; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            api.moveForward(null, 'Player');
          }, 1500);

          const success = await api.startAttempt();
          return {
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(8, 3),
            ),
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(9, 1),
            ),
            success,
          };
        },
      );
    });
    expect(r.agentPosOk).toBe(true);
    expect(r.playerPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Agent 6: Build Bridge with one turn', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'agent06',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 3; i++) {
            api.moveForward(null, 'PlayerAgent');
            api.placeBlock(null, 'planksOak', 'PlayerAgent');
          }
          api.turnRight(null, 'PlayerAgent');
          for (let i = 0; i < 2; i++) {
            api.moveForward(null, 'PlayerAgent');
            api.placeBlock(null, 'planksOak', 'PlayerAgent');
          }

          setTimeout(() => {
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 4; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 5; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            api.turnLeft(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 5; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
          }, 1000);

          const success = await api.startAttempt();
          return {
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(5, 3),
            ),
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(3, 1),
            ),
            success,
          };
        },
      );
    });
    expect(r.agentPosOk).toBe(true);
    expect(r.playerPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Agent 7: Build Bridge with multiple turns', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'agent07',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 3; i++) {
            api.moveForward(null, 'PlayerAgent');
            api.placeBlock(null, 'planksOak', 'PlayerAgent');
          }
          api.turnRight(null, 'PlayerAgent');
          api.moveForward(null, 'PlayerAgent');
          api.placeBlock(null, 'planksOak', 'PlayerAgent');
          api.turnLeft(null, 'PlayerAgent');
          for (let i = 0; i < 2; i++) {
            api.moveForward(null, 'PlayerAgent');
            api.placeBlock(null, 'planksOak', 'PlayerAgent');
          }

          setTimeout(() => {
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 5; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 3; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 2; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 3; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            api.moveForward(null, 'Player');
          }, 1000);

          const success = await api.startAttempt();
          return {
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(6, 2),
            ),
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(5, 1),
            ),
            success,
          };
        },
      );
    });
    expect(r.agentPosOk).toBe(true);
    expect(r.playerPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Agent 8: Build Bridge with Functions', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'agent08',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const func = () => {
            for (let i = 0; i < 2; ++i) {
              api.moveForward(null, 'PlayerAgent');
              api.placeBlock(null, 'planksOak', 'PlayerAgent');
            }
            api.moveForward(null, 'PlayerAgent');
            api.moveForward(null, 'PlayerAgent');
            api.turnRight(null, 'PlayerAgent');
          };

          for (let i = 0; i < 3; ++i) func();

          setTimeout(() => {
            api.moveForward(null, 'Player');
            for (let i = 0; i < 3; ++i) {
              for (let j = 0; j < 4; j++) api.moveForward(null, 'Player');
              api.turnRight(null, 'Player');
            }
            api.turnRight(null, 'Player');
            for (let i = 0; i < 5; i++) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
          }, 10000);

          const success = await api.startAttempt();
          return {
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(7, 7),
            ),
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(9, 2),
            ),
            success,
          };
        },
      );
    });
    expect(r.agentPosOk).toBe(true);
    expect(r.playerPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Agent 9: Clear Path', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'agent09',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const func = () => {
            api.destroyBlock(null, 'PlayerAgent');
            api.moveForward(null, 'PlayerAgent');
            api.placeBlock(null, 'gravel', 'PlayerAgent');
          };

          func();
          api.moveForward(null, 'PlayerAgent');
          api.moveForward(null, 'PlayerAgent');
          func();
          api.moveForward(null, 'PlayerAgent');
          func();
          api.turnRight(null, 'PlayerAgent');
          func();
          api.moveForward(null, 'PlayerAgent');
          api.moveForward(null, 'PlayerAgent');
          func();

          setTimeout(() => {
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 6; i++) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 4; i++) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 4; i++) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
          }, 5000);

          const success = await api.startAttempt();
          return {
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(8, 3),
            ),
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(4, 1),
            ),
            success,
          };
        },
      );
    });
    expect(r.agentPosOk).toBe(true);
    expect(r.playerPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Agent 11: The Nether', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'agent11',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const funcLong = () => {
            for (let i = 0; i < 5; ++i) {
              api.moveForward(null, 'PlayerAgent');
              api.placeBlock(null, 'netherrack', 'PlayerAgent');
            }
          };
          const funcShort = () => {
            for (let i = 0; i < 2; ++i) {
              api.moveForward(null, 'PlayerAgent');
              api.placeBlock(null, 'netherrack', 'PlayerAgent');
            }
          };

          funcShort();
          api.turnRight(null, 'PlayerAgent');
          funcLong();
          api.turnLeft(null, 'PlayerAgent');
          funcLong();
          api.turnLeft(null, 'PlayerAgent');
          funcShort();

          setTimeout(() => {
            api.turnLeft(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 5; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 5; ++i) api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 2; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 2; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            api.turnRight(null, 'Player');
            api.moveForward(null, 'Player');
            api.turnLeft(null, 'Player');
            for (let i = 0; i < 2; ++i) api.moveForward(null, 'Player');
            api.turnRight(null, 'Player');
            for (let i = 0; i < 3; ++i) api.moveForward(null, 'Player');
          }, 15000);

          await api.startAttempt();
          return {
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(7, 2),
            ),
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(4, 2),
            ),
          };
        },
      );
    });
    expect(r.agentPosOk).toBe(true);
    expect(r.playerPosOk).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Aquatic
// ---------------------------------------------------------------------------
test.describe('Craft: Aquatic', () => {
  test('Aquatic 1: chest (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'aquatic01',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          await moveForward();
          await moveForward();
          return {
            pos: {
              x: levelModel.player.position.x,
              y: levelModel.player.position.y,
            },
          };
        },
      );
    });
    expect(r.pos).toEqual({x: 4, y: 5});
  });

  test('Aquatic 2: Move to boat (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'aquatic02',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          const turnRight = () =>
            new Promise(r => api.turnRight(null, 'Player', r));
          await moveForward();
          await turnRight();
          for (let i = 0; i < 5; i++) await moveForward();
          return {
            pos: {
              x: levelModel.player.position.x,
              y: levelModel.player.position.y,
            },
          };
        },
      );
    });
    expect(r.pos).toEqual({x: 7, y: 3});
  });

  test('Aquatic 3: Move to Cod (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'aquatic03',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          for (let i = 0; i < 7; i++) await moveForward();
          return {
            pos: {
              x: levelModel.player.position.x,
              y: levelModel.player.position.y,
            },
          };
        },
      );
    });
    expect(r.pos).toEqual({x: 5, y: 1});
  });

  test('Aquatic 4: Move to Dolphin (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'aquatic04',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          for (let i = 0; i < 7; i++) await moveForward();
          return {
            pos: {
              x: levelModel.player.position.x,
              y: levelModel.player.position.y,
            },
          };
        },
      );
    });
    expect(r.pos).toEqual({x: 5, y: 1});
  });

  test('Aquatic 5: Move to Chest (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'aquatic05',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          const turnRight = () =>
            new Promise(r => api.turnRight(null, 'Player', r));
          await turnRight();
          await moveForward();
          await moveForward();
          await turnRight();
          await moveForward();
          await moveForward();
          return {
            pos: {
              x: levelModel.player.position.x,
              y: levelModel.player.position.y,
            },
          };
        },
      );
    });
    expect(r.pos).toEqual({x: 6, y: 5});
  });

  test('Aquatic 6: Move to Chest (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'aquatic06',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          const turnRight = () =>
            new Promise(r => api.turnRight(null, 'Player', r));
          const turnLeft = () =>
            new Promise(r => api.turnLeft(null, 'Player', r));
          for (let i = 0; i < 3; i++) await moveForward();
          await turnRight();
          for (let i = 0; i < 6; i++) await moveForward();
          await turnLeft();
          for (let i = 0; i < 3; i++) await moveForward();
          return {
            pos: {
              x: levelModel.player.position.x,
              y: levelModel.player.position.y,
            },
          };
        },
      );
    });
    expect(r.pos).toEqual({x: 6, y: 3});
  });

  test('Aquatic 7: Move to Chest (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'aquatic07',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          const turnRight = () =>
            new Promise(r => api.turnRight(null, 'Player', r));
          for (let i = 0; i < 5; i++) await moveForward();
          await turnRight();
          await moveForward();
          await moveForward();
          await turnRight();
          await moveForward();
          await moveForward();
          return {
            pos: {
              x: levelModel.player.position.x,
              y: levelModel.player.position.y,
            },
          };
        },
      );
    });
    expect(r.pos).toEqual({x: 6, y: 6});
  });

  test('Aquatic 7a: Move to Chest Turtle Path (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'aquatic07',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          const turnRight = () =>
            new Promise(r => api.turnRight(null, 'Player', r));
          const turnLeft = () =>
            new Promise(r => api.turnLeft(null, 'Player', r));
          await moveForward();
          await moveForward();
          await turnLeft();
          for (let i = 0; i < 3; i++) await moveForward();
          await turnRight();
          for (let i = 0; i < 5; i++) await moveForward();
          await turnRight();
          for (let i = 0; i < 3; i++) await moveForward();
          await turnLeft();
          await moveForward();
          await turnRight();
          for (let i = 0; i < 4; i++) await moveForward();
          await turnRight();
          for (let i = 0; i < 6; i++) await moveForward();
          await turnRight();
          await moveForward();
          return {
            pos: {
              x: levelModel.player.position.x,
              y: levelModel.player.position.y,
            },
          };
        },
      );
    });
    expect(r.pos).toEqual({x: 7, y: 7});
  });

  test('Aquatic 8: Move to Tropical Fish (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'aquatic08a',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          const turnRight = () =>
            new Promise(r => api.turnRight(null, 'Player', r));
          const turnLeft = () =>
            new Promise(r => api.turnLeft(null, 'Player', r));
          for (let i = 0; i < 7; i++) await moveForward();
          await turnRight();
          for (let i = 0; i < 5; i++) await moveForward();
          await turnRight();
          await moveForward();
          await moveForward();
          await turnLeft();
          await moveForward();
          await moveForward();
          await turnRight();
          for (let i = 0; i < 4; i++) await moveForward();
          await turnRight();
          for (let i = 0; i < 3; i++) await moveForward();
          return {
            pos: {
              x: levelModel.player.position.x,
              y: levelModel.player.position.y,
            },
          };
        },
      );
    });
    expect(r.pos).toEqual({x: 5, y: 7});
  });

  test('Aquatic 9: Move to Chest (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'aquatic09',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          const turnRight = () =>
            new Promise(r => api.turnRight(null, 'Player', r));
          const turnLeft = () =>
            new Promise(r => api.turnLeft(null, 'Player', r));
          for (let i = 0; i < 4; i++) await moveForward();
          await turnRight();
          for (let i = 0; i < 7; i++) await moveForward();
          await turnRight();
          await moveForward();
          await turnLeft();
          await moveForward();
          await turnRight();
          for (let i = 0; i < 3; i++) await moveForward();
          await turnRight();
          for (let i = 0; i < 6; i++) await moveForward();
          await turnRight();
          await moveForward();
          return {
            pos: {
              x: levelModel.player.position.x,
              y: levelModel.player.position.y,
            },
          };
        },
      );
    });
    expect(r.pos).toEqual({x: 3, y: 7});
  });

  test('Aquatic 10: Move to Squid (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'aquatic10',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          const turnRight = () =>
            new Promise(r => api.turnRight(null, 'Player', r));
          const turnLeft = () =>
            new Promise(r => api.turnLeft(null, 'Player', r));
          for (let i = 0; i < 7; i++) await moveForward();
          await turnRight();
          await moveForward();
          await moveForward();
          await turnRight();
          await moveForward();
          await moveForward();
          await turnLeft();
          for (let i = 0; i < 3; i++) await moveForward();
          return {
            pos: {
              x: levelModel.player.position.x,
              y: levelModel.player.position.y,
            },
          };
        },
      );
    });
    expect(r.pos).toEqual({x: 6, y: 3});
  });

  test('Aquatic 11: Activate Conduit (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'aquatic11',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          const turnRight = () =>
            new Promise(r => api.turnRight(null, 'Player', r));

          for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
              api.placeBlock(null, 'prismarine', 'Player');
              await moveForward();
            }
            await turnRight();
          }
          return {
            conduitActivated: levelModel.actionPlane.getBlockAt(
              new Position(5, 3),
            ).isActivatedConduit,
          };
        },
      );
    });
    expect(r.conduitActivated).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Designer
// ---------------------------------------------------------------------------
test.describe('Craft: Designer', () => {
  test('Designer 1: Chicken Move (fail)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel('designer01', async (api: CraftApi) => {
        const success = await api.startAttempt();
        return {success};
      });
    });
    expect(r.success).toBe(false);
  });

  test('Designer 1: Chicken Move (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'designer01',
        async (api: CraftApi) => {
          api.onEventTriggered(null, 'chicken', 2, (event: CraftEvent) => {
            api.moveForward(null, event.targetIdentifier);
            api.turnLeft(null, event.targetIdentifier);
          });
          const success = await api.startAttempt();
          return {success};
        },
        0.5,
      );
    });
    expect(r.success).toBe(true);
  });

  test('Designer 2: Four Chicken Move', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'designer02',
        async (api: CraftApi) => {
          api.onEventTriggered(null, 'chicken', 2, (event: CraftEvent) => {
            api.repeat(
              null,
              () => {
                api.drop(null, 'diamond', event.targetIdentifier);
                api.moveForward(null, event.targetIdentifier);
                api.turnLeft(null, event.targetIdentifier);
              },
              -1,
              event.targetIdentifier,
            );
          });
          const success = await api.startAttempt();
          return {success};
        },
        0.5,
      );
    });
    expect(r.success).toBe(true);
  });

  test('Designer 3: Four Chicken Random Move', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'designer03',
        async (api: CraftApi) => {
          api.onEventTriggered(null, 'chicken', 2, (event: CraftEvent) => {
            api.repeat(
              null,
              () => {
                api.wait(null, 'random', event.targetIdentifier);
                api.moveForward(null, event.targetIdentifier);
                api.turnRandom(null, event.targetIdentifier);
              },
              -1,
              event.targetIdentifier,
            );
          });
          const success = await api.startAttempt();
          return {success};
        },
        0.5,
      );
    });
    expect(r.success).toBe(true);
  });

  test('Designer 4: Move Player Inside House', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'designer04',
        async (api: CraftApi) => {
          for (let i = 0; i < 5; i++) api.moveForward(null, 'Player');
          api.use(null, 'Player');
          api.moveForward(null, 'Player');
          const success = await api.startAttempt();
          return {success};
        },
        0.5,
      );
    });
    expect(r.success).toBe(true);
  });

  test('Designer 5: Add Shear Sheep Behavior (push back)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'designer05',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          for (let i = 0; i < 4; i++) api.moveForward(null, 'Player');
          api.turnRight(null, 'Player');
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          const success = await api.startAttempt();
          const entityAt6 = levelModel.getEntityAt(new Position(6, 3));
          const entityAt7 = levelModel.getEntityAt(new Position(7, 3));
          return {
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(5, 3),
            ),
            entityAt6Undefined: entityAt6 === undefined,
            entityAt7Type: entityAt7?.type,
            success,
          };
        },
        0.5,
      );
    });
    expect(r.playerPosOk).toBe(true);
    expect(r.entityAt6Undefined).toBe(true);
    expect(r.entityAt7Type).toBe('sheep');
    expect(r.success).toBe(false);
  });

  test('Designer 5: Add Shear Sheep Behavior (fail)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'designer05',
        async (api: CraftApi) => {
          for (let i = 0; i < 4; i++) api.moveForward(null, 'Player');
          api.turnRight(null, 'Player');
          api.moveForward(null, 'Player');
          api.use(null, 'Player');
          const success = await api.startAttempt();
          return {success};
        },
        0.5,
      );
    });
    expect(r.success).toBe(false);
  });

  test('Designer 5: Add Shear Sheep Behavior (pass)', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'designer05',
        async (api: CraftApi) => {
          api.onEventTriggered(null, 'sheep', 1, (event: CraftEvent) => {
            api.drop(null, 'wool', event.targetIdentifier);
          });
          for (let i = 0; i < 4; i++) api.moveForward(null, 'Player');
          api.turnRight(null, 'Player');
          api.moveForward(null, 'Player');
          api.use(null, 'Player');
          const success = await api.startAttempt();
          return {success};
        },
        0.5,
      );
    });
    expect(r.success).toBe(true);
  });

  test('Designer 6: Lead Cows to Grass', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'designer06',
        async (api: CraftApi) => {
          api.onEventTriggered(null, 'cow', 2, (event: CraftEvent) => {
            api.repeat(
              null,
              () => {
                api.moveToward(null, event.targetIdentifier, 'Player');
              },
              -1,
              event.targetIdentifier,
            );
          });
          api.moveForward(null, 'Player');
          api.turnLeft(null, 'Player');
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          const success = await api.startAttempt();
          return {success};
        },
        0.5,
      );
    });
    expect(r.success).toBe(true);
  });

  test('Designer 7: Cannot walk into lava', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'designer07',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          const moveForward = () =>
            new Promise(r => api.moveForward(null, 'Player', r));
          const turnLeft = () =>
            new Promise(r => api.turnLeft(null, 'Player', r));
          await turnLeft();
          await moveForward();
          return {
            posOk: Position.equals(
              levelModel.player.position,
              new Position(3, 1),
            ),
          };
        },
        0.5,
      );
    });
    expect(r.posOk).toBe(true);
  });

  test('Designer 7: Explode Stone Wall', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'designer07',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.onEventTriggered(null, 'creeper', 2, (event: CraftEvent) => {
            api.turnLeft(null, event.targetIdentifier);
            api.moveForward(null, event.targetIdentifier);
            api.moveForward(null, event.targetIdentifier);
            api.moveForward(null, event.targetIdentifier);
            api.turnRight(null, event.targetIdentifier);
            api.moveForward(null, event.targetIdentifier);
            api.moveForward(null, event.targetIdentifier);
            api.moveForward(null, event.targetIdentifier);
          });
          api.onEventTriggered(null, 'creeper', 0, (event: CraftEvent) => {
            api.flashEntity(null, event.targetIdentifier);
            api.wait(null, '2', event.targetIdentifier);
            api.explodeEntity(null, event.targetIdentifier);
          });
          api.wait(null, '7', 'Player');
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          api.turnLeft(null, 'Player');
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          api.turnRight(null, 'Player');
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          api.turnRight(null, 'Player');
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          api.moveForward(null, 'Player');
          api.wait(null, '7', 'Player');
          api.turnLeft(null, 'Player');
          api.turnLeft(null, 'Player');
          for (let i = 0; i < 6; i++) api.moveForward(null, 'Player');

          const success = await api.startAttempt();
          return {
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(7, 4),
            ),
            success,
          };
        },
        0.5,
      );
    });
    expect(r.playerPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Designer 8: Trapped by Zombies', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'designer08',
        async (api: CraftApi) => {
          api.onEventTriggered(null, 'ironGolem', 2, (event: CraftEvent) => {
            api.repeat(
              null,
              () => {
                api.moveToward(null, event.targetIdentifier, 'zombie');
                api.attack(null, event.targetIdentifier);
              },
              -1,
              event.targetIdentifier,
            );
          });
          const success = await api.startAttempt();
          return {success};
        },
        0.5,
      );
    });
    expect(r.success).toBe(true);
  });

  test('Designer 9: Spawn Entity', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel} = (window as unknown as {__craftTest: CraftTestHarness})
        .__craftTest;
      return runLevel(
        'designer09',
        async (api: CraftApi) => {
          api.spawnEntity(null, 'sheep', 'middle');
          api.onEventTriggered(null, 'sheep', 2, (event: CraftEvent) => {
            api.moveToward(null, event.targetIdentifier, 'Player');
          });
          const success = await api.startAttempt();
          return {success};
        },
        0.5,
      );
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Functionality
// ---------------------------------------------------------------------------
test.describe('Craft: Functionality', () => {
  test('Pistons: Entity Obstruction 1', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'functionality01',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.placeInFront(null, 'railsRedstoneTorch', 'Player');
          api.turnLeft(null, 'Player');
          api.moveForward(null, 'Player');
          const success = await api.startAttempt();
          return {
            blockType: levelModel.actionPlane._data[21].blockType,
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(4, 3),
            ),
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(1, 2),
            ),
            success,
          };
        },
        1,
      );
    });
    expect(r.blockType).toBe('');
    expect(r.playerPosOk).toBe(true);
    expect(r.agentPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Pistons: Entity Obstruction 2', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'functionality01',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.placeInFront(null, 'railsRedstoneTorch', 'Player');
          api.turnLeft(null, 'Player');
          api.moveForward(null, 'Player');

          setTimeout(() => {
            api.moveForward(null, 'PlayerAgent');
          }, 1000);

          setTimeout(() => {
            api.moveForward(null, 'Player');
          }, 2000);

          const success = await api.startAttempt();
          return {
            blockType: levelModel.actionPlane._data[21].blockType,
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(4, 3),
            ),
            agentPosOk: Position.equals(
              levelModel.agent.position,
              new Position(1, 3),
            ),
            success,
          };
        },
        1,
      );
    });
    expect(r.blockType).toBe('pistonArmLeft');
    expect(r.playerPosOk).toBe(true);
    expect(r.agentPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Rails: Moving On to Ride', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'functionality02',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.moveDirection(null, 'Player', 1);

          setTimeout(() => {
            for (let i = 0; i < 8; ++i) api.moveDirection(null, 'Player', 1);
          }, 10000);

          const success = await api.startAttempt();
          return {
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(9, 9),
            ),
            success,
          };
        },
      );
    });
    expect(r.playerPosOk).toBe(true);
    expect(r.success).toBe(true);
  });

  test('Pressure Plate: Moving On to Rail', async ({page}) => {
    await gotoCraftHarness(page);
    const r = await page.evaluate(async () => {
      const {runLevel, Position} = (
        window as unknown as {__craftTest: CraftTestHarness}
      ).__craftTest;
      return runLevel(
        'functionality03',
        async (api: CraftApi, levelModel: CraftLevelModel) => {
          api.moveDirection(null, 'Player', 2);
          api.moveDirection(null, 'Player', 1);
          const success = await api.startAttempt();
          return {
            playerPosOk: Position.equals(
              levelModel.player.position,
              new Position(6, 2),
            ),
            isPowered: levelModel.actionPlane._data[0].isPowered,
            success,
          };
        },
      );
    });
    expect(r.playerPosOk).toBe(true);
    expect(r.isPowered).toBeFalsy();
    expect(r.success).toBe(true);
  });
});
