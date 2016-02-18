var tickWrapper = require('./util/tickWrapper');
var assert = require('./util/testUtils').assert;

function createFakeApp() {
  return {
    tickCount: 0,
    onTick: function () {
      console.log("actual");
      this.tickCount++;
    }
  };
}

describe('tickWrapper', function () {
  afterEach(function () {
    tickWrapper.reset();
  });

  it('runOnAppTick', function () {
    var app1 = createFakeApp();

    var calledMe = false;

    tickWrapper.runOnAppTick(app1, 2, function () {
      calledMe = true;
    });

    app1.onTick();
    assert.equal(calledMe, false);
    assert.equal(app1.tickCount, 1);

    app1.onTick();
    assert.equal(calledMe, false);
    assert.equal(app1.tickCount, 2);

    app1.onTick();
    assert.equal(calledMe, true);
    assert.equal(app1.tickCount, 3);
  });

  it('tickAppUntil', function (done) {
    var app1 = createFakeApp();

    tickWrapper.tickAppUntil(app1, function () {
      console.log("predicate");
      return app1.tickCount === 3;
    }).then(function () {
      // tickCount is 4 because our predicate function runs at the beginning of
      // the loop, and our original onTick is still called before we get to
      // promise resolution
      assert.equal(app1.tickCount, 4);
      done();
    });

    app1.onTick();
    app1.onTick();
    app1.onTick();
    app1.onTick();
  });

  it('reset', function () {
    var app1 = createFakeApp();
    var originalOnTick = app1.onTick;

    var calledMe = false;
    tickWrapper.runOnAppTick(app1, 2, function () {
      calledMe = true;
    });

    app1.onTick();
    app1.onTick();
    assert.equal(calledMe, false);
    tickWrapper.reset();
    app1.onTick();
    assert.equal(calledMe, false, 'didnt call on tick 2 because of reset');
    assert.equal(app1.tickCount, 3);
    assert.equal(app1.onTick, originalOnTick);
  });
});
