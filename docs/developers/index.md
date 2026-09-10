---
title: Developers
description: Engineering documentation for the CodeAI platform (studio.code.org).
type: concept
---

This is the developer documentation for the CodeAI monorepo. It covers the platform internals, the labs that students use, project storage and sharing, external integrations, AI features, professional learning, and the curriculum authoring pipeline.

Start with [ARCHITECTURE.md](https://github.com/code-dot-org/code-dot-org/blob/staging/ARCHITECTURE.md) for the tenets that rarely change, then use the sections below for the subsystem you are working in.

## Platform

How the Rails monolith, the frontend build, background jobs, email, observability, and feature flags fit together. Start here if you are new to the repo or need to understand a cross-cutting concern.

See [Platform](/developers/platform/).

## Labs

How a curriculum level becomes a running lab in the browser: the level-loading contract, the Blockly fork, and how to add a new lab.

See [Labs](/developers/labs/).

## Projects

Channel-based project storage, the sharing and abuse pipeline, publishability tiers, and the sandboxed preview domain.

See [Projects](/developers/projects/).

## Integrations

LTI integration with school LMS platforms, roster sync from Google Classroom and Clever, and the school and district data model.

See [Integrations](/developers/integrations/).

## AI

The AI subsystem: aichat, the tutor, rubric evaluation, lesson summaries, and the safety pipeline.

See [AI](/developers/ai/).

## Professional learning

The workshop and enrollment object model, Foorm surveys, and how teacher verification and permissions work.

See [Professional learning](/developers/professional-learning/).

## Curriculum

The levelbuilder authoring environment, the curriculum data model and seeding pipeline, and the file round-trip between the database and `dashboard/config/`.

See [Curriculum](/developers/curriculum/).

## Operations

Local setup, test suites and CI, deploy targets and adhoc environments, and the documentation maintenance runbook.

See [Operations](/developers/operations/).
