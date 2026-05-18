import {createStudent} from '../../shared/auth';
import {test} from '../../shared/fixtures';

import {TextToSpeechPage} from './TextToSpeechPage';

test.describe('Text-to-speech', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/text_to_speech.feature
   * Scenario: Check that TTS player is displayed
   */
  test(
    'TTS player is displayed on a CSF contained level',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page);
      const tts = new TextToSpeechPage(page);

      await tts.openLevel(
        '/courses/allthettsthings/units/1/lessons/1/levels/1',
      );
      await tts.expectInlineAudioCount(1);
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/text_to_speech.feature
   * Scenario: Listen to TTS Audio in CSF
   */
  test(
    'CSF level shows inline-audio for feedback and hint after run',
    {tag: '@chrome'},
    async ({page}) => {
      const tts = new TextToSpeechPage(page);

      await tts.openLevel(
        '/courses/allthethingscourse/units/1/lessons/6/levels/3?noautoplay=true',
      );
      await tts.runCsfLevel();
      await tts.expectCsfTopInstructionsAudioCount(2);
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/text_to_speech.feature
   * Scenario: Listen to TTS Audio in CSF contained level
   */
  test(
    'CSF contained level shows one inline-audio element',
    {tag: '@chrome'},
    async ({page}) => {
      await createStudent(page);
      const tts = new TextToSpeechPage(page);

      await tts.openLevel(
        '/courses/allthettsthings/units/1/lessons/1/levels/1',
      );
      await tts.expectInlineAudioCount(1);
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/text_to_speech.feature
   * Scenario: Listen to TTS Audio in CSD
   */
  test(
    'CSD level shows one inline-audio element',
    {tag: '@chrome'},
    async ({page}) => {
      await createStudent(page);
      const tts = new TextToSpeechPage(page);

      await tts.openLevel(
        '/courses/allthettsthings/units/1/lessons/1/levels/2',
      );
      await tts.expectInlineAudioCount(1);
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/text_to_speech.feature
   * Scenario: Listen to TTS Audio in CSP and CSP contained level
   */
  test(
    'CSP levels show one inline-audio element each',
    {tag: '@chrome'},
    async ({page}) => {
      await createStudent(page);
      const tts = new TextToSpeechPage(page);

      await tts.openLevel(
        '/courses/allthettsthings/units/1/lessons/1/levels/4',
      );
      await tts.expectInlineAudioCount(1);

      await tts.openLevel(
        '/courses/allthettsthings/units/1/lessons/1/levels/3',
      );
      await tts.expectInlineAudioCount(1);
    },
  );
});
