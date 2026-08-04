// MSW handlers for every dashboard endpoint the feature calls at runtime.
// Shapes mirror the Rails controllers (see report: ai_student_podcasts,
// challenges, challenge_responses, practice_problems,
// user_practice_problem_attempts, user_lesson_reflections).

import {bypass, delay, http, HttpResponse} from 'msw';

import {CHALLENGES, PODCAST_SCRIPT, SERVER_PRACTICE_PROBLEMS} from './fixtures';

let attemptId = 500;

export const handlers = [
  // -- Reflection ----------------------------------------------------------
  http.post('/user_lesson_reflections', () =>
    HttpResponse.json({}, {status: 201}),
  ),
  http.post('/user_lesson_objective_reflections', () =>
    HttpResponse.json({}, {status: 201}),
  ),

  // -- Podcast modality ----------------------------------------------------
  http.post('/ai_student_podcasts/generate_podcast', () =>
    HttpResponse.json({}, {status: 202}),
  ),
  http.get('/ai_student_podcasts', async () => {
    await delay(800); // simulate the generation job finishing
    return HttpResponse.json({podcast_script: JSON.stringify(PODCAST_SCRIPT)});
  }),
  http.get('/ai_student_podcasts/retrieve_podcast_from_s3', async () => {
    const audio = await fetch(bypass('/media/mock-podcast.mp3'));
    return new HttpResponse(await audio.arrayBuffer(), {
      headers: {'Content-Type': 'audio/mpeg'},
    });
  }),

  // -- Challenge modality --------------------------------------------------
  http.get('/challenges', () => HttpResponse.json(CHALLENGES)),
  http.post('/challenge_responses', () =>
    HttpResponse.json(
      {id: 601, assets: [{id: 701, asset_type: 'whiteboard_image'}]},
      {status: 201},
    ),
  ),
  http.put('/challenge_response_assets/:id/upload', () =>
    HttpResponse.json({}),
  ),

  // -- Skills check --------------------------------------------------------
  http.get('/practice_problems', () =>
    HttpResponse.json(SERVER_PRACTICE_PROBLEMS),
  ),
  http.get('/user_practice_problem_attempts', () => HttpResponse.json([])),
  http.post('/user_practice_problem_attempts/', () =>
    HttpResponse.json({id: ++attemptId}, {status: 201}),
  ),
  http.put('/user_practice_problem_attempts/:id', () => HttpResponse.json({})),
];
