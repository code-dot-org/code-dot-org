/* global Blockly, goog */
/* global assert, assertNull, assertNotNull, assertEquals, assertFalse */
'use strict';

function test_aggregateCounts() {
  // counts numbers
  assertEquals(1, Blockly.aggregateCounts([1,2,3])[1]);
  assertEquals(2, Blockly.aggregateCounts([1,1,3])[1]);
  assertEquals(1, Blockly.aggregateCounts([1,1,3])[3]);
  assertEquals(undefined, Blockly.aggregateCounts([1,3])[2]);

  // counts strings
  assertEquals(1, Blockly.aggregateCounts(['foo', 'bar', 'baz'])['foo']);
  assertEquals(2, Blockly.aggregateCounts(['foo', 'foo', 'baz'])['foo']);
}
