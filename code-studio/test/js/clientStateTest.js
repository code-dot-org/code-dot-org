/** @file Tests for clientState.js */

'use strict';

var assert = require('assert');
window.$ = require('jquery');
require('jquery.cookie');
var state = require('../../src/js/clientState');
var chai = require('chai');

chai.should();

describe("clientState#sourceForLevel", function() {

  beforeEach(function () {
    state.reset();
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
    sessionStorage.setItem('source_sample_4', 'bad data');
    assert(state.sourceForLevel('sample', 4, null) === undefined);
  });
});

describe("clientState#trackProgress", function() {

  beforeEach(function() {
    state.reset();
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

  it("handles malformed cookies for level progress", function () {
    $.cookie('progress', null, {expires: 365, path: '/'});
    state.levelProgress('sample', 1).should.equal(0);

    $.cookie('progress', '', {expires: 365, path: '/'});
    state.levelProgress('sample', 1).should.equal(0);

    $.cookie('progress', '{\'malformed_json\':true', {expires: 365, path: '/'});
    state.levelProgress('sample', 1).should.equal(0);

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
    state.reset();
  });

  it("Does not record line counts when level progress does not have a line count", function () {
    $.cookie('lines', 50, {expires: 365, path: '/'});
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

  it("Handled malformed line counts in cookie", function () {
    $.cookie('lines', NaN, {expires: 365, path: '/'});
    state.lines().should.equal(0);
    state.trackProgress(true, 50, 100, 1);
    state.lines().should.equal(50);
    $.cookie('lines').should.equal('50');
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
    sessionStorage.setItem('video', null);
    state.hasSeenVideo('someVideo').should.equal(false);
    state.recordVideoSeen('someVideo');
    state.hasSeenVideo('someVideo').should.equal(true);

    sessionStorage.setItem('video', '');
    state.hasSeenVideo('someVideo').should.equal(false);
    state.recordVideoSeen('someVideo');
    state.hasSeenVideo('someVideo').should.equal(true);

    sessionStorage.setItem('video', '{\'malformed_json\': true');
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
    sessionStorage.setItem('callout', null);
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);

    sessionStorage.setItem('callout', '');
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);

    sessionStorage.setItem('callout', '{\'malformed_json\': true');
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);
  });
});

describe("clientState#reset", function() {

  beforeEach(function() {
    state.reset();
  });

  it("Resetting client state actually resets everything", function () {
    state.recordCalloutSeen('someCallout');
    state.recordVideoSeen('someVideo');
    state.trackProgress(true, 5, 100, 'sample', 1);

    state.hasSeenCallout('someCallout').should.equal(true);
    state.hasSeenVideo('someVideo').should.equal(true);
    state.levelProgress('sample', 1).should.equal(100);
    state.lines().should.equal(5);

    state.reset();

    state.hasSeenCallout('someCallout').should.equal(false);
    state.hasSeenVideo('someVideo').should.equal(false);
    state.levelProgress('sample', 1).should.equal(0);
    state.lines().should.equal(0);
  });
});
