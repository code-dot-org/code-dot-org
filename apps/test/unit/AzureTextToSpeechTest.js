import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import AzureTextToSpeech from '@cdo/apps/AzureTextToSpeech';

import {assert, expect} from '../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const assertSoundResponsesEqual = (expected, actual) => {
  assert.deepEqual(expected.bytes, actual.bytes);
  const playbackOptions = ['volume', 'loop', 'forceHTML5', 'allowHTML5Mobile'];
  playbackOptions.forEach(opt => {
    assert.deepEqual(
      expected.playbackOptions[opt],
      actual.playbackOptions[opt]
    );
  });
  assert.deepEqual(expected.profaneWords, actual.profaneWords);
  assert.equal(expected.error, actual.error);
};

describe('AzureTextToSpeech', () => {
  let azureTTS;

  beforeEach(() => {
    azureTTS = new AzureTextToSpeech();
    jest.spyOn(azureTTS, 'playBytes_');
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
            profaneWords: [badWord],
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
            onFailure: onFailureSpy,
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
            bytes: new ArrayBuffer(),
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
            onFailure: onFailureSpy,
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
            JSON.stringify([badWord]),
          ]);
          options = {
            text: badWord,
            gender: 'female',
            locale: 'en-US',
            onFailure: onFailureSpy,
          };
          soundPromise = azureTTS.createSoundPromise(options);
          expectedSoundResponse = azureTTS.createSoundResponse_({
            ...options,
            profaneWords: [badWord],
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
            JSON.stringify([]),
          ]);
        });

        describe('on success', () => {
          beforeEach(() => {
            const bytes = new ArrayBuffer();
            jest
              .spyOn(azureTTS, 'convertTextToSpeech')
              .mockResolvedValue(bytes);
            options = {
              text: 'hello',
              gender: 'male',
              locale: 'es-MX',
            };
            soundPromise = azureTTS.createSoundPromise(options);
            expectedSoundResponse = azureTTS.createSoundResponse_({
              ...options,
              bytes,
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
            jest
              .spyOn(azureTTS, 'convertTextToSpeech')
              .mockRejectedValue(error);
            options = {
              text: 'hello',
              gender: 'male',
              locale: 'es-MX',
              onFailure: onFailureSpy,
            };
            soundPromise = azureTTS.createSoundPromise(options);
            expectedSoundResponse = azureTTS.createSoundResponse_({
              ...options,
              error,
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
        bytes: new ArrayBuffer(),
      });
    });

    it('no-ops if sound is already playing', async () => {
      const dequeueStub = jest.spyOn(azureTTS, 'dequeue_');
      azureTTS.playing = true;

      await azureTTS.asyncPlayFromQueue_(playSpy);
      expect(dequeueStub.mock.calls.length).to.equal(0);
      expect(playSpy).not.to.have.been.called;
    });

    it('no-ops if queue is empty', async () => {
      const dequeueStub = jest
        .spyOn(azureTTS, 'dequeue_')
        .mockReturnValue(undefined);

      await azureTTS.asyncPlayFromQueue_(playSpy);
      expect(dequeueStub.mock.calls.length).to.equal(1);
      expect(playSpy).not.to.have.been.called;
    });

    it('plays sound if response was successful', async () => {
      jest
        .spyOn(azureTTS, 'dequeue_')
        .mockReturnValue(() => Promise.resolve(successfulResponse));

      await azureTTS.asyncPlayFromQueue_(playSpy);
      expect(playSpy).to.have.been.calledOnce;
    });

    it('ends sound if response was unsuccessful', async () => {
      const unsuccessfulResponse = azureTTS.createSoundResponse_({
        error: new Error(),
      });
      unsuccessfulResponse.playbackOptions.onEnded = sinon.spy();
      jest
        .spyOn(azureTTS, 'dequeue_')
        .mockReturnValue(() => Promise.resolve(unsuccessfulResponse));

      await azureTTS.asyncPlayFromQueue_(playSpy);
      expect(unsuccessfulResponse.playbackOptions.onEnded).to.have.been
        .calledOnce;
      expect(playSpy).not.to.have.been.called;
    });
  });
});
