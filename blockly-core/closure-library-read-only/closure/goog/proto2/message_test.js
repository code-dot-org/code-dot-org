// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.proto2.MessageTest');
goog.setTestOnly('goog.proto2.MessageTest');

goog.require('goog.testing.jsunit');
goog.require('proto2.TestAllTypes');
goog.require('proto2.TestAllTypes.NestedEnum');
goog.require('proto2.TestAllTypes.NestedMessage');
goog.require('proto2.TestAllTypes.OptionalGroup');
goog.require('proto2.TestAllTypes.RepeatedGroup');

function testEqualsWithEmptyMessages() {
  var message1 = new proto2.TestAllTypes();
  assertTrue('same message object', message1.equals(message1));
  assertFalse('comparison with null', message1.equals(null));
  assertFalse('comparison with undefined', message1.equals(undefined));

  var message2 = new proto2.TestAllTypes();
  assertTrue('two empty message objects', message1.equals(message2));

  var message3 = new proto2.TestAllTypes.NestedMessage();
  assertFalse('different message types', message3.equals(message1));
}

function testEqualsWithSingleInt32Field() {
  var message1 = new proto2.TestAllTypes();
  var message2 = new proto2.TestAllTypes();

  message1.setOptionalInt32(1);
  assertFalse('message1 has an extra int32 field', message1.equals(message2));

  message2.setOptionalInt32(1);
  assertTrue('same int32 field in both messages', message1.equals(message2));

  message2.setOptionalInt32(2);
  assertFalse('different int32 field', message1.equals(message2));

  message1.clearOptionalInt32();
  assertFalse('message2 has an extra int32 field', message1.equals(message2));
}

function testEqualsWithRepeatedInt32Fields() {
  var message1 = new proto2.TestAllTypes();
  var message2 = new proto2.TestAllTypes();

  message1.addRepeatedInt32(0);
  message2.addRepeatedInt32(0);
  assertTrue('equal repeated int32 field', message1.equals(message2));

  message1.addRepeatedInt32(1);
  assertFalse('message1 has more items', message1.equals(message2));

  message2.addRepeatedInt32(1);
  message2.addRepeatedInt32(1);
  assertFalse('message2 has more items', message1.equals(message2));

  message1.addRepeatedInt32(2);
  assertFalse('different int32 items', message1.equals(message2));
}

function testEqualsWithDefaultValue() {
  var message1 = new proto2.TestAllTypes();
  var message2 = new proto2.TestAllTypes();
  message1.setOptionalInt64('1');

  assertEquals('message1.getOptionalInt64OrDefault should return 1',
      '1', message1.getOptionalInt64OrDefault());
  assertEquals('message2.getOptionalInt64OrDefault should return 1 too',
      '1', message2.getOptionalInt64OrDefault());
  assertTrue('message1.hasOptionalInt64() should be true',
      message1.hasOptionalInt64());
  assertFalse('message2.hasOptionalInt64() should be false',
      message2.hasOptionalInt64());
  assertFalse('as a result they are not equal', message1.equals(message2));
}

function testEqualsWithOptionalGroup() {
  var message1 = new proto2.TestAllTypes();
  var message2 = new proto2.TestAllTypes();
  var group1 = new proto2.TestAllTypes.OptionalGroup();
  var group2 = new proto2.TestAllTypes.OptionalGroup();

  message1.setOptionalgroup(group1);
  assertFalse('only message1 has OptionalGroup field',
      message1.equals(message2));

  message2.setOptionalgroup(group2);
  assertTrue('both messages have OptionalGroup field',
      message1.equals(message2));

  group1.setA(0);
  group2.setA(1);
  assertFalse('different value in the optional group',
      message1.equals(message2));

  message1.clearOptionalgroup();
  assertFalse('only message2 has OptionalGroup field',
      message1.equals(message2));
}

function testEqualsWithRepeatedGroup() {
  var message1 = new proto2.TestAllTypes();
  var message2 = new proto2.TestAllTypes();
  var group1 = new proto2.TestAllTypes.RepeatedGroup();
  var group2 = new proto2.TestAllTypes.RepeatedGroup();

  message1.addRepeatedgroup(group1);
  assertFalse('message1 has more RepeatedGroups',
      message1.equals(message2));

  message2.addRepeatedgroup(group2);
  assertTrue('both messages have one RepeatedGroup',
      message1.equals(message2));

  group1.addA(1);
  assertFalse('message1 has more int32s in RepeatedGroup',
      message1.equals(message2));

  group2.addA(1);
  assertTrue('both messages have one int32 in RepeatedGroup',
      message1.equals(message2));

  group1.addA(1);
  group2.addA(2);
  assertFalse('the messages have different int32s in RepeatedGroup',
      message1.equals(message2));
}

