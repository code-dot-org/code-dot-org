import {assert} from '../util/deprecatedChai';
var tickWrapper = require('./../integration/util/tickWrapper');

function createFakeApp() {
  return {
    tickCount: 0,
    onTick: function() {
      this.tickCount++;
    }
  };
}

describe('tickWrapper', function() {
  afterEach(function() {
    tickWrapper.reset();
  });

  it('runOnAppTick', function() {
    var app1 = createFakeApp();

    var calledMe = false;
    tickWrapper.runOnAppTick(app1, 2, function() {
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

  it('tickAppUntil', function(done) {
    var app1 = createFakeApp();

    tickWrapper
      .tickAppUntil(app1, function() {
        return app1.tickCount === 3;
      })
      .then(function() {
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

  it('never calls action if reset before tick count', function() {
    var app1 = createFakeApp();
    app1.onTick;

    var calledMe = false;
    tickWrapper.runOnAppTick(app1, 3, function() {
      calledMe = true;
    });

    app1.onTick();
    app1.onTick();
    assert.equal(calledMe, false);
    assert.equal(app1.tickCount, 2);
    tickWrapper.reset();
    app1.onTick();
    app1.onTick();
    assert.equal(app1.tickCount, 4);
    assert.equal(
      calledMe,
      false,
      'Didnt call function even though we hit tick count, because of reset'
    );
  });

  it('can have multiple preTick functions, and reset successfully', function() {
    var app1 = createFakeApp();
    var originalOnTick = app1.onTick;

    var predicate1Calls = 0;
    var predicate2Calls = 0;

    tickWrapper.tickAppUntil(app1, function() {
      predicate1Calls++;
      return false;
    });
    tickWrapper.tickAppUntil(app1, function() {
      predicate2Calls++;
      return false;
    });

    app1.onTick();
    app1.onTick();
    assert.equal(predicate1Calls, 2);
    assert.equal(predicate2Calls, 2);
    assert.equal(app1.tickCount, 2);
    tickWrapper.reset();
    app1.onTick();
    assert.equal(app1.tickCount, 3);
    assert.equal(predicate1Calls, 2, 'stopped calling predicate1');
    assert.equal(predicate2Calls, 2, 'stopped calling predicate2');
    assert.equal(app1.onTick, originalOnTick);
  });
});
