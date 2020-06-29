import sinon from 'sinon';
import {expect} from '../../../util/deprecatedChai';
import {
  commands,
  executors,
  injectExecuteCmd
} from '@cdo/apps/lib/util/audioApi';
import dropletConfig from '@cdo/apps/lib/util/audioApiDropletConfig';

describe('Audio API', function() {
  // Check that every command, has an executor, has a droplet config entry.
  // May eventually need to allow droplet config entries to not have a matching
  // executor because they get aliased.
  it('is internally complete', function() {
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

  describe('playSound', function() {
    it('has two arguments, "url" and "loop"', function() {
      const funcName = 'playSound';
      // Check droplet config for the 2 documented params
      expect(dropletConfig[funcName].paletteParams).to.deep.equal([
        'url',
        'loop'
      ]);
      expect(dropletConfig[funcName].params).to.have.length(2);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two', 'three', 'four');
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[2]).to.deep.equal({
        url: 'one',
        loop: 'two',
        callback: 'three'
      });
    });
  });

  describe('stopSound', function() {
    it('has one argument, "url"', function() {
      const funcName = 'stopSound';
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).to.deep.equal(['url']);
      expect(dropletConfig[funcName].params).to.have.length(1);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two');
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[2]).to.deep.equal({url: 'one'});
    });
  });

  describe('playSpeech', function() {
    it('has three arguments, "text", "gender", and "language"', function() {
      const funcName = 'playSpeech';
      // Check droplet config for the 2 documented params
      expect(dropletConfig[funcName].paletteParams).to.deep.equal([
        'text',
        'gender',
        'language'
      ]);
      expect(dropletConfig[funcName].params).to.have.length(3);

      // Check that executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('this is text', 'female', 'English', 'nothing');
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[2]).to.deep.equal({
        text: 'this is text',
        gender: 'female',
        language: 'English'
      });
    });
  });
});
