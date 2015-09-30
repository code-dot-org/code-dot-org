//= require client_state

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
});

