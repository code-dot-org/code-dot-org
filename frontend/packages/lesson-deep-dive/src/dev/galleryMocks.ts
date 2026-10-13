// mocks.ts owns POST */challenge_responses; these GETs share its path, not
// its method, so both registries can load together.

import {
  registerMockFixture,
  type MockResponderContext,
} from '@code-dot-org/core/api/mocks';

import {
  CHALLENGES,
  FIXTURE_RESPONSES,
  TUTOR_GALLERY_DATA,
  type FixtureResponse,
  type GalleryChallengeResponse,
} from './galleryFixtures';
import {csrfTokenRoute} from './mocks';

type ViewerRole = 'owner' | 'teacher' | 'peer';

// Defaults to teacher, the role the gallery is built for.
function viewerRoleFromLocation(): ViewerRole {
  const role = new URLSearchParams(window.location.search).get('viewerRole');
  return role === 'owner' || role === 'peer' ? role : 'teacher';
}

type MockStore = MockResponderContext['store'];

// Approvals the viewer has toggled, by response id, over the fixture's own.
function readApprovals(store: MockStore): Record<string, boolean> {
  return store.read<Record<string, boolean>>('approvals') ?? {};
}

function isApproved(store: MockStore, response: FixtureResponse): boolean {
  return readApprovals(store)[response.id] ?? response.approved;
}

// The viewer's own reactions by response id; the fixture has no other viewers.
function readReactions(store: MockStore): Record<string, string[]> {
  return store.read<Record<string, string[]>>('reactions') ?? {};
}

// Synced with ChallengeResponseReaction::EMOJIS, whose order Rails returns.
const EMOJI_ORDER = ['clap', 'fire', 'smile', 'heart', 'party', 'trophy'];

function reactionsBody(mine: string[]) {
  return {
    reactions: EMOJI_ORDER.filter(emoji => mine.includes(emoji)).map(emoji => ({
      emoji,
      count: 1,
      reacted: true,
    })),
  };
}

// Rails' summarize omits student_feedback from list rows: absent, not null.
function toListResponse(
  store: MockStore,
  response: FixtureResponse,
): GalleryChallengeResponse {
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
    approved: isApproved(store, response),
    created_at: response.created_at,
    assets: response.assets,
    ...reactionsBody(readReactions(store)[response.id] ?? []),
  };
}

export function registerGalleryMocks(): void {
  registerMockFixture([
    csrfTokenRoute,

    // POST /challenge_responses/:id/reactions {emoji}
    {
      method: 'post',
      path: '*/challenge_responses/:id/reactions',
      respond: async ({params, request, store}) => {
        const id = String(params.id);
        const {emoji} = (await request.json()) as {emoji: string};
        const reactions = readReactions(store);
        const mine = [...new Set([...(reactions[id] ?? []), emoji])];
        store.write('reactions', {...reactions, [id]: mine});
        return reactionsBody(mine);
      },
    },

    // DELETE /challenge_responses/:id/reactions/:emoji
    {
      method: 'delete',
      path: '*/challenge_responses/:id/reactions/:emoji',
      respond: ({params, store}) => {
        const id = String(params.id);
        const reactions = readReactions(store);
        const mine = (reactions[id] ?? []).filter(
          emoji => emoji !== params.emoji,
        );
        store.write('reactions', {...reactions, [id]: mine});
        return reactionsBody(mine);
      },
    },

    // PATCH /challenge_responses/:id/approve {approved}
    {
      method: 'patch',
      path: '*/challenge_responses/:id/approve',
      respond: async ({params, request, store}) => {
        const response = FIXTURE_RESPONSES.find(
          r => r.id === Number(params.id),
        );
        if (!response) return new Response(null, {status: 404});
        const {approved} = (await request.json()) as {approved: boolean};
        store.write('approvals', {
          ...readApprovals(store),
          [response.id]: approved,
        });
        return {...toListResponse(store, response)};
      },
    },

    // GET /api/v1/scripts/:script/lessons/:position/tutor_gallery_data
    {
      path: '*/tutor_gallery_data',
      respond: () => ({
        ...TUTOR_GALLERY_DATA,
        is_teacher: viewerRoleFromLocation() === 'teacher',
      }),
    },

    // GET /challenge_responses?unit_id=&section_id=&sort=
    // GET /challenge_responses?challenge_id=&user_id=&sort=oldest
    {
      path: '*/challenge_responses',
      respond: ({url, store}) => {
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
        // Rails also shows a student their own rows; the fixture has no
        // signed-in user.
        if (viewerRoleFromLocation() !== 'teacher') {
          list = list.filter(response => isApproved(store, response));
        }
        const sorted = [...list].sort((a, b) =>
          a.created_at.localeCompare(b.created_at),
        );
        if (params.get('sort') !== 'oldest') sorted.reverse();
        return sorted.map(response => toListResponse(store, response));
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
      respond: ({params, store}) => {
        const response = FIXTURE_RESPONSES.find(
          r => r.id === Number(params.id),
        );
        if (!response) return new Response(null, {status: 404});
        const role = viewerRoleFromLocation();
        const challenge = CHALLENGES[response.challenge_id];
        return {
          ...toListResponse(store, response),
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
