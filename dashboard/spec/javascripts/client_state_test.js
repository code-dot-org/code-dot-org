//= require client_state

describe("clientState#levelProgress", function() {
  beforeEach(function() {
    dashboard.clientState.reset();
  });

  it("records level progress", function() {
    dashboard.clientState.levelProgress(100).should.equal(0);
    dashboard.clientState.setLevelProgress(100, 50);
    dashboard.clientState.levelProgress(100).should.equal(50);
    dashboard.clientState.levelProgress(200).should.equal(0);
    dashboard.clientState.setLevelProgress(100, 100);
    dashboard.clientState.setLevelProgress(200, 50);
    dashboard.clientState.levelProgress(100).should.equal(100);
    dashboard.clientState.levelProgress(200).should.equal(50);
  });
});

describe("clientState#lines", function() {
  beforeEach(function() {
    dashboard.clientState.reset();
  });

  it("adds lines completed", function() {
    dashboard.clientState.lines().should.equal(0);
    dashboard.clientState.addLines(42);
    dashboard.clientState.lines().should.equal(42);
    dashboard.clientState.addLines(20);
    dashboard.clientState.lines().should.equal(62);
  });
});

