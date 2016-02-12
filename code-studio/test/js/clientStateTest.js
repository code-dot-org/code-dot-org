/** @file Tests for clientState.js */

'use strict';

var assert = require('assert');
require('jquery.cookie');
var state = require('../../src/js/clientState')();
var chai = require('chai');

chai.should();

function resetState() {
  state.setAnonymousUser();
  state.reset();
}

describe("clientState#sourceForLevel", function() {

  beforeEach(function () {
    resetState();
  });

  it("returns cached levelSource if timestamp is newer", function () {
    state.writeSourceForLevel('sample', 1, 200, 'abc');
    var source = state.sourceForLevel('sample', 1, 100);
    source.should.equal('abc');
  });

  it("returns cached levelSource if no timestamp given", function () {
    state.writeSourceForLevel('sample', 2, 300, 'zzz');
    state.sourceForLevel('sample', 2, null).should.equal('zzz');
  });

  it("returns `undefined` if timestamp is older", function () {
    state.writeSourceForLevel('sample', 3, 100, 'abc');
    assert(state.sourceForLevel('sample', 3, 200) === undefined);
  });

  it("returns `undefined` if cache can't be parsed", function () {
    state.writeSourceForLevel('sample', 4, 100, 'abc');
    state.setItemForTest('source_sample_4', 'bad data');
    assert(state.sourceForLevel('sample', 4, null) === undefined);
  });
});

describe("clientState#trackProgress", function() {

  beforeEach(function() {
    resetState();
  });

  it("records level progress and line counts when level is completed", function() {
    state.levelProgress('sample', 1).should.equal(0);
    state.levelProgress('sample', 2).should.equal(0);
    state.lines().should.equal(0);

    //User has passed a level with optimal solution
    state.trackProgress(true, 5, 100, 'sample', 1);
    state.levelProgress('sample', 1).should.equal(100);
    state.levelProgress('sample', 2).should.equal(0);
    state.lines().should.equal(5);

    //User has passed another level but with suboptimal solution
    state.trackProgress(true, 10, 20, 'sample', 2);
    state.levelProgress('sample', 1).should.equal(100);
    state.levelProgress('sample', 2).should.equal(20);
    state.lines().should.equal(15);

    //User passes the the same level but with a better solution
    state.trackProgress(true, 5, 100, 'sample', 2);
    state.levelProgress('sample', 1).should.equal(100);
    state.levelProgress('sample', 2).should.equal(100);
    state.lines().should.equal(20);
  });

  it("records level progress but not line counts when level is failed", function() {
    state.levelProgress('sample', 1).should.equal(0);
    state.levelProgress('sample', 2).should.equal(0);
    state.lines().should.equal(0);

    //User has failed a level
    state.trackProgress(false, 5, 3, 'sample', 1);
    state.levelProgress('sample', 1).should.equal(3);
    state.levelProgress('sample', 2).should.equal(0);
    state.lines().should.equal(0);

    //User failed a different level
    state.trackProgress(false, 5, 3, 'sample', 2);
    state.levelProgress('sample', 1).should.equal(3);
    state.levelProgress('sample', 2).should.equal(3);
    state.lines().should.equal(0);
  });

  it("records level progress truncates line count at a certain level", function () {
    state.trackProgress(true, 999, 20, 'sample', 1);
    state.levelProgress('sample', 1).should.equal(20);
    state.lines().should.equal(999);

    state.trackProgress(true, 5, 100, 'sample', 2);
    state.levelProgress('sample', 2).should.equal(100);
    state.lines().should.equal(1000);

    state.trackProgress(true, 1, 100, 'sample', 1);
    state.lines().should.equal(1000);
  });

  it("records level progress does not allow negative line counts", function () {
    state.trackProgress(true, 10, 100, 'sample', 1);
    state.levelProgress('sample', 1).should.equal(100);
    state.lines().should.equal(10);

    state.trackProgress(true, -10, 100, 'sample', 1);
    state.levelProgress('sample', 1).should.equal(100);
    state.lines().should.equal(10);
  });

});

