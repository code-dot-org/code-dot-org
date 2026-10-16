const test = require('tape');

const LevelBlock = require('../../src/js/game/LevelMVC/LevelBlock');

test('isMiniblock', t => {
  const defaultBlock = new LevelBlock("");
  t.equal(defaultBlock.getIsMiniblock(), false);

  const miniBlock = new LevelBlock("diamondMiniblock");
  t.equal(miniBlock.getIsMiniblock(), true);

  t.end();
});

test('getMiniblockFrame', t => {
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
    t.equal(LevelBlock.getMiniblockFrame(blockType), "redstoneDust");
  });

  // Rails give us nothing
  t.equal(LevelBlock.getMiniblockFrame("rails"), "railNormal");
  t.equal(LevelBlock.getMiniblockFrame("glass"), undefined);
  t.equal(LevelBlock.getMiniblockFrame("ice"), undefined);

  // Generally, the in-world blocks, the miniblock-specific blocks, and the
  // miniblock frame itself should all resolve to just the miniblock frame
  [
    "oreDiamond",
    "diamondMiniblock",
    "diamond"
  ].forEach(blockType => {
    t.equal(LevelBlock.getMiniblockFrame(blockType), "diamond");
  });

  t.end();
});
