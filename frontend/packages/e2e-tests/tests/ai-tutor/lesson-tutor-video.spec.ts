import {expect, test} from '../fixtures';
import {LessonTutorPage} from '../pages/lesson-tutor-page';
import {
  MAIN_TRACK_VIDEO,
  MAIN_TRACK_VIDEO_SECONDS,
  SCENE_NARRATED_VIDEO,
  SCENE_NARRATED_VIDEO_SECONDS,
  serveJsonVideos,
} from '../shared/json-video-documents';

// aif1-v2-2025 lesson 1 has two json videos attached, so the intervention
// screen shows the carousel, which reuses one <json-video> and gives it a new
// src per video. The documents themselves come from serveJsonVideos, so the
// first video is known to be narrated per scene and the second to have a
// top-level track; the real ones live in S3 and could be authored either way.
//
// Drone's instance seeds only the UI-test units (dashboard/test/ui/config),
// not this one, hence @no_ci: the spec runs on DTT against test-studio.
const UNIT = 'aif1-v2-2025';
const LESSON = 1;

test.describe('Lesson tutor videos', {tag: ['@no_ci']}, () => {
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

  // Before the fix, a load only touched the top-level track's element when
  // the new video had one, so a track from the previous video survived the
  // switch and play() started it under the new video.
  test('Switching videos drops the previous video audio', async ({page}) => {
    const tutor = new LessonTutorPage(page);

    await tutor.playButton.click();
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
        scene: {paused: false},
        main: {paused: true, src: null},
      });
  });
});
