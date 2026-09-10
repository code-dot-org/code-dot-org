---
title: Sandboxed preview domain
description: Why Web Lab and Python Lab previews are served from a separate origin.
type: concept
---

Web Lab 2 and Python Lab previews run on a separate origin
(`*.preview.codeprojects.org`, migrating to `*.preview.codeaiprojects.org`) to
isolate student-authored HTML and Python output from the main studio.code.org
session.

## Why a separate domain

Student projects in Web Lab produce arbitrary HTML. Serving that HTML on the main
domain would give it access to the user's session cookies, CSRF tokens, and
same-origin APIs. The preview domain is a different origin, so the student's HTML
cannot read or write anything on studio.code.org.

## Domain migration

Some school content filters block `codeprojects.org` because its per-project UUID
subdomains look like a proxy service. The migration to `codeaiprojects.org` gives
the preview domain a fresh reputation. See `docs/weblab-preview-domain-migration.md`
for the full migration plan.

The domain is selected at runtime by `apps/src/util/sandboxedPreviewDomain.ts` with
this precedence:

1. The `new-preview-domain` experiment (per-session opt-in).
2. The `sandboxed-preview-domain` DCDO flag (per-environment rollout).
3. The default: `codeprojects.org` until the migration completes.

Both domains are served simultaneously. The server accepts requests on either host;
the client decides which one to embed. Stale client bundles continue to work across
the transition.

## Route containment

Preview hosts are constrained at the top of `dashboard/config/routes.rb`. A
catch-all `match '*path'` 404s everything except the preview controller actions,
preventing any other Rails route from being reachable on the preview host. Rack
middleware mounted ahead of routing (the Sinatra `/v3/...` APIs) has no host
constraint and still answers on the preview hosts.

## Related

- [Project storage](/developers/projects/project-storage/)
- [Sharing and abuse](/developers/projects/sharing-and-abuse/)
