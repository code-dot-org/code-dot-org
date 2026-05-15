import {test} from '../../shared/fixtures';

import {VideoPlayerPage} from './VideoPlayerPage';

test.describe('Video player', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/video/videoplayer_eyes.feature
   * Scenario: Fallback player
   */
  test('fallback player for Flappy level', async ({page}) => {
    const videoPlayer = new VideoPlayerPage(page);

    await videoPlayer.open('/flappy/1?force_youtube_fallback');
    await videoPlayer.expectFlappyVideoDialogReady();
    await videoPlayer.expectFallbackPlayerReady();
    // Visual checkpoint stub: fallback video player for level.
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/video/videoplayer_eyes.feature
   * Scenario: Fallback player for unplugged
   */
  test('fallback player for unplugged level', async ({page}) => {
    const videoPlayer = new VideoPlayerPage(page);

    await videoPlayer.open(
      '/courses/allthethingscourse/units/1/lessons/55/levels/1?force_youtube_fallback',
    );
    await videoPlayer.expectFallbackPlayButtonReady();
    // Visual checkpoint stub: fallback video player for unplugged.
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/video/videoplayer_eyes.feature
   * Scenario: Fallback player for embedded
   */
  test('fallback player for embedded level', async ({page}) => {
    const videoPlayer = new VideoPlayerPage(page);

    await videoPlayer.open(
      '/courses/allthethingscourse/units/1/lessons/34/levels/1?force_youtube_fallback=1',
    );
    await videoPlayer.expectFallbackPlayButtonReady();
    // Visual checkpoint stub: fallback video player for embedded.
  });

  /**
   * Migration status: SKIPPED
   * Source: dashboard/test/ui/features/teacher_tools/video/videoplayer_eyes.feature
   * Scenario: Flash fallback player gets injected in Chrome (assuming Flash is available)
   */
  test.skip('Flash fallback player gets injected in Chrome', async () => {
    test.skip(
      true,
      'Source scenario is @skip: browser plugin autoplay was removed from supported browsers.',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/video/videoplayer_eyes.feature
   * Scenario: Normal player
   */
  test(
    'normal player uses the expected Flappy YouTube embed',
    {tag: '@no_mobile'},
    async ({page}) => {
      const videoPlayer = new VideoPlayerPage(page);

      await videoPlayer.open('/flappy/1');
      await videoPlayer.expectFlappyVideoDialogReady();
      await videoPlayer.expectFlappyYouTubeEmbed();
    },
  );
});
