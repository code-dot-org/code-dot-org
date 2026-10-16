const test = require('tape');

const LevelBlock = require('../../src/js/game/LevelMVC/LevelBlock');
const LevelPlane = require('../../src/js/game/LevelMVC/LevelPlane');
const BaseEntity = require('../../src/js/game/Entities/BaseEntity');
const Sheep = require('../../src/js/game/Entities/Sheep');
const Player = require('../../src/js/game/Entities/Player');
const Agent = require('../../src/js/game/Entities/Agent');

const mockGameController = {
  getIsDirectPlayerControl: () => false,
  delayPlayerMoveBy: () => {},
  levelData: {},
  levelModel: {
    isPlayerStandingInWater: () => false,
    isPlayerStandingInLava: () => false,
  },
};

const mockPlane = {
  getBlockAt: () => new LevelBlock(""),
};

test('canPlaceBlockOver', t => {
  const solidBlocks = ["dirt", "cobblestone"].map((type) => new LevelBlock(type));
  const liquidBlocks = ["water", "lava"].map((type) => new LevelBlock(type));

  const baseEntity = new BaseEntity(mockGameController, "Entity", "Entity", 1, 1, 1);
  const player = new Player(mockGameController, "Player", 1, 1, "Player", true, 1);
  const agent = new Agent(mockGameController, "PlayerAgent", 1, 1, "Agent", true, 1);

  // default entities can't place blocks at all
  solidBlocks.concat(liquidBlocks).forEach((block) => {
    t.false(baseEntity.canPlaceBlockOver(new LevelBlock("anything"), block).canPlace);
  });

  // Player can only place on the ground plane if on top of water or lava
  solidBlocks.forEach((block) => {
    const result = player.canPlaceBlockOver(new LevelBlock("anything"), block);
    t.true(result.canPlace);
    t.equal(result.plane, "actionPlane");
  });
  liquidBlocks.forEach((block) => {
    const result = player.canPlaceBlockOver(new LevelBlock("anything"), block);
    t.true(result.canPlace);
    t.equal(result.plane, "groundPlane");
  });

  // Player can only place wheat on farmland
  const wheat = new LevelBlock("cropWheat");
  const farmland = new LevelBlock("farmlandWet");
  solidBlocks.concat(liquidBlocks).forEach((block) => {
    t.false(player.canPlaceBlockOver(wheat, block).canPlace);
  });
  t.true(player.canPlaceBlockOver(wheat, farmland).canPlace);

  // Agents can only place solid blocks if they are standing on liquid
  solidBlocks.forEach((blockToPlace) => {
    solidBlocks.forEach((groundBlock) => {
      t.false(agent.canPlaceBlockOver(blockToPlace, groundBlock).canPlace);
    });
    liquidBlocks.forEach((groundBlock) => {
      t.true(agent.canPlaceBlockOver(blockToPlace, groundBlock).canPlace);
    });
  });

  // Agents cannot place redstone, pistons, rails, or torches on liquid
  ["redstoneWire", "piston", "rails", "torch", "railsRedstoneTorch"].map((type) => new LevelBlock(type)).forEach((blockToPlace) => {
    liquidBlocks.forEach((groundBlock) => {
      t.false(agent.canPlaceBlockOver(blockToPlace, groundBlock).canPlace);
    });
  });

  // Agents will place redstone and rails on the action plane
  ["redstoneWire", "rails"].map((type) => new LevelBlock(type)).forEach((blockToPlace) => {
    solidBlocks.forEach((groundBlock) => {
      t.equal(agent.canPlaceBlockOver(blockToPlace, groundBlock).plane, "actionPlane");
    });
  });

  t.end();
});

test('playerCanOpenTreasureChest', t => {
  const controller = Object.assign({}, mockGameController, {
    levelView: {
      trees: [],
      collectibleItems: [],
      playMoveForwardAnimation: (entity, oldPosition, facing, shouldJumpDown, isOnBlock, groundType, completionHandler) => {
        completionHandler();
      },
      playIdleAnimation: () => {},
      playOpenChestAnimation: () => {},
    },
  });

  const player = new Player(controller, "Player", 1, 1, "Player", true, 1);
  player.updateHidingBlock = () => {};
  controller.levelModel.moveForward = () => {
    player.setMovePosition([2, 1]);
  };
  controller.levelModel.groundPlane = mockPlane;

  const data = [
    '', '', '', '',
    '', '', '', 'Chest',
    '', '', '', '',
  ];
  const actionPlane = new LevelPlane(data, 4, 3, null, "actionPlane");
  const chest = actionPlane.getBlockAt([3, 1]);
  controller.levelModel.actionPlane = actionPlane;

  t.equal(chest.isOpen, false);
  player.doMoveForward();
  t.equal(chest.isOpen, true);

  t.end();
});

test('canPlaceBlock, by entity case', t => {
  const walkableBlocks = ["rails", "redstoneWire"].map((type) => new LevelBlock(type));
  const emptyBlock = new LevelBlock("");

  const player = new Player(mockGameController, "Player", 1, 1, "Player", true, 1);
  const agent = new Agent(mockGameController, "PlayerAgent", 1, 1, "Agent", true, 1);

  // If there is something in the actionPlane that's walkable, it should still block placement.
  walkableBlocks.forEach((block) => {
    t.false(agent.canPlaceBlock(block));
  });
  // The Player should follow the same rules.
  walkableBlocks.forEach((block) => {
    t.false(player.canPlaceBlock(block));
  });

  // Blocks should be placeable if the actionPlane is empty.
  t.true(agent.canPlaceBlock(emptyBlock));
  t.true(player.canPlaceBlock(emptyBlock));

  t.end();
});

test('sheep Drop', t => {
  const sheep = new Sheep(mockGameController, "Sheep", "Sheep", 1, 1, 1);

  // Sheep starts !naked
  t.false(sheep.naked);
  // if(!naked) drop returns true and sets naked = true;
  t.true(sheep.drop(null, "wool"));
  t.true(sheep.naked);
  // if(naked) drop returns false
  t.false(sheep.drop(null, "wool"));

  t.end();
});
