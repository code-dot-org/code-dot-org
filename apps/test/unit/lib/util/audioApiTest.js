import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import {
  commands,
  executors,
  injectExecuteCmd,
  MAX_SPEECH_TEXT_LENGTH
} from '@cdo/apps/lib/util/audioApi';
import dropletConfig from '@cdo/apps/lib/util/audioApiDropletConfig';
import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';
import {setAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';
import AzureTextToSpeech from '@cdo/apps/AzureTextToSpeech';

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

    describe('block functionality', function() {
      let outputWarningSpy, azureTTSStub, options;

      beforeEach(function() {
        outputWarningSpy = sinon.spy();
        injectErrorHandler({outputWarning: outputWarningSpy});
        azureTTSStub = {
          createSoundPromise: sinon.spy(),
          enqueueAndPlay: sinon.spy()
        };
        sinon.stub(AzureTextToSpeech, 'getSingleton').returns(azureTTSStub);
        setAppOptions({
          azureSpeechServiceVoices: {
            English: {female: 'en-female', locale: 'en-US'}
          }
        });
        options = {
          text: 'hello world',
          gender: 'female',
          language: 'English'
        };
      });

      afterEach(function() {
        AzureTextToSpeech.getSingleton.restore();
      });

      it('truncates text longer than MAX_SPEECH_TEXT_LENGTH', async function() {
        options.text = 'a'.repeat(MAX_SPEECH_TEXT_LENGTH + 1);
        const expectedText = 'a'.repeat(MAX_SPEECH_TEXT_LENGTH);
        await commands.playSpeech(options);

        expect(outputWarningSpy).to.have.been.calledOnce;
        expect(azureTTSStub.createSoundPromise).to.have.been.calledOnce;
        const args = azureTTSStub.createSoundPromise.firstCall.args[0];
        expect(args.text).to.equal(expectedText);
        expect(azureTTSStub.enqueueAndPlay).to.have.been.calledOnce;
      });

      it('falls back to English/female if requested voice is unavailable', async function() {
        options.gender = 'male';
        options.language = 'Spanish';
        await commands.playSpeech(options);

        expect(outputWarningSpy).not.to.have.been.called;
        expect(azureTTSStub.createSoundPromise).to.have.been.calledOnce;
        const args = azureTTSStub.createSoundPromise.firstCall.args[0];
        expect(args.gender).to.equal('female');
        expect(args.locale).to.equal('en-US');
        expect(azureTTSStub.enqueueAndPlay).to.have.been.calledOnce;
      });

      it('creates and enqueues a sound promise', async function() {
        await commands.playSpeech(options);

        expect(outputWarningSpy).not.to.have.been.called;
        expect(azureTTSStub.createSoundPromise).to.have.been.calledOnce;
        const args = azureTTSStub.createSoundPromise.firstCall.args[0];
        expect(args.text).to.equal('hello world');
        expect(args.gender).to.equal('female');
        expect(args.locale).to.equal('en-US');
        expect(azureTTSStub.enqueueAndPlay).to.have.been.calledOnce;
      });
    });
  });
});
