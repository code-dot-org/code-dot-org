import {expect, test} from '../fixtures';
import {LessonTutorPage} from '../pages/lesson-tutor-page';
import {
  MAIN_TRACK_VIDEO,
  MAIN_TRACK_VIDEO_SECONDS,
  SCENE_NARRATED_VIDEO,
  SCENE_NARRATED_VIDEO_SECONDS,
  serveJsonVideos,
} from '../shared/json-video-documents';

// ui-test-lesson-tutor (dashboard/test/ui/config) is a unit under an AIF
// course offering, which is what turns the Tutor+ deep dive on, with two json
// videos seeded against its one lesson's objectives, so the intervention
// screen shows the carousel. The carousel reuses one <json-video> and gives
// it a new src per video. The documents themselves come from serveJsonVideos,
// so the first video is known to be narrated per scene and the second to have
// a top-level track.
const UNIT = 'ui-test-lesson-tutor';
const LESSON = 1;

test.describe('Lesson tutor videos', () => {
  test.beforeEach(async ({page, signInAsNewUser}) => {
    await signInAsNewUser({type: 'student', name: 'Test Student'});
    await serveJsonVideos(page, [SCENE_NARRATED_VIDEO, MAIN_TRACK_VIDEO]);
    const tutor = new LessonTutorPage(page);
    await tutor.gotoScreen({unit: UNIT, lesson: LESSON});
    await tutor.openVideos();
    expect(await tutor.duration()).toBe(SCENE_NARRATED_VIDEO_SECONDS);
  });

  // Before the fix, play() started only the top-level track; a scene clip
  // started only on a scene change or a seek, so this video stayed silent.
  test('Play starts a scene-narrated video and pause stops it', async ({
    page,
  }) => {
    const tutor = new LessonTutorPage(page);

    await tutor.playButton.click();
    await expect
      .poll(() => tutor.audioTracks())
      .toMatchObject({
        scene: {paused: false},
        main: {paused: true, src: null},
      });
    await expect
      .poll(async () => (await tutor.audioTracks()).scene.currentTime)
      .toBeGreaterThan(0.1);

    await tutor.playButton.click();
    await expect
      .poll(() => tutor.audioTracks())
      .toMatchObject({
        scene: {paused: true},
      });
  });

  // Before the fix, a load kept whichever track the new video did not
  // replace, so a track from the previous video survived the switch and
  // play() started it under the new video. The scene clip is started by a
  // seek rather than by play, which pre-fix did not start it, so this test
  // fails on the stale track and not on the play bug above.
  test('Switching videos drops the previous video audio', async ({page}) => {
    const tutor = new LessonTutorPage(page);

    await tutor.playButton.click();
    await tutor.seek(2);
    await expect
      .poll(() => tutor.audioTracks())
      .toMatchObject({
        scene: {paused: false},
      });

    await tutor.switchVideo(tutor.nextVideoButton);
    expect(await tutor.duration()).toBe(MAIN_TRACK_VIDEO_SECONDS);
    expect(await tutor.audioTracks()).toMatchObject({
      scene: {paused: true, src: null},
      main: {paused: true},
    });

    await tutor.playButton.click();
    await expect
      .poll(() => tutor.audioTracks())
      .toMatchObject({
        main: {paused: false},
        scene: {paused: true, src: null},
      });

    await tutor.switchVideo(tutor.previousVideoButton);
    expect(await tutor.duration()).toBe(SCENE_NARRATED_VIDEO_SECONDS);
    expect(await tutor.audioTracks()).toMatchObject({
      main: {paused: true, src: null},
      scene: {paused: true},
    });

    await tutor.playButton.click();
    await expect
      .poll(() => tutor.audioTracks())
      .toMatchObject({
        main: {paused: true, src: null},
        scene: {paused: false},
      });
  });
});
