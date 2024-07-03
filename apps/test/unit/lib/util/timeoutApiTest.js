import sinon from 'sinon';

import JavaScriptModeErrorHandler from '@cdo/apps/JavaScriptModeErrorHandler';
import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';
import {
  commands,
  executors,
  dropletConfig,
  injectExecuteCmd,
} from '@cdo/apps/lib/util/timeoutApi';
import * as apiTimeoutList from '@cdo/apps/lib/util/timeoutList';



describe('Timeout API', () => {
  let testErrorHandler, clock;

  beforeEach(() => {
    testErrorHandler = sinon.createStubInstance(JavaScriptModeErrorHandler);
    clock = sinon.useFakeTimers();
    injectErrorHandler(testErrorHandler);
  });

  afterEach(() => {
    apiTimeoutList.clearTimeouts();
    apiTimeoutList.clearIntervals();

    injectErrorHandler(null);
    clock.restore();
  });

  // Check that every command
  // - has an executor
  // - has a droplet config entry
  // May eventually need to allow droplet config entries to not have a matching
  // executor because they get aliased.
  it('is internally complete', () => {
    for (let commandName in commands) {
      if (!Object.prototype.hasOwnProperty.call(commands, commandName)) {
        continue;
      }
      expect(executors.hasOwnProperty(commandName)).toBeTruthy();
      expect(dropletConfig.hasOwnProperty(commandName)).toBeTruthy();
    }

    for (let commandName in executors) {
      if (!Object.prototype.hasOwnProperty.call(executors, commandName)) {
        continue;
      }
      expect(commands.hasOwnProperty(commandName)).toBeTruthy();
      expect(dropletConfig.hasOwnProperty(commandName)).toBeTruthy();
    }

    for (let commandName in dropletConfig) {
      if (!Object.prototype.hasOwnProperty.call(dropletConfig, commandName)) {
        continue;
      }
      expect(dropletConfig[commandName].func).toBe(commandName);
      expect(dropletConfig[commandName].parent).toBe(executors);
      expect(commands.hasOwnProperty(commandName)).toBeTruthy();
      expect(executors.hasOwnProperty(commandName)).toBeTruthy();
    }
  });

  describe('setTimeout', () => {
    const funcName = 'setTimeout';

    it('has two arguments, "callback" and "milliseconds"', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).toEqual([
        'callback',
        'ms',
      ]);
      expect(dropletConfig[funcName].params).toHaveLength(2);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two', 'three');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.firstCall.args[2]).toEqual({
        callback: 'one',
        milliseconds: 'two',
      });
    });

    itComplainsIfArgumentIsNotAFunction(funcName, 'callback', {
      callback: () => {},
      milliseconds: 0,
    });

    itComplainsIfArgumentIsNotANumber(funcName, 'milliseconds', {
      callback: () => {},
      milliseconds: 0,
    });

    it('sets a timeout', () => {
      const spy = sinon.spy();
      commands[funcName]({
        callback: spy,
        milliseconds: 3,
      });
      expect(spy).not.toHaveBeenCalled();
      clock.tick(3);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('clearTimeout', () => {
    const funcName = 'clearTimeout';

    it('has one argument, "__"', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).toEqual(['__']);
      expect(dropletConfig[funcName].params).toHaveLength(1);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.firstCall.args[2]).toEqual({timeoutId: 'one'});
    });

    itComplainsIfArgumentIsNotANumber(funcName, 'timeoutId', {
      timeoutId: 0,
    });

    it('clears a timeout', () => {
      const spy = sinon.spy();
      const key = commands.setTimeout({
        callback: spy,
        milliseconds: 2,
      });
      expect(spy).not.toHaveBeenCalled();
      commands.clearTimeout({timeoutId: key});
      clock.tick(2);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('setInterval', () => {
    const funcName = 'setInterval';

    it('has two arguments, "callback" and "milliseconds"', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).toEqual([
        'callback',
        'ms',
      ]);
      expect(dropletConfig[funcName].params).toHaveLength(2);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two', 'three');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.firstCall.args[2]).toEqual({
        callback: 'one',
        milliseconds: 'two',
      });
    });

    itComplainsIfArgumentIsNotAFunction(funcName, 'callback', {
      callback: () => {},
      milliseconds: 0,
    });

    itComplainsIfArgumentIsNotANumber(funcName, 'milliseconds', {
      callback: () => {},
      milliseconds: 0,
    });

    it('sets an interval', () => {
      const spy = sinon.spy();
      commands[funcName]({
        callback: spy,
        milliseconds: 3,
      });
      expect(spy).not.toHaveBeenCalled();
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(1);
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(2);
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });

  describe('clearInterval', () => {
    const funcName = 'clearInterval';

    it('has one argument, "__"', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).toEqual(['__']);
      expect(dropletConfig[funcName].params).toHaveLength(1);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.firstCall.args[2]).toEqual({intervalId: 'one'});
    });

    itComplainsIfArgumentIsNotANumber(funcName, 'intervalId', {
      intervalId: 0,
    });

    it('clears an interval', () => {
      const spy = sinon.spy();
      const key = commands.setInterval({
        callback: spy,
        milliseconds: 3,
      });
      expect(spy).not.toHaveBeenCalled();
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(1);

      commands.clearInterval({intervalId: key});
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(1);
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('timedLoop', () => {
    const funcName = 'timedLoop';

    it('has two arguments, "ms" and "callback"', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).toEqual([
        'ms',
        'callback',
      ]);
      expect(dropletConfig[funcName].params).toHaveLength(2);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two', 'three');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.firstCall.args[2]).toEqual({ms: 'one', callback: 'two'});
    });

    itComplainsIfArgumentIsNotAFunction(funcName, 'callback', {
      callback: () => {},
      ms: 0,
    });

    itComplainsIfArgumentIsNotANumber(funcName, 'ms', {
      callback: () => {},
      ms: 0,
    });

    it('sets an interval', () => {
      const spy = sinon.spy();
      commands[funcName]({
        callback: spy,
        ms: 3,
      });
      expect(spy).not.toHaveBeenCalled();
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(1);
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(2);
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });

  describe('stopTimedLoop', () => {
    const funcName = 'stopTimedLoop';

    it('has no default arguments, max one argument', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).toBeUndefined();
      expect(dropletConfig[funcName].params).toBeUndefined();
      expect(dropletConfig[funcName].paramButtons).toEqual({
        minArgs: 0,
        maxArgs: 1,
      });

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName](); // Called with no args
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.firstCall.args[2]).toEqual({key: undefined});

      spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two'); // Called with extra args
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.firstCall.args[2]).toEqual({key: 'one'});
    });

    itComplainsIfArgumentIsNotANumber(funcName, 'key', {
      key: 0,
    });

    it('clears an interval started by setTimedLoop', () => {
      const spy = sinon.spy();
      const key = commands.timedLoop({
        callback: spy,
        ms: 3,
      });
      expect(spy).not.toHaveBeenCalled();
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(1);

      commands.stopTimedLoop({key});
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(1);
      clock.tick(3);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Generates a unit test that checks whether the <funcName> function correctly
   * validates that its <argName> argument must be a string.
   *
   * @param {!string} funcName - Name of function on the 'commands' object
   *   imported from the API module under test.
   * @param {!string} argName - The name of the argument to check.
   * @param {!object} validArgs - An example of valid arguments to the function.
   */
  function itComplainsIfArgumentIsNotANumber(funcName, argName, validArgs) {
    itComplainsIfArgumentIsNotOfType(funcName, argName, 'number', validArgs);
  }

  /**
   * Generates a unit test that checks whether the <funcName> function correctly
   * validates that its <argName> argument must be a function.
   *
   * @param {!string} funcName - Name of function on the 'commands' object
   *   imported from the API module under test.
   * @param {!string} argName - The name of the argument to check.
   * @param {!object} validArgs - An example of valid arguments to the function.
   */
  function itComplainsIfArgumentIsNotAFunction(funcName, argName, validArgs) {
    itComplainsIfArgumentIsNotOfType(funcName, argName, 'function', validArgs);
  }

  /**
   * Generates a unit test that checks whether the <funcName> function correctly
   * validates that its <argName> argument must be an <expectedType>.
   *
   * @param {!string} funcName - Name of function on the 'commands' object
   *   imported from the API module under test. e.g. 'setInterval'
   * @param {!string} argName - The functions on the 'commands' object all take
   *   an options object with named arguments as their first parameter, this is
   *   the name of the argument to check for validation within that options
   *   object.
   * @param {!string} expectedType - The type of a valid value for the named
   *   argument in the domain of the function, as given by the typeof operator.
   *   Note: This could/should be extended to support the additional types
   *   defined in the apiValidateType() function.
   * @param {!object} validArgs - An example of valid arguments to the function
   *   under test.  This set of valid arguments is used to generate permutations
   *   where the argument under test is invalid in different ways, to check that
   *   validation is functioning as expected.
   */
  function itComplainsIfArgumentIsNotOfType(
    funcName,
    argName,
    expectedType,
    validArgs
  ) {
    function callFuncWithArgValue(badValue) {
      commands[funcName]({
        ...validArgs,
        [argName]: badValue,
      });
    }

    it(`complains if argument ${argName} is not a ${expectedType}`, () => {
      if (expectedType !== 'number') {
        testErrorHandler.outputWarning.resetHistory();
        callFuncWithArgValue(42);
        expect(testErrorHandler.outputWarning).toHaveBeenCalledTimes(1);
        expect(testErrorHandler.outputWarning.firstCall.args[0]).toBe(`${funcName}() ${argName} parameter value (42) is not a ${expectedType}.`);
      }

      if (expectedType !== 'string') {
        testErrorHandler.outputWarning.resetHistory();
        callFuncWithArgValue('foobar');
        expect(testErrorHandler.outputWarning).toHaveBeenCalledTimes(1);
        expect(testErrorHandler.outputWarning.firstCall.args[0]).toBe(
          `${funcName}() ${argName} parameter value (foobar) is not a ${expectedType}.`
        );
      }

      if (expectedType !== 'object') {
        testErrorHandler.outputWarning.resetHistory();
        callFuncWithArgValue(null);
        expect(testErrorHandler.outputWarning).toHaveBeenCalledTimes(1);
        expect(testErrorHandler.outputWarning.firstCall.args[0]).toBe(
          `${funcName}() ${argName} parameter value (null) is not a ${expectedType}.`
        );

        testErrorHandler.outputWarning.resetHistory();
        callFuncWithArgValue({obj: 5});
        expect(testErrorHandler.outputWarning).toHaveBeenCalledTimes(1);
        expect(testErrorHandler.outputWarning.firstCall.args[0]).toBe(
          `${funcName}() ${argName} parameter value ([object Object]) is not a ${expectedType}.`
        );
      }
    });
  }
});
