// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.testing.fs.EntryTest');
goog.setTestOnly('goog.testing.fs.EntryTest');

goog.require('goog.fs.DirectoryEntry');
goog.require('goog.fs.Error');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.fs.FileSystem');
goog.require('goog.testing.jsunit');

var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();
var fs, file, mockClock;

function setUp() {
  mockClock = new goog.testing.MockClock(true);

  fs = new goog.testing.fs.FileSystem();
  file = fs.getRoot().
      getDirectorySync('foo', goog.fs.DirectoryEntry.Behavior.CREATE).
      getFileSync('bar', goog.fs.DirectoryEntry.Behavior.CREATE);
}

function tearDown() {
  mockClock.uninstall();
}

function testGetName() {
  assertEquals('bar', file.getName());
}

function testGetFullPath() {
  assertEquals('/foo/bar', file.getFullPath());
  assertEquals('/', fs.getRoot().getFullPath());
}

function testGetFileSystem() {
  assertEquals(fs, file.getFileSystem());
}

function testMoveTo() {
  file.moveTo(fs.getRoot()).addCallback(function(newFile) {
    assertTrue(file.deleted);
    assertFalse(newFile.deleted);
    assertEquals('/bar', newFile.getFullPath());
    assertEquals(fs.getRoot(), newFile.parent);
    assertEquals(newFile, fs.getRoot().getFileSync('bar'));
    assertFalse(fs.getRoot().getDirectorySync('foo').hasChild('bar'));

    asyncTestCase.continueTesting();
  });
  waitForAsync('waiting for file move');
}

function testMoveToNewName() {
  // Advance the clock to an arbitrary, known time.
  mockClock.tick(71);
  file.moveTo(fs.getRoot(), 'baz').
      addCallback(function(newFile) {
        mockClock.tick();
        assertTrue(file.deleted);
        assertFalse(newFile.deleted);
        assertEquals('/baz', newFile.getFullPath());
        assertEquals(fs.getRoot(), newFile.parent);
        assertEquals(newFile, fs.getRoot().getFileSync('baz'));

        var oldParentDir = fs.getRoot().getDirectorySync('foo');
        assertFalse(oldParentDir.hasChild('bar'));
        assertFalse(oldParentDir.hasChild('baz'));

        return oldParentDir.getLastModified();
      }).
      addCallback(function(lastModifiedDate) {
        assertEquals(71, lastModifiedDate.getTime());
        var oldParentDir = fs.getRoot().getDirectorySync('foo');
        return oldParentDir.getMetadata();
      }).
      addCallback(function(metadata) {
        assertEquals(71, metadata.modificationTime.getTime());
        return fs.getRoot().getLastModified();
      }).
      addCallback(function(rootLastModifiedDate) {
        assertEquals(71, rootLastModifiedDate.getTime());
        return fs.getRoot().getMetadata();
      }).
      addCallback(function(rootMetadata) {
        assertEquals(71, rootMetadata.modificationTime.getTime());
        asyncTestCase.continueTesting();
      });
  waitForAsync('waiting for file move');
}

function testMoveDeletedFile() {
  assertFailsWhenDeleted(function() { return file.moveTo(fs.getRoot()); });
}

function testCopyTo() {
  mockClock.tick(61);
  file.copyTo(fs.getRoot()).
      addCallback(function(newFile) {
        assertFalse(file.deleted);
        assertFalse(newFile.deleted);
        assertEquals('/bar', newFile.getFullPath());
        assertEquals(fs.getRoot(), newFile.parent);
        assertEquals(newFile, fs.getRoot().getFileSync('bar'));

        var oldParentDir = fs.getRoot().getDirectorySync('foo');
        assertEquals(file, oldParentDir.getFileSync('bar'));
        return oldParentDir.getLastModified();
      }).
      addCallback(function(lastModifiedDate) {
        assertEquals('The original parent directory was not modified.',
                     0, lastModifiedDate.getTime());
        var oldParentDir = fs.getRoot().getDirectorySync('foo');
        return oldParentDir.getMetadata();
      }).
      addCallback(function(metadata) {
        assertEquals('The original parent directory was not modified.',
                     0, metadata.modificationTime.getTime());
        return fs.getRoot().getLastModified();
      }).
      addCallback(function(rootLastModifiedDate) {
        assertEquals(61, rootLastModifiedDate.getTime());
        return fs.getRoot().getMetadata();
      }).
      addCallback(function(rootMetadata) {
        assertEquals(61, rootMetadata.modificationTime.getTime());
        asyncTestCase.continueTesting();
      });
  waitForAsync('waiting for file copy');
}

function testCopyToNewName() {
  file.copyTo(fs.getRoot(), 'baz').addCallback(function(newFile) {
    assertFalse(file.deleted);
    assertFalse(newFile.deleted);
    assertEquals('/baz', newFile.getFullPath());
    assertEquals(fs.getRoot(), newFile.parent);
    assertEquals(newFile, fs.getRoot().getFileSync('baz'));
    assertEquals(file, fs.getRoot().getDirectorySync('foo').getFileSync('bar'));
    assertFalse(fs.getRoot().getDirectorySync('foo').hasChild('baz'));

    asyncTestCase.continueTesting();
  });
  waitForAsync('waiting for file copy');
}

function testCopyDeletedFile() {
  assertFailsWhenDeleted(function() { return file.copyTo(fs.getRoot()); });
}

function testRemove() {
  mockClock.tick(57);
  file.remove().
      addCallback(function() {
        mockClock.tick();
        var parentDir = fs.getRoot().getDirectorySync('foo');

        assertTrue(file.deleted);
        assertFalse(parentDir.hasChild('bar'));

        return parentDir.getLastModified();
      }).
      addCallback(function(date) {
        assertEquals(57, date.getTime());
        var parentDir = fs.getRoot().getDirectorySync('foo');
        return parentDir.getMetadata();
      }).
      addCallback(function(metadata) {
        assertEquals(57, metadata.modificationTime.getTime());
        asyncTestCase.continueTesting();
      });
  waitForAsync('waiting for file removal');
}

function testRemoveDeletedFile() {
  assertFailsWhenDeleted(function() { return file.remove(); });
}

function testGetParent() {
  file.getParent().addCallback(function(p) {
    assertEquals(file.parent, p);
    assertEquals(fs.getRoot().getDirectorySync('foo'), p);
    assertEquals('/foo', p.getFullPath());

    asyncTestCase.continueTesting();
  });
  waitForAsync('waiting for file parent');
}

function testGetDeletedFileParent() {
  assertFailsWhenDeleted(function() { return file.getParent(); });
}


function assertFailsWhenDeleted(fn) {
  file.remove().addCallback(fn).
      addCallback(function() { fail('Expected an error'); }).
      addErrback(function(err) {
        assertEquals(goog.fs.Error.ErrorCode.NOT_FOUND, err.code);
        asyncTestCase.continueTesting();
      });
  waitForAsync('waiting for file operation');
}

function waitForAsync(msg) {
  asyncTestCase.waitForAsync(msg);
  mockClock.tick();
}
