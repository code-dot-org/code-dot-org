/* global dashboard */

//= require client_state
//= require jquery.cookie

describe("clientState#trackProgress", function() {
  var state = dashboard.clientState;

  beforeEach(function() {
    state.reset();
  });

  it("returns cached levelSource if timestamp is newer", function () {
    state.writeSourceForLevel(1, 200, 'abc');
    state.sourceForLevel(1, 100).should.equal('abc');
  });

  it("returns cached levelSource if no timestamp given", function () {
    state.writeSourceForLevel(2, 300, 'abc');
    state.sourceForLevel(2, null).should.equal('abc');
  });

  it("returns `undefined` if timestamp is older", function () {
    state.writeSourceForLevel(3, 100, 'abc');
    assert(state.sourceForLevel(3, 200) === undefined);
  });

  it("returns `undefined` if cache can't be parsed", function () {
    localStorage.setItem('source4', 'bad data');
    assert(state.sourceForLevel(4, 200) === undefined);
  });

  it("records level progress and line counts when level is completed", function() {
    state.levelProgress(1).should.equal(0);
    state.levelProgress(2).should.equal(0);
    state.lines().should.equal(0);

    //User has passed a level with optimal solution
    state.trackProgress(true, 5, 100, 1);
    state.levelProgress(1).should.equal(100);
    state.levelProgress(2).should.equal(0);
    state.lines().should.equal(5);

    //User has passed another level but with suboptimal solution
    state.trackProgress(true, 10, 20, 2);
    state.levelProgress(1).should.equal(100);
    state.levelProgress(2).should.equal(20);
    state.lines().should.equal(15);

    //User passes the the same level but with a better solution
    state.trackProgress(true, 5, 100, 2);
    state.levelProgress(1).should.equal(100);
    state.levelProgress(2).should.equal(100);
    state.lines().should.equal(20);
  });

  it("records level progress but not line counts when level is failed", function() {
    state.levelProgress(1).should.equal(0);
    state.levelProgress(2).should.equal(0);
    state.lines().should.equal(0);

    //User has failed a level
    state.trackProgress(false, 5, 3, 1);
    state.levelProgress(1).should.equal(3);
    state.levelProgress(2).should.equal(0);
    state.lines().should.equal(0);

    //User failed a different level
    state.trackProgress(false, 5, 3, 2);
    state.levelProgress(1).should.equal(3);
    state.levelProgress(2).should.equal(3);
    state.lines().should.equal(0);
  });

  it("records level progress truncates line count at a certain level", function () {
    state.trackProgress(true, 999, 20, 1);
    state.levelProgress(1).should.equal(20);
    state.lines().should.equal(999);

    state.trackProgress(true, 5, 100, 2);
    state.levelProgress(2).should.equal(100);
    state.lines().should.equal(1000);

    state.trackProgress(true, 1, 100, 1);
    state.lines().should.equal(1000);
  });

  it("records level progress does not allow negative line counts", function () {
    state.trackProgress(true, 10, 100, 1);
    state.levelProgress(1).should.equal(100);
    state.lines().should.equal(10);

    state.trackProgress(true, -10, 100, 1);
    state.levelProgress(1).should.equal(100);
    state.lines().should.equal(10);
  });

  it("handles malformed cookies for level progress", function () {
    $.cookie('progress', null, {expires: 365, path: '/'});
    state.levelProgress(1).should.equal(0);

    $.cookie('progress', '', {expires: 365, path: '/'});
    state.levelProgress(1).should.equal(0);

    $.cookie('progress', '{\'malformed_json\':true', {expires: 365, path: '/'});
    state.levelProgress(1).should.equal(0);

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
    state.trackProgress(true, 5, 100, 1);

    state.hasSeenCallout('someCallout').should.equal(true);
    state.hasSeenVideo('someVideo').should.equal(true);
    state.levelProgress(1).should.equal(100);
    state.lines().should.equal(5);

    state.reset();

    state.hasSeenCallout('someCallout').should.equal(false);
    state.hasSeenVideo('someVideo').should.equal(false);
    state.levelProgress(1).should.equal(0);
    state.lines().should.equal(0);
  })
});