function testEqualsWithNestedMessage() {
  var message1 = new proto2.TestAllTypes();
  var message2 = new proto2.TestAllTypes();
  var nested1 = new proto2.TestAllTypes.NestedMessage();
  var nested2 = new proto2.TestAllTypes.NestedMessage();

  message1.setOptionalNestedMessage(nested1);
  assertFalse('only message1 has nested message', message1.equals(message2));

  message2.setOptionalNestedMessage(nested2);
  assertTrue('both messages have nested message', message1.equals(message2));

  nested1.setB(1);
  assertFalse('different int32 in the nested messages',
      message1.equals(message2));

  message1.clearOptionalNestedMessage();
  assertFalse('only message2 has nested message', message1.equals(message2));
}

function testEqualsWithNestedEnum() {
  var message1 = new proto2.TestAllTypes();
  var message2 = new proto2.TestAllTypes();

  message1.setOptionalNestedEnum(proto2.TestAllTypes.NestedEnum.FOO);
  assertFalse('only message1 has nested enum', message1.equals(message2));

  message2.setOptionalNestedEnum(proto2.TestAllTypes.NestedEnum.FOO);
  assertTrue('both messages have nested enum', message1.equals(message2));

  message2.setOptionalNestedEnum(proto2.TestAllTypes.NestedEnum.BAR);
  assertFalse('different enum value', message1.equals(message2));

  message1.clearOptionalNestedEnum();
  assertFalse('only message2 has nested enum', message1.equals(message2));
}

function testEqualsWithUnknownFields() {
  var message1 = new proto2.TestAllTypes();
  var message2 = new proto2.TestAllTypes();
  message1.setUnknown(999, 'foo');
  message1.setUnknown(999, 'bar');
  assertTrue('unknown fields are ignored', message1.equals(message2));
}

function testCloneEmptyMessage() {
  var message = new proto2.TestAllTypes();
  var clone = message.clone();
  assertObjectEquals('cloned empty message', message, clone);
}

function testCloneMessageWithSeveralFields() {
  var message = new proto2.TestAllTypes();
  message.setOptionalInt32(1);
  message.addRepeatedInt32(2);
  var optionalGroup = new proto2.TestAllTypes.OptionalGroup();
  optionalGroup.setA(3);
  message.setOptionalgroup(optionalGroup);
  var repeatedGroup = new proto2.TestAllTypes.RepeatedGroup();
  repeatedGroup.addA(4);
  message.addRepeatedgroup(repeatedGroup);
  var nestedMessage = new proto2.TestAllTypes.NestedMessage();
  nestedMessage.setB(5);
  message.setOptionalNestedMessage(nestedMessage);
  message.setOptionalNestedEnum(proto2.TestAllTypes.NestedEnum.FOO);
  message.setUnknown(999, 'foo');

  var clone = message.clone();
  assertNotEquals('different OptionalGroup instance',
      message.getOptionalgroup(), clone.getOptionalgroup());
  assertNotEquals('different RepeatedGroup array instance',
      message.repeatedgroupArray(), clone.repeatedgroupArray());
  assertNotEquals('different RepeatedGroup array item instance',
      message.getRepeatedgroup(0), clone.getRepeatedgroup(0));
  assertNotEquals('different NestedMessage instance',
      message.getOptionalNestedMessage(), clone.getOptionalNestedMessage());
}

function testCloneWithUnknownFields() {
  var message = new proto2.TestAllTypes();
  message.setUnknown(999, 'foo');

  var clone = message.clone();
  assertTrue('clone.equals(message) returns true', clone.equals(message));
  clone.forEachUnknown(function(tag, value) {
    fail('the unknown fields should not have been cloned');
  });

  clone.setUnknown(999, 'foo');
  assertObjectEquals('the original and the cloned message are equal except ' +
      'for the unknown fields', message, clone);
}

function testCopyFromSameMessage() {
  var source = new proto2.TestAllTypes();
  source.setOptionalInt32(32);
  source.copyFrom(source);
  assertEquals(32, source.getOptionalInt32());
}

