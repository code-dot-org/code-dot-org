# Design: teacher-dashboard-lesson-materials

## Context

TSX component family in `teacherNavigation/lessonMaterials/` reading
`currentUser.showAITALessonSummary` / `showAITAPodcasts` (seeded from HAML
DCDO values today) and `teacherSections` selection state; resources from
`/dashboardapi/lesson_materials/:unit_id`; AIF check via `unit_in_aif`.
Podcast/summary generation triggers live in `teacherSectionsRedux`
(assignment-change hooks). Empty state driven by missing curriculum
assignment (Router:250-261).

## Goals / Non-Goals

**Goals:** full tab parity including all three AI sub-features under both
gate arms; pixel parity (DSCO-era surface).

**Non-Goals:** no changes to AITA generation backends; no new AI features;
the dead `{aif:false}` branch is not reproduced (bad id = 404 is the
contract; its removal is in `teacher-dashboard-api-hygiene`).

## Decisions

- D1. Port like homepage (TSX extraction + Query spine), not roster-style
  store bridging: the components are modern TSX; their redux reads
  (currentUser flags, selected section) map to the home-endpoint flags and
  the shell's selected-section query.
- D2. AITA flags come from the homepage change's
  `GET /api/v1/teacher_dashboard/home` (`showAITALessonSummary`,
  `showAITAPodcasts`) — no second flag channel; the experiment arms
  (`ai-lesson-podcasts`, AI_ARTIFACT) read through the candidate's
  experiments adapter.
- D3. Generation triggers (summary/podcast kickoff on assignment change)
  are re-expressed as effects on the candidate's assignment mutation path,
  with the legacy `teacherSectionsRedux:1132-1143` behavior as the oracle;
  they fire under the same conditions, not more often.
- D4. `unit_in_aif` wrapper encodes bad-id = 404 (verified contract), with
  a parser test pinning it.

## Hardening addendum (2026-07-04)

Endpoints pinned from `LessonMaterialsContainer.tsx` (this session):

| Method + path | Params | Notes |
| --- | --- | --- |
| GET `/dashboardapi/lesson_materials/...` | (:70; full path shape capture-gated) | resources per unit |
| GET `/ai_lesson_summaries/show` | query `lesson_id` (:202-204) | AITA summary; response `{lesson_summary}` is a JSON-in-string (`JSON.parse(response.value.lesson_summary)`, :209-210) — the schema must model the double encoding |
| `<audio src="/ai_lesson_summary_podcasts/show?lesson_id=...">` | :437 | CORRECTION: podcasts are STREAMED via an audio element src, not fetched as JSON. MSW/dev-shell must stub an audio response (or mask the player in offline scenarios); the wrapper layer covers only the URL construction |
| GET `/teacher_dashboard/unit_in_aif` | query `unit_id` (:229) | bad id = 404, pinned earlier |

All wrappers in CORE DashboardApi (human ruling); feature owns fixtures
only; the materials entry lazy-loads outside the shell chunk.

Additional gate row — responsive (desktop/laptop): resource rows and
dropdowns reflow at common desktop widths, 200% zoom, split-screen,
narrow laptop; the audio player remains operable. Tablet/mobile parity
NOT required.

## Risks / Trade-offs

- [Podcast/summary UI depends on generation state that is slow/async] →
  MSW scenarios cover pending/ready/absent states; live checks accept
  eventual consistency, component tests pin the state machine.
- [Both-arms flag matrix multiplies scenarios (2 summary × 2 podcast paths
  × artifact)] → scenarios pin combinations that change UI, not the full
  cross product; the discovery gate enumerates which combinations are
  distinct.

## Migration Plan

Wrappers → discovery → port read-only resources → port AI sub-features →
flip map entry → pixel baselines → verify. Rollback: revert additive
commits.
