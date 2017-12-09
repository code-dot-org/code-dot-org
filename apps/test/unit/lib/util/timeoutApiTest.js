import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import {
  commands,
  executors,
  dropletConfig,
  injectExecuteCmd,
} from '@cdo/apps/lib/util/timeoutApi';
import * as apiTimeoutList from '@cdo/apps/lib/util/timeoutList';
import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';
import JavaScriptModeErrorHandler from '@cdo/apps/JavaScriptModeErrorHandler';

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
      if (!commands.hasOwnProperty(commandName)) {
        continue;
      }
      expect(executors).to.have.ownProperty(commandName);
      expect(dropletConfig).to.have.ownProperty(commandName);
    }

    for (let commandName in executors) {
      if (!executors.hasOwnProperty(commandName)) {
        continue;
      }
      expect(commands).to.have.ownProperty(commandName);
      expect(dropletConfig).to.have.ownProperty(commandName);
    }

    for (let commandName in dropletConfig) {
      if (!dropletConfig.hasOwnProperty(commandName)) {
        continue;
      }
      expect(dropletConfig[commandName].func).to.equal(commandName);
      expect(dropletConfig[commandName].parent).to.equal(executors);
      expect(commands).to.have.ownProperty(commandName);
      expect(executors).to.have.ownProperty(commandName);
    }
  });

  describe('setTimeout', () => {
    const funcName = 'setTimeout';

    it('has two arguments, "callback" and "milliseconds"', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).to.deep.equal(['callback', 'ms']);
      expect(dropletConfig[funcName].params).to.have.length(2);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two', 'three');
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[2]).to.deep.equal({callback: 'one', milliseconds: 'two'});
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
        milliseconds: 3
      });
      expect(spy).not.to.have.been.called;
      clock.tick(3);
      expect(spy).to.have.been.called;
    });
  });

  describe('clearTimeout', () => {
    const funcName = 'clearTimeout';

    it('has one argument, "__"', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).to.deep.equal(['__']);
      expect(dropletConfig[funcName].params).to.have.length(1);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two');
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[2]).to.deep.equal({timeoutId: 'one'});
    });

    itComplainsIfArgumentIsNotANumber(funcName, 'timeoutId', {
      timeoutId: 0,
    });

    it('clears a timeout', () => {
      const spy = sinon.spy();
      const key = commands.setTimeout({
        callback: spy,
        milliseconds: 2
      });
      expect(spy).not.to.have.been.called;
      commands.clearTimeout({timeoutId: key});
      clock.tick(2);
      expect(spy).not.to.have.been.called;
    });
  });

  describe('setInterval', () => {
    const funcName = 'setInterval';

    it('has two arguments, "callback" and "milliseconds"', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).to.deep.equal(['callback', 'ms']);
      expect(dropletConfig[funcName].params).to.have.length(2);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two', 'three');
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[2]).to.deep.equal({callback: 'one', milliseconds: 'two'});
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
        milliseconds: 3
      });
      expect(spy).not.to.have.been.called;
      clock.tick(3);
      expect(spy).to.have.been.calledOnce;
      clock.tick(3);
      expect(spy).to.have.been.calledTwice;
      clock.tick(3);
      expect(spy).to.have.been.calledThrice;
    });
  });

  describe('clearInterval', () => {
    const funcName = 'clearInterval';

    it('has one argument, "__"', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).to.deep.equal(['__']);
      expect(dropletConfig[funcName].params).to.have.length(1);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two');
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[2]).to.deep.equal({intervalId: 'one'});
    });

    itComplainsIfArgumentIsNotANumber(funcName, 'intervalId', {
      intervalId: 0,
    });

    it('clears an interval', () => {
      const spy = sinon.spy();
      const key = commands.setInterval({
        callback: spy,
        milliseconds: 3
      });
      expect(spy).not.to.have.been.called;
      clock.tick(3);
      expect(spy).to.have.been.calledOnce;

      commands.clearInterval({intervalId: key});
      clock.tick(3);
      expect(spy).to.have.been.calledOnce;
      clock.tick(3);
      expect(spy).to.have.been.calledOnce;
    });
  });

  describe('timedLoop', () => {
    const funcName = 'timedLoop';

    it('has two arguments, "ms" and "callback"', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).to.deep.equal(['ms', 'callback']);
      expect(dropletConfig[funcName].params).to.have.length(2);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two', 'three');
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[2]).to.deep.equal({ms: 'one', callback: 'two'});
    });

    itComplainsIfArgumentIsNotAFunction(funcName, 'callback', {
      callback: () => {},
      ms: 0,
    });

    itComplainsIfArgumentIsNotANumber(funcName, 'ms', {
      callback: () => {},
      ms: 0,
    });
  });

  describe('stopTimedLoop', () => {
    const funcName = 'stopTimedLoop';

    it('has no default arguments, max one argument', () => {
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).to.be.undefined;
      expect(dropletConfig[funcName].params).to.be.undefined;
      expect(dropletConfig[funcName].paramButtons).to.deep.equal({minArgs: 0, maxArgs: 1});

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName](); // Called with no args
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[2]).to.deep.equal({key: undefined});

      spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two'); // Called with extra args
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[2]).to.deep.equal({key: 'one'});
    });

    itComplainsIfArgumentIsNotANumber(funcName, 'key', {
      key: 0,
    });
  });

  function itComplainsIfArgumentIsNotANumber(funcName, argName, validArgs) {
    it(`complains if argument ${argName} is not a number`, () => {
      commands[funcName]({
        ...validArgs,
        [argName]: null
      });
      expect(testErrorHandler.outputWarning).to.have.been.calledOnce;
      expect(testErrorHandler.outputWarning.firstCall.args[0]).to.equal(
        `${funcName}() ${argName} parameter value (null) is not a number.`
      );

      commands[funcName]({
        ...validArgs,
        [argName]: 'string'
      });
      expect(testErrorHandler.outputWarning).to.have.been.calledTwice;
      expect(testErrorHandler.outputWarning.secondCall.args[0]).to.equal(
        `${funcName}() ${argName} parameter value (string) is not a number.`
      );

      commands[funcName]({
        ...validArgs,
        [argName]: {obj: 5}
      });
      expect(testErrorHandler.outputWarning).to.have.been.calledThrice;
      expect(testErrorHandler.outputWarning.thirdCall.args[0]).to.equal(
        `${funcName}() ${argName} parameter value ([object Object]) is not a number.`
      );
    });
  }

  function itComplainsIfArgumentIsNotAFunction(funcName, argName, validArgs) {
    it(`complains if argument ${argName} is not a function`, () => {
      commands[funcName]({
        ...validArgs,
        [argName]: null
      });
      expect(testErrorHandler.outputWarning).to.have.been.calledOnce;
      expect(testErrorHandler.outputWarning.firstCall.args[0]).to.equal(
        `${funcName}() ${argName} parameter value (null) is not a function.`
      );

      commands[funcName]({
        ...validArgs,
        [argName]: 'string'
      });
      expect(testErrorHandler.outputWarning).to.have.been.calledTwice;
      expect(testErrorHandler.outputWarning.secondCall.args[0]).to.equal(
        `${funcName}() ${argName} parameter value (string) is not a function.`
      );

      commands[funcName]({
        ...validArgs,
        [argName]: {obj: 5}
      });
      expect(testErrorHandler.outputWarning).to.have.been.calledThrice;
      expect(testErrorHandler.outputWarning.thirdCall.args[0]).to.equal(
        `${funcName}() ${argName} parameter value ([object Object]) is not a function.`
      );
    });
  }
});