function testCopyFromFlatMessage() {
  // Recursive copying is implicitly tested in the testClone... methods.

  var source = new proto2.TestAllTypes();
  source.setOptionalInt32(32);
  source.setOptionalInt64('64');
  source.addRepeatedInt32(32);

  var target = new proto2.TestAllTypes();
  target.setOptionalInt32(33);
  target.setOptionalUint32(33);
  target.addRepeatedInt32(33);

  target.copyFrom(source);
  assertObjectEquals('source and target are equal after copyFrom', source,
      target);

  target.copyFrom(source);
  assertObjectEquals('second copyFrom call has no effect', source, target);

  source.setUnknown(999, 'foo');
  target.setUnknown(999, 'bar');
  target.copyFrom(source);
  assertThrows('unknown fields are not copied',
      goog.partial(assertObjectEquals, source, target));
}

function testMergeFromEmptyMessage() {
  var source = new proto2.TestAllTypes();
  source.setOptionalInt32(32);
  source.setOptionalInt64('64');
  var nested = new proto2.TestAllTypes.NestedMessage();
  nested.setB(66);
  source.setOptionalNestedMessage(nested);

  var target = new proto2.TestAllTypes();
  target.mergeFrom(source);
  assertObjectEquals('source and target are equal after mergeFrom', source,
      target);
}

function testMergeFromFlatMessage() {
  var source = new proto2.TestAllTypes();
  source.setOptionalInt32(32);
  source.setOptionalString('foo');
  source.setOptionalNestedEnum(proto2.TestAllTypes.NestedEnum.FOO);

  var target = new proto2.TestAllTypes();
  target.setOptionalInt64('64');
  target.setOptionalString('bar');
  target.setOptionalNestedEnum(proto2.TestAllTypes.NestedEnum.BAR);

  var expected = new proto2.TestAllTypes();
  expected.setOptionalInt32(32);
  expected.setOptionalInt64('64');
  expected.setOptionalString('foo');
  expected.setOptionalNestedEnum(proto2.TestAllTypes.NestedEnum.FOO);

  target.mergeFrom(source);
  assertObjectEquals('expected and target are equal after mergeFrom', expected,
      target);
}

function testMergeFromNestedMessage() {
  var source = new proto2.TestAllTypes();
  var nested = new proto2.TestAllTypes.NestedMessage();
  nested.setB(66);
  source.setOptionalNestedMessage(nested);

  var target = new proto2.TestAllTypes();
  nested = new proto2.TestAllTypes.NestedMessage();
  nested.setC(77);
  target.setOptionalNestedMessage(nested);

  var expected = new proto2.TestAllTypes();
  nested = new proto2.TestAllTypes.NestedMessage();
  nested.setB(66);
  nested.setC(77);
  expected.setOptionalNestedMessage(nested);

  target.mergeFrom(source);
  assertObjectEquals('expected and target are equal after mergeFrom', expected,
      target);
}

function testMergeFromRepeatedMessage() {
  var source = new proto2.TestAllTypes();
  source.addRepeatedInt32(2);
  source.addRepeatedInt32(3);

  var target = new proto2.TestAllTypes();
  target.addRepeatedInt32(1);

  target.mergeFrom(source);
  assertArrayEquals('repeated_int32 array has elements from both messages',
      [1, 2, 3], target.repeatedInt32Array());
}

function testInitDefaultsWithEmptyMessage() {
  var message = new proto2.TestAllTypes();
  message.initDefaults(false);

  assertFalse('int32 field is not set', message.hasOptionalInt32());
  assertFalse('int64 [default=1] field is not set', message.hasOptionalInt64());
  assertTrue('optional group field is set', message.hasOptionalgroup());
  assertFalse('int32 inside the group is not set',
      message.getOptionalgroup().hasA());
  assertObjectEquals('value of the optional group',
      new proto2.TestAllTypes.OptionalGroup(), message.getOptionalgroup());
  assertTrue('nested message is set', message.hasOptionalNestedMessage());
  assertObjectEquals('value of the nested message',
      new proto2.TestAllTypes.NestedMessage(),
      message.getOptionalNestedMessage());
  assertFalse('nested enum is not set', message.hasOptionalNestedEnum());
  assertFalse('repeated int32 is not set', message.hasRepeatedInt32());
  assertFalse('repeated nested message is not set',
      message.hasRepeatedNestedMessage());

  message = new proto2.TestAllTypes();
  message.initDefaults(true);

  assertTrue('int32 field is set', message.hasOptionalInt32());
  assertEquals('value of the int32 field', 0, message.getOptionalInt32());
  assertTrue('int64 [default=1] field is set', message.hasOptionalInt64());
  assertEquals('value of the int64 field', '1', message.getOptionalInt64());
  assertTrue('int32 inside nested message is set',
      message.getOptionalNestedMessage().hasB());
  assertEquals('value of the int32 field inside the nested message', 0,
      message.getOptionalNestedMessage().getB());
}

