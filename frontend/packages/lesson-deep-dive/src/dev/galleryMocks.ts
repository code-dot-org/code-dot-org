// mocks.ts owns POST */challenge_responses; these GETs share its path, not
// its method, so both registries can load together.

import {registerMockFixture} from '@code-dot-org/core/api/mocks';

import {
  CHALLENGES,
  FIXTURE_RESPONSES,
  TUTOR_GALLERY_DATA,
  type FixtureResponse,
  type GalleryChallengeResponse,
} from './galleryFixtures';

type ViewerRole = 'owner' | 'teacher' | 'peer';

// Defaults to teacher, the role the gallery is built for.
function viewerRoleFromLocation(): ViewerRole {
  const role = new URLSearchParams(window.location.search).get('viewerRole');
  return role === 'owner' || role === 'peer' ? role : 'teacher';
}

// Rails' summarize omits student_feedback from list rows: absent, not null.
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
    // GET /api/v1/scripts/:script/lessons/:position/tutor_gallery_data
    {
      path: '*/tutor_gallery_data',
      respond: () => ({...TUTOR_GALLERY_DATA}),
    },

    // GET /challenge_responses?unit_id=&section_id=&sort=
    // GET /challenge_responses?challenge_id=&user_id=&sort=oldest
    {
      path: '*/challenge_responses',
      respond: ({url}) => {
        const params = url.searchParams;
        let list = FIXTURE_RESPONSES;
        if (params.has('unit_id')) {
          list = list.filter(r => r.unit_id === Number(params.get('unit_id')));
        }
        // The fixture has no signed-in user, so "My projects" lists everyone.
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

    // GET /challenge_responses/unit_counts?section_id=
    // Registered before /:id, which would otherwise match "unit_counts".
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

    // GET /challenge_responses/:id
    // Rails omits the role-gated keys rather than nulling them; so does this.
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
