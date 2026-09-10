---
title: Roster sync architecture
description: How Clever, Google Classroom, and LTI roster sync pull class lists into CodeAI sections.
type: concept
---

CodeAI supports three roster sync providers. Each uses a different protocol, but the result is the same: a CodeAI section whose student list mirrors an external class.

## Providers

| Provider | Section login type | Auth mechanism | Sync trigger |
|---|---|---|---|
| Google Classroom | `google_classroom` | Teacher's Google OAuth token | Teacher creates section, selects Google Classroom class |
| Clever | `clever` | Teacher's Clever OAuth token | Teacher creates section, selects Clever class |
| LTI (Canvas, Schoology) | `lti_v1` | Server-to-server access token (client credentials grant) | LTI launch or manual sync from Login Info page |

## Common behavior

All three providers:

- Create students who do not yet have CodeAI accounts.
- Match returning students by their provider-specific identity.
- Prevent manual roster edits in the CodeAI section. The external service is the source of truth.
- Support re-sync to pick up changes made in the external service.

## LTI roster sync

LTI roster sync uses the Names and Role Provisioning Service (NRPS), an LTI Advantage extension. The flow:

1. On launch or manual sync, `LtiV1Controller#sync_course` is called.
2. The controller obtains an access token via `Clients::LtiAdvantageClient` using a client-credentials JWT signed with CodeAI's private key.
3. The client calls the NRPS membership endpoint for the course context.
4. `Services::Lti.sync_section_roster` iterates the NRPS response, creating or updating users and section membership.

NRPS membership is capped at `Policies::Lti::MAX_COURSE_MEMBERSHIP` (1000) members per section. Canvas uses resource-link-level membership (the membership endpoint accepts a resource link ID); Schoology uses context-level membership.

Roster sync is gated on `Policies::Lti.roster_sync_enabled?(user)`, which checks `user.teacher?` and `user.lti_roster_sync_enabled`.

## Clever roster sync

Clever sections use `Sections::CleverSection`. When a teacher creates a Clever-type section:

1. The teacher authenticates with Clever via OAuth.
2. CodeAI fetches the teacher's Clever classes.
3. The teacher selects a class to import.
4. CodeAI pulls the student list from Clever's API and creates student accounts or matches existing ones.

Clever district and school administrators who sign in are silently converted to teacher accounts (`User::CLEVER_ADMIN_USER_TYPES`).

## Google Classroom roster sync

Google Classroom sections use `Sections::GoogleClassroomSection`. The flow is similar to Clever:

1. The teacher authenticates with Google via OAuth.
2. CodeAI fetches the teacher's Google Classroom courses.
3. The teacher selects a course to import.
4. CodeAI pulls the course roster.

The `google_classroom_family_name` DCDO flag controls whether family names are included in synced student records.

## Related pages

- [LTI 1.3 integration](/developers/integrations/lti-integration/)
- [School and district data model](/developers/integrations/school-and-district-data-model/)
- [Import a roster](/guide/sections/import-a-roster/) (teacher-facing)
