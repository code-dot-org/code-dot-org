const test = require("tape");
const attempt = require("../helpers/RunLevel.js");
const Position = require("../../src/js/game/LevelMVC/Position");

test('Designer 1: Chicken Move (fail)', t => {
  attempt('designer01', async api => {
    const success = await api.startAttempt();
    t.assert(!success);
    t.end();
  });
});

test('Designer 1: Chicken Move (pass)', t => {
  attempt('designer01', async api => {
    api.onEventTriggered(null, 'chicken', 2, event => {
      api.moveForward(null, event.targetIdentifier);
      api.turnLeft(null, event.targetIdentifier);
    });

    const success = await api.startAttempt();
    t.assert(success);
    t.end();
  }, 0.5);
});

test('Designer 2: Four Chicken Move', t => {
  attempt('designer02', async api => {
    api.onEventTriggered(null, 'chicken', 2, event => {
      api.repeat(null, () => {
        api.drop(null, 'diamond', event.targetIdentifier);
        api.moveForward(null, event.targetIdentifier);
        api.turnLeft(null, event.targetIdentifier);
      }, -1, event.targetIdentifier);
    });

    const success = await api.startAttempt();
    t.assert(success);
    t.end();
  }, 0.5);
});

test('Designer 3: Four Chicken Random Move', t => {
  attempt('designer03', async api => {
    api.onEventTriggered(null, 'chicken', 2, event => {
      api.repeat(null, () => {
        // Movement isn't actually random because we've stubbed `Math.random()`
        // for integration tests.
        api.wait(null, 'random', event.targetIdentifier);
        api.moveForward(null, event.targetIdentifier);
        api.turnRandom(null, event.targetIdentifier);
      }, -1, event.targetIdentifier);
    });

    const success = await api.startAttempt();
    t.assert(success);
    t.end();
  }, 0.5);
});

test('Designer 4: Move Player Inside House', t => {
  attempt('designer04', async api => {
    for (let i = 0; i < 5; i++) {
      api.moveForward(null, 'Player');
    }
    api.use(null, 'Player');
    api.moveForward(null, 'Player');

    const success = await api.startAttempt();
    t.assert(success);
    t.end();
  });
});

test('Designer 5: Add Shear Sheep Behavior (push back)', t => {
  attempt('designer05', async (api, levelModel) => {
    // Move to the sheep and push it back 1 space.
    for (let i = 0; i < 4; i++) {
      api.moveForward(null, 'Player');
    }
    api.turnRight(null, 'Player');
    api.moveForward(null, 'Player');
    api.moveForward(null, 'Player');

    const success = await api.startAttempt();
    t.true(Position.equals(levelModel.player.position, new Position(5, 3)));
    t.equal(levelModel.getEntityAt(new Position(6, 3)), undefined);
    t.equal(levelModel.getEntityAt(new Position(7, 3)).type, 'sheep');
    t.assert(!success);
    t.end();
  });
});

test('Designer 5: Add Shear Sheep Behavior (fail)', t => {
  attempt('designer05', async api => {
    // Move to the sheep without defining the sheep `use` behavior.
    for (let i = 0; i < 4; i++) {
      api.moveForward(null, 'Player');
    }
    api.turnRight(null, 'Player');
    api.moveForward(null, 'Player');
    api.use(null, 'Player');

    const success = await api.startAttempt();
    t.assert(!success);
    t.end();
  });
});

test('Designer 5: Add Shear Sheep Behavior (pass)', t => {
  attempt('designer05', async api => {
    // Set up the sheep `use` behavior to drop wool.
    api.onEventTriggered(null, 'sheep', 1, event => {
      api.drop(null, 'wool', event.targetIdentifier);
    });

    // Move to the sheep then `use`.
    for (let i = 0; i < 4; i++) {
      api.moveForward(null, 'Player');
    }
    api.turnRight(null, 'Player');
    api.moveForward(null, 'Player');
    api.use(null, 'Player');

    const success = api.startAttempt();
    t.assert(success);
    t.end();
  });
});

test('Designer 6: Lead Cows to Grass', t => {
  attempt('designer06', async api => {
    // Define cow follow behavior as user code.
    api.onEventTriggered(null, 'cow', 2, event => {
      api.repeat(null, () => {
        api.moveToward(null, event.targetIdentifier, 'Player');
      }, -1, event.targetIdentifier);
    });

    // Move player into grassy area.
    api.moveForward(null, 'Player');
    api.turnLeft(null, 'Player');
    api.moveForward(null, 'Player');
    api.moveForward(null, 'Player');

    const success = await api.startAttempt();
    t.assert(success);
    t.end();
  });
});


test('Designer 7: Cannot walk into lava', t => {
  attempt('designer07', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));
    const turnLeft = () => new Promise(r => api.turnLeft(null, 'Player', r));

    await turnLeft();
    await moveForward();

    t.true(Position.equals(levelModel.player.position, new Position(3, 1)));
  });
});

test('Designer 7: Explode Stone Wall', t => {
  attempt('designer07', async (api, levelModel) => {
    // Make the creeper move towards the sheep.
    api.onEventTriggered(null, 'creeper', 2, event => {
      api.turnLeft(null, event.targetIdentifier);
      api.moveForward(null, event.targetIdentifier);
      api.moveForward(null, event.targetIdentifier);
      api.moveForward(null, event.targetIdentifier);
      api.turnRight(null, event.targetIdentifier);
      api.moveForward(null, event.targetIdentifier);
      api.moveForward(null, event.targetIdentifier);
      api.moveForward(null, event.targetIdentifier);
    });

    // Define creeper explode behavior as user code.
    api.onEventTriggered(null, 'creeper', 0, event => {
      api.flashEntity(null, event.targetIdentifier);
      api.wait(null, '2', event.targetIdentifier);
      api.explodeEntity(null, event.targetIdentifier);
    });

    // Move player to touch the creeper, then away.
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

    // Move player to the sheep.
    api.turnLeft(null, 'Player');
    api.turnLeft(null, 'Player');
    for (let i = 0; i < 6; i++) {
      api.moveForward(null, 'Player');
    }

    const success = await api.startAttempt();
    t.true(Position.equals(levelModel.player.position, new Position(7, 4)));
    t.assert(success);
    t.end();
  }, 0.5);
});

test('Designer 8: Trapped by Zombies', t => {
  attempt('designer08', async api => {
    // Define iron golem behavior as user code.
    api.onEventTriggered(null, 'ironGolem', 2, event => {
      api.repeat(null, () => {
        api.moveToward(null, event.targetIdentifier, 'zombie');
        api.attack(null, event.targetIdentifier);
      }, -1, event.targetIdentifier);
    });

    const success = await api.startAttempt();
    t.assert(success);
    t.end();
  });
});

test('Designer 9: Spawn Entity', t => {
  attempt('designer09', async api => {
    api.spawnEntity(null, 'sheep', 'middle');
    api.onEventTriggered(null, 'sheep', 2, event => {
      api.moveToward(null, event.targetIdentifier, 'Player');
    });

    const success = await api.startAttempt();
    t.assert(success);
    t.end();
  });
});
