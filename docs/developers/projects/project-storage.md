---
title: Project storage
description: How projects are stored, identified, and served in the CodeAI platform.
type: concept
---

Every project is identified by a **channel id** -- an encrypted token derived from a
`storage_id` and a `project_id`. The channel id appears in every project URL
(`/projects/:type/:channel_id`) and is the primary key for all project operations.

## Storage model

Project sources and assets live in S3, in the `cdo-v3-sources` and `cdo-v3-files`
buckets. The Sinatra middleware at `/v3/channels` (ChannelsApi) handles reads and
writes; Rails controllers handle higher-level operations (share, remix, publish).

The `channel_tokens` table maps an encrypted channel id to a `storage_id` and
`level_id`. The `user_project_storage_ids` table maps a user to their `storage_id`.
A signed-out user gets a `storage_id` via a cookie; when they later sign in, the
storage id is associated with their user record.

## Channel id and authentication

Loading, viewing, and editing a project by channel id does **not** require a
session. The `ProjectsController` exempts `show`, `edit`, and `load` from
`authenticate_user!`. The channel id's unguessability is the only access control
for read and edit operations. Do not expose a channel id in logs, analytics, or
error reports.

Mutating operations -- remix (creates a new channel), delete, publish, and abuse
reporting -- do require authentication.

## The `project-uuid-in-url` flag

The DCDO flag `project-uuid-in-url` (default: false) controls whether the URL
uses the raw UUID or the encrypted form. The encrypted form is the production
default. Do not modify the channel-id AES encryption scheme.

## Data storage (datablock)

App Lab and Game Lab projects that use `createRecord` / `setKeyValue` store
structured data in the `datablock_storage_tables` and `datablock_storage_records`
tables. The `DatablockStorageController` serves these at
`/datablock_storage/:channel_id/*` with a rate limit of 30 requests per 10 seconds
per channel (DCDO `datablock_storage_request_limit_per_ten_seconds`).

## Related

- [Sharing and abuse pipeline](/developers/projects/sharing-and-abuse/)
- [Publishability tiers](/developers/projects/publishability-tiers/)
- [Sandboxed preview domain](/developers/projects/sandboxed-preview-domain/)
