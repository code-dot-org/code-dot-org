# Design: user-write-api-misc-controllers

## Decisions

**D1 — permissions get one audit mechanism, not two.** Today only the
admin bit is logged (user_permission_grantee.rb:12, and revocation
bypasses it — A2). GrantPermission/RevokePermission emit through the
same channel/format the A2 fix establishes, parameterized by permission
name. The model's `permission=`/`revoke_permission` writers become
shims delegating to the commands so non-controller callers keep working.

**D2 — AcceptDataTransferAgreement preserves leniency.** The endpoint
today does a bare `save` and returns 204 regardless; the command's
`call` (non-raising) form matches. Idempotence guard stays inside the
command. Pin: second acceptance does not overwrite
data_transfer_agreement_at.

**D3 — preferences absorb the two stragglers.** `next_census_display`
and `ai_rubrics_tour_seen` join the UpdatePreferences allowlist; the
rubrics endpoint keeps its `teacher?` 401 guard controller-side (pinned)
because it is authorization, not preference semantics.

**D4 — UpdateSchoolInfo owns the write pair.** The
`update(school_info:)` + `user_school_infos` confirmation-date update
move together into one transactional command; SchoolInfo
first_or_create resolution stays controller/query-side (it is input
resolution, not User mutation). The complete_school_info validation
behavior (user.rb:376) is pinned across the school-shape matrix.

**D5 — closing sweep is a ratchet, not a promise.** The change lands
with a re-run inventory committed alongside; any newly-appeared site
(code moves while this program runs) is classified in the same PR. Cop
graduation is the machine check that the ratchet holds.

## Characterization matrix

admin endpoints: actor admin/non-admin × target user shape; permission
grant/revoke × valid/invalid permission names; DTA: first/repeat accept;
school info: complete/incomplete × US/non-US; rubrics: teacher/student
actor. Pins capture status/body/row deltas/audit messages.

## Rollback

Additive commands, per-endpoint flips, no data migrations.
