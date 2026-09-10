---
title: Sharing and abuse
description: How sharing eligibility is determined and how the abuse-reporting pipeline works.
type: reference
---

## Sharing eligibility

Sharing eligibility is decided in three layers, evaluated in order:

1. **Project type.** `ALWAYS_PUBLISHABLE_PROJECT_TYPES` (Artist, Dance, Sprite Lab,
   Music Lab, Python Lab, and many block-based labs) can be shared by anyone.
   `CONDITIONALLY_PUBLISHABLE_PROJECT_TYPES` (App Lab, Game Lab) are gated by age
   and the teacher's sharing setting. `UNPUBLISHABLE_PROJECT_TYPES` (Web Lab,
   Algebra Game, Minecraft Code Builder) cannot be published to the gallery but may
   still have share links.

2. **Age and teacher setting.** For conditionally publishable types, the student's
   `sharing_disabled` boolean on the `users` table controls access. Under-13
   accounts default to `sharing_disabled = true` on creation. A teacher's section
   `sharing_disabled` flag propagates to students on join; when a student leaves all
   sections, the flag resets based on age.

3. **Restricted share mode.** Sprite Lab projects with uploaded student images enter
   restricted share mode (`RESTRICTED_PUBLISH_PROJECT_TYPES`). The project can still
   be shared via link but cannot be published or remixed.

The frontend resolves these in `headerShare.js`, `ShareAllowedDialog.jsx`, and
`ShareDisallowedDialog.jsx`. The backend enforces publish eligibility in
`ProjectsController#can_publish_age_status`.

## Share filtering

When a student opens the share dialog, `lib/cdo/share_filtering.rb` scans the
project source for personal information (names, phone numbers, emails). The scan
depth for Blockly JSON is controlled by DCDO `share_filtering_blockly_json_max_depth`.
The filter is backed by WebPurify (Gatekeeper `webpurify`); in development and test
environments, WebPurify calls are skipped.

## Abuse reporting

The report-abuse form at `/report_abuse` accepts reports from signed-in and
signed-out users. When DCDO `restrict-abuse-reporting-to-verified` is true, only
verified (signed-in) users can submit.

Each report increments the project's `abuse_score` across the channel and all its
asset buckets (`sources`, `assets`, `files`, `animations`, `libraries`). When the
abuse score reaches or exceeds the threshold of **15**
(`SharedConstants::ABUSE_CONSTANTS.ABUSE_THRESHOLD`), the project is blocked:

- The share page shows a blocked message.
- Remix is forbidden (`abuse_score_blocks_remix?`).
- The project remains in the owner's project list but is inaccessible to others.

Staff can reset the abuse score through an admin interface, unblocking the project.

In production, reports are forwarded to Zendesk for human review. In development
and test environments, the Zendesk POST is skipped.

## Content proxies

Three proxy controllers let student code fetch external resources through the
CodeAI origin:

| Route | Controller | Allowlist |
|---|---|---|
| `GET /media` | `MediaProxyController` | Content-type allowlist + hostname-suffix allowlist |
| `GET /xhr` | `XhrProxyController` | JSON content-type allowlist only |
| `GET /redirected_url` | `RedirectProxyController` | Hostname-suffix allowlist (bit.ly, tinyurl.com, etc.) |

None of these controllers implement rate limiting in application code. Content-type
and hostname filtering are the only in-repo controls. WAF or CloudFront-level
limits may exist outside version control.

## Related

- [Project storage](/developers/projects/project-storage/)
- [Publishability tiers](/developers/projects/publishability-tiers/)
