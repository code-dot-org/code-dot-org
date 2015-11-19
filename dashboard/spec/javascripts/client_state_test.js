/* global dashboard */

//= require client_state
//= require jquery.cookie

describe("clientState#trackProgress", function() {
  var state = dashboard.clientState;

  beforeEach(function() {
    state.reset();
  });

  it("returns cached levelSource if timestamp is newer", function () {
    state.writeSourceForLevel('sample', 'a', 200, 'abc');
    state.sourceForLevel('sample', 'a', 100).should.equal('abc');
  });

  it("returns cached levelSource if no timestamp given", function () {
    state.writeSourceForLevel('sample', 'b', 300, 'zzz');
    state.sourceForLevel('sample', 'b', null).should.equal('zzz');
  });

  it("returns `undefined` if timestamp is older", function () {
    state.writeSourceForLevel('sample', 'c', 100, 'abc');
    assert(state.sourceForLevel('sample', 'c', 200) === undefined);
  });

  it("returns `undefined` if cache can't be parsed", function () {
    state.writeSourceForLevel('sample', 'd', 100, 'abc');
    localStorage.setItem('source_sample_d', 'bad data');
    assert(state.sourceForLevel('sample', 'd', null) === undefined);
  });

  it("records level progress and line counts when level is completed", function() {
    state.levelProgress('sample', 'a').should.equal(0);
    state.levelProgress('sample', 'b').should.equal(0);
    state.lines().should.equal(0);

    //User has passed a level with optimal solution
    state.trackProgress(true, 5, 100, 'sample', 'a');
    state.levelProgress('sample', 'a').should.equal(100);
    state.levelProgress('sample', 'b').should.equal(0);
    state.lines().should.equal(5);

    //User has passed another level but with suboptimal solution
    state.trackProgress(true, 10, 20, 'sample', 'b');
    state.levelProgress('sample', 'a').should.equal(100);
    state.levelProgress('sample', 'b').should.equal(20);
    state.lines().should.equal(15);

    //User passes the the same level but with a better solution
    state.trackProgress(true, 5, 100, 'sample', 'b');
    state.levelProgress('sample', 'a').should.equal(100);
    state.levelProgress('sample', 'b').should.equal(100);
    state.lines().should.equal(20);
  });

  it("records level progress but not line counts when level is failed", function() {
    state.levelProgress('sample', 'a').should.equal(0);
    state.levelProgress('sample', 'b').should.equal(0);
    state.lines().should.equal(0);

    //User has failed a level
    state.trackProgress(false, 5, 3, 'sample', 'a');
    state.levelProgress('sample', 'a').should.equal(3);
    state.levelProgress('sample', 'b').should.equal(0);
    state.lines().should.equal(0);

    //User failed a different level
    state.trackProgress(false, 5, 3, 'sample', 'b');
    state.levelProgress('sample', 'a').should.equal(3);
    state.levelProgress('sample', 'b').should.equal(3);
    state.lines().should.equal(0);
  });

  it("records level progress truncates line count at a certain level", function () {
    state.trackProgress(true, 999, 20, 'sample', 'a');
    state.levelProgress('sample', 'a').should.equal(20);
    state.lines().should.equal(999);

    state.trackProgress(true, 5, 100, 'sample', 'b');
    state.levelProgress('sample', 'b').should.equal(100);
    state.lines().should.equal(1000);

    state.trackProgress(true, 1, 100, 'sample', 'a');
    state.lines().should.equal(1000);
  });

  it("records level progress does not allow negative line counts", function () {
    state.trackProgress(true, 10, 100, 'sample', 'a');
    state.levelProgress('sample', 'a').should.equal(100);
    state.lines().should.equal(10);

    state.trackProgress(true, -10, 100, 'sample', 'a');
    state.levelProgress('sample', 'a').should.equal(100);
    state.lines().should.equal(10);
  });

  it("handles malformed cookies for level progress", function () {
    $.cookie('progress', null, {expires: 365, path: '/'});
    state.levelProgress('sample', 'a').should.equal(0);

    $.cookie('progress', '', {expires: 365, path: '/'});
    state.levelProgress('sample', 'a').should.equal(0);

    $.cookie('progress', '{\'malformed_json\':true', {expires: 365, path: '/'});
    state.levelProgress('sample', 'a').should.equal(0);

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
    localStorage.setItem('video', null);
    state.hasSeenVideo('someVideo').should.equal(false);
    state.recordVideoSeen('someVideo');
    state.hasSeenVideo('someVideo').should.equal(true);

    localStorage.setItem('video', '');
    state.hasSeenVideo('someVideo').should.equal(false);
    state.recordVideoSeen('someVideo');
    state.hasSeenVideo('someVideo').should.equal(true);

    localStorage.setItem('video', '{\'malformed_json\': true');
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
    localStorage.setItem('callout', null);
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);

    localStorage.setItem('callout', '');
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);

    localStorage.setItem('callout', '{\'malformed_json\': true');
    state.hasSeenCallout('someCallout').should.equal(false);
    state.recordCalloutSeen('someCallout');
    state.hasSeenCallout('someCallout').should.equal(true);
  });

  it("Resetting client state actually resets everything", function () {
    state.recordCalloutSeen('someCallout');
    state.recordVideoSeen('someVideo');
    state.trackProgress(true, 5, 100, 'sample', 'a');

    state.hasSeenCallout('someCallout').should.equal(true);
    state.hasSeenVideo('someVideo').should.equal(true);
    state.levelProgress('sample', 'a').should.equal(100);
    state.lines().should.equal(5);

    state.reset();

    state.hasSeenCallout('someCallout').should.equal(false);
    state.hasSeenVideo('someVideo').should.equal(false);
    state.levelProgress('sample', 'a').should.equal(0);
    state.lines().should.equal(0);
  })
});

