import { describe, it, expect } from 'vitest';

import LevelBlock from '../../src/js/game/LevelMVC/LevelBlock';

it('isMiniblock', () => {
  const defaultBlock = new LevelBlock("");
  expect(defaultBlock.getIsMiniblock()).toBe(false);

  const miniBlock = new LevelBlock("diamondMiniblock");
  expect(miniBlock.getIsMiniblock()).toBe(true);

});

it('getMiniblockFrame', () => {
  // All the various forms of redstone resolve to the same thing
  [
    'oreRedstone',
    'redstoneDust',
    'redstoneDustMiniblock',
    'redstoneWire',
    'redstoneWireHorizontal',
    'redstoneWireOn',
    'redstoneWireTUp',
  ].forEach(blockType => {
    expect(LevelBlock.getMiniblockFrame(blockType)).toBe("redstoneDust");
  });

  // Rails give us nothing
  expect(LevelBlock.getMiniblockFrame("rails")).toBe("railNormal");
  expect(LevelBlock.getMiniblockFrame("glass")).toBe(undefined);
  expect(LevelBlock.getMiniblockFrame("ice")).toBe(undefined);

  // Generally, the in-world blocks, the miniblock-specific blocks, and the
  // miniblock frame itself should all resolve to just the miniblock frame
  [
    "oreDiamond",
    "diamondMiniblock",
    "diamond"
  ].forEach(blockType => {
    expect(LevelBlock.getMiniblockFrame(blockType)).toBe("diamond");
  });

});
