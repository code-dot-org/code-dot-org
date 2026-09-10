## Repo root

./AGENTS.md | Agent conventions: repo map, writing style, README hierarchy, testing/lint pointers | developer | 2026-09-01 | fresh: actively maintained core agent doc | overlaps: ./CLAUDE.md, ./CLAUDE.local.md, ./AGENTS.override.md, ./TESTING.md
./AGENTS.override.md | Private repo-specific conventions: Ruby layering, PR/commit rules, feature flags | developer | untracked (gitignored, not in git history) | unknown: untracked private file, no history to date | overlaps: ./AGENTS.md, ./CLAUDE.local.md, .github/pull_request_template.md
./ARCHITECTURE.md | Architectural tenets: monorepo, monolith, REST, Rails-way, CI-gated merges | developer | 2026-08-28 | fresh: durable constitution-style doc, self-describing | overlaps: ./README.md, ./CONTRIBUTING.md
./CLAUDE.local.md | One-line pointer redirecting Claude to AGENTS.override.md | developer | untracked (gitignored, not in git history) | unknown: untracked private stub file | overlaps: ./AGENTS.override.md, ./CLAUDE.md
./CLAUDE.md | One-line pointer redirecting Claude to AGENTS.md, do-not-edit notice | developer | 2026-08-28 | fresh: thin current stub, matches AGENTS.md | overlaps: ./AGENTS.md, ./CLAUDE.local.md
./CODE_OF_CONDUCT.md | Contributor Covenant code of conduct for the project community | developer | 2026-08-28 | fresh: stable boilerplate, unlikely to change | overlaps: ./CONTRIBUTING.md
./CONTRIBUTING.md | How to contribute: CLA, setup, tenets, style, lint, manual/testing | developer | 2026-08-28 | stale: cites Sauce Labs for manual browser testing | overlaps: ./README.md, ./SETUP.md, ./ARCHITECTURE.md, ./STYLEGUIDE.md, ./CODE_OF_CONDUCT.md, ./TESTING.md
./README.md | Repo overview, quick start, and map of major directories/docs | developer | 2026-08-28 | fresh: quick-start steps match current setup | overlaps: ./SETUP.md, ./CONTRIBUTING.md, ./ARCHITECTURE.md, ./TESTING.md, ./STYLEGUIDE.md
./SETUP.md | Full local dev environment setup for macOS/Ubuntu/Windows | developer | 2026-08-28 | fresh: pins current ruby/node/uv versions | overlaps: ./README.md, ./CONTRIBUTING.md
./stephen-engineering-style-report.md | Personal engineering style analysis report scratch file | unknown | untracked | unknown: untracked scratch file, not part of repo docs | overlaps: none (not a real repo doc)
./STYLEGUIDE.md | Ruby/JS/CSS code style conventions and linting expectations | developer | 2026-08-28 | fresh: durable style reference, still enforced by rake lint | overlaps: ./CONTRIBUTING.md, ./README.md
./TESTING.md | How to run apps/dashboard/pegasus/UI/eyes test suites | developer | 2026-08-28 | stale: PhantomJS/Karma-deprecated and Sauce Labs mentions | overlaps: ./CONTRIBUTING.md, docs/testing-production-locally.md, docs/testing-with-applitools-eyes.md

## docs

