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

  describe('createSoundPromise', () => {
    let onFailureSpy;

    beforeEach(() => {
      onFailureSpy = sinon.spy();
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
            locale: 'en-US',
            onFailure: onFailureSpy
          });
        });

        it('resolves to cached sound response', async () => {
          const soundResponse = await soundPromise();
          assertSoundResponsesEqual(cachedSoundResponse, soundResponse);
        });

        it('calls onFailure', async () => {
          await soundPromise();
          expect(onFailureSpy).to.have.been.calledOnce;
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
            locale: 'en-US',
            onFailure: onFailureSpy
          });
        });

        it('resolves to cached sound response', async () => {
          const soundResponse = await soundPromise();
          assertSoundResponsesEqual(cachedSoundResponse, soundResponse);
        });

        it('does not call onFailure', async () => {
          await soundPromise();
          expect(onFailureSpy).not.to.have.been.called;
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
            locale: 'en-US',
            onFailure: onFailureSpy
          };
          soundPromise = azureTTS.createSoundPromise(options);
          expectedSoundResponse = azureTTS.createSoundResponse_({
            ...options,
            profaneWords: [badWord]
          });
        });

        it('calls onFailure', async () => {
          await soundPromise();
          expect(onFailureSpy).to.have.been.calledOnce;
        });

        it('caches the response', async () => {
          await soundPromise();
          const actualResponse = azureTTS.getCachedSound_(
            options.locale,
            options.gender,
            options.text
          );
          assertSoundResponsesEqual(expectedSoundResponse, actualResponse);
        });

        it('resolves with profaneWords', async () => {
          const actualResponse = await soundPromise();
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
              locale: 'es-MX'
            };
            soundPromise = azureTTS.createSoundPromise(options);
            expectedSoundResponse = azureTTS.createSoundResponse_({
              ...options,
              bytes
            });
          });

          it('caches the response', async () => {
            await soundPromise();
            const actualResponse = azureTTS.getCachedSound_(
              options.locale,
              options.gender,
              options.text
            );
            assertSoundResponsesEqual(expectedSoundResponse, actualResponse);
          });

          it('resolves with sound bytes', async () => {
            const actualResponse = await soundPromise();
            assertSoundResponsesEqual(expectedSoundResponse, actualResponse);
          });
        });

        describe('on failure', () => {
          beforeEach(() => {
            const error = {status: 400};
            sinon
              .stub(azureTTS, 'convertTextToSpeech')
              .returns(new Promise((_, reject) => reject(error)));
            options = {
              text: 'hello',
              gender: 'male',
              locale: 'es-MX',
              onFailure: onFailureSpy
            };
            soundPromise = azureTTS.createSoundPromise(options);
            expectedSoundResponse = azureTTS.createSoundResponse_({
              ...options,
              error
            });
          });

          it('does not cache the response', async () => {
            await soundPromise();
            expect(
              azureTTS.getCachedSound_(
                options.locale,
                options.gender,
                options.text
              )
            ).to.be.undefined;
          });

          it('calls onFailure', async () => {
            await soundPromise();
            expect(onFailureSpy).to.have.been.calledOnce;
          });

          it('resolves with error', async () => {
            const actualResponse = await soundPromise();
            assertSoundResponsesEqual(expectedSoundResponse, actualResponse);
          });
        });
      });
    });
  });

  describe('asyncPlayFromQueue_', () => {
    let playSpy, successfulResponse;

    beforeEach(() => {
      playSpy = sinon.spy();
      successfulResponse = azureTTS.createSoundResponse_({
        bytes: new ArrayBuffer()
      });
    });

    it('no-ops if sound is already playing', async () => {
      const dequeueStub = sinon.stub(azureTTS, 'dequeue_');
      azureTTS.playing = true;

      await azureTTS.asyncPlayFromQueue_(playSpy);
      expect(dequeueStub).not.to.have.been.called;
      expect(playSpy).not.to.have.been.called;

      dequeueStub.restore();
    });

    it('no-ops if queue is empty', async () => {
      const dequeueStub = sinon.stub(azureTTS, 'dequeue_').returns(undefined);

      await azureTTS.asyncPlayFromQueue_(playSpy);
      expect(dequeueStub).to.have.been.calledOnce;
      expect(playSpy).not.to.have.been.called;

      dequeueStub.restore();
    });

    it('plays sound if response was successful', async () => {
      const dequeueStub = sinon
        .stub(azureTTS, 'dequeue_')
        .returns(() => Promise.resolve(successfulResponse));

      await azureTTS.asyncPlayFromQueue_(playSpy);
      expect(playSpy).to.have.been.calledOnce;

      dequeueStub.restore();
    });

    it('ends sound if response was unsuccessful', async () => {
      const unsuccessfulResponse = azureTTS.createSoundResponse_({
        error: new Error()
      });
      unsuccessfulResponse.playbackOptions.onEnded = sinon.spy();
      const dequeueStub = sinon
        .stub(azureTTS, 'dequeue_')
        .returns(() => Promise.resolve(unsuccessfulResponse));

      await azureTTS.asyncPlayFromQueue_(playSpy);
      expect(unsuccessfulResponse.playbackOptions.onEnded).to.have.been
        .calledOnce;
      expect(playSpy).not.to.have.been.called;

      dequeueStub.restore();
    });
  });
});
