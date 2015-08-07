/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

function verify_DB_(msg, expected, db) {
   var equal = (expected.length == db.length);
   if (equal) {
     for (var x = 0; x < expected.length; x++) {
       if (expected[x] != db[x]) {
         equal = false;
         break;
       }
     }
   }
   if (equal) {
     assertTrue(msg, true);
   } else {
     assertEquals(msg, expected, db);
   }
}

function test_DB_addConnection() {
  var db = new Blockly.ConnectionDB();
  var o2 = {y_: 2};
  db.addConnection_(o2);
  verify_DB_('Adding connection #2', [o2], db);

  var o4 = {y_: 4};
  db.addConnection_(o4);
  verify_DB_('Adding connection #4', [o2, o4], db);

  var o1 = {y_: 1};
  db.addConnection_(o1);
  verify_DB_('Adding connection #1', [o1, o2, o4], db);

  var o3a = {y_: 3};
  db.addConnection_(o3a);
  verify_DB_('Adding connection #3a', [o1, o2, o3a, o4], db);

  var o3b = {y_: 3};
  db.addConnection_(o3b);
  verify_DB_('Adding connection #3b', [o1, o2, o3b, o3a, o4], db);
}

function test_DB_removeConnection() {
  var db = new Blockly.ConnectionDB();
  var o1 = {y_: 1};
  var o2 = {y_: 2};
  var o3a = {y_: 3};
  var o3b = {y_: 3};
  var o3c = {y_: 3};
  var o4 = {y_: 4};
  db.addConnection_(o1);
  db.addConnection_(o2);
  db.addConnection_(o3c);
  db.addConnection_(o3b);
  db.addConnection_(o3a);
  db.addConnection_(o4);
  verify_DB_('Adding connections 1-4', [o1, o2, o3a, o3b, o3c, o4], db);

  db.removeConnection_(o2);
  verify_DB_('Removing connection #2', [o1, o3a, o3b, o3c, o4], db);

  db.removeConnection_(o4);
  verify_DB_('Removing connection #4', [o1, o3a, o3b, o3c], db);

  db.removeConnection_(o1);
  verify_DB_('Removing connection #1', [o3a, o3b, o3c], db);

  db.removeConnection_(o3a);
  verify_DB_('Removing connection #3a', [o3b, o3c], db);

  db.removeConnection_(o3c);
  verify_DB_('Removing connection #3c', [o3b], db);

  db.removeConnection_(o3b);
  verify_DB_('Removing connection #3b', [], db);
}

function test_addClass() {
  var p = document.createElement('p');
  Blockly.addClass_(p, 'one');
  assertEquals('Adding "one"', 'one', p.className);
  Blockly.addClass_(p, 'one');
  assertEquals('Adding duplicate "one"', 'one', p.className);
  Blockly.addClass_(p, 'two');
  assertEquals('Adding "two"', 'one two', p.className);
  Blockly.addClass_(p, 'two');
  assertEquals('Adding duplicate "two"', 'one two', p.className);
  Blockly.addClass_(p, 'three');
  assertEquals('Adding "three"', 'one two three', p.className);
}

function test_removeClass() {
  var p = document.createElement('p');
  p.className = ' one three  two three  ';
  Blockly.removeClass_(p, 'two');
  assertEquals('Removing "two"', 'one three three', p.className);
  Blockly.removeClass_(p, 'four');
  assertEquals('Removing "four"', 'one three three', p.className);
  Blockly.removeClass_(p, 'three');
  assertEquals('Removing "three"', 'one', p.className);
  Blockly.removeClass_(p, 'ne');
  assertEquals('Removing "ne"', 'one', p.className);
  Blockly.removeClass_(p, 'one');
  assertEquals('Removing "one"', '', p.className);
  Blockly.removeClass_(p, 'zero');
  assertEquals('Removing "zero"', '', p.className);
}