docs/build-assets-on-adhoc.md | CI build pipeline flow for adhoc/staging/test asset builds | infra | 2026-08-28 | stale: rebuilds phantomjs-prebuilt, legacy Grunt/webpack flow | overlaps: docs/log-formats.md, docs/where-are-the-logs.md
docs/fa-v4-icons-in-locales-spec.md | Font Awesome v4-in-locales migration analysis ahead of FA v7 upgrade | developer | 2026-08-28 | fresh: active in-progress migration planning doc | overlaps: shared/css/README.md
docs/how-sharing-and-feedback-work.md | One external image link describing a sharing/feedback diagram | developer | 2026-08-28 | stale: single dead Gliffy link, no real content | overlaps: docs/projects-data-model.md
docs/importing-data.md | Pegasus CSV-to-SQL data import column-naming conventions | developer | 2026-08-28 | stale: pegasus-specific, pegasus largely deprecated | overlaps: docs/pegasus-dashboard-integration.md
docs/jwks.md | How to generate/rotate JWKS keys for JWT/LTI 1.3 signing | developer | 2026-08-28 | fresh: stable operational key-rotation reference | overlaps: none
docs/log-formats.md | Reference of log field formats across CloudFront/ALB/Rails/Lambda/etc | infra | 2026-08-28 | fresh: detailed, recently authored AWS log reference | overlaps: docs/logging.md, docs/where-are-the-logs.md
docs/logging.md | Inventory of what emits logs platform-wide and where they land | infra | 2026-08-28 | fresh: detailed current architecture overview with code links | overlaps: docs/log-formats.md, docs/where-are-the-logs.md
docs/pdf-lesson-plan-generation.md | How lesson-plan PDFs are generated from Dropbox-synced .md/.collate files | developer | 2026-08-28 | stale: Dropbox-driven staging cron workflow, thin doc | overlaps: none
docs/pegasus-dashboard-integration.md | How Pegasus reads the dashboard DB and current user | developer | 2026-08-28 | stale: pegasus-centric integration, pegasus mostly deprecated | overlaps: docs/importing-data.md
docs/plc/survey-summary-design.md | 2019 design proposal for a generic JotForm survey summary pipeline | developer | 2026-08-28 | stale: explicitly dated April 2019 proposal doc | overlaps: none
docs/projects-data-model.md | Early data-model design for saveable/shareable user "projects" | developer | 2026-08-28 | stale: early AppsAPI design doc, likely superseded | overlaps: docs/how-sharing-and-feedback-work.md
docs/reset-password-manually.md | How to manually reset a user's password via dashboard-console | developer | 2026-08-28 | stale: shows Rails 4.0.3 console banner in example | overlaps: none
docs/server-sessions.md | AWS Systems Manager Session Manager shell/SSH/port-forward access to servers | infra | 2026-08-28 | fresh: durable current SSM access reference | overlaps: docs/where-are-the-logs.md
docs/testing-production-locally.md | Steps to run a local Rails server in production mode | developer | 2026-08-28 | stale: motivated by IE9 stylesheet-count limits | overlaps: ./TESTING.md
docs/testing-with-applitools-eyes.md | How to write/run Applitools Eyes visual UI tests | developer | 2026-08-28 | stale: Sauce Labs signup and Chrome 33 pin | overlaps: ./TESTING.md
docs/update-levelbuilder.md | Engineer steps to sync levelbuilder/test/staging branches and fix breakage | developer | 2026-08-28 | stale: dead Pivotal Tracker ticket links | overlaps: ./AGENTS.md
docs/weblab-preview-domain-migration.md | Weblab2/pyodide sandbox preview domain migration off codeprojects.org | developer | 2026-08-28 | fresh: active 2026 migration with current rollout flags | overlaps: python/pythonlab/README.md
docs/where-are-the-logs.md | Table of log file locations per environment (dev/staging/test/prod) | infra | 2026-08-28 | stale: superseded by newer logging.md/log-formats.md, dead HipChat image | overlaps: docs/logging.md, docs/log-formats.md, docs/server-sessions.md
docs/youtube-fallback.md | Video.js fallback player for schools that block YouTube | developer | 2026-08-28 | stale: Flash-player fallback instructions, Flash long removed | overlaps: none

## lib, shared, tools

lib/cdo/cloud_formation/README.md | Overview of Cdo::CloudFormation module classes for stack templates | infra | 2026-08-28 | fresh: short stable architecture pointer doc | overlaps: none
shared/css/README.md | Procedure to update self-hosted FontAwesome CSS/webfont files in S3 | developer | 2026-08-28 | fresh: current S3 paths and component-library references | overlaps: docs/fa-v4-icons-in-locales-spec.md
shared/test/README.md | How shared/ Minitest tests use test_helper, VCR, and DB rollback | developer | 2026-08-28 | fresh: stable current test-harness reference | overlaps: none
tools/scripts/javalabSpritesheetGenerators/README.md | Manual steps to build a Java Lab neighborhood spritesheet | developer | 2026-08-28 | unknown: thin one-off script instructions, no version signal | overlaps: python/pythonlab/neighborhood/README.md

## openspec/changes/classlink-roster-support

