---
title: Platform
description: The CodeAI platform internals -- Rails monolith, frontend build, jobs, email, observability, and feature flags.
type: concept
---

The platform section documents the cross-cutting infrastructure that every engineer in this repo touches. If you need to understand how a request reaches a controller, where business logic goes, how flags gate a rollout, or why two error trackers are wired at once, start here.

- [System overview](/developers/platform/system-overview/) -- the Rails monolith and everything around it.
- [Conventions and layering](/developers/platform/conventions-and-layering/) -- Services, Policies, Queries, Forms, and where new code belongs.
- [Background jobs](/developers/platform/background-jobs/) -- ActiveJob, delayed_job, the Chef crontab, and adding a job.
- [Email pipeline](/developers/platform/email-pipeline/) -- Poste2, Mailjet, interceptors, and sending mail locally.
- [Observability](/developers/platform/observability/) -- Honeybadger, Sentry, structured logs, and tracing a request.
- [Availability and configuration](/developers/platform/availability-and-configuration/) -- DCDO, Gatekeeper, experiments, pilots, environments, and the flag lifecycle.
- [Frontend build](/developers/platform/frontend-build/) -- the apps/ webpack bundle, the frontend/ Turborepo, the design system, and i18n.

For authentication, sessions, and authorization, see [Authentication and authorization](/developers/platform/authentication/).

For local setup, test suites, and deploy targets, see [Operations](/developers/operations/).