describe("clientState#queryParams", function() {
  it("parses query params", function () {
    window.history.replaceState("", "", "?foo=1&bar=2");

    var params = state.queryParams();
    params.foo.should.equal('1');
    params.bar.should.equal('2');

    state.queryParams('foo').should.equal('1');
    state.queryParams('bar').should.equal('2');
  });
});

describe("clientState#hasSeenVideo/hasSeenCallout", function() {

  beforeEach(function() {
    resetState();
  });

  it("Does not record line counts when level progress does not have a line count", function () {
    state.trackProgress(true, 50, 100, 1);
    state.lines().should.equal(50);
    state.trackProgress(true, undefined, 100, 1);
    state.lines().should.equal(50);
    state.trackProgress(true, Infinity, 100, 2);
    state.lines().should.equal(50);
    state.trackProgress(true, NaN, 100, 3);
    state.lines().should.equal(50);
    state.trackProgress(true, '', 100, 4);
    state.lines().should.equal(50);
    state.trackProgress(true, 50, 100, 5);
    state.lines().should.equal(100);
  });

  it("records video progress", function () {
    state.hasSeenVideo('video1').should.equal(false);
    state.hasSeenVideo('video2').should.equal(false);

    state.recordVideoSeen('video1');
    state.hasSeenVideo('video1').should.equal(true);
    state.hasSeenVideo('video2').should.equal(false);

    state.recordVideoSeen('video2');
    state.hasSeenVideo('video1').should.equal(true);
    state.hasSeenVideo('video2').should.equal(true);

    //Check idempotency
    state.recordVideoSeen('video1');
    state.hasSeenVideo('video1').should.equal(true);
    state.hasSeenVideo('video2').should.equal(true);
  });

  it("handles malformed storage for video progress", function () {
    state.setItemForTest('video', null);
    state.hasSeenVideo('someVideo').should.equal(false);
    state.recordVideoSeen('someVideo');
    state.hasSeenVideo('someVideo').should.equal(true);

    state.setItemForTest('video', '');
    state.hasSeenVideo('someVideo').should.equal(false);
    state.recordVideoSeen('someVideo');
    state.hasSeenVideo('someVideo').should.equal(true);

    state.setItemForTest('video', '{\'malformed_json\': true');
    state.hasSeenVideo('someVideo').should.equal(false);
    state.recordVideoSeen('someVideo');
    state.hasSeenVideo('someVideo').should.equal(true);
  });

  it("records callouts seen", function () {
    state.hasSeenCallout('callout1').should.equal(false);
    state.hasSeenCallout('callout2').should.equal(false);

    state.recordCalloutSeen('callout1');
    state.hasSeenCallout('callout1').should.equal(true);
    state.hasSeenCallout('callout2').should.equal(false);

    state.recordCalloutSeen('callout2');
    state.hasSeenCallout('callout1').should.equal(true);
    state.hasSeenCallout('callout2').should.equal(true);

    //Check idempotency
    state.recordCalloutSeen('callout1');
    state.hasSeenCallout('callout1').should.equal(true);
    state.hasSeenCallout('callout2').should.equal(true);
  });

  it("handles malformed storage for callouts seen", function () {
    state.setItemForTest('callout', null);
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);

    state.setItemForTest('callout', '');
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);

    state.setItemForTest('callout', '{\'malformed_json\': true');
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);
  });
});

describe("clientState#reset", function() {

  beforeEach(function() {
    resetState();
  });

  it("Resetting client state actually resets everything", function () {
    state.recordCalloutSeen('someCallout');
    state.recordVideoSeen('someVideo');
    state.trackProgress(true, 5, 100, 'sample', 1);

    state.hasSeenCallout('someCallout').should.equal(true);
    state.hasSeenVideo('someVideo').should.equal(true);
    state.levelProgress('sample', 1).should.equal(100);
    state.lines().should.equal(5);

    resetState();

    state.hasSeenCallout('someCallout').should.equal(false);
    state.hasSeenVideo('someVideo').should.equal(false);
    state.levelProgress('sample', 1).should.equal(0);
    state.lines().should.equal(0);
  });
});