openspec/changes/classlink-roster-support/design.md | ClassLink One Roster rostering + v2 auth-id migration technical design | developer | 2026-08-28 | fresh: active in-progress 2026 change design | overlaps: proposal.md, tasks.md, both specs/spec.md in this change
openspec/changes/classlink-roster-support/proposal.md | Proposal to add ClassLink One Roster class import/sync for teachers | developer | 2026-08-28 | fresh: active in-progress 2026 change proposal | overlaps: design.md, tasks.md, both specs/spec.md in this change
openspec/changes/classlink-roster-support/specs/classlink-id-migration/spec.md | Spec: versioned TenantId\|SourcedId auth_id and dual-match login window | developer | 2026-08-28 | fresh: active in-progress 2026 spec | overlaps: design.md, proposal.md, tasks.md, classlink-rostering/spec.md
openspec/changes/classlink-roster-support/specs/classlink-rostering/spec.md | Spec: teacher-facing ClassLink class listing/import via One Roster API | developer | 2026-08-28 | fresh: active in-progress 2026 spec | overlaps: design.md, proposal.md, tasks.md, classlink-id-migration/spec.md
openspec/changes/classlink-roster-support/tasks.md | Four-PR implementation task breakdown for ClassLink rostering change | developer | 2026-08-28 | fresh: active in-progress 2026 task list | overlaps: design.md, proposal.md, both specs/spec.md in this change

## python

python/pythonlab/neighborhood/README.md | Python Lab `neighborhood` grid-painter package API, ported from javalab | developer | 2026-08-28 | fresh: current API reference matching shipped package | overlaps: python/pythonlab/README.md, tools/scripts/javalabSpritesheetGenerators/README.md
python/pythonlab/README.md | Overview of Python Lab packages: neighborhood, pythonlab_setup, theater, etc | developer | 2026-08-31 | fresh: current package inventory, recently touched | overlaps: python/pythonlab/neighborhood/README.md, python/pythonlab/theater/README.md, python/README.md, docs/weblab-preview-domain-migration.md
python/pythonlab/theater/README.md | Python Lab `theater` Scene/animation-and-sound package API | developer | 2026-08-31 | fresh: current API reference matching shipped package | overlaps: python/pythonlab/README.md
python/README.md | How Python runs inside Rails via pycall.rb and uv package management | developer | 2026-08-28 | fresh: describes current pycall/uv setup and job-queue caveat | overlaps: python/pythonlab/README.md

## experimental

experimental/README.md | Purpose of experimental/ directory: version-controlled, no prod dependents | developer | 2026-08-28 | fresh: short durable directory-purpose note | overlaps: none

## .github

.github/instructions/copilot.instructions.md | Copilot-specific rule: no new i18n keys, plain English strings only | developer | 2026-08-28 | fresh: short current override, easy to verify | overlaps: none
.github/prompts/opsx-apply.prompt.md | Symlinked prompt: implement tasks from an OpenSpec change | developer | untracked (symlink excluded via .git/info/exclude, points outside repo) | unknown: untracked symlink to external openspec tool, not repo content | overlaps: opsx-archive/explore/propose.prompt.md, openspec/changes/* (same tooling family)
.github/prompts/opsx-archive.prompt.md | Symlinked prompt: archive a completed OpenSpec change | developer | untracked (symlink excluded via .git/info/exclude, points outside repo) | unknown: untracked symlink to external openspec tool, not repo content | overlaps: opsx-apply/explore/propose.prompt.md
.github/prompts/opsx-explore.prompt.md | Symlinked prompt: explore-mode thinking partner for OpenSpec changes | developer | untracked (symlink excluded via .git/info/exclude, points outside repo) | unknown: untracked symlink to external openspec tool, not repo content | overlaps: opsx-apply/archive/propose.prompt.md
.github/prompts/opsx-propose.prompt.md | Symlinked prompt: create a new OpenSpec change proposal with artifacts | developer | untracked (symlink excluded via .git/info/exclude, points outside repo) | unknown: untracked symlink to external openspec tool, not repo content | overlaps: opsx-apply/archive/explore.prompt.md
.github/pull_request_template.md | Default GitHub PR body template: summary, links, testing, deployment, privacy | developer | 2026-08-28 | fresh: concise current template, matches PR conventions | overlaps: ./AGENTS.override.md
