---
title: Operations
description: Local setup, test suites, CI pipelines, deploy targets, logs, and internal staff tools.
type: concept
---

Day-to-day mechanics of working in the CodeAI monorepo: running the app locally, running tests, understanding how code reaches production, finding logs, and using the internal staff tools.

- [Local development](/developers/operations/local-development/) -- run the two servers, configure `locals.yml`, and fix common breakages.
- [Testing](/developers/operations/testing/) -- the test suites (jest, Karma, minitest, vitest, Playwright, Cucumber), how to run one file, and what CI runs where.
- [Test API and local accounts](/developers/operations/test-api-and-local-accounts/) -- the test-only HTTP API, the e2e `createUser` helper, and rails runner.
- [Delivery](/developers/operations/delivery/) -- branches, Drone, GitHub Actions, Chef/EC2, the k8s path, adhoc environments, and deploys.
- [Logs and observability](/developers/operations/logs-and-observability/) -- where logs go, how to access servers, and links to the platform observability page.
- [Staff tools](/developers/operations/staff-tools/) -- admin account lookup, impersonation, permissions, moderation, reports, and NPS.

For the platform internals (Rails layering, background jobs, flags, observability APIs), see [Platform](/developers/platform/).

For the documentation system maintenance runbook, see [Documentation](/developers/documentation/).
