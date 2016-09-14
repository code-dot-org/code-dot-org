/* global Blockly, goog */
/* global assert, assertNull, assertNotNull, assertEquals, assertFalse */

'use strict';

function test_blockLimits() {
  var blockLimits = new Blockly.BlockLimits();

  blockLimits.events.listen('change', function (eventObject) {
    var limit = blockLimits.limits_[eventObject.type];
    assertEquals(limit.limit, eventObject.limit);
    assertEquals(limit.count + eventObject.remaining, limit.limit);
  });

  assertEquals(blockLimits.hasBlockLimits(), false);

  blockLimits.setLimit('test_block', 1);
  assertEquals(true, blockLimits.hasBlockLimits());

  // limit of 1, can only add one
  assertEquals(1, blockLimits.getLimit('test_block'));
  assertEquals(true, blockLimits.canAddBlocks(['test_block']));
  assertEquals(false, blockLimits.canAddBlocks(['test_block', 'test_block']));
  assertEquals(true, blockLimits.canAddBlocks(['test_block', 'other_block']));

  // added one, cannot add any more
  blockLimits.updateBlockTotals(['test_block']);
  assertEquals(false, blockLimits.canAddBlocks(['test_block']));
  assertEquals(true, blockLimits.canAddBlocks(['other_block']));

  // added some other block, can add one again
  blockLimits.updateBlockTotals(['other_block']);
  assertEquals(true, blockLimits.canAddBlocks(['test_block']));
  assertEquals(true, blockLimits.canAddBlocks(['other_block']));

  // added one and another, cannot add any more
  blockLimits.updateBlockTotals(['other_block', 'test_block']);
  assertEquals(false, blockLimits.canAddBlocks(['test_block']));
  assertEquals(true, blockLimits.canAddBlocks(['other_block']));

  // update limit to 2!
  blockLimits.setLimit('test_block', 2);
  assertEquals(2, blockLimits.getLimit('test_block'));

  // can add only two
  assertEquals(true, blockLimits.canAddBlocks(['test_block']));
  assertEquals(true, blockLimits.canAddBlocks(['other_block']));
  assertEquals(true, blockLimits.canAddBlocks(['test_block', 'test_block']));
  assertEquals(false, blockLimits.canAddBlocks(['test_block', 'test_block', 'test_block']));

  // add one, can add only one more
  blockLimits.updateBlockTotals(['test_block']);
  assertEquals(true, blockLimits.canAddBlocks(['test_block']));
  assertEquals(false, blockLimits.canAddBlocks(['test_block', 'test_block']));
}
