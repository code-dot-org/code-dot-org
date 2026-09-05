// Endpoints the Tutor+ project gallery calls at runtime, served through
// @code-dot-org/core's MSW registry. Only registered from gallery.tsx: the
// deep dive entry's mocks.ts already owns POST */challenge_responses for the
// student submission flow, and these are GETs on the same resource, so both
// can be registered together without colliding on method.
//
// Shapes mirror ChallengeResponsesController: index, unit_counts, show.

import {registerMockFixture} from '@code-dot-org/core/api/mocks';

import {
  CHALLENGES,
  FIXTURE_RESPONSES,
  type FixtureResponse,
  type GalleryChallengeResponse,
} from './galleryFixtures';

type ViewerRole = 'owner' | 'teacher' | 'peer';

// ?viewerRole= picks the layout: teacher sees the AI assessment, owner sees
// just their feedback, peer sees neither. Defaults to teacher, since that is
// the role this gallery is built for.
function viewerRoleFromLocation(): ViewerRole {
  const role = new URLSearchParams(window.location.search).get('viewerRole');
  return role === 'owner' || role === 'peer' ? role : 'teacher';
}

// The index shape: summarize() without include_feedback, so student_feedback
// is not just null, the key is absent.
function toListResponse(response: FixtureResponse): GalleryChallengeResponse {
  return {
    id: response.id,
    challenge_id: response.challenge_id,
    user_id: response.user_id,
    user_name: response.user_name,
    unit_id: response.unit_id,
    lesson_position: response.lesson_position,
    student_text: response.student_text,
    transcript: response.transcript,
    evaluation_status: response.evaluation_status,
    is_final: response.is_final,
    created_at: response.created_at,
    assets: response.assets,
  };
}

export function registerGalleryMocks(): void {
  registerMockFixture([
    // GET /challenge_responses?unit_id=&section_id=&sort= — the gallery grid.
    // GET /challenge_responses?challenge_id=&user_id=&sort=oldest — a
    // project's version switcher. Both go through this one handler, same as
    // the Rails action.
    {
      path: '*/challenge_responses',
      respond: ({url}) => {
        const params = url.searchParams;
        let list = FIXTURE_RESPONSES;
        if (params.has('unit_id')) {
          list = list.filter(r => r.unit_id === Number(params.get('unit_id')));
        }
        // "My projects" (no section_id) is not modeled here — the fixture has
        // no signed-in-user concept, so it falls back to showing everyone's.
        if (params.has('section_id')) {
          list = list.filter(
            r => r.sectionId === Number(params.get('section_id')),
          );
        }
        if (params.has('challenge_id')) {
          list = list.filter(
            r => r.challenge_id === Number(params.get('challenge_id')),
          );
        }
        if (params.has('user_id')) {
          list = list.filter(r => r.user_id === Number(params.get('user_id')));
        }
        const sorted = [...list].sort((a, b) =>
          a.created_at.localeCompare(b.created_at),
        );
        if (params.get('sort') !== 'oldest') sorted.reverse();
        return sorted.map(toListResponse);
      },
    },

    // GET /challenge_responses/unit_counts?section_id= — registered ahead of
    // the /:id route below, or matchRequestUrl would read "unit_counts" as
    // an :id.
    {
      path: '*/challenge_responses/unit_counts',
      respond: ({url}) => {
        const sectionId = url.searchParams.get('section_id');
        const list = sectionId
          ? FIXTURE_RESPONSES.filter(r => r.sectionId === Number(sectionId))
          : FIXTURE_RESPONSES;
        const counts: Record<string, number> = {};
        for (const response of list) {
          if (response.unit_id === null) continue;
          const key = String(response.unit_id);
          counts[key] = (counts[key] ?? 0) + 1;
        }
        return counts;
      },
    },

    // GET /challenge_responses/:id — the project page detail. Rails omits
    // student_feedback/evaluated_at/evaluation_result/rubric entirely for
    // roles that don't get them (summarize()'s include_feedback/
    // include_evaluation are conditional hash keys, not nulled fields), so
    // the mock does too — a client that distinguishes absent from null
    // should see the same thing against either backend.
    {
      path: '*/challenge_responses/:id',
      respond: ({params}) => {
        const response = FIXTURE_RESPONSES.find(
          r => r.id === Number(params.id),
        );
        if (!response) return new Response(null, {status: 404});
        const role = viewerRoleFromLocation();
        const challenge = CHALLENGES[response.challenge_id];
        return {
          ...toListResponse(response),
          viewer_role: role,
          question: challenge.question,
          ...(role !== 'peer' && {
            student_feedback: response.evaluation?.student_feedback ?? null,
            evaluated_at: response.evaluatedAt,
          }),
          ...(role === 'teacher' && {
            evaluation_result: response.evaluation,
            rubric: challenge.rubric,
          }),
        };
      },
    },
  ]);
}
