/** @file Tests for clientState.js */

var assert = require('assert');
var state = require('@cdo/apps/code-studio/clientState');
var chai = require('chai');

chai.should();

describe('clientState#sourceForLevel', function() {
  beforeEach(function() {
    state.reset();
  });

  it('returns cached levelSource if timestamp is newer', function() {
    state.writeSourceForLevel('sample', 1, 200, 'abc');
    var source = state.sourceForLevel('sample', 1, 100);
    source.should.equal('abc');
  });

  it('returns cached levelSource if no timestamp given', function() {
    state.writeSourceForLevel('sample', 2, 300, 'zzz');
    state.sourceForLevel('sample', 2, null).should.equal('zzz');
  });

  it('returns `undefined` if timestamp is older', function() {
    state.writeSourceForLevel('sample', 3, 100, 'abc');
    assert(state.sourceForLevel('sample', 3, 200) === undefined);
  });

  it("returns `undefined` if cache can't be parsed", function() {
    state.writeSourceForLevel('sample', 4, 100, 'abc');
    sessionStorage.setItem('source_sample_4', 'bad data');
    assert(state.sourceForLevel('sample', 4, null) === undefined);
  });
});

describe('clientState#trackLines', function() {
  beforeEach(function() {
    state.reset();
  });

  it('records line counts when level is completed', function() {
    state.lines().should.equal(0);

    //User has passed a level
    state.trackLines(true, 5);
    state.lines().should.equal(5);

    //User has passed another level
    state.trackLines(true, 10);
    state.lines().should.equal(15);
  });

  it('does not record line counts when level is failed', function() {
    state.lines().should.equal(0);

    //User has failed a level
    state.trackLines(false, 5);
    state.lines().should.equal(0);
  });

  it('truncates line count at a certain level', function() {
    state.trackLines(true, 999);
    state.lines().should.equal(999);

    state.trackLines(true, 5);
    state.lines().should.equal(1000);

    state.trackLines(true, 1);
    state.lines().should.equal(1000);
  });

  it('does not allow negative line counts', function() {
    state.trackLines(true, 10);
    state.lines().should.equal(10);

    state.trackLines(true, -10);
    state.lines().should.equal(10);
  });

  it('Does not record line counts when level progress does not have a line count', function() {
    sessionStorage.setItem('lines', 50);
    state.lines().should.equal(50);
    state.trackLines(true, undefined);
    state.lines().should.equal(50);
    state.trackLines(true, Infinity);
    state.lines().should.equal(50);
    state.trackLines(true, NaN);
    state.lines().should.equal(50);
    state.trackLines(true, '');
    state.lines().should.equal(50);
    state.trackLines(true, 50);
    state.lines().should.equal(100);
  });

  it('Handled malformed line counts in session storage', function() {
    sessionStorage.setItem('lines', NaN);
    state.lines().should.equal(0);
    state.trackLines(true, 50);
    state.lines().should.equal(50);
  });
});

describe('clientState#queryParams', function() {
  it('parses query params', function() {
    window.history.replaceState('', '', '?foo=1&bar=2');

    var params = state.queryParams();
    params.foo.should.equal('1');
    params.bar.should.equal('2');

    state.queryParams('foo').should.equal('1');
    state.queryParams('bar').should.equal('2');
  });
});

describe('clientState#hasSeenVideo/hasSeenCallout', function() {
  beforeEach(function() {
    state.reset();
  });

  it('records video progress', function() {
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

  it('handles malformed storage for video progress', function() {
    sessionStorage.setItem('video', null);
    state.hasSeenVideo('someVideo').should.equal(false);
    state.recordVideoSeen('someVideo');
    state.hasSeenVideo('someVideo').should.equal(true);

    sessionStorage.setItem('video', '');
    state.hasSeenVideo('someVideo').should.equal(false);
    state.recordVideoSeen('someVideo');
    state.hasSeenVideo('someVideo').should.equal(true);

    sessionStorage.setItem('video', "{'malformed_json': true");
    state.hasSeenVideo('someVideo').should.equal(false);
    state.recordVideoSeen('someVideo');
    state.hasSeenVideo('someVideo').should.equal(true);
  });

  it('records callouts seen', function() {
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

  it('handles malformed storage for callouts seen', function() {
    sessionStorage.setItem('callout', null);
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);

    sessionStorage.setItem('callout', '');
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);

    sessionStorage.setItem('callout', "{'malformed_json': true");
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);
  });
});

describe('clientState#reset', function() {
  beforeEach(function() {
    state.reset();
  });

  it('Resetting client state actually resets everything', function() {
    state.recordCalloutSeen('someCallout');
    state.recordVideoSeen('someVideo');
    state.trackLines(true, 5);

    state.hasSeenCallout('someCallout').should.equal(true);
    state.hasSeenVideo('someVideo').should.equal(true);
    state.lines().should.equal(5);

    state.reset();

    state.hasSeenCallout('someCallout').should.equal(false);
    state.hasSeenVideo('someVideo').should.equal(false);
    state.lines().should.equal(0);
  });
});
