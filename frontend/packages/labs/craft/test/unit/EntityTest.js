import { describe, it, expect } from 'vitest';

import LevelBlock from '../../src/js/game/LevelMVC/LevelBlock';
import LevelPlane from '../../src/js/game/LevelMVC/LevelPlane';
import BaseEntity from '../../src/js/game/Entities/BaseEntity';
import Sheep from '../../src/js/game/Entities/Sheep';
import Player from '../../src/js/game/Entities/Player';
import Agent from '../../src/js/game/Entities/Agent';

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

it('canPlaceBlockOver', () => {
  const solidBlocks = ["dirt", "cobblestone"].map((type) => new LevelBlock(type));
  const liquidBlocks = ["water", "lava"].map((type) => new LevelBlock(type));

  const baseEntity = new BaseEntity(mockGameController, "Entity", "Entity", 1, 1, 1);
  const player = new Player(mockGameController, "Player", 1, 1, "Player", true, 1);
  const agent = new Agent(mockGameController, "PlayerAgent", 1, 1, "Agent", true, 1);

  // default entities can't place blocks at all
  solidBlocks.concat(liquidBlocks).forEach((block) => {
    expect(baseEntity.canPlaceBlockOver(new LevelBlock("anything"), block).canPlace).toBe(false);
  });

  // Player can only place on the ground plane if on top of water or lava
  solidBlocks.forEach((block) => {
    const result = player.canPlaceBlockOver(new LevelBlock("anything"), block);
    expect(result.canPlace).toBe(true);
    expect(result.plane).toBe("actionPlane");
  });
  liquidBlocks.forEach((block) => {
    const result = player.canPlaceBlockOver(new LevelBlock("anything"), block);
    expect(result.canPlace).toBe(true);
    expect(result.plane).toBe("groundPlane");
  });

  // Player can only place wheat on farmland
  const wheat = new LevelBlock("cropWheat");
  const farmland = new LevelBlock("farmlandWet");
  solidBlocks.concat(liquidBlocks).forEach((block) => {
    expect(player.canPlaceBlockOver(wheat, block).canPlace).toBe(false);
  });
  expect(player.canPlaceBlockOver(wheat, farmland).canPlace).toBe(true);

  // Agents can only place solid blocks if they are standing on liquid
  solidBlocks.forEach((blockToPlace) => {
    solidBlocks.forEach((groundBlock) => {
      expect(agent.canPlaceBlockOver(blockToPlace, groundBlock).canPlace).toBe(false);
    });
    liquidBlocks.forEach((groundBlock) => {
      expect(agent.canPlaceBlockOver(blockToPlace, groundBlock).canPlace).toBe(true);
    });
  });

  // Agents cannot place redstone, pistons, rails, or torches on liquid
  ["redstoneWire", "piston", "rails", "torch", "railsRedstoneTorch"].map((type) => new LevelBlock(type)).forEach((blockToPlace) => {
    liquidBlocks.forEach((groundBlock) => {
      expect(agent.canPlaceBlockOver(blockToPlace, groundBlock).canPlace).toBe(false);
    });
  });

  // Agents will place redstone and rails on the action plane
  ["redstoneWire", "rails"].map((type) => new LevelBlock(type)).forEach((blockToPlace) => {
    solidBlocks.forEach((groundBlock) => {
      expect(agent.canPlaceBlockOver(blockToPlace, groundBlock).plane).toBe("actionPlane");
    });
  });

});

it('playerCanOpenTreasureChest', () => {
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

  expect(chest.isOpen).toBe(false);
  player.doMoveForward();
  expect(chest.isOpen).toBe(true);

});

it('canPlaceBlock, by entity case', () => {
  const walkableBlocks = ["rails", "redstoneWire"].map((type) => new LevelBlock(type));
  const emptyBlock = new LevelBlock("");

  const player = new Player(mockGameController, "Player", 1, 1, "Player", true, 1);
  const agent = new Agent(mockGameController, "PlayerAgent", 1, 1, "Agent", true, 1);

  // If there is something in the actionPlane that's walkable, it should still block placement.
  walkableBlocks.forEach((block) => {
    expect(agent.canPlaceBlock(block)).toBe(false);
  });
  // The Player should follow the same rules.
  walkableBlocks.forEach((block) => {
    expect(player.canPlaceBlock(block)).toBe(false);
  });

  // Blocks should be placeable if the actionPlane is empty.
  expect(agent.canPlaceBlock(emptyBlock)).toBe(true);
  expect(player.canPlaceBlock(emptyBlock)).toBe(true);

});

it('sheep Drop', () => {
  const sheep = new Sheep(mockGameController, "Sheep", "Sheep", 1, 1, 1);

  // Sheep starts !naked
  expect(sheep.naked).toBe(false);
  // if(!naked) drop returns true and sets naked = true;
  expect(sheep.drop(null, "wool")).toBe(true);
  expect(sheep.naked).toBe(true);
  // if(naked) drop returns false
  expect(sheep.drop(null, "wool")).toBe(false);

});
