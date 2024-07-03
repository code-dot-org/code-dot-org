import sinon from 'sinon';

import AzureTextToSpeech from '@cdo/apps/AzureTextToSpeech';
import {setAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';
import {
  commands,
  executors,
  injectExecuteCmd,
  MAX_SPEECH_TEXT_LENGTH,
} from '@cdo/apps/lib/util/audioApi';
import dropletConfig from '@cdo/apps/lib/util/audioApiDropletConfig';
import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';



describe('Audio API', function () {
  // Check that every command, has an executor, has a droplet config entry.
  // May eventually need to allow droplet config entries to not have a matching
  // executor because they get aliased.
  it('is internally complete', function () {
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

  describe('playSound', function () {
    it('has two arguments, "url" and "loop"', function () {
      const funcName = 'playSound';
      // Check droplet config for the 2 documented params
      expect(dropletConfig[funcName].paletteParams).toEqual([
        'url',
        'loop',
      ]);
      expect(dropletConfig[funcName].params).toHaveLength(2);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two', 'three', 'four');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.firstCall.args[2]).toEqual({
        url: 'one',
        loop: 'two',
        callback: 'three',
      });
    });
  });

  describe('stopSound', function () {
    it('has one argument, "url"', function () {
      const funcName = 'stopSound';
      // Check droplet config
      expect(dropletConfig[funcName].paletteParams).toEqual(['url']);
      expect(dropletConfig[funcName].params).toHaveLength(1);

      // Check executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      executors[funcName]('one', 'two');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.firstCall.args[2]).toEqual({url: 'one'});
    });
  });

  describe('playSpeech', function () {
    it('has four arguments, "text", "gender", "language", and "onComplete"', function () {
      const funcName = 'playSpeech';
      // Check droplet config for the 2 documented params
      expect(dropletConfig[funcName].paletteParams).toEqual([
        'text',
        'gender',
        'language',
      ]);
      expect(dropletConfig[funcName].params).toHaveLength(3);

      // Check that executors map arguments to object correctly
      let spy = sinon.spy();
      injectExecuteCmd(spy);
      const onCompleteCallback = () => console.log('done');
      executors[funcName](
        'this is text',
        'female',
        'English',
        onCompleteCallback,
        'no fifth arg'
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.firstCall.args[2]).toEqual({
        text: 'this is text',
        gender: 'female',
        language: 'English',
        onComplete: onCompleteCallback,
      });
    });

    describe('block functionality', function () {
      let outputWarningSpy, azureTTSStub, options;

      beforeEach(function () {
        outputWarningSpy = sinon.spy();
        injectErrorHandler({outputWarning: outputWarningSpy});
        azureTTSStub = {
          createSoundPromise: sinon.spy(),
          enqueueAndPlay: sinon.spy(),
        };
        sinon.stub(AzureTextToSpeech, 'getSingleton').returns(azureTTSStub);
        setAppOptions({
          azureSpeechServiceVoices: {
            English: {female: 'en-female', locale: 'en-US'},
          },
        });
        options = {
          text: 'hello world',
          gender: 'female',
          language: 'English',
        };
      });

      afterEach(function () {
        AzureTextToSpeech.getSingleton.restore();
      });

      it('truncates text longer than MAX_SPEECH_TEXT_LENGTH', async function () {
        options.text = 'a'.repeat(MAX_SPEECH_TEXT_LENGTH + 1);
        const expectedText = 'a'.repeat(MAX_SPEECH_TEXT_LENGTH);
        await commands.playSpeech(options);

        expect(outputWarningSpy).toHaveBeenCalledTimes(1);
        expect(azureTTSStub.createSoundPromise).toHaveBeenCalledTimes(1);
        const args = azureTTSStub.createSoundPromise.firstCall.args[0];
        expect(args.text).toBe(expectedText);
        expect(azureTTSStub.enqueueAndPlay).toHaveBeenCalledTimes(1);
      });

      it('falls back to English/female if requested voice is unavailable', async function () {
        options.gender = 'male';
        options.language = 'Spanish';
        await commands.playSpeech(options);

        expect(outputWarningSpy).not.toHaveBeenCalled();
        expect(azureTTSStub.createSoundPromise).toHaveBeenCalledTimes(1);
        const args = azureTTSStub.createSoundPromise.firstCall.args[0];
        expect(args.gender).toBe('female');
        expect(args.locale).toBe('en-US');
        expect(azureTTSStub.enqueueAndPlay).toHaveBeenCalledTimes(1);
      });

      it('creates and enqueues a sound promise', async function () {
        await commands.playSpeech(options);

        expect(outputWarningSpy).not.toHaveBeenCalled();
        expect(azureTTSStub.createSoundPromise).toHaveBeenCalledTimes(1);
        const args = azureTTSStub.createSoundPromise.firstCall.args[0];
        expect(args.text).toBe('hello world');
        expect(args.gender).toBe('female');
        expect(args.locale).toBe('en-US');
        expect(azureTTSStub.enqueueAndPlay).toHaveBeenCalledTimes(1);
      });
    });
  });
});