function testInitDefaultsWithNonEmptyMessage() {
  var message = new proto2.TestAllTypes();
  message.setOptionalInt32(32);
  message.setOptionalInt64('64');
  message.setOptionalgroup(new proto2.TestAllTypes.OptionalGroup());
  var nested1 = new proto2.TestAllTypes.NestedMessage();
  nested1.setB(66);
  message.setOptionalNestedMessage(nested1);
  var nested2 = new proto2.TestAllTypes.NestedMessage();
  message.addRepeatedNestedMessage(nested2);
  var nested3 = new proto2.TestAllTypes.NestedMessage();
  nested3.setB(66);
  message.addRepeatedNestedMessage(nested3);

  message.initDefaults(true);
  assertEquals('int32 field is unchanged', 32, message.getOptionalInt32());
  assertEquals('int64 [default=1] field is unchanged', '64',
      message.getOptionalInt64());
  assertTrue('bool field is initialized', message.hasOptionalBool());
  assertFalse('value of the bool field', message.getOptionalBool());
  assertTrue('int32 inside the optional group is initialized',
      message.getOptionalgroup().hasA());
  assertEquals('value of the int32 inside the optional group', 0,
      message.getOptionalgroup().getA());
  assertEquals('int32 inside nested message is unchanged', 66,
      message.getOptionalNestedMessage().getB());
  assertTrue('int32 at index 0 of the repeated nested message is initialized',
      message.getRepeatedNestedMessage(0).hasB());
  assertEquals('value of int32 at index 0 of the repeated nested message', 0,
      message.getRepeatedNestedMessage(0).getB());
  assertEquals('int32 at index 1 of the repeated nested message is unchanged',
      66, message.getRepeatedNestedMessage(1).getB());
}

function testInitDefaultsTwice() {
  var message = new proto2.TestAllTypes();
  message.initDefaults(false);
  var clone = message.clone();
  clone.initDefaults(false);
  assertObjectEquals('second call of initDefaults(false) has no effect',
      message, clone);

  message = new proto2.TestAllTypes();
  message.initDefaults(true);
  clone = message.clone();
  clone.initDefaults(true);
  assertObjectEquals('second call of initDefaults(true) has no effect',
      message, clone);
}

function testInitDefaultsThenClone() {
  var message = new proto2.TestAllTypes();
  message.initDefaults(true);
  assertObjectEquals('message is cloned properly', message, message.clone());
}

function testGetAfterSetWithLazyDeserializer() {
  // Test makes sure that the lazy deserializer for a field is not
  // erroneously called when get$Value is called after set$Value.
  var message = new proto2.TestAllTypes();

  var fakeDeserializer = {}; // stub with no methods defined; fails hard
  message.initializeForLazyDeserializer(fakeDeserializer, {} /* data */);
  message.setOptionalBool(true);
  assertEquals(true, message.getOptionalBool());
}

function testHasOnLazyDeserializer() {
  // Test that null values for fields are treated as absent by the lazy
  // deserializer.
  var message = new proto2.TestAllTypes();

  var fakeDeserializer = {}; // stub with no methods defined; fails hard
  message.initializeForLazyDeserializer(fakeDeserializer,
      {13: false} /* data */);
  assertEquals(true, message.hasOptionalBool());
}

function testHasOnLazyDeserializerWithNulls() {
  // Test that null values for fields are treated as absent by the lazy
  // deserializer.
  var message = new proto2.TestAllTypes();

  var fakeDeserializer = {}; // stub with no methods defined; fails hard
  message.initializeForLazyDeserializer(fakeDeserializer,
      {13: null} /* data */);
  assertEquals(false, message.hasOptionalBool());
}
