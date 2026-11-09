const test = require("tape");
const attempt = require("../helpers/RunLevel.js");
const Position = require("../../src/js/game/LevelMVC/Position");

test('Aquatic 1: chest (pass)', t => {
  attempt('aquatic01', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));
    await moveForward();
    await moveForward();

    t.deepEqual(levelModel.player.position, new Position(4, 5));
  });
});
test('Aquatic 2: Move to boat (pass)', t => {
  attempt('aquatic02', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));
    const turnRight = () => new Promise(r => api.turnRight(null, 'Player', r));

    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();

    t.deepEqual(levelModel.player.position, new Position(7, 3));
  });
});
test('Aquatic 3: Move to Cod (pass)', t => {
  attempt('aquatic03', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));

    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();

    t.deepEqual(levelModel.player.position, new Position(5, 1));
  });
});
test('Aquatic 4: Move to Dolphin (pass)', t => {
  attempt('aquatic04', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));

    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();

    t.deepEqual(levelModel.player.position, new Position(5, 1));
  });
});
test('Aquatic 5: Move to Chest (pass)', t => {
  attempt('aquatic05', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));
    const turnRight = () => new Promise(r => api.turnRight(null, 'Player', r));

    await turnRight();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();

    t.deepEqual(levelModel.player.position, new Position(6, 5));
  });
});
test('Aquatic 6: Move to Chest (pass)', t => {
  attempt('aquatic06', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));
    const turnRight = () => new Promise(r => api.turnRight(null, 'Player', r));
    const turnLeft = () => new Promise(r => api.turnLeft(null, 'Player', r));

    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnLeft();
    await moveForward();
    await moveForward();
    await moveForward();

    t.deepEqual(levelModel.player.position, new Position(6, 3));
  });
});
test('Aquatic 7: Move to Chest (pass)', t => {
  attempt('aquatic07', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));
    const turnRight = () => new Promise(r => api.turnRight(null, 'Player', r));

    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();

    t.deepEqual(levelModel.player.position, new Position(6, 6));
  });
});
test('Aquatic 7a: Move to Chest Turtle Path (pass)', t => {
  attempt('aquatic07', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));
    const turnRight = () => new Promise(r => api.turnRight(null, 'Player', r));
    const turnLeft = () => new Promise(r => api.turnLeft(null, 'Player', r));

    await moveForward();
    await moveForward();
    await turnLeft();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnLeft();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();

    t.deepEqual(levelModel.player.position, new Position(7, 7));
  });
});
test('Aquatic 8: Move to Tropical Fish (pass)', t => {
  attempt('aquatic08a', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));
    const turnRight = () => new Promise(r => api.turnRight(null, 'Player', r));
    const turnLeft = () => new Promise(r => api.turnLeft(null, 'Player', r));

    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await turnLeft();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();

    t.deepEqual(levelModel.player.position, new Position(5, 7));
  });
});
test('Aquatic 9: Move to Chest (pass)', t => {
  attempt('aquatic09', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));
    const turnRight = () => new Promise(r => api.turnRight(null, 'Player', r));
    const turnLeft = () => new Promise(r => api.turnLeft(null, 'Player', r));

    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await turnLeft();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();

    t.deepEqual(levelModel.player.position, new Position(3, 7));
  });
});
test('Aquatic 10: Move to Squid (pass)', t => {
  attempt('aquatic10', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));
    const turnRight = () => new Promise(r => api.turnRight(null, 'Player', r));
    const turnLeft = () => new Promise(r => api.turnLeft(null, 'Player', r));

    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await turnRight();
    await moveForward();
    await moveForward();
    await turnLeft();
    await moveForward();
    await moveForward();
    await moveForward();

    t.deepEqual(levelModel.player.position, new Position(6, 3));
  });
});
test('Aquatic 11: Activate Conduit (pass)', t => {
  attempt('aquatic11', async (api, levelModel) => {
    t.plan(1);
    const moveForward = () => new Promise(r => api.moveForward(null, 'Player', r));
    const turnRight = () => new Promise(r => api.turnRight(null, 'Player', r));

    function placePrismarine() {
      api.placeBlock(null, "prismarine", "Player");
    }

    for (let i = 0; i < 4; ++i){
      for (let j = 0; j < 4; ++j) {
        await placePrismarine();
        await moveForward();
      }
      await turnRight();
    }

    t.true(levelModel.actionPlane.getBlockAt(new Position(5, 3)).isActivatedConduit);
  });
});
