import {expect, test} from '../fixtures';
import {LessonTutorPage} from '../pages/lesson-tutor-page';
import {createTeacherAssociatedStudent, resetSession} from '../shared/auth';
import {
  MAIN_TRACK_VIDEO,
  MAIN_TRACK_VIDEO_SECONDS,
  SCENE_NARRATED_VIDEO,
  SCENE_NARRATED_VIDEO_SECONDS,
  serveJsonVideos,
} from '../shared/json-video-documents';
import {setAiChatAccessLevelOnCreate} from '../shared/sections';

// Under an AIF course offering, which enables the deep dive, with two videos.
const UNIT = 'ui-test-lesson-tutor';
const LESSON = 1;

test.describe('Lesson tutor videos', () => {
  test.beforeEach(async ({page}) => {
    // The deep dive needs an authorized teacher's section with AI chat enabled.
    await resetSession(page);
    await page.goto('/');
    await createTeacherAssociatedStudent(page, {
      studentName: 'Test Student',
      authorized: true,
      onSectionCreated: setAiChatAccessLevelOnCreate(page, 'enabled'),
    });
    await serveJsonVideos(page, [SCENE_NARRATED_VIDEO, MAIN_TRACK_VIDEO]);
    const tutor = new LessonTutorPage(page);
    await tutor.gotoScreen({unit: UNIT, lesson: LESSON});
    await tutor.openVideos();
    expect(await tutor.duration()).toBe(SCENE_NARRATED_VIDEO_SECONDS);
  });

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

  test('Switching videos drops the previous video audio', async ({page}) => {
    const tutor = new LessonTutorPage(page);

    await tutor.playButton.click();
    // Seeking starts the clip, so only a surviving track can fail this test.
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
