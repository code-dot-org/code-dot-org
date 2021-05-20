import {assert} from '../util/deprecatedChai';
import JSInterpreter from '@cdo/apps/lib/tools/jsinterpreter/JSInterpreter';
var testUtils = require('./../util/testUtils');

var runState = require('@cdo/apps/redux/runState');

describe('runState', () => {
  testUtils.setExternalGlobals();

  describe('stepSpeed', function() {
    var reducer = runState.default;

    it('is initially 1', function() {
      var state = reducer(null, {});
      assert.strictEqual(state.stepSpeed, 1);
    });

    it('remains 1 when set to null', function() {
      var state = reducer(null, runState.setStepSpeed(null));
      assert.strictEqual(state.stepSpeed, 1);
    });

    it('remains 1 when set to undefined', function() {
      var state = reducer(null, runState.setStepSpeed(undefined));
      assert.strictEqual(state.stepSpeed, 1);
    });

    it('can be set to 0.0', function() {
      var state = reducer(null, runState.setStepSpeed(0.0));
      assert.strictEqual(state.stepSpeed, 0);
    });

    it('can be set to a decimal', function() {
      var state = reducer(null, runState.setStepSpeed(0.5));
      assert.strictEqual(state.stepSpeed, 0.5);
    });
  });

  describe('isRunning reducer', function() {
    var reducer = runState.default;

    it('starts out false', function() {
      var state = reducer(null, {});
      assert.strictEqual(state.isRunning, false);
    });

    it('can be set to true when false', function() {
      var previousState = {
        isRunning: false
      };
      var state = reducer(previousState, runState.setIsRunning(true));
      assert.strictEqual(state.isRunning, true);
    });

    it('can be set to false when true', function() {
      var previousState = {
        isRunning: true
      };
      var state = reducer(previousState, runState.setIsRunning(false));
      assert.strictEqual(state.isRunning, false);
    });

    it('can be set to true when already true', function() {
      var previousState = {
        isRunning: true
      };
      var state = reducer(previousState, runState.setIsRunning(true));
      assert.strictEqual(state.isRunning, true);
    });

    it('sets isDebuggerPaused to false when running is set to false', function() {
      var previousState = {
        isRunning: false,
        isDebuggerPaused: true
      };
      var state = reducer(previousState, runState.setIsRunning(false));
      assert.strictEqual(state.isRunning, false);
      assert.strictEqual(state.isDebuggerPaused, false);
    });

    it('doesnt change isDebuggerPaused when set to true', function() {
      var previousState = {
        isRunning: true,
        isDebuggerPaused: true
      };
      var state = reducer(previousState, runState.setIsRunning(true));
      assert.strictEqual(state.isRunning, true);
      assert.strictEqual(state.isDebuggerPaused, true);
    });

    it('sets isDebuggingSprites to false when running is set to false', function() {
      var previousState = {
        isRunning: true,
        isDebuggingSprites: true
      };
      var state = reducer(previousState, runState.setIsRunning(false));
      assert.strictEqual(state.isRunning, false);
      assert.strictEqual(state.isDebuggingSprites, false);
    });

    it('doesnt change isDebuggingSprites when set to true', function() {
      var previousState = {
        isRunning: true,
        isDebuggingSprites: true
      };
      var state = reducer(previousState, runState.setIsRunning(true));
      assert.strictEqual(state.isRunning, true);
      assert.strictEqual(state.isDebuggingSprites, true);
    });
  });

  describe('isDebuggerPaused reducer', function() {
    var reducer = runState.default;

    it('starts out false', function() {
      var state = reducer(null, {});
      assert.strictEqual(state.isDebuggerPaused, false);
    });

    it('can be set to true when false', function() {
      var previousState = {
        isDebuggerPaused: false
      };
      var state = reducer(
        previousState,
        runState.setIsDebuggerPaused(true, JSInterpreter.StepType.IN)
      );
      assert.strictEqual(state.isDebuggerPaused, true);
      assert.strictEqual(state.nextStep, JSInterpreter.StepType.IN);
    });

    it('can be set to false when true', function() {
      var previousState = {
        isDebuggerPaused: true
      };
      var state = reducer(
        previousState,
        runState.setIsDebuggerPaused(false, JSInterpreter.StepType.RUN)
      );
      assert.strictEqual(state.isDebuggerPaused, false);
      assert.strictEqual(state.nextStep, JSInterpreter.StepType.RUN);
    });

    it('can be set to true when already true', function() {
      var previousState = {
        isDebuggerPaused: true
      };
      var state = reducer(
        previousState,
        runState.setIsDebuggerPaused(true, JSInterpreter.StepType.OVER)
      );
      assert.strictEqual(state.isDebuggerPaused, true);
      assert.strictEqual(state.nextStep, JSInterpreter.StepType.OVER);
    });

    it('sets isRunning to true when debugging', function() {
      var previousState = {
        isRunning: true,
        isDebuggerPaused: false,
        nextStep: undefined
      };
      var state = reducer(previousState, runState.setIsDebuggerPaused(true));
      assert.deepEqual(state, {
        isRunning: true,
        isDebuggerPaused: true,
        nextStep: undefined
      });
    });

    it('doesnt change isRunning when set to false', function() {
      var previousState = {
        isRunning: true,
        isDebuggerPaused: false,
        nextStep: undefined
      };
      var state = reducer(previousState, runState.setIsDebuggerPaused(false));
      assert.deepEqual(state, {
        isRunning: true,
        isDebuggerPaused: false,
        nextStep: undefined
      });
    });
  });

  describe('isDebuggingSprites reducer', function() {
    var reducer = runState.default;

    it('starts out false', function() {
      var state = reducer(null, {});
      assert.strictEqual(state.isDebuggingSprites, false);
    });

    it('can be set to true when false', function() {
      var previousState = {
        isRunning: true,
        isDebuggingSprites: false
      };
      var state = reducer(previousState, runState.setIsDebuggingSprites(true));
      assert.strictEqual(state.isDebuggingSprites, true);
    });

    it('can be set to false when true', function() {
      var previousState = {
        isRunning: true,
        isDebuggingSprites: true
      };
      var state = reducer(previousState, runState.setIsDebuggingSprites(false));
      assert.strictEqual(state.isDebuggingSprites, false);
    });

    it('doesnt change to true when isRunning is set to false', function() {
      var previousState = {
        isRunning: false,
        isDebuggingSprites: false
      };
      var state = reducer(previousState, runState.setIsDebuggingSprites(true));
      assert.strictEqual(state.isDebuggingSprites, false);
    });
  });
});
