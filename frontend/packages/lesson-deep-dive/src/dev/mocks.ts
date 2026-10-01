// Dashboard endpoints the deep dive calls at runtime, served through
// @code-dot-org/core's MSW registry. Registered globally (no scenario scope)
// because the dev shell renders one lesson.
//
// Shapes mirror the Rails controllers: practice_problems,
// user_practice_problem_attempts, challenges, challenge_responses,
// ai_student_podcasts, user_lesson_reflections, json_videos content, plus
// get_token for CSRF.

import {
  registerMockFixture,
  type MockJsonBody,
  type MockRoute,
} from '@code-dot-org/core/api/mocks';

import {PRACTICE_PROBLEMS} from './fixtures';

const PODCAST_SCRIPT = [
  {
    voice_id: 'Sam',
    text: "Welcome back! Today we're recapping how AI predicts responses.",
  },
  {voice_id: 'Riley', text: 'Right — and it all starts with the prompt.'},
  {
    voice_id: 'Sam',
    text: 'A more detailed prompt narrows the range of likely next words, so the answer lands closer to what you asked for.',
  },
];

// Silent 8-bit PCM WAV bytes, so audio elements have something real to decode
// without committing a media fixture.
function silentWavBytes(seconds: number, sampleRate = 8000): ArrayBuffer {
  const samples = seconds * sampleRate;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };
  ascii(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  ascii(8, 'WAVEfmt ');
  view.setUint32(16, 16, true); // PCM header size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // byte rate
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  ascii(36, 'data');
  view.setUint32(40, samples, true);
  new Uint8Array(buffer, 44).fill(128); // 8-bit PCM silence
  return buffer;
}

// One second of silence in place of the synthesized podcast audio; the
// AnalyserNode still gets real bytes.
function silentWav(): Response {
  return new Response(silentWavBytes(1), {
    headers: {'Content-Type': 'audio/wav'},
  });
}

// The pipeline inlines each clip as a data URI, so the mock videos do too.
function silentWavDataUri(seconds: number): string {
  const bytes = new Uint8Array(silentWavBytes(seconds));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:audio/wav;base64,${btoa(binary)}`;
}

// The two videos LESSON_DEEP_DIVE_DATA.jsonVideos points at, in the two
// shapes <json-video> has to handle: narration on each scene with no
// top-level track (how the lesson pipeline emits videos), and one top-level
// track over silent scenes (how the older examples are built). Scenes are
// 30 s so nothing in a test's polling window crosses a scene boundary.
const videoScene = (label: string, audio?: string) => ({
  duration: '30s',
  speech: label,
  html: `<h1 style="color:#fff;font-family:sans-serif;margin:1em">${label}</h1>`,
  ...(audio ? {audio} : {}),
});

const JSON_VIDEOS: Record<string, MockJsonBody> = {
  'lesson-tutor-aif26-u1-l1-v1': {
    scenes: [
      videoScene('Scene one', silentWavDataUri(12)),
      videoScene('Scene two', silentWavDataUri(12)),
    ],
  },
  'lesson-tutor-aif26-u1-l1-v2': {
    audio: silentWavDataUri(12),
    scenes: [videoScene('Main track')],
  },
};

let nextAttemptId = 500;

// AuthenticityTokenStore calls this before the first write and reads the
// token from the csrf-token response header, not the body.
export const csrfTokenRoute: MockRoute = {
  path: '*/get_token',
  respond: () =>
    new Response(null, {headers: {'csrf-token': 'dev-shell-csrf-token'}}),
};

export function registerLessonDeepDiveMocks(): void {
  registerMockFixture([
    csrfTokenRoute,

    // JsonVideosController#content. An unknown key declines, so the element
    // sees the 404 and shows its error poster, as Studio would.
    {
      path: '*/json_videos/:key/content',
      respond: ({params}) => JSON_VIDEOS[String(params.key)],
    },

    // PracticeProblemsController#index filters by objective when asked. The
    // seeded problems hang off a different lesson's objective, so the deep
    // dive's own objective ids match none and SkillsCheck falls back to its
    // built-in example questions — which is what Studio does here too.
    {
      path: '*/practice_problems',
      respond: ({url}) => {
        const ids = url.searchParams.getAll('objective_ids[]');
        if (ids.length === 0) return PRACTICE_PROBLEMS;
        return PRACTICE_PROBLEMS.filter(problem =>
          problem.objectives.some(objective =>
            ids.includes(String(objective.id)),
          ),
        );
      },
    },
    {path: '*/user_practice_problem_attempts', respond: []},
    {
      method: 'post',
      path: '*/user_practice_problem_attempts/',
      respond: () => ({id: ++nextAttemptId}),
    },
    {method: 'put', path: '*/user_practice_problem_attempts/:id', respond: {}},

    {path: '*/challenges', respond: []},
    {
      method: 'post',
      path: '*/challenge_responses',
      respond: {id: 601, assets: [{id: 701, asset_type: 'whiteboard_image'}]},
      status: 201,
    },
    {
      method: 'put',
      path: '*/challenge_response_assets/:id/upload',
      respond: {},
    },

    {
      method: 'post',
      path: '*/user_lesson_reflections',
      respond: {},
      status: 201,
    },
    {
      method: 'post',
      path: '*/user_lesson_objective_reflections',
      respond: {},
      status: 201,
    },

    {
      method: 'post',
      path: '*/ai_student_podcasts/generate_podcast',
      respond: {},
      status: 202,
    },
    {
      path: '*/ai_student_podcasts/retrieve_podcast_from_s3',
      respond: () => silentWav(),
    },
    {
      path: '*/ai_student_podcasts',
      respond: {podcast_script: JSON.stringify(PODCAST_SCRIPT)},
    },
  ]);
}
