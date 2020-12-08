import {assert, expect} from '../util/reconfiguredChai';
import sinon from 'sinon';
import AzureTextToSpeech from '@cdo/apps/AzureTextToSpeech';

const assertSoundResponsesEqual = (expected, actual) => {
  assert.deepEqual(expected.bytes, actual.bytes);
  assert.deepEqual(expected.playbackOptions, actual.playbackOptions);
  assert.deepEqual(expected.profaneWords, actual.profaneWords);
  assert.equal(expected.error, actual.error);
};

describe('AzureTextToSpeech', () => {
  let azureTTS, playBytesStub;

  beforeEach(() => {
    azureTTS = new AzureTextToSpeech();
    playBytesStub = sinon.stub(azureTTS, 'playBytes_');
  });

  afterEach(() => {
    playBytesStub.restore();
  });

  describe('enqueueAndPlay', () => {
    it('plays given soundPromise', async () => {
      const response = azureTTS.createSoundResponse_({
        bytes: new ArrayBuffer()
      });

      await azureTTS.enqueueAndPlay(new Promise(resolve => resolve(response)));

      expect(playBytesStub).to.have.been.calledOnce;
      expect(azureTTS.queue_.length).to.equal(0);
    });

    it('does not play if sound is already playing', async () => {
      azureTTS.playing = true;
      const response = azureTTS.createSoundResponse_({
        bytes: new ArrayBuffer()
      });
      response.playbackOptions.onEnded = sinon.spy();

      await azureTTS.enqueueAndPlay(new Promise(resolve => resolve(response)));

      expect(playBytesStub).not.to.have.been.called;
      expect(response.playbackOptions.onEnded).not.to.have.been.called;
    });

    it('does not play if sound response was unsuccessful', async () => {
      const response = azureTTS.createSoundResponse_({
        error: 'An error occurred'
      });
      response.playbackOptions.onEnded = sinon.spy();

      await azureTTS.enqueueAndPlay(new Promise(resolve => resolve(response)));

      expect(playBytesStub).not.to.have.been.called;
      expect(response.playbackOptions.onEnded).to.have.been.calledOnce;
    });
  });

  describe('createSoundPromise', () => {
    let onProfanityFoundSpy;

    beforeEach(() => {
      onProfanityFoundSpy = sinon.spy();
    });

    describe('with a cached sound', () => {
      describe('with profanity', () => {
        let cachedSoundResponse, soundPromise;

        beforeEach(() => {
          const badWord = 'badWord';
          cachedSoundResponse = azureTTS.createSoundResponse_({
            profaneWords: [badWord]
          });
          azureTTS.setCachedSound_(
            'en-US',
            'female',
            `hi ${badWord}`,
            cachedSoundResponse
          );
          soundPromise = azureTTS.createSoundPromise({
            text: `hi ${badWord}`,
            gender: 'female',
            languageCode: 'en-US',
            onProfanityFound: onProfanityFoundSpy
          });
        });

        it('resolves to cached sound response', async () => {
          const soundResponse = await soundPromise;
          assertSoundResponsesEqual(cachedSoundResponse, soundResponse);
        });

        it('calls onProfanityFound', async () => {
          await soundPromise;
          expect(onProfanityFoundSpy).to.have.been.calledOnce;
        });
      });

      describe('without profanity', () => {
        let cachedSoundResponse, soundPromise;

        beforeEach(() => {
          cachedSoundResponse = azureTTS.createSoundResponse_({
            bytes: new ArrayBuffer()
          });
          azureTTS.setCachedSound_(
            'en-US',
            'female',
            'hi',
            cachedSoundResponse
          );
          soundPromise = azureTTS.createSoundPromise({
            text: 'hi',
            gender: 'female',
            languageCode: 'en-US',
            onProfanityFound: onProfanityFoundSpy
          });
        });

        it('resolves to cached sound response', async () => {
          const soundResponse = await soundPromise;
          assertSoundResponsesEqual(cachedSoundResponse, soundResponse);
        });

        it('does not call onProfanityFound', async () => {
          await soundPromise;
          expect(onProfanityFoundSpy).not.to.have.been.called;
        });
      });
    });

    describe('with a new sound', () => {
      let server;

      beforeEach(() => {
        server = sinon.fakeServer.create();
        server.autoRespond = true;
      });

      afterEach(() => {
        server.restore();
      });

      describe('with profanity', () => {
        let badWord, options, soundPromise, expectedSoundResponse;

        beforeEach(() => {
          badWord = 'badWord';
          server.respondWith('POST', `/profanity/find`, [
            200,
            {'Content-Type': 'application/json'},
            JSON.stringify([badWord])
          ]);
          options = {
            text: badWord,
            gender: 'female',
            languageCode: 'en-US',
            onProfanityFound: onProfanityFoundSpy
          };
          soundPromise = azureTTS.createSoundPromise(options);
          expectedSoundResponse = azureTTS.createSoundResponse_({
            ...options,
            profaneWords: [badWord]
          });
        });

        it('calls onProfanityFound', async () => {
          await soundPromise;
          expect(onProfanityFoundSpy).to.have.been.calledOnce;
        });

        it('caches the response', async () => {
          await soundPromise;
          const actualResponse = azureTTS.getCachedSound_(
            options.languageCode,
            options.gender,
            options.text
          );
          assertSoundResponsesEqual(expectedSoundResponse, actualResponse);
        });

        it('resolves with profaneWords', async () => {
          const actualResponse = await soundPromise;
          assertSoundResponsesEqual(expectedSoundResponse, actualResponse);
        });
      });

      describe('without profanity', () => {
        let options, soundPromise, expectedSoundResponse;

        beforeEach(() => {
          server.respondWith('POST', `/profanity/find`, [
            200,
            {'Content-Type': 'application/json'},
            JSON.stringify([])
          ]);
        });

        describe('on success', () => {
          beforeEach(() => {
            const bytes = new ArrayBuffer();
            sinon
              .stub(azureTTS, 'convertTextToSpeech')
              .returns(new Promise(resolve => resolve(bytes)));
            options = {
              text: 'hello',
              gender: 'male',
              languageCode: 'es-MX'
            };
            soundPromise = azureTTS.createSoundPromise(options);
            expectedSoundResponse = azureTTS.createSoundResponse_({
              ...options,
              bytes
            });
          });

          it('caches the response', async () => {
            await soundPromise;
            const actualResponse = azureTTS.getCachedSound_(
              options.languageCode,
              options.gender,
              options.text
            );
            assertSoundResponsesEqual(expectedSoundResponse, actualResponse);
          });

          it('resolves with sound bytes', async () => {
            const actualResponse = await soundPromise;
            assertSoundResponsesEqual(expectedSoundResponse, actualResponse);
          });
        });

        describe('on failure', () => {
          beforeEach(() => {
            const statusText = 'Bad Request';
            sinon
              .stub(azureTTS, 'convertTextToSpeech')
              .returns(new Promise((_, reject) => reject({statusText})));
            options = {
              text: 'hello',
              gender: 'male',
              languageCode: 'es-MX'
            };
            soundPromise = azureTTS.createSoundPromise(options);
            expectedSoundResponse = azureTTS.createSoundResponse_({
              ...options,
              error: statusText
            });
          });

          it('does not cache the response', async () => {
            await soundPromise;
            expect(
              azureTTS.getCachedSound_(
                options.languageCode,
                options.gender,
                options.text
              )
            ).to.be.undefined;
          });

          it('resolves with error', async () => {
            const actualResponse = await soundPromise;
            assertSoundResponsesEqual(expectedSoundResponse, actualResponse);
          });
        });
      });
    });
  });
});
