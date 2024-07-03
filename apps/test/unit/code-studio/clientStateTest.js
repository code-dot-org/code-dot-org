/** @file Tests for clientState.js */

var assert = require('assert');
var chai = require('chai');

var state = require('@cdo/apps/code-studio/clientState');

expect(chai)();

describe('clientState#sourceForLevel', function () {
  beforeEach(function () {
    state.reset();
  });

  it('returns cached levelSource if timestamp is newer', function () {
    state.writeSourceForLevel('sample', 1, 200, 'abc');
    var source = state.sourceForLevel('sample', 1, 100);
    expect(source).toBe('abc');
  });

  it('returns cached levelSource if no timestamp given', function () {
    state.writeSourceForLevel('sample', 2, 300, 'zzz');
    expect(state.sourceForLevel('sample', 2, null)).toBe('zzz');
  });

  it('returns `undefined` if timestamp is older', function () {
    state.writeSourceForLevel('sample', 3, 100, 'abc');
    assert(state.sourceForLevel('sample', 3, 200) === undefined);
  });

  it("returns `undefined` if cache can't be parsed", function () {
    state.writeSourceForLevel('sample', 4, 100, 'abc');
    sessionStorage.setItem('source_sample_4', 'bad data');
    assert(state.sourceForLevel('sample', 4, null) === undefined);
  });
});

describe('clientState#queryParams', function () {
  it('parses query params', function () {
    window.history.replaceState('', '', '?foo=1&bar=2');

    var params = state.queryParams();
    expect(params.foo).toBe('1');
    expect(params.bar).toBe('2');

    expect(state.queryParams('foo')).toBe('1');
    expect(state.queryParams('bar')).toBe('2');
  });
});

describe('clientState#hasSeenVideo/hasSeenCallout', function () {
  beforeEach(function () {
    state.reset();
  });

  it('records video progress', function () {
    expect(state.hasSeenVideo('video1')).toBe(false);
    expect(state.hasSeenVideo('video2')).toBe(false);

    state.recordVideoSeen('video1');
    expect(state.hasSeenVideo('video1')).toBe(true);
    expect(state.hasSeenVideo('video2')).toBe(false);

    state.recordVideoSeen('video2');
    expect(state.hasSeenVideo('video1')).toBe(true);
    expect(state.hasSeenVideo('video2')).toBe(true);

    //Check idempotency
    state.recordVideoSeen('video1');
    expect(state.hasSeenVideo('video1')).toBe(true);
    expect(state.hasSeenVideo('video2')).toBe(true);
  });

  it('handles malformed storage for video progress', function () {
    sessionStorage.setItem('video', null);
    expect(state.hasSeenVideo('someVideo')).toBe(false);
    state.recordVideoSeen('someVideo');
    expect(state.hasSeenVideo('someVideo')).toBe(true);

    sessionStorage.setItem('video', '');
    expect(state.hasSeenVideo('someVideo')).toBe(false);
    state.recordVideoSeen('someVideo');
    expect(state.hasSeenVideo('someVideo')).toBe(true);

    sessionStorage.setItem('video', "{'malformed_json': true");
    expect(state.hasSeenVideo('someVideo')).toBe(false);
    state.recordVideoSeen('someVideo');
    expect(state.hasSeenVideo('someVideo')).toBe(true);
  });

  it('records callouts seen', function () {
    expect(state.hasSeenCallout('callout1')).toBe(false);
    expect(state.hasSeenCallout('callout2')).toBe(false);

    state.recordCalloutSeen('callout1');
    expect(state.hasSeenCallout('callout1')).toBe(true);
    expect(state.hasSeenCallout('callout2')).toBe(false);

    state.recordCalloutSeen('callout2');
    expect(state.hasSeenCallout('callout1')).toBe(true);
    expect(state.hasSeenCallout('callout2')).toBe(true);

    //Check idempotency
    state.recordCalloutSeen('callout1');
    expect(state.hasSeenCallout('callout1')).toBe(true);
    expect(state.hasSeenCallout('callout2')).toBe(true);
  });

  it('handles malformed storage for callouts seen', function () {
    sessionStorage.setItem('callout', null);
    expect(state.hasSeenCallout('someCallout')).toBe(false);
    state.recordCalloutSeen('someCallout');
    expect(state.hasSeenCallout('someCallout')).toBe(true);

    sessionStorage.setItem('callout', '');
    expect(state.hasSeenCallout('someCallout')).toBe(false);
    state.recordCalloutSeen('someCallout');
    expect(state.hasSeenCallout('someCallout')).toBe(true);

    sessionStorage.setItem('callout', "{'malformed_json': true");
    expect(state.hasSeenCallout('someCallout')).toBe(false);
    state.recordCalloutSeen('someCallout');
    expect(state.hasSeenCallout('someCallout')).toBe(true);
  });
});

describe('clientState#reset', function () {
  beforeEach(function () {
    state.reset();
  });

  it('Resetting client state actually resets everything', function () {
    state.recordCalloutSeen('someCallout');
    state.recordVideoSeen('someVideo');

    expect(state.hasSeenCallout('someCallout')).toBe(true);
    expect(state.hasSeenVideo('someVideo')).toBe(true);

    state.reset();

    expect(state.hasSeenCallout('someCallout')).toBe(false);
    expect(state.hasSeenVideo('someVideo')).toBe(false);
  });
});
