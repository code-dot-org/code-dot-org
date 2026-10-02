import {expect, test} from '../fixtures';
import {
  LessonTutorPage,
  type VideoAudioTrack,
  type VideoAudioTracks,
} from '../pages/lesson-tutor-page';

// aif1-v2-2025 lesson 1 has two seeded json videos
// (dashboard/config/json_videos/lesson-tutor-aif26-u1-l1-v*.json), so the
// intervention screen shows the carousel, which reuses one <json-video> and
// gives it a new src per video.
const UNIT = 'aif1-v2-2025';
const LESSON = 1;

// <json-video> plays through two <audio> elements: one for a video's
// top-level track, one for the current scene's own clip. Which one a video
// uses is decided when it is authored, and the documents live in S3, so the
// assertions are about "a track", never a particular one. Both bugs these
// cover showed up as audio: scene clips not starting on play, and a previous
// video's track playing on under the next.
const isPlaying = (track: VideoAudioTrack) =>
  !track.paused && track.currentTime > 0.1;
const anyPlaying = (tracks: VideoAudioTracks) =>
  isPlaying(tracks.main) || isPlaying(tracks.scene);
const allPaused = (tracks: VideoAudioTracks) =>
  tracks.main.paused && tracks.scene.paused;
const loadedSources = (tracks: VideoAudioTracks) =>
  [tracks.main.src, tracks.scene.src].filter(src => src !== null);

test.describe('Lesson tutor videos', () => {
  test.beforeEach(async ({page, signInAsNewUser}) => {
    await signInAsNewUser({type: 'student', name: 'Test Student'});
    const tutor = new LessonTutorPage(page);
    await tutor.gotoScreen({unit: UNIT, lesson: LESSON});
    await tutor.openVideos();
  });

  test('Play starts the audio and pause stops it', async ({page}) => {
    const tutor = new LessonTutorPage(page);

    await tutor.playButton.click();
    await expect
      .poll(async () => anyPlaying(await tutor.audioTracks()))
      .toBe(true);

    await tutor.playButton.click();
    await expect
      .poll(async () => allPaused(await tutor.audioTracks()))
      .toBe(true);
  });

  test('Switching videos drops the previous video audio', async ({page}) => {
    const tutor = new LessonTutorPage(page);

    await tutor.playButton.click();
    await expect
      .poll(async () => anyPlaying(await tutor.audioTracks()))
      .toBe(true);
    const previous = loadedSources(await tutor.audioTracks());
    expect(previous).not.toEqual([]);

    await tutor.switchVideo(tutor.nextVideoButton);

    // Nothing of the previous video is left on either track after the load.
    const afterLoad = await tutor.audioTracks();
    expect(allPaused(afterLoad)).toBe(true);
    expect(
      loadedSources(afterLoad).filter(src => previous.includes(src)),
    ).toEqual([]);

    // And play starts only this video's audio.
    await tutor.playButton.click();
    await expect
      .poll(async () => anyPlaying(await tutor.audioTracks()))
      .toBe(true);
    const playing = await tutor.audioTracks();
    for (const track of [playing.main, playing.scene]) {
      if (!track.paused) expect(previous).not.toContain(track.src);
    }
  });
});