describe("clientState#setCurrentUserKey", function() {

  beforeEach(function () {
    resetState();
  });

  it("tracks state on a per-user basis", function () {
    // Track some progress for an anonymous user and make sure it is preserved.
    var user1_key = 'user1';
    var user1_lines = 10;
    var user1_level = 1;
    var user2_key = 'user2';
    var user2_level = 2;
    state.setCurrentUserKey(user1_key);
    state.trackProgress(true, user1_lines, 100, 'sample', user1_level);
    state.recordVideoSeen('user1_video');

    state.levelProgress('sample', user1_level).should.equal(100);
    state.levelProgress('sample', user2_level).should.equal(0);
    state.lines().should.equal(user1_lines);
    state.hasSeenVideo('user1_video').should.equal(true);
    state.hasSeenVideo('user2_video').should.equal(false);

    // Switch to user2 and verify that no state leaks.
    state.setCurrentUserKey(user2_key);
    state.levelProgress('sample', 1).should.equal(0);
    state.lines().should.equal(0);
    state.hasSeenVideo('video1').should.equal(false);

    // Set state for user2 and verify it is recorded correctly.
    var user2_lines = 50;
    state.trackProgress(true, user2_lines, 100, 'sample', 2);
    state.recordVideoSeen('user2_video');

    state.levelProgress('sample', user1_level).should.equal(0);
    state.levelProgress('sample', user2_level).should.equal(100);
    state.lines().should.equal(user2_lines);
    state.hasSeenVideo('user1_video').should.equal(false);
    state.hasSeenVideo('user2_video').should.equal(true);

    // Switch back to user1 and verify that user1 state is still present.
    state.setCurrentUserKey(user1_key);
    state.levelProgress('sample', user1_level).should.equal(100);
    state.levelProgress('sample', user2_level).should.equal(0);
    state.lines().should.equal(user1_lines);
    state.hasSeenVideo('user1_video').should.equal(true);
    state.hasSeenVideo('user2_video').should.equal(false);

    // Switch to an anonymous user and verify that state is tracked.
    state.setAnonymousUser();
    state.recordVideoSeen('anon_video');
    state.hasSeenVideo('anon_video').should.equal(true);
    state.hasSeenVideo('user1_video').should.equal(false);
    state.hasSeenVideo('user2_video').should.equal(false);

    // Redundantly setting to an anonymous user should preserve the state.
    state.setAnonymousUser();
    state.hasSeenVideo('anon_video').should.equal(true);

    // Switch back to user2 and verify that user2 state is still present.
    state.setCurrentUserKey(user2_key);
    state.levelProgress('sample', user1_level).should.equal(0);
    state.levelProgress('sample', user2_level).should.equal(100);
    state.lines().should.equal(user2_lines);
    state.hasSeenVideo('anon_video').should.equal(false);
    state.hasSeenVideo('user1_video').should.equal(false);
    state.hasSeenVideo('user2_video').should.equal(true);

    // Reset the state for user2 and verify that all progress is reset.
    state.reset();
    state.levelProgress('sample', user2_level).should.equal(0);
    state.lines().should.equal(0);
    state.hasSeenVideo('user2_video').should.equal(false);

    // Switch back to user1 and verify that the state has not reset.
    state.setCurrentUserKey(user1_key);
    state.levelProgress('sample', user1_level).should.equal(100);
    state.lines().should.equal(user1_lines);
    state.hasSeenVideo('user1_video').should.equal(true);

    // Switch to an anonymous user and verify that past anonymous or user state is not present.
    state.setAnonymousUser();
    state.hasSeenVideo('anon_video').should.equal(false);
    state.hasSeenVideo('user1_video').should.equal(false);
    state.levelProgress('sample', user1_level).should.equal(0);
  });
});
