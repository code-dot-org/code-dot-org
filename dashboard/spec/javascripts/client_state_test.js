//= require client_state
//= require jquery.cookie

describe("clientState#levelProgress", function() {
  beforeEach(function() {
    dashboard.clientState.reset();
  });

  it("records level progress", function() {
    var state = dashboard.clientState;
    state.levelProgress(100).should.equal(0);
    state.setLevelProgress(100, 50);
    state.levelProgress(100).should.equal(50);
    state.levelProgress(200).should.equal(0);
    state.allLevelsProgress().should.eql({"100": 50})
    state.setLevelProgress(100, 100);
    state.setLevelProgress(200, 50);
    state.levelProgress(100).should.equal(100);
    state.levelProgress(200).should.equal(50);
    state.allLevelsProgress().should.eql({"100": 100, "200": 50})
  });

  it("handles malformed level progress cookies", function() {
    $.cookie('progress', '',  {expires: 365})
    var state = dashboard.clientState;
    state.levelProgress(100).should.equal(0);

    $.cookie('progress', '[(*', {expires: 365})
    state.levelProgress(100).should.equal(0);

    state.setLevelProgress(100, 10);
    state.levelProgress(100).should.equal(10);
  });

});


describe("clientState#lines", function() {
  beforeEach(function() {
    dashboard.clientState.reset();
  });

  it("adds lines completed", function() {
    var state = dashboard.clientState;
    state.lines().should.equal(0);
    state.addLines(42);
    state.lines().should.equal(42);
    state.addLines(20);
    state.lines().should.equal(62);
  });

  it("handles malformed lines cookies", function() {
    $.cookie('lines', '',  {expires: 365})
    var state = dashboard.clientState;
    state.lines().should.equal(0);

    $.cookie('progress', '[ab', {expires: 365})
    state.lines().should.equal(0);

    state.addLines(10);
    state.lines().should.equal(10);
  });
});