function test_shortestStringLength() {
  var len = Blockly.shortestStringLength('one,two,three,four,five'.split(','));
  assertEquals('Length of "one"', 3, len);
  len = Blockly.shortestStringLength('one,two,three,four,five,'.split(','));
  assertEquals('Length of ""', 0, len);
  len = Blockly.shortestStringLength(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.shortestStringLength([]);
  assertEquals('Empty list', 0, len);
}

function test_commonWordPrefix() {
  var len = Blockly.commonWordPrefix('one,two,three,four,five'.split(','));
  assertEquals('No prefix', 0, len);
  len = Blockly.commonWordPrefix('Xone,Xtwo,Xthree,Xfour,Xfive'.split(','));
  assertEquals('No word prefix', 0, len);
  len = Blockly.commonWordPrefix('abc de,abc de,abc de,abc de'.split(','));
  assertEquals('Full equality', 6, len);
  len = Blockly.commonWordPrefix('abc deX,abc deY'.split(','));
  assertEquals('One word prefix', 4, len);
  len = Blockly.commonWordPrefix('abc de,abc deY'.split(','));
  assertEquals('Overflow no', 4, len);
  len = Blockly.commonWordPrefix('abc de,abc de Y'.split(','));
  assertEquals('Overflow yes', 6, len);
  len = Blockly.commonWordPrefix(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.commonWordPrefix([]);
  assertEquals('Empty list', 0, len);
  len = Blockly.commonWordPrefix('turn&nbsp;left,turn&nbsp;right'.split(','));
  assertEquals('No prefix due to &amp;nbsp;', 0, len);
  len = Blockly.commonWordPrefix('turn\u00A0left,turn\u00A0right'.split(','));
  assertEquals('No prefix due to \\u00A0', 0, len);
}

function test_commonWordSuffix() {
  var len = Blockly.commonWordSuffix('one,two,three,four,five'.split(','));
  assertEquals('No prefix', 0, len);
  len = Blockly.commonWordSuffix('oneX,twoX,threeX,fourX,fiveX'.split(','));
  assertEquals('No word prefix', 0, len);
  len = Blockly.commonWordSuffix('abc de,abc de,abc de,abc de'.split(','));
  assertEquals('Full equality', 6, len);
  len = Blockly.commonWordSuffix('Xabc de,Yabc de'.split(','));
  assertEquals('One word prefix', 3, len);
  len = Blockly.commonWordSuffix('abc de,Yabc de'.split(','));
  assertEquals('Overflow no', 3, len);
  len = Blockly.commonWordSuffix('abc de,Y abc de'.split(','));
  assertEquals('Overflow yes', 6, len);
  len = Blockly.commonWordSuffix(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.commonWordSuffix([]);
  assertEquals('Empty list', 0, len);
}

function test_printerRangeToNumbers() {
  assert('No number', goog.array.equals([], Blockly.printerRangeToNumbers('')));
  assert('Single number', goog.array.equals([1], Blockly.printerRangeToNumbers('1')));
  assert('Multiple numbers', goog.array.equals([1,2,3], Blockly.printerRangeToNumbers('1,2,3')));
  assert('Numbers out of order', goog.array.equals([1,5,2], Blockly.printerRangeToNumbers('1,5,2')));
  assert('Range inclusive', goog.array.equals([1,2,3,4,5], Blockly.printerRangeToNumbers('1-5')));
  assert('Single numbers and a range', goog.array.equals([1,2,3,4,5], Blockly.printerRangeToNumbers('1,2-4,5')));
  assert('Spaces in list', goog.array.equals([1,2,3,4,5], Blockly.printerRangeToNumbers('1, 2-4, 5')));
}

function test_getBoxOverflow() {
  // top right bottom left
  var sameBoxOverflow = Blockly.getBoxOverflow(
    new goog.math.Box(0, 0, 0, 0),
    new goog.math.Box(0, 0, 0, 0));
  assertEquals(0, sameBoxOverflow.top);
  assertEquals(0, sameBoxOverflow.right);
  assertEquals(0, sameBoxOverflow.bottom);
  assertEquals(0, sameBoxOverflow.left);
  var differentBoxesOverflow = Blockly.getBoxOverflow(
    new goog.math.Box(0, 0, 0, 0),
    new goog.math.Box(-1, 2, 3, -4));
  assertEquals(1, differentBoxesOverflow.top);
  assertEquals(2, differentBoxesOverflow.right);
  assertEquals(3, differentBoxesOverflow.bottom);
  assertEquals(4, differentBoxesOverflow.left);
}

function test_isBoxWiderThan() {
  // top right bottom left
  assert(!Blockly.isBoxWiderThan(
    new goog.math.Box(0, 0, 0, 0),
    new goog.math.Box(0, 0, 0, 0)));
  assert(Blockly.isBoxWiderThan(
    new goog.math.Box(0, 1, 0, 0),
    new goog.math.Box(0, 0, 0, 0)));
  assert(!Blockly.isBoxWiderThan(
    new goog.math.Box(0, 0, 0, 0),
    new goog.math.Box(0, 1, 0, 0)));
}

function test_numberWithin() {
  // Within inclusive
  assert(Blockly.numberWithin(1, 1, 5, true));
  assert(Blockly.numberWithin(5, 1, 5, true));
  assert(Blockly.numberWithin(4, 1, 5, true));

  // Not within inclusive
  assert(!Blockly.numberWithin(0, 1, 5, true));
  assert(!Blockly.numberWithin(6, 1, 5, true));
  assert(!Blockly.numberWithin(-1, 1, 5, true));

  // Within exclusive
  assert(Blockly.numberWithin(2, 1, 5, false));
  assert(Blockly.numberWithin(4, 1, 5, false));
  assert(Blockly.numberWithin(4.9, 1, 5, false));

  // Not within exclusive
  assert(!Blockly.numberWithin(1, 1, 5, false));
  assert(!Blockly.numberWithin(5, 1, 5, false));
  assert(!Blockly.numberWithin(6, 1, 5, false));
}


function test_svgRectToRect() {
  /** @type SVGRect */
  var fakeSvgRect = {
    x: 0,
    y: 1,
    width: 2,
    height: 3
  };
  var googRect = Blockly.svgRectToRect(fakeSvgRect);
  assertEquals(0, googRect.left);
  assertEquals(1, googRect.top);
  assertEquals(2, googRect.width);
  assertEquals(3, googRect.height);
}

function test_addToNonZeroSides() {
  var actualBox = new goog.math.Box(1, 0, 0, 0);
  Blockly.addToNonZeroSides(actualBox, 1);
  var expectedBox = new goog.math.Box(2, 0, 0, 0);
  assert(goog.math.Box.equals(expectedBox, actualBox));
}

