# Existing documentation catalog

Every markdown file in scope, with topic, audience, freshness and overlaps.
Scope: repo root (top level), docs/, dashboard/, k8s/, docker/, aws/, lib/,
shared/, tools/, bin/, openspec/, python/, experimental/, .github/, apps/ and
frontend/. Excluded: node_modules, build and dist output, pegasus/ (legacy
Sinatra CMS for code.org, out of scope), and cookbooks/ (26 markdown files
documenting the legacy Chef cookbooks that still configure production hosts;
counted, not cataloged).

Totals: 232 files in the backend and infrastructure half (133 cataloged rows
plus one consolidated row standing for 99 auto-generated Clever API SDK docs),
208 files under apps/ and frontend/. 440 in all.

## Freshness caveat, read this before trusting any date

A repo-wide merge (`dts_candidate_2026-08-28`, and a history rewrite at
`4ed012e8a57`) touched almost every file, so `git log -1` returns 2026-08-28
for the great majority of these paths. Dates are therefore near-useless as a
freshness signal here, and both catalog halves below grade freshness from
content instead: a doc is marked stale when it names tech the repo no longer
uses (PhantomJS, Sauce Labs, mini_racer, gulp, Flash, Vagrant, Chef for app
deploy, Pivotal Tracker), when it points at a moved path, or when it is an
unfinished placeholder.

## The ten most authoritative starting points for a new developer

README.md, AGENTS.md, ARCHITECTURE.md, SETUP.md, apps/README.md,
frontend/AGENTS.md, frontend/README.md, TESTING.md (authoritative on intent,
stale in places), k8s/README.md plus k8s/docs/ARCHITECTURE.md, and the four
convention READMEs under dashboard/lib/{services,policies,queries,forms}/.

## The ten clearest staleness cases

TESTING.md (PhantomJS, Sauce Labs), docs/testing-with-applitools-eyes.md
(Sauce Labs, a Chrome 33 pin), docs/build-assets-on-adhoc.md
(phantomjs-prebuilt), docs/youtube-fallback.md (Flash player),
docs/importing-data.md and docs/pegasus-dashboard-integration.md (both
pegasus-centric), docs/where-are-the-logs.md (superseded by newer logging
docs), docs/plc/survey-summary-design.md (dated April 2019),
docs/reset-password-manually.md (a Rails 4.0.3 console banner),
dashboard/app/views/home/_privacy_notice.md (a COPPA notice unrevised since
2016), and dashboard/public/frequency/TODO.md (an unfinished checklist).
apps/src/.../fontAwesomeV6Icon/README.md still writes import paths as
`@cdo/apps/...`; several component-library READMEs are frozen at
"Status: Ready for Dev"; apps/docs/refactor.md and
apps/src/netsim/CONTRIBUTING.md link to Pivotal Tracker, which predates Jira.

## Duplicate and parallel documentation to reconcile

- apps/src/music (legacy) and frontend/packages/labs/music (the new port) are
  documented separately and describe the same product feature.
- apps/src/localization and frontend/packages/core/src/plugins/localization,
  same split.
- frontend/openspec/, frontend/.specify/ and frontend/specs/ are excluded from
  git via .git/info/exclude and hold uncommitted personal planning documents.
  One of them, 001-header-signed-in-button, describes work that has already
  shipped.

---

# Part 1: backend, infrastructure, root


Repo: code-dot-org, branch staging, rev 9793f8d36ae. Scope: top-level *.md at repo
root, plus docs/, dashboard/, k8s/, docker/, aws/, lib/, shared/, tools/, bin/,
openspec/, python/, experimental/, .github/. pegasus/ skipped entirely per
instruction; cookbooks/ counted only, see note at bottom.

Caveat that applies to nearly every "last commit date" below: a repo-wide
merge (`dts_candidate_2026-08-28`, PR #74949, "DTS Levelbuilder > Staging")
touched almost every file in the repo on 2026-08-28, so that date is not a
reliable content-freshness signal by itself — freshness verdicts here are
based on reading each file's content, not on the date column. A few files
(AGENTS.md 2026-09-01, python/pythonlab/README.md and
dashboard/engines/observability/README.md 2026-08-31) have a genuinely later
date from real subsequent edits.

## Totals

| Directory | .md/.mdx/.markdown files | Individually cataloged | Notes |
|---|---|---|---|
| root (top-level only) | 12 | 12 | includes 2 untracked private files + 1 untracked scratch file |
| docs/ | 19 | 19 | |
| dashboard/ | 122 | 23 | 99 files in `dashboard/lib/clever/docs/` consolidated into 1 row (auto-generated) |
| k8s/ | 31 | 31 | |
| docker/ | 7 | 7 | true count is 7, not 6 — `docker/build/README.md` is a legit source dir, not a build-output dir |
| aws/ | 12 | 12 | |
| lib/ | 1 | 1 | |
| shared/ | 2 | 2 | |
| tools/ | 1 | 1 | |
| bin/ | 9 | 9 | |
| openspec/ | 5 | 5 | |
| python/ | 4 | 4 | |
| experimental/ | 1 | 1 | |
| .github/ | 6 | 6 | 4 of these are symlinks to an external openspec tool, excluded from git |
| **Total** | **232** | **133 rows + 1 consolidated row (=100 files)** | |
| cookbooks/ (counted, not cataloged) | 26 | — | Chef cookbooks provisioning prod/staging/adhoc infra (mysql, nginx, ruby, redis, secrets, cloudwatch-agent, etc.) — infrastructure-as-code, not narrative docs |

232 = 12 + 19 + 122 + 31 + 7 + 12 + 1 + 2 + 1 + 9 + 5 + 4 + 1 + 6.

---

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

## docs/

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

## dashboard/

dashboard/app/models/census/README.md | Census form data sources, school-info mapping, summarization into census_summaries | developer | 2026-08-28 | fresh: durable data-model reference, links current | overlaps: dashboard/app/models/SCHOOL_DATA_README.md
dashboard/app/models/plc/README.md | Object model overview for Professional Learning Course (PLC) teacher training | developer | 2026-08-28 | fresh: short stable model glossary, still accurate | overlaps: dashboard/lib/pd/foorm/README.md
dashboard/app/models/SCHOOL_DATA_README.md | Known data-quality issues in schools/school_infos validation and country fields | developer | 2026-08-28 | fresh: durable known-issues notes, no expiry | overlaps: dashboard/app/models/census/README.md
dashboard/app/views/home/_privacy.md | Code.org Privacy Policy legal text, revised June 2023, rendered publicly | unknown | 2026-08-28 | fresh: dated June 2023 revision explicitly | overlaps: dashboard/app/views/home/_privacy_notice.md, dashboard/app/views/home/_tos.md
dashboard/app/views/home/_privacy_notice.md | COPPA notice for under-13 students, revision dated August 2016 | teacher | 2026-08-28 | stale: content dated 2016, unrevised since | overlaps: dashboard/app/views/home/_privacy.md, dashboard/app/views/home/_tos.md
dashboard/app/views/home/_tos.md | Code.org Terms of Service legal text, revised December 2022 | unknown | 2026-08-28 | fresh: dated Dec 2022 revision explicitly | overlaps: dashboard/app/views/home/_privacy.md, dashboard/app/views/home/_privacy_notice.md
dashboard/config/scripts/script_assets/pd/algebra_facilitators.md | HTML bios/headshots of PD workshop facilitators for algebra course | teacher | 2026-08-28 | unknown: curriculum content, no revision markers | overlaps: none
dashboard/engines/observability/AGENTS.md | Agent conventions for OTel/Sentry init ordering and version pins | developer | 2026-08-28 | fresh: references current Rails 7.0 pin | overlaps: dashboard/engines/observability/README.md
dashboard/engines/observability/README.md | Observability Rails engine setup: OpenTelemetry tracing and Sentry error reporting | developer | 2026-08-31 | fresh: newest-dated file, describes active engine | overlaps: dashboard/engines/observability/AGENTS.md
dashboard/legacy/README.md | Criteria for what dashboard-only code belongs in the legacy directory | developer | 2026-08-28 | fresh: durable placement-rule reference, still applies | overlaps: dashboard/lib/policies/README.md, dashboard/lib/queries/README.md, dashboard/lib/services/README.md, dashboard/lib/forms/README.md
dashboard/lib/clever/README.md | Auto-generated Ruby client for Clever v3 API (districts/schools/rosters) | developer | 2026-08-28 | fresh: describes current v3 codegen client | overlaps: dashboard/lib/clever/docs/* (its own generated reference), bin/oneoff/nces_data/README.md (loose: external ed-data import)
dashboard/lib/clever/docs/*.md — **99 files, consolidated** | Auto-generated per-model/per-API Ruby SDK reference (OpenAPI Generator output for `clever_client` gem) | developer | 2026-08-28 (single vendor-bump commit touched all 99) | fresh: generated artifact, trust the generator not hand-audit | overlaps: dashboard/lib/clever/README.md
dashboard/lib/forms/README.md | Form Object pattern conventions for multi-model/complex-validation Rails forms | developer | 2026-08-28 | fresh: durable pattern doc, framework-agnostic | overlaps: dashboard/lib/policies/README.md, dashboard/lib/queries/README.md, dashboard/lib/services/README.md, dashboard/legacy/README.md
dashboard/lib/pd/foorm/README.md | Foorm survey pipeline: workshop response summarization and rollup calculation steps | developer | 2026-08-28 | fresh: detailed pipeline doc, internally consistent | overlaps: dashboard/app/models/plc/README.md
dashboard/lib/policies/README.md | Policy Object pattern: POROs that tell you about business rules | developer | 2026-08-28 | fresh: durable pattern doc, unchanged convention | overlaps: dashboard/lib/queries/README.md, dashboard/lib/services/README.md, dashboard/lib/forms/README.md, dashboard/legacy/README.md
dashboard/lib/queries/README.md | Query Object pattern: POROs that retrieve data, with scoping examples | developer | 2026-08-28 | fresh: durable pattern doc, unchanged convention | overlaps: dashboard/lib/policies/README.md, dashboard/lib/services/README.md, dashboard/lib/forms/README.md, dashboard/legacy/README.md
dashboard/lib/services/README.md | Service Object pattern: POROs that perform business-logic actions | developer | 2026-08-28 | fresh: durable pattern doc, unchanged convention | overlaps: dashboard/lib/policies/README.md, dashboard/lib/queries/README.md, dashboard/lib/forms/README.md, dashboard/legacy/README.md
dashboard/public/apps-package/media/json/README.md | Directory convention for large webpack-bundled static JSON assets | developer | (untracked/no history) | unknown: no git history, likely new | overlaps: none
dashboard/public/frequency/TODO.md | Unfinished TODO checklist for a BarGraph frequency-visualization tool | developer | 2026-08-28 | stale: literal unresolved TODO list, no owner | overlaps: none
dashboard/public/lab_resources/README.md | Static lab placeholder-image folder, served at /lab_resources/<filename> on prod | developer | 2026-08-28 | fresh: short durable convention note | overlaps: none
dashboard/test/factories/README.md | FactoryBot factory file naming convention for namespaced vs. plain models | developer | 2026-08-28 | fresh: durable convention, still followed | overlaps: none
dashboard/test/load/database/README.md | Sysbench + CloudFormation runbook for Aurora database load testing | infra | 2026-08-28 | unknown: infra runbook, unclear if run recently | overlaps: none
dashboard/test/ui/config/README.md | UI-test-only curriculum content tree, partitioned from production config by naming | developer | 2026-08-28 | fresh: describes active partitioned-curriculum-data effort | overlaps: dashboard/test/ui/README.md
dashboard/test/ui/README.md | UI test CI/CD execution via Drone, Device Farm, and SauceLabs | developer | 2026-08-28 | fresh: matches current TESTING.md provider setup | overlaps: dashboard/test/ui/config/README.md

## k8s/

k8s/docker/benchmark-skaffold-rebuilds/AGENTS.md | Agent notes pointing at the skaffold-rebuild benchmark README | infra | 2026-08-28 | fresh - thin pointer, matches sibling docs | overlaps: k8s/docker/benchmark-skaffold-rebuilds/README.md, k8s/docker/benchmark-skaffold-rebuilds/daily-odds-of-file-change-report.md
k8s/docker/benchmark-skaffold-rebuilds/daily-odds-of-file-change-report.md | Generated report: git-change frequency per Dockerfile COPY path | infra | 2026-08-28 | fresh, regenerable data, current window | overlaps: k8s/docker/benchmark-skaffold-rebuilds/AGENTS.md, k8s/docker/benchmark-skaffold-rebuilds/README.md
k8s/docker/benchmark-skaffold-rebuilds/README.md | How to profile skaffold build cache-invalidation via simulated daily changes | infra | 2026-08-28 | fresh, active benchmarking workflow doc | overlaps: k8s/docker/benchmark-skaffold-rebuilds/AGENTS.md, k8s/docker/benchmark-skaffold-rebuilds/daily-odds-of-file-change-report.md
k8s/docker/README.md | Overview of layered k8s Dockerfiles (core/static/pegasus/db-seed) and skaffold build | infra | 2026-08-28 | fresh, matches current image layers | overlaps: docker/README.md, docker/base/README.md, docker/build/README.md, docker/deps/README.md, docker/rails/README.md, k8s/README.md
k8s/docs/ARCHITECTURE.md | Explains env_type vs release_name identity split in k8s deploys | infra | 2026-08-28 | fresh, concise durable reference | overlaps: k8s/docs/kubernetes-secrets.md, k8s/docs/reorg/after.md, k8s/docs/reorg/before.md
k8s/docs/kargotecture/implementations.md | Index of iteration-7 Kargo implementation branches, dirs, PR numbers | infra | 2026-08-28 | fresh, indexes the live PR set | overlaps: k8s/docs/kargotecture/PRs.md, k8s/docs/kargotecture/plans/iteration-7/implementations/*.md, k8s/docs/kargotecture/report-iteration-7.md
k8s/docs/kargotecture/plans/iteration-7/argo-refs-code-dot-org-commit.md | Kargo plan: tiny build-lock record, Argo deploys pinned commit directly | infra | 2026-08-28 | fresh, current iteration-7 finalist | overlaps: implementations/argo-refs-code-dot-org-commit.md, rankings.md, report-iteration-7.md, plans/modules/git-build-lock-freight-record.md
k8s/docs/kargotecture/plans/iteration-7/common-case-rendered-branches.md | Kargo plan: pair real image+commit as Freight, render stage branches | infra | 2026-08-28 | fresh, marked best-for-KISS finalist | overlaps: implementations/common-case-rendered-branches.md, rankings.md, plans/modules/live-source-checkout-at-freight-commit.md, plans/modules/rendered-stage-branches-and-pr-review.md
k8s/docs/kargotecture/plans/iteration-7/implementations/argo-refs-code-dot-org-commit.md | Implementation review: argo-refs plan's Helm/Kustomize PRs, gaps, freight complexity | infra | 2026-08-28 | fresh, reviews merged working branches | overlaps: plans/iteration-7/argo-refs-code-dot-org-commit.md, PRs.md, implementations.md
k8s/docs/kargotecture/plans/iteration-7/implementations/common-case-rendered-branches.md | Implementation review: common-case plan's PRs, gaps, low freight complexity | infra | 2026-08-28 | fresh, reviews merged working branches | overlaps: plans/iteration-7/common-case-rendered-branches.md, PRs.md, implementations.md
k8s/docs/kargotecture/plans/iteration-7/implementations/oci-release-capsule.md | Implementation review: OCI-capsule plan's PRs, gaps, high freight complexity | infra | 2026-08-28 | fresh, reviews merged working branches | overlaps: plans/iteration-7/oci-release-capsule.md, PRs.md, implementations.md
k8s/docs/kargotecture/plans/iteration-7/implementations/rendered-branches.md | Implementation review: thin-lock rendered-branches plan's PRs and gaps | infra | 2026-08-28 | fresh, reviews merged working branches | overlaps: plans/iteration-7/rendered-branches.md, PRs.md, implementations.md
k8s/docs/kargotecture/plans/iteration-7/implementations/source-snapshot-rendered-branches.md | Implementation review: source-snapshot plan, notes one partial/unfinished branch | infra | 2026-08-28 | fresh, flags partial implementation itself | overlaps: plans/iteration-7/source-snapshot-rendered-branches.md, PRs.md, implementations.md
k8s/docs/kargotecture/plans/iteration-7/oci-release-capsule.md | Kargo plan: immutable OCI release-capsule artifact as promotion source of truth | infra | 2026-08-28 | fresh, current iteration-7 finalist | overlaps: implementations/oci-release-capsule.md, rankings.md, report-iteration-7.md
k8s/docs/kargotecture/plans/iteration-7/rankings.md | Weighted ranking (KISS, reviewability, Kargo-fit) of five iteration-7 finalists | infra | 2026-08-28 | fresh, drives the final report | overlaps: report-iteration-7.md, all five plans/iteration-7/*.md plan docs
k8s/docs/kargotecture/plans/iteration-7/rendered-branches.md | Kargo plan: thin build-lock plus full rendered-manifest stage branches | infra | 2026-08-28 | fresh, current iteration-7 finalist | overlaps: implementations/rendered-branches.md, rankings.md, plans/modules/git-build-lock-freight-record.md, plans/modules/rendered-stage-branches-and-pr-review.md
k8s/docs/kargotecture/plans/iteration-7/source-snapshot-rendered-branches.md | Kargo plan: freeze deploy-package snapshot once, render into stage branches | infra | 2026-08-28 | fresh, marked best-for-reviewability finalist | overlaps: implementations/source-snapshot-rendered-branches.md, rankings.md, plans/modules/rendered-stage-branches-and-pr-review.md
k8s/docs/kargotecture/plans/modules/gate-promotion-on-legacy-gitflow-branches.md | Reusable module: gate Kargo promotion on legacy Gitflow merge state | infra | 2026-08-28 | fresh, coexistence-period module, still needed | overlaps: all five plans/iteration-7/*.md plan docs (each implements this gate)
k8s/docs/kargotecture/plans/modules/git-build-lock-freight-record.md | Reusable module: minimal Git build-lock Freight record shape | infra | 2026-08-28 | fresh, shared by thin-lock plans | overlaps: plans/iteration-7/argo-refs-code-dot-org-commit.md, plans/iteration-7/rendered-branches.md
k8s/docs/kargotecture/plans/modules/live-source-checkout-at-freight-commit.md | Reusable module: sparse-checkout live source at the promoted commit | infra | 2026-08-28 | fresh, shared by live-source plans | overlaps: plans/iteration-7/common-case-rendered-branches.md, plans/iteration-7/rendered-branches.md
k8s/docs/kargotecture/plans/modules/rendered-stage-branches-and-pr-review.md | Reusable module: rendered manifests in stage branches with PR review | infra | 2026-08-28 | fresh, shared by three plans | overlaps: plans/iteration-7/common-case-rendered-branches.md, plans/iteration-7/rendered-branches.md, plans/iteration-7/source-snapshot-rendered-branches.md
k8s/docs/kargotecture/PRs.md | Flat list of Helm/Kustomize PR links for all iteration-7 plans | infra | 2026-08-28 | fresh, matches implementations.md 1:1 | overlaps: implementations.md, report-iteration-7.md, all plans/iteration-7/implementations/*.md
k8s/docs/kargotecture/report-iteration-7.md | Synthesis report ranking iteration-7 Kargo finalists, best-of callouts | infra | 2026-08-28 | fresh, but cites missing report-5 (broken internal citation, iteration-7 is still verifiably the latest/only plan set on disk) | overlaps: rankings.md, all five plans/iteration-7/*.md, PRs.md
k8s/docs/kargotecture/research-plan.md | Process plan for producing the iterative multi-pass Kargo doc set | infra | 2026-08-28 | fresh, methodology still being followed | overlaps: report-iteration-7.md (its iteration-7 output)
k8s/docs/kubernetes-secrets.md | Traces one AWS Secrets Manager secret's path into a dashboard pod | infra | 2026-08-28 | fresh, detailed durable trace doc | overlaps: k8s/docs/ARCHITECTURE.md
k8s/docs/reorg/after.md | Snapshot: proposed post-reorg OpenTofu/ArgoCD phase layout | infra | 2026-08-28 | fresh, point-in-time snapshot, fine as-is | overlaps: k8s/docs/reorg/before.md, k8s/docs/reorg/phase2-after.md
k8s/docs/reorg/before.md | Snapshot: pre-reorg OpenTofu/ArgoCD phase layout | infra | 2026-08-28 | fresh, point-in-time snapshot, fine as-is | overlaps: k8s/docs/reorg/after.md, k8s/docs/reorg/phase2-before.md
k8s/docs/reorg/phase2-after.md | Snapshot: post-reorg detail for the Phase 2 cluster-infra module | infra | 2026-08-28 | fresh, point-in-time snapshot, fine as-is | overlaps: k8s/docs/reorg/after.md, k8s/docs/reorg/phase2-before.md
k8s/docs/reorg/phase2-before.md | Snapshot: pre-reorg per-.tf-file resource detail for Phase 2 | infra | 2026-08-28 | fresh, point-in-time snapshot, fine as-is | overlaps: k8s/docs/reorg/before.md, k8s/docs/reorg/phase2-after.md
k8s/README.md | Guide: build/run dashboard locally under k8s via skaffold | developer | 2026-08-28 | fresh, detailed current setup guide | overlaps: k8s/docker/README.md, docker/README.md, docker/developers/README.md
k8s/TODO.md | Backlog: perf, DB-seed, Prometheus, and Kargo/Tofu follow-up items | infra | 2026-08-28 | fresh, live backlog, TODO by design | overlaps: k8s/docs/kargotecture/* (its Kargo section)

## docker/

docker/base/README.md | cdo-base image: shared minimal Ruby runtime, dual docker/podman rules | infra | 2026-08-28 | fresh, documents current image chain | overlaps: docker/build/README.md, docker/deps/README.md, docker/rails/README.md, k8s/docker/README.md
docker/build/README.md | cdo-build image: compile toolchain (Node, gems, python) layered on cdo-base | infra | 2026-08-28 | fresh, matches current build chain | overlaps: docker/base/README.md, docker/deps/README.md, docker/rails/README.md
docker/deps/README.md | cdo-deps image: production gem bundle plus Python venv layer | infra | 2026-08-28 | fresh, matches current build chain | overlaps: docker/base/README.md, docker/build/README.md, docker/rails/README.md
docker/developers/README.md | Run MySQL/Redis/S3 in Docker while dashboard runs natively | developer | 2026-08-28 | fresh, standard local-dev instructions | overlaps: docker/README.md
docker/frontend/README.md | Docker images for Code.org Next.js frontend apps, built weekly | developer | 2026-08-28 | fresh, small scoped reference doc | overlaps: none
docker/rails/README.md | cdo-rails image: Rails source slice atop cdo-deps via dockerignore allowlist | infra | 2026-08-28 | fresh, matches current build chain | overlaps: docker/base/README.md, docker/build/README.md, docker/deps/README.md, k8s/docker/README.md
docker/README.md | Quick-start: build the docker image chain, run Rails API locally | developer | 2026-08-28 | early-stage warning in the doc itself, otherwise current | overlaps: docker/base/README.md, docker/build/README.md, docker/deps/README.md, docker/rails/README.md, docker/developers/README.md

## aws/

aws/cloudformation/components/README.md | Partial CloudFormation template chunks includable via ERB `component` helper | infra | 2026-08-28 | fresh, thin 2-line reference | overlaps: aws/cloudformation/README.md
aws/cloudformation/README.md | Overview of CF stack templates, Lambda resources, and how to test changes | infra | 2026-08-28 | fresh, comprehensive stable reference | overlaps: aws/cloudformation/components/README.md, aws/cloudformation/standalone/access_logs/README.md, aws/cloudformation/standalone/ai_diff/README.md, aws/dms/README.md
aws/cloudformation/standalone/access_logs/README.md | CloudFront access-logs stack: manual change-set deploy process | infra | 2026-08-28 | fresh, notes a possible future replacement | overlaps: aws/cloudformation/README.md
aws/cloudformation/standalone/ai_diff/README.md | AI Differentiation Bedrock knowledge-base CF stack, partly manual | infra | 2026-08-28 | fresh but explicitly work-in-progress | overlaps: aws/cloudformation/README.md, aws/cloudformation/standalone/gen_ai_curriculum/monitoring/README.md
aws/cloudformation/standalone/gen_ai_curriculum/monitoring/alarms/README.md | Script to create/overwrite AI Chat CloudWatch alarms | infra | 2026-08-28 | fresh, thin 5-line reference | overlaps: aws/cloudformation/standalone/gen_ai_curriculum/monitoring/README.md, .../dashboard/README.md
aws/cloudformation/standalone/gen_ai_curriculum/monitoring/dashboard/README.md | Script to create/overwrite AI Chat CloudWatch dashboard | infra | 2026-08-28 | fresh, thin reference doc | overlaps: aws/cloudformation/standalone/gen_ai_curriculum/monitoring/README.md, .../alarms/README.md
aws/cloudformation/standalone/gen_ai_curriculum/monitoring/README.md | Index for Gen AI CloudWatch monitoring scripts, lists open TODOs | infra | 2026-08-28 | fresh, has open follow-up TODOs | overlaps: .../alarms/README.md, .../dashboard/README.md, aws/cloudformation/standalone/ai_diff/README.md
aws/dms/README.md | Pointer to AWS Database Migration Service task definitions and config | infra | 2026-08-28 | fresh, thin 3-line pointer | overlaps: aws/cloudformation/README.md (data.yml.erb)
aws/emr/README.md | Legacy EMR directory meant to mirror public-safe S3 data | infra | 2026-08-28 | suspect: dead internal wiki.code.org link | overlaps: none
aws/offsite/aurora-snapshots-fargate/README.md | Verifies offsite Aurora snapshot backups are restorable, via Fargate job | infra | 2026-08-28 | fresh, active backup-verification tooling | overlaps: aws/offsite/prune-aurora-backups/README.md
aws/offsite/prune-aurora-backups/README.md | SAM Lambda that prunes old offsite Aurora backup snapshots | infra | 2026-08-28 | suspect: cites NodeJS 10.10 (long EOL) | overlaps: aws/offsite/aurora-snapshots-fargate/README.md
aws/redshift/zeroetl_materialized_views/README.md | Generated Redshift materialized-view SQL templates from Zero-ETL export models | infra | 2026-08-28 | fresh, detailed generated-file caveats | overlaps: none

## lib/, shared/, tools/

lib/cdo/cloud_formation/README.md | Overview of Cdo::CloudFormation module classes for stack templates | infra | 2026-08-28 | fresh: short stable architecture pointer doc | overlaps: none
shared/css/README.md | Procedure to update self-hosted FontAwesome CSS/webfont files in S3 | developer | 2026-08-28 | fresh: current S3 paths and component-library references | overlaps: docs/fa-v4-icons-in-locales-spec.md
shared/test/README.md | How shared/ Minitest tests use test_helper, VCR, and DB rollback | developer | 2026-08-28 | fresh: stable current test-harness reference | overlaps: none
tools/scripts/javalabSpritesheetGenerators/README.md | Manual steps to build a Java Lab neighborhood spritesheet | developer | 2026-08-28 | unknown: thin one-off script instructions, no version signal | overlaps: python/pythonlab/neighborhood/README.md

## bin/

bin/archive/README.md | Directory for once-useful scripts retired from active use | developer | 2026-08-28 | fresh: short durable placement-rule note | overlaps: bin/oneoff/README.md, bin/oneoff/data_fix/README.md, bin/oneoff/wipe_data/README.md
bin/curriculum/export/README.md | Redshift-to-S3 unit-progress export pipeline with AWS Comprehend PII filtering | developer | 2026-08-28 | fresh: detailed multi-step pipeline, internally consistent | overlaps: bin/curriculum/README.md
bin/curriculum/README.md | Directory for scripts affecting curriculum objects (Unit, Lesson, Standard, etc.) | developer | 2026-08-28 | fresh: short durable placement-rule note | overlaps: bin/curriculum/export/README.md
bin/dynamic_config/README.md | update_gatekeeper.sh usage for applying predefined dynamic-config YAML presets | developer | 2026-08-28 | fresh: short usage note, still applicable | overlaps: none
bin/oneoff/data_fix/README.md | Directory for one-off scripts that fixed bad production data | developer | 2026-08-28 | fresh: short durable placement-rule note | overlaps: bin/oneoff/README.md, bin/archive/README.md, bin/oneoff/wipe_data/README.md
bin/oneoff/hoai_2025/musicgen/README.md | Hour of AI 2025 music-content generation script for "Mix and Move" activity | developer | 2026-08-28 | fresh: describes 2025 curriculum feature | overlaps: bin/oneoff/README.md
bin/oneoff/nces_data/README.md | Annual NCES school/district survey data import: tables and S3 layout | developer | 2026-08-28 | fresh: durable annual-import process note | overlaps: bin/oneoff/README.md, dashboard/lib/clever/README.md (loose: external ed-data import)
bin/oneoff/README.md | Directory convention for short-lived, potentially destructive one-off scripts | developer | 2026-08-28 | fresh: short durable placement-rule note | overlaps: bin/archive/README.md, bin/oneoff/data_fix/README.md, bin/oneoff/wipe_data/README.md, bin/oneoff/hoai_2025/musicgen/README.md, bin/oneoff/nces_data/README.md
bin/oneoff/wipe_data/README.md | One-line note: scripts here wipe data from the DB | developer | 2026-08-28 | fresh: trivially short, still accurate | overlaps: bin/oneoff/README.md, bin/archive/README.md, bin/oneoff/data_fix/README.md

## openspec/

openspec/changes/classlink-roster-support/design.md | ClassLink One Roster rostering + v2 auth-id migration technical design | developer | 2026-08-28 | fresh: active in-progress 2026 change design | overlaps: proposal.md, tasks.md, both specs/spec.md in this change
openspec/changes/classlink-roster-support/proposal.md | Proposal to add ClassLink One Roster class import/sync for teachers | developer | 2026-08-28 | fresh: active in-progress 2026 change proposal | overlaps: design.md, tasks.md, both specs/spec.md in this change
openspec/changes/classlink-roster-support/specs/classlink-id-migration/spec.md | Spec: versioned TenantId\|SourcedId auth_id and dual-match login window | developer | 2026-08-28 | fresh: active in-progress 2026 spec | overlaps: design.md, proposal.md, tasks.md, classlink-rostering/spec.md
openspec/changes/classlink-roster-support/specs/classlink-rostering/spec.md | Spec: teacher-facing ClassLink class listing/import via One Roster API | developer | 2026-08-28 | fresh: active in-progress 2026 spec | overlaps: design.md, proposal.md, tasks.md, classlink-id-migration/spec.md
openspec/changes/classlink-roster-support/tasks.md | Four-PR implementation task breakdown for ClassLink rostering change | developer | 2026-08-28 | fresh: active in-progress 2026 task list | overlaps: design.md, proposal.md, both specs/spec.md in this change

## python/

python/pythonlab/neighborhood/README.md | Python Lab `neighborhood` grid-painter package API, ported from javalab | developer | 2026-08-28 | fresh: current API reference matching shipped package | overlaps: python/pythonlab/README.md, tools/scripts/javalabSpritesheetGenerators/README.md
python/pythonlab/README.md | Overview of Python Lab packages: neighborhood, pythonlab_setup, theater, etc | developer | 2026-08-31 | fresh: current package inventory, recently touched | overlaps: python/pythonlab/neighborhood/README.md, python/pythonlab/theater/README.md, python/README.md, docs/weblab-preview-domain-migration.md
python/pythonlab/theater/README.md | Python Lab `theater` Scene/animation-and-sound package API | developer | 2026-08-31 | fresh: current API reference matching shipped package | overlaps: python/pythonlab/README.md
python/README.md | How Python runs inside Rails via pycall.rb and uv package management | developer | 2026-08-28 | fresh: describes current pycall/uv setup and job-queue caveat | overlaps: python/pythonlab/README.md

## experimental/

experimental/README.md | Purpose of experimental/ directory: version-controlled, no prod dependents | developer | 2026-08-28 | fresh: short durable directory-purpose note | overlaps: none

## .github/

.github/instructions/copilot.instructions.md | Copilot-specific rule: no new i18n keys, plain English strings only | developer | 2026-08-28 | fresh: short current override, easy to verify | overlaps: none
.github/prompts/opsx-apply.prompt.md | Symlinked prompt: implement tasks from an OpenSpec change | developer | untracked (symlink excluded via .git/info/exclude, points outside repo) | unknown: untracked symlink to external openspec tool, not repo content | overlaps: opsx-archive/explore/propose.prompt.md, openspec/changes/* (same tooling family)
.github/prompts/opsx-archive.prompt.md | Symlinked prompt: archive a completed OpenSpec change | developer | untracked (symlink excluded via .git/info/exclude, points outside repo) | unknown: untracked symlink to external openspec tool, not repo content | overlaps: opsx-apply/explore/propose.prompt.md
.github/prompts/opsx-explore.prompt.md | Symlinked prompt: explore-mode thinking partner for OpenSpec changes | developer | untracked (symlink excluded via .git/info/exclude, points outside repo) | unknown: untracked symlink to external openspec tool, not repo content | overlaps: opsx-apply/archive/propose.prompt.md
.github/prompts/opsx-propose.prompt.md | Symlinked prompt: create a new OpenSpec change proposal with artifacts | developer | untracked (symlink excluded via .git/info/exclude, points outside repo) | unknown: untracked symlink to external openspec tool, not repo content | overlaps: opsx-apply/archive/explore.prompt.md
.github/pull_request_template.md | Default GitHub PR body template: summary, links, testing, deployment, privacy | developer | 2026-08-28 | fresh: concise current template, matches PR conventions | overlaps: ./AGENTS.override.md

---

## cookbooks/ (skipped per instruction, counted only)

26 markdown files (mostly per-cookbook README.md) across 31 cookbook directories
(cdo-analytics, cdo-apps, cdo-authorized-keys, cdo-awscli, cdo-cloudwatch-agent,
cdo-github-access, cdo-home-ubuntu, cdo-jemalloc, cdo-mysql, cdo-nginx,
cdo-nodejs, cdo-otel-collector, cdo-postfix, cdo-python, cdo-redis,
cdo-repository, cdo-ruby, cdo-secrets, ...). cookbooks/ is a Chef
cookbook tree used to provision low-level infrastructure on production,
staging, test, and adhoc servers (per repo AGENTS.md) — not narrative
developer documentation, so left uncataloged as instructed.

---

# Part 2: apps/ and frontend/


Generated 2026-09-09. Scope: `apps/` and `frontend/`, excluding node_modules/build/dist/.turbo/coverage/storybook-static.

## Freshness-date caveat

`git log -1` for nearly every file in this catalog resolves to commit `4ed012e8a57`
("Merge pull request #74949 from code-dot-org/dts_candidate_2026-08-28"), which
shows every file as newly *added* (`new file mode`) rather than modified. That
commit is a repo-wide history event (squash/rebase), not a real edit — so a
2026-08-28 date below is **not evidence the doc was touched recently**. Where a
file predates that merge or postdates it with its own commit, the date is
meaningful; otherwise treat the freshness verdict as content-based only (stale
tech mentioned, dead links, TODOs), not date-based. Files with no date are
untracked (new, uncommitted) as of this session's `git status`.

## Section 1: Markdown file catalog

apps/docs/build.md | apps webpack/rspack bundling strategy and FAQ | developer | 2026-08-28 (unreliable, see caveat) | unknown - content plausible, no dated claims found | frontend/docs/conventions/packages.md; apps/README.md#Building
apps/docs/creating-new-blocks.md | how to author a new Blockly block (init/generator) | developer | 2026-08-28 (unreliable) | stale - 3 parts pattern, no mention of TS Blockly work | none
apps/docs/js-interpreter.md | guide to upgrading the forked JS-Interpreter dependency | developer | 2026-08-28 (unreliable) | fresh - describes current fork/package still in package.json | none
apps/docs/netsim/CONTRIBUTING.md | netsim dev setup: Redis/Pusher, links Pivotal Tracker | developer | 2026-08-28 (unreliable) | stale - Pivotal Tracker link, org uses Jira now | apps/docs/netsim/README.md
apps/docs/netsim/README.md | Internet Simulator architecture: shards, tables, routing | developer | 2026-08-28 (unreliable) | unknown - stable legacy subsystem, no dated claims | apps/docs/netsim/CONTRIBUTING.md; apps/src/netsim/README.md
apps/docs/refactor.md | old case-for-refactoring manifesto (jquery/ejs/react/redux mix) | developer | 2026-08-28 (unreliable) | stale - describes jquery/ejs era predating lab2/TS migration | apps/src/AGENTS.md (supersedes intent)
apps/i18n/fish/README.md | fish/ dir holds ml-activities external-repo translations | developer/levelbuilder | 2026-08-28 (unreliable) | fresh - narrow factual note, still plausible | apps/i18n/mlPlayground/README.md (same pattern)
apps/i18n/mlPlayground/README.md | mlPlayground/ dir holds ml-playground external-repo translations | developer/levelbuilder | 2026-08-28 (unreliable) | fresh - narrow factual note, still plausible | apps/i18n/fish/README.md (same pattern)
apps/i18n/tts_keys/README.md | how to request TTS audio generation for lab i18n strings | developer/levelbuilder | 2026-08-28 (unreliable) | fresh - references live script path | none
apps/lib/pyodide/README.md | how to add/upgrade Python .whl packages served to Pyodide | developer | 2026-08-28 (unreliable) | fresh - pythonlab is an active lab2 lab | apps/src/pythonlab/README.md
apps/README.md | apps/ quick start, build, test, lint, rspack opt-in docs | developer | 2026-08-31 (real date) | fresh - describes current rspack/typecheck workflow in detail | TESTING.md (root); frontend/AGENTS.md
apps/script/HoC2023ScriptFiles/README.md | one-off 2024 script generating DanceAI HoC effect-weight maps | developer | 2026-08-28 (unreliable) | stale - dated 01/08/2024, event-specific past campaign | apps/src/dance/ai/README.md
apps/shims/README.md | rspack build shims replacing babel-only loader behaviors | developer | 2026-08-31 (real date) | fresh - active rspack migration doc | apps/README.md#Building with rspack
apps/src/AGENTS.md | apps/src JS/TS conventions: comments, types, imports, constants | developer | 2026-08-28 (unreliable) | fresh - matches current repo-wide AGENTS.md convention | AGENTS.md (root); apps/src/sketchlab/reactFlow/AGENTS.md
apps/src/aichat/evals/fixtures/README.md | image-generation safety eval CSV fixture format + smoke-tiny.csv | developer | 2026-08-28 (unreliable) | fresh - active AI safety eval harness | apps/src/pythonlab and weblab2 prompt trees (AI feature family)
apps/src/aiTutor/prompts/answerTypeContracts/ask.md | AI Tutor prompt: "ask" answer-type guarantee (1-2 questions) | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment, not docs | apps/src/pythonlab/prompts/answerTypeContracts/*; apps/src/weblab2/prompts/answerTypeContracts/*
apps/src/aiTutor/prompts/answerTypeContracts/refusal.md | AI Tutor prompt: "refusal" guarantee + scripted refusal line | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab/weblab2 refusal contract variants
apps/src/aiTutor/prompts/answerTypeContracts/testCase.md | AI Tutor prompt: "testCase" guarantee (3-5 test steps) | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab/weblab2 testCase contract variants
apps/src/aiTutor/prompts/answerTypeTriggers/buildJSON.md | AI Tutor trigger: fires on JSON request | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab/weblab2 buildJSON trigger variants
apps/src/aiTutor/prompts/answerTypeTriggers/debug.md | AI Tutor trigger: fires on "not working"/debug help | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab/weblab2 debug trigger variants
apps/src/aiTutor/prompts/answerTypeTriggers/example.md | AI Tutor trigger: fires on example/hint request | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab/weblab2 example trigger variants
apps/src/aiTutor/prompts/answerTypeTriggers/pseudocode.md | AI Tutor trigger: fires on pseudocode/planning request | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab/weblab2 pseudocode trigger variants
apps/src/aiTutor/prompts/answerTypeTriggers/refusal.md | AI Tutor trigger: fires on off-topic/should-not-do request | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab/weblab2 refusal trigger variants
apps/src/aiTutor/prompts/answerTypeTriggers/testCase.md | AI Tutor trigger: fires on test-case request | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab/weblab2 testCase trigger variants
apps/src/blockly/TESTING.md | manual regression checklist for Blockly version bumps, per mainline lab | developer | 2026-08-28 (unreliable) | fresh - names current mainline labs (Dance/Poetry/Music/Flappy/Bounce) | TESTING.md (root, different scope)
apps/src/bubbleChoice/README.md | Lab2 React client for bubble_choice level type, vs legacy HAML path | developer | 2026-08-28 (unreliable) | fresh - correctly distinguishes Lab2 vs legacy path | apps/src/lab2/README.md
apps/src/code-studio/components/README.md | one-line: shared UI components used across Labs/Levels/Widgets | developer | 2026-08-28 (unreliable) | stale - "first pass attempt", superseded by sharedComponents/legacySharedComponents split | apps/src/sharedComponents/README.md; apps/src/legacySharedComponents/README.md
apps/src/code-studio/legacyDashboardRoutingCompatibility/README.md | shim bridging react-router v3 class routes to v6 hooks | developer | 2026-08-28 (unreliable) | stale - describes an in-progress migration ("last component using v3"), unclear if still true | none
apps/src/dance/ai/README.md | Dance AI modal architecture: emoji-to-effect UI, modes | developer | 2026-08-28 (unreliable) | fresh - 2023 HoC feature, still live component | apps/script/HoC2023ScriptFiles/README.md
apps/src/generated/README.md | build-generated files directory, do not add sources here | developer | 2026-08-28 (unreliable) | fresh - simple directory convention note | none
apps/src/javalab/lab2/README.md | Java Lab on Lab2+codebridge, opt-in via uses_lab2 property | developer | 2026-08-28 (unreliable) | fresh - describes an active migration path with concrete file refs | apps/src/lab2/README.md; apps/src/weblab2/README.md (parallel lab2 port)
apps/src/lab2/progress/README.md | Lab2 progress/validation system: ProgressManager, Validator, JSON conditions | developer | 2026-08-28 (unreliable) | fresh - references PRs #50596/#53142, consistent with Music Lab | apps/src/music/README.md; apps/src/lab2/README.md
apps/src/lab2/README.md | Lab2 framework overview: guidelines, features, how to create a new lab | developer | 2026-08-28 (unreliable) | fresh - central, actively referenced by many other READMEs | apps/src/bubbleChoice, apps/src/panels, apps/src/javalab/lab2, apps/src/weblab2, apps/src/music
apps/src/legacySharedComponents/README.md | old shared UI components, superseded by componentLibrary/Design System | developer | 2026-08-28 (unreliable) | fresh - accurately flags itself as legacy/deprecated-in-progress | apps/src/sharedComponents/README.md; frontend/packages/component-library
apps/src/localization/README.md | dynamic translation module using LocalizeJS, experiment-gated | developer | 2026-08-28 (unreliable) | SUSPECT - "hidden behind an experiment"; verify LocalizeJS still in use, not migrated | none
apps/src/music/README.md | Music Lab client overview: Blockly+WebAudio, custom fields, Lab2 usage | developer | 2026-08-28 (unreliable) | fresh - detailed, matches current music lab feature set | frontend/packages/labs/music/README.md (possible newer port - CHECK OVERLAP)
apps/src/netsim/README.md | pointer stub: netsim client is documented in apps/docs/netsim/ | developer | 2026-08-28 (unreliable) | fresh - thin pointer, low risk of staleness | apps/docs/netsim/README.md; apps/docs/netsim/CONTRIBUTING.md
apps/src/panels/README.md | Lab2 React client for `panels` level type (image+text panels) | developer | 2026-08-28 (unreliable) | fresh - references PR #55758, describes narrow scope accurately | apps/src/lab2/README.md
apps/src/pythonlab/prompts/answerTypeContracts/buildCSV.md | Python Lab AI prompt: buildCSV output-format contract | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | aiTutor/weblab2 buildCSV-family contracts
apps/src/pythonlab/prompts/answerTypeContracts/buildJSON.md | Python Lab AI prompt: buildJSON output-format contract | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | aiTutor/weblab2 buildJSON contracts
apps/src/pythonlab/prompts/answerTypeContracts/buildPython.md | Python Lab AI prompt: buildPython contract, never full solution | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 buildJavaScript/buildHTML/buildCSS analogs
apps/src/pythonlab/prompts/answerTypeContracts/debug.md | Python Lab AI prompt: debug contract, print()-only guidance | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | aiTutor/weblab2 debug contracts
apps/src/pythonlab/prompts/answerTypeContracts/documentation.md | Python Lab AI prompt: documentation contract, placeholder rules | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 documentation contract
apps/src/pythonlab/prompts/answerTypeContracts/example.md | Python Lab AI prompt: example contract, cloze txt fence rules | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | aiTutor/weblab2 example contracts
apps/src/pythonlab/prompts/answerTypeContracts/explainCode.md | Python Lab AI prompt: explainCode contract, no new runnable lines | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 explainCode contract
apps/src/pythonlab/prompts/answerTypeContracts/hint.md | Python Lab AI prompt: hint contract, no token-complete code | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 hint contract
apps/src/pythonlab/prompts/answerTypeContracts/pseudocode.md | Python Lab AI prompt: pseudocode contract, plain-English fence rules | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | aiTutor/weblab2 pseudocode contracts
apps/src/pythonlab/prompts/answerTypeContracts/refusalPythonSnippets.md | Python Lab AI prompt: refusal contract, ask-hint-example-pseudocode rotation | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 refusalJavaScriptSnippets contract
apps/src/pythonlab/prompts/answerTypeTriggers/ask.md | Python Lab AI trigger: fires for conceptual/guiding questions | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | aiTutor/weblab2 ask triggers
apps/src/pythonlab/prompts/answerTypeTriggers/buildCSV.md | Python Lab AI trigger: fires on CSV/tabular data request | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 buildCSS trigger analog
apps/src/pythonlab/prompts/answerTypeTriggers/buildPython.md | Python Lab AI trigger: fires on Python code/script request | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 buildJavaScript trigger analog
apps/src/pythonlab/prompts/answerTypeTriggers/documentation.md | Python Lab AI trigger: fires on language/API documentation question | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 documentation trigger
apps/src/pythonlab/prompts/answerTypeTriggers/explainCode.md | Python Lab AI trigger: fires on "what does this do" style question | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 explainCode trigger
apps/src/pythonlab/prompts/answerTypeTriggers/hint.md | Python Lab AI trigger: fires on quick-hint request | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 hint trigger
apps/src/pythonlab/prompts/answerTypeTriggers/refusalPythonSnippets.md | Python Lab AI trigger: fires on "just give me the code" requests | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 refusalJavaScriptSnippets trigger
apps/src/pythonlab/prompts/basePrompt.md | Python Lab AI Tutor persona: Socratic Python Tutor, tone/process | developer | 2026-08-28 (unreliable) | fresh - live system-prompt root | weblab2 basePrompt (same shape, JS-focused)
apps/src/pythonlab/prompts/environment.md | Python Lab AI prompt: describes IDE panels for AI tutor context | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | weblab2 environment.md
apps/src/pythonlab/README.md | Python Lab architecture: pyodide sandbox iframe, preview-domain migration | developer | 2026-08-28 (unreliable) | fresh - references DCDO flag + linked migration doc, detailed and current | apps/lib/pyodide/README.md; docs/weblab-preview-domain-migration.md (referenced but not in this catalog's scope if outside apps/frontend)
apps/src/sharedComponents/README.md | generic reusable UI components without Design System counterpart | developer | 2026-08-28 (unreliable) | fresh - self-flags as mid-consolidation, links live Google Doc | apps/src/legacySharedComponents/README.md; frontend/packages/component-library
apps/src/sketchlab/reactFlow/AGENTS.md | Sketch Lab coding guidelines: a11y, DSCO/MUI, theming, style rules | developer | 2026-08-28 (unreliable) | fresh - references live MUI migration and current CSS/theme conventions | apps/src/AGENTS.md (parent, calls this out as worked example)
apps/src/standaloneVideo/README.md | Lab2 React client for standalone_video level, vs legacy HAML path | developer | 2026-08-28 (unreliable) | fresh - narrow, accurate scope note with known gap flagged | apps/src/lab2/README.md
apps/src/userLevelInteractionsLogger/README.md | EMPTY FILE (0 bytes) | unknown | 2026-08-28 (unreliable) | stale - placeholder never filled in | none
apps/src/weblab/README.md | Weblab (legacy, Bramble-based HTML/CSS editor) architecture and features | developer | 2026-08-28 (unreliable) | fresh - detailed, describes still-live legacy tool distinct from weblab2 | apps/src/weblab2/README.md
apps/src/weblab2/README.md | Web Lab 2 iframe/service-worker preview architecture + local run steps | developer | 2026-08-28 (unreliable) | fresh - detailed Chrome flag workaround, matches preview-domain migration doc | apps/src/weblab/README.md; apps/src/pythonlab/README.md (same preview-domain pattern)
apps/static/json/README.md | convention: large static JSON assets bundled outside JS via webpack | developer | 2026-08-28 (unreliable) | fresh - describes current webpack asset-resource approach | apps/docs/build.md
apps/.storybook/README.md | how to run apps/ Storybook and add *.story.jsx stories | developer | 2026-08-28 (unreliable) | SUSPECT - check Storybook version/config still matches; frontend/ has separate design-system-storybook | frontend/apps/design-system-storybook/README.md (possible duplicate/overlap)
apps/src/weblab2/prompts/answerTypeContracts/buildCSS.md | Web Lab 2 AI prompt: buildCSS contract, plain-styling defaults | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab buildCSV contract (parallel structure)
apps/src/weblab2/prompts/answerTypeContracts/buildHTML.md | Web Lab 2 AI prompt: buildHTML contract, placeholder image rules | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | none
apps/src/weblab2/prompts/answerTypeContracts/buildJavaScript.md | Web Lab 2 AI prompt: buildJavaScript contract, arrow-fn-only rule | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab buildPython contract (parallel structure)
apps/src/weblab2/prompts/answerTypeContracts/buildJSON.md | Web Lab 2 AI prompt: buildJSON output-format contract | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab/aiTutor buildJSON contracts (identical text)
apps/src/weblab2/prompts/answerTypeContracts/debug.md | Web Lab 2 AI prompt: debug contract, no-devtools-assumed guidance | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab debug contract (parallel)
apps/src/weblab2/prompts/answerTypeContracts/documentation.md | Web Lab 2 AI prompt: documentation contract, placeholder rules | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab documentation contract (parallel)
apps/src/weblab2/prompts/answerTypeContracts/example.md | Web Lab 2 AI prompt: example contract, cloze txt fence + arrow-fn rule | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab example contract (parallel)
apps/src/weblab2/prompts/answerTypeContracts/explainCode.md | Web Lab 2 AI prompt: explainCode contract, no new runnable lines | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab explainCode contract (parallel)
apps/src/weblab2/prompts/answerTypeContracts/hint.md | Web Lab 2 AI prompt: hint contract, no token-complete JS | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab hint contract (parallel)
apps/src/weblab2/prompts/answerTypeContracts/pseudocode.md | Web Lab 2 AI prompt: pseudocode contract, plain-English fence rules | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab pseudocode contract (parallel)
apps/src/weblab2/prompts/answerTypeContracts/refusalJavaScriptSnippets.md | Web Lab 2 AI prompt: refusal contract, ask-hint-example-pseudocode rotation | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab refusalPythonSnippets contract (parallel)
apps/src/weblab2/prompts/answerTypeTriggers/ask.md | Web Lab 2 AI trigger: fires for conceptual/guiding questions | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab ask trigger (parallel)
apps/src/weblab2/prompts/answerTypeTriggers/buildCSS.md | Web Lab 2 AI trigger: fires on styling/CSS request | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab buildCSV trigger (parallel)
apps/src/weblab2/prompts/answerTypeTriggers/buildHTML.md | Web Lab 2 AI trigger: fires on wireframe/layout/page-build keywords | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | none (no pythonlab analog)
apps/src/weblab2/prompts/answerTypeTriggers/buildJavaScript.md | Web Lab 2 AI trigger: fires on interactivity/JS request | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab buildPython trigger (parallel)
apps/src/weblab2/prompts/answerTypeTriggers/documentation.md | Web Lab 2 AI trigger: fires on JS/HTML/CSS documentation question | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab documentation trigger (parallel)
apps/src/weblab2/prompts/answerTypeTriggers/explainCode.md | Web Lab 2 AI trigger: fires on "what does this do" style question | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab explainCode trigger (parallel)
apps/src/weblab2/prompts/answerTypeTriggers/hint.md | Web Lab 2 AI trigger: fires on quick-hint request | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab hint trigger (parallel)
apps/src/weblab2/prompts/answerTypeTriggers/refusalJavaScriptSnippets.md | Web Lab 2 AI trigger: fires on "just give me the code" requests | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab refusalPythonSnippets trigger (parallel)
apps/src/weblab2/prompts/basePrompt.md | Web Lab 2 AI Tutor persona: Socratic Web Dev Tutor, tone/process | developer | 2026-08-28 (unreliable) | fresh - live system-prompt root | pythonlab basePrompt (same shape, Python-focused)
apps/src/weblab2/prompts/environment.md | Web Lab 2 AI prompt: describes IDE panels for AI tutor context | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment | pythonlab environment.md (parallel, differs in panel names)
apps/src/weblab2/prompts/preReplyCheckAllowJs.md | Web Lab 2 AI prompt: pre-reply leak check, JS-allowed variant | developer | 2026-08-28 (unreliable) | fresh - live safety-gate prompt | preReplyCheckNoJs.md (JS-disallowed variant)
apps/src/weblab2/prompts/preReplyCheckNoJs.md | Web Lab 2 AI prompt: pre-reply leak check, JS-disallowed variant | developer | 2026-08-28 (unreliable) | fresh - live safety-gate prompt | preReplyCheckAllowJs.md (JS-allowed variant)
apps/src/weblab2/prompts/securityIntro.md | Web Lab 2 AI prompt: sandbox/CSP constraints for suggested code | developer | 2026-08-28 (unreliable) | fresh - live prompt fragment, describes current sandbox+CSP | preReplyCheckAllowJs.md / preReplyCheckNoJs.md (enforce same rules)
frontend/AGENTS.md | frontend/ Turborepo structure, README-hierarchy rule, commands | developer | 2026-08-28 (unreliable) | fresh - matches actual packages/apps directory layout | AGENTS.md (root); frontend/docs/conventions/packages.md
frontend/apps/design-system-storybook/README.md | design-system Storybook: dev/build/test commands, brand switcher | developer | 2026-08-28 (unreliable) | fresh - describes live rebrand/brand-switcher mechanism in detail | apps/.storybook/README.md (separate legacy apps/ Storybook instance)
frontend/apps/studio/AGENTS.md | Code Studio host-app rules: routeTree.gen.ts, lab registration steps | developer | 2026-08-28 (unreliable) | fresh - concrete, current file paths (labs.ts, getLabEntrypoint.ts) | frontend/apps/studio/docs/architecture.md; frontend/apps/studio/README.md
frontend/apps/studio/docs/architecture.md | Studio Rails/Vite integration chain, init ordering, feature flag gate | developer | 2026-08-28 (unreliable) | fresh - detailed DCDO flag + vite.json mechanics, internally consistent | frontend/apps/studio/AGENTS.md; frontend/apps/studio/README.md
frontend/apps/studio/README.md | Code Studio (experimental) dev setup: Vite Rails vs standalone, MSW mocking | developer | 2026-08-28 (unreliable) | fresh - matches architecture.md claims | frontend/apps/studio/docs/architecture.md; frontend/apps/studio/AGENTS.md
frontend/docs/conventions/packages.md | package/lab scaffolding conventions via `yarn turbo gen` | developer | 2026-08-28 (unreliable) | fresh - explicitly notes coupling to turbo/generators/config.ts | frontend/turbo/generators/README.md; frontend/AGENTS.md
frontend/README.md | frontend/ Turborepo top-level overview: apps vs packages | developer | 2026-08-28 (unreliable) | fresh - lists current apps/packages accurately | frontend/AGENTS.md
frontend/openspec/changes/component-library-deploy-refactor/design.md | design rationale: collapse duplicate CL CI runs into workflow_call dispatch | developer | untracked (in .git/info/exclude, personal/local) | fresh - active in-progress plan, all tasks unchecked | frontend/openspec/changes/oceans-lab-ci/* (same CI-dispatcher pattern, stacked branch)
frontend/openspec/changes/component-library-deploy-refactor/proposal.md | why: dedupe component-library-deploy.yml push trigger | developer | untracked (local) | fresh - active proposal | design.md, tasks.md in same change
frontend/openspec/changes/component-library-deploy-refactor/specs/oceans-lab-ci/spec.md | ADDED requirement: deploy workflow becomes workflow_call-only | developer | untracked (local) | fresh - active proposal | frontend/openspec/changes/oceans-lab-ci/specs/oceans-lab-ci/spec.md (same spec capability name, different change)
frontend/openspec/changes/component-library-deploy-refactor/tasks.md | task checklist: stacked branch, protection audit, workflow refactor | developer | untracked (local) | fresh - all tasks unchecked, not yet started | proposal.md, design.md in same change
frontend/openspec/changes/frontend-react-align-catalog-sweep/design.md | context: frontend/ has 2 React versions across workspaces (18 vs 19) | developer | untracked (local) | fresh - concrete package.json/node_modules evidence cited | tasks.md (partially done, [x] on early steps)
frontend/openspec/changes/frontend-react-align-catalog-sweep/proposal.md | why: pin React 18.3.1 everywhere via yarn catalog, drop react-compiler | developer | untracked (local) | fresh - active proposal | design.md, tasks.md same change
frontend/openspec/changes/frontend-react-align-catalog-sweep/specs/frontend-dependency-catalog/spec.md | ADDED requirement: single react/react-dom resolves via yarn catalog | developer | untracked (local) | fresh - active proposal | tasks.md same change
frontend/openspec/changes/frontend-react-align-catalog-sweep/tasks.md | task checklist: React 18.3.1 alignment across studio/core/labs-music | developer | untracked (local) | fresh - IN PROGRESS: baseline + step 2 items checked [x], rest pending | none
frontend/openspec/changes/oceans-lab-ci/design.md | context: existing frontend-ci.yml dispatcher pattern, oceans lab has no CI gate | developer | untracked (local) | fresh - active proposal, cites concrete file names | frontend/openspec/changes/component-library-deploy-refactor/* (stacked on this branch)
frontend/openspec/changes/oceans-lab-ci/proposal.md | why: gate oceans-lab e2e tests in CI like studio/component-library | developer | untracked (local) | fresh - active proposal | design.md, tasks.md same change
frontend/openspec/changes/oceans-lab-ci/specs/oceans-lab-ci/spec.md | ADDED requirement: path-gated oceans CI lane on PR+push | developer | untracked (local) | fresh - active proposal | component-library-deploy-refactor spec (same capability name)
frontend/openspec/changes/oceans-lab-ci/tasks.md | task checklist: add oceans-ci.yml workflow, wire into frontend-ci.yml | developer | untracked (local) | fresh - all tasks unchecked, not yet started | none
frontend/packages/component-library/CHANGELOG.md | auto-generated changesets release log | developer | 2026-08-28 (unreliable) | fresh - standard generated changelog | CHANGELOG-pre1.md (older history)
frontend/packages/component-library/CHANGELOG-pre1.md | archived pre-v1 changelog history | developer | 2026-08-28 (unreliable) | fresh (archival by design, not meant to update) | CHANGELOG.md
frontend/packages/component-library/codemods/README.md | codemods for DSCO-to-MUI component migrations | developer | 2026-08-28 (unreliable) | fresh - active migration tooling | MIGRATION_STATUS.md; BUTTON_MIGRATION_TO_MUI.md
frontend/packages/component-library/CONTRIBUTING.md | how to contribute to component-library: setup, PR process | developer | 2026-08-28 (unreliable) | unknown - generic contributing guide, check against actual PR process | frontend/packages/component-library-styles/CONTRIBUTING.md
frontend/packages/component-library/MIGRATION_STATUS.md | tracks per-component DSCO→MUI migration status | developer | 2026-08-28 (unreliable) | SUSPECT - status table needs live cross-check against actual component code, easy to drift | codemods/README.md; BUTTON_MIGRATION_TO_MUI.md
frontend/packages/component-library/README.md | component-library package overview: install, usage, structure | developer | 2026-08-28 (unreliable) | fresh - central package doc | frontend/README.md; design-system skill
frontend/packages/component-library/src/button/BUTTON_MIGRATION_TO_MUI.md | Button-specific DSCO→MUI migration guide: API/props/style mapping | developer | 2026-08-28 (unreliable) | fresh - detailed, cross-referenced from MIGRATION_STATUS.md and codemods/README.md | codemods/README.md; MIGRATION_STATUS.md
frontend/packages/component-library/src/accordion/faqAccordion/README.md | usage doc: FAQAccordion component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | accordion/README.md (sibling)
frontend/packages/component-library/src/accordion/README.md | usage doc: Accordion + FAQAccordion components import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | accordion/faqAccordion/README.md
frontend/packages/component-library/src/actionBlock/fullWidthActionBlock/README.md | usage doc: FullWidthActionBlock component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | actionBlock/README.md (sibling)
frontend/packages/component-library/src/actionBlock/README.md | usage doc: ActionBlock component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | actionBlock/fullWidthActionBlock/README.md
frontend/packages/component-library/src/alert/README.md | usage doc: Alert component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/breadcrumbs/README.md | usage doc: Breadcrumbs component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/button/README.md | usage doc: Button/LinkButton/GenericButton, marked DEPRECATED for MUI | developer | 2026-08-28 (unreliable) | fresh - explicitly flags own deprecation with migration links | MIGRATION_STATUS.md; BUTTON_MIGRATION_TO_MUI.md; codemods/README.md
frontend/packages/component-library/src/carousel/README.md | usage doc: Carousel component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/checkbox/README.md | usage doc: Checkbox component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/chips/README.md | usage doc: Chip/ChipsGroup components import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/closeButton/README.md | usage doc: CloseButton component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/common/README.md | index of shared DSCO helpers/types/constants | developer | 2026-08-28 (unreliable) | fresh - internal reference doc | none
frontend/packages/component-library/src/dialog/README.md | usage doc: Dialog/CustomDialog components import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/divider/README.md | usage doc: Divider component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/dropdown/actionDropdown/README.md | usage doc: ActionDropdown, tagged "Status: Ready for Dev" | developer | 2026-08-28 (unreliable) | SUSPECT - "Ready for Dev" status tag may be stale placeholder, verify component shipped | dropdown/README.md; dropdown/checkboxDropdown, iconDropdown, simpleDropdown (same status tag pattern)
frontend/packages/component-library/src/dropdown/checkboxDropdown/README.md | usage doc: CheckboxDropdown, tagged "Status: Ready for Dev" | developer | 2026-08-28 (unreliable) | SUSPECT - same stale-status-tag concern as actionDropdown | dropdown/actionDropdown, iconDropdown, simpleDropdown
frontend/packages/component-library/src/dropdown/iconDropdown/README.md | usage doc: IconDropdown, tagged "Status: Ready for Dev" | developer | 2026-08-28 (unreliable) | SUSPECT - same stale-status-tag concern | dropdown/actionDropdown, checkboxDropdown, simpleDropdown
frontend/packages/component-library/src/dropdown/README.md | usage doc: CustomDropdown, tagged "Status: Ready for Dev" | developer | 2026-08-28 (unreliable) | SUSPECT - same stale-status-tag concern; also is this the parent or a sibling variant? | dropdown/actionDropdown, checkboxDropdown, iconDropdown, simpleDropdown
frontend/packages/component-library/src/dropdown/simpleDropdown/README.md | usage doc: SimpleDropdown, tagged "Status: Ready for dev" | developer | 2026-08-28 (unreliable) | SUSPECT - same stale-status-tag concern | dropdown/actionDropdown, checkboxDropdown, iconDropdown
frontend/packages/component-library/src/fontAwesomeV6Icon/README.md | usage doc: FontAwesomeV6Icon, import example uses OLD `@cdo/apps/...` path | developer | 2026-08-28 (unreliable) | STALE - import path is `@cdo/apps/componentLibrary/fontAwesomeV6`, wrong for a frontend/ package (should be @code-dot-org/component-library/...) | none
frontend/packages/component-library/src/footer/README.md | design-system Footer: what it is, relation to dashboard/apps | developer | 2026-08-28 (unreliable) | fresh - describes cross-repo relationship | frontend/packages/component-library/src/header/README.md (counterpart)
frontend/packages/component-library/src/formFieldWrapper/README.md | usage doc: FormFieldWrapper component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | frontend/packages/component-library/src/form/README.md (related, composed form kit)
frontend/packages/component-library/src/form/README.md | composed settings-form kit: state, SaveBar, Field, error mapping | developer | 2026-08-28 (unreliable) | fresh - describes a substantial composed feature, detailed | frontend/packages/component-library/src/formFieldWrapper/README.md; frontend/packages/users/README.md (SaveBar per memory notes)
frontend/packages/component-library/src/header/README.md | design-system Header: says dashboard/apps do NOT use it today | developer | 2026-08-28 (unreliable) | SUSPECT - header-modernization project (Phases 0-3) reportedly landed per prior work; claim may be outdated | frontend/packages/component-library/src/footer/README.md; frontend/specs/001-header-signed-in-button/* (SignedInUserButton built on this header)
frontend/packages/component-library/src/heroBanner/README.md | usage doc: HeroBanner component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/image/README.md | usage doc: Image component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/link/README.md | usage doc: Link, tagged "Status: Ready for dev" | developer | 2026-08-28 (unreliable) | SUSPECT - same stale-status-tag concern as dropdown family | dropdown/* (same status-tag pattern)
frontend/packages/component-library/src/list/simpleList/README.md | usage doc: SimpleList, tagged "Status: Ready for dev" | developer | 2026-08-28 (unreliable) | SUSPECT - same stale-status-tag concern | dropdown/*; link/README.md
frontend/packages/component-library/src/modal/README.md | usage doc: Modal component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | frontend/packages/component-library/src/dialog/README.md (related overlay pattern)
frontend/packages/component-library/src/notification-banner/README.md | usage doc: NotificationBanner component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | frontend/packages/component-library/src/alert/README.md; src/toast/README.md (related notification patterns)
frontend/packages/component-library/src/popover/README.md | usage doc: Popover/WithPopover components import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template, explains WithPopover wrapper pattern | frontend/packages/component-library/src/tooltip/README.md (related positioning pattern)
frontend/packages/component-library/src/radioButton/README.md | usage doc: RadioButton/RadioButtonGroup components import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | frontend/packages/component-library/src/checkbox/README.md (sibling form control)
frontend/packages/component-library/src/segmentedButtons/README.md | usage doc: SegmentedButtons component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/slider/README.md | usage doc: Slider component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/snackbar/README.md | note: no custom Snackbar, use MUI's directly, see Storybook | developer | 2026-08-28 (unreliable) | fresh - correctly defers to MUI + live Storybook link | frontend/packages/component-library/src/toast/README.md (built atop MUI Snackbar)
frontend/packages/component-library/src/tabs/README.md | usage doc: Tabs component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/tags/README.md | usage doc: Tags component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | frontend/packages/component-library/src/chips/README.md (related tag/chip concept)
frontend/packages/component-library/src/textField/README.md | usage doc: TextField component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/themes/README.md | theming architecture: Brand vs Mode dimensions, ThemeProvider | developer | 2026-08-28 (unreliable) | fresh - matches design-system-storybook brand-switcher doc | frontend/apps/design-system-storybook/README.md (brand switcher mirrors this)
frontend/packages/component-library/src/toast/README.md | usage doc: Toast (MUI Snackbar + Alert + live region for a11y) | developer | 2026-08-28 (unreliable) | fresh - references Alert README, describes a11y live region | frontend/packages/component-library/src/alert/README.md; src/snackbar/README.md
frontend/packages/component-library/src/toggle/README.md | usage doc: Toggle component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library/src/tooltip/README.md | usage doc: comparison table, MUI Tooltip (new code) vs WithTooltip (legacy) | developer | 2026-08-28 (unreliable) | fresh - actively documents a DSCO-to-MUI split decision | frontend/packages/component-library/src/popover/README.md
frontend/packages/component-library/src/typography/README.md | usage doc: Typography, notes eventual move to separate `dsco_` repo | developer | 2026-08-28 (unreliable) | SUSPECT - "at some point it will be moved" is an open-ended TODO, verify still planned | none
frontend/packages/component-library/src/video/README.md | usage doc: Video component import/props | developer | 2026-08-28 (unreliable) | fresh - standard per-component template | none
frontend/packages/component-library-styles/CHANGELOG.md | auto-generated changesets release log | developer | 2026-08-28 (unreliable) | fresh - standard generated changelog | frontend/packages/component-library/CHANGELOG.md
frontend/packages/component-library-styles/CONTRIBUTING.md | how to contribute new styles/tokens, coding standards | developer | 2026-08-28 (unreliable) | unknown - generic contributing guide | frontend/packages/component-library/CONTRIBUTING.md (near-duplicate structure)
frontend/packages/component-library-styles/README.md | shared CSS variables/mixins/typography package overview | developer | 2026-08-28 (unreliable) | fresh - central styles package doc | frontend/packages/component-library/README.md
frontend/packages/core/AGENTS.md | @code-dot-org/core doc-maintenance rules tied to architecture.md/README.md | developer | 2026-08-28 (unreliable) | fresh - matches current file structure (src/config, src/api/dashboard, src/plugins) | frontend/packages/core/docs/architecture.md; frontend/packages/core/README.md
frontend/packages/core/docs/architecture.md | core package architecture: singletons, boot sequence, browser-only | developer | 2026-08-28 (unreliable) | fresh - detailed, matches SiteConfig.ts internals | frontend/packages/core/README.md; frontend/packages/core/AGENTS.md
frontend/packages/core/README.md | @code-dot-org/core overview: boot, plugin model, SiteConfig | developer | 2026-08-28 (unreliable) | fresh - matches architecture.md claims, shows initializeCore usage | frontend/packages/core/docs/architecture.md
frontend/packages/core/src/api/dashboard/metrics/README.md | one-line: legacy direct-to-backend event metrics methods | developer | 2026-08-28 (unreliable) | stale-flavored - self-describes as "legacy", minimal content | frontend/packages/core/src/plugins/observability/README.md (newer metrics path)
frontend/packages/core/src/api/mocks/README.md | MSW mock handlers for running labs without Rails backend | developer | 2026-08-28 (unreliable) | fresh - matches VITE_API_MODE=msw pattern used elsewhere (studio, users) | frontend/apps/studio/README.md (Mocked API section); frontend/packages/users/README.md
frontend/packages/core/src/api/README.md | API client structure: domains mirror backend controllers | developer | 2026-08-28 (unreliable) | fresh - describes current domain-keyed structure | frontend/packages/core/src/api/transports/README.md
frontend/packages/core/src/api/transports/README.md | Transport interface abstraction: request/requestBlob/requestWithMeta | developer | 2026-08-28 (unreliable) | fresh - clean interface doc | frontend/packages/core/src/api/README.md
frontend/packages/core/src/plugins/consent/README.md | Consent plugin: CMP-agnostic (OneTrust today) cookie consent | developer | 2026-08-28 (unreliable) | fresh - matches analytics+consent plugin project in memory | frontend/packages/core/src/plugins/observability/README.md (consent gates observability)
frontend/packages/core/src/plugins/localization/README.md | Core localization plugin: dynamic translation via plugin bootstrap | developer | 2026-08-28 (unreliable) | fresh - newer plugin-based replacement pattern | apps/src/localization/README.md (OLDER legacy localization module - real overlap, likely two systems coexisting)
frontend/packages/core/src/plugins/observability/CONTRIBUTING.md | how to add a new observability provider adapter | developer | 2026-08-28 (unreliable) | fresh - step-by-step, references BaseAdapter | frontend/packages/core/src/plugins/observability/README.md
frontend/packages/core/src/plugins/observability/README.md | Observability plugin: provider-agnostic Sentry-style wrapper, consent-gated | developer | 2026-08-28 (unreliable) | fresh - matches consent plugin + Observability::Errors.report project in memory | frontend/packages/core/src/plugins/consent/README.md; frontend/packages/core/src/plugins/observability/CONTRIBUTING.md
frontend/packages/core/src/redux/README.md | dynamic Redux slice injection convention across feature packages | developer | 2026-08-28 (unreliable) | fresh - describes concrete convention with code example | frontend/packages/users/README.md (likely a slice owner)
frontend/packages/e2e-tests/README.md | Playwright e2e suite for studio.code.org: local run, functional vs eyes tags | developer | 2026-08-28 (unreliable) | fresh - matches @visual/@eyes port work in memory | frontend/packages/playwright-support/README.md
frontend/packages/fonts/README.md | fonts package: Font Awesome Pro CDN setup and usage | developer | 2026-08-28 (unreliable) | fresh - straightforward setup doc | none
frontend/packages/labs/ailab/README.md | AI Lab (KNN classification/regression teaching tool), ported from standalone repo | developer | 2026-08-28 (unreliable) | fresh - detailed feature list, describes migration from standalone repo | frontend/packages/labs/oceans/README.md (similar former-standalone-repo lab); frontend/packages/labs/music/README.md
frontend/packages/labs/base/README.md | @code-dot-org/lab: host shell for Lab2 labs, host/lab import boundary | developer | 2026-08-28 (unreliable) | fresh - describes enforced ESLint boundary rule | apps/src/lab2/README.md (older legacy-webpack Lab2 concept - naming overlap worth checking)
frontend/packages/labs/music/AGENTS.md | doc-maintenance rules for Music Lab package (labs.ts, fixtures) | developer | 2026-08-28 (unreliable) | fresh - matches frontend/apps/studio/AGENTS.md pattern | frontend/apps/studio/AGENTS.md; frontend/packages/labs/oceans/AGENTS.md
frontend/packages/labs/music/README.md | NEW standalone Music Lab port for Studio (Vite/TanStack), DashboardApiClient usage | developer | 2026-08-28 (unreliable) | fresh - describes new architecture distinct from legacy | REAL OVERLAP: apps/src/music/README.md (OLD legacy-webpack Music Lab) - two Music Lab implementations coexist during migration
frontend/packages/labs/oceans/AGENTS.md | oceans-lab project overview: dual consumers (legacy Fish.js + Studio Vite) | developer | 2026-08-28 (unreliable) | fresh - matches openspec oceans-lab-ci change in progress | frontend/openspec/changes/oceans-lab-ci/*; frontend/packages/labs/oceans/README.md
frontend/packages/labs/oceans/docs/architecture.md | oceans-lab init sequence: canvas, sound library, KNN/SVM trainer, render loop | developer | 2026-08-28 (unreliable) | fresh - detailed mechanism trace | frontend/packages/labs/oceans/AGENTS.md; frontend/packages/labs/oceans/README.md
frontend/packages/labs/oceans/README.md | AI for Oceans lab: ported from ml-activities standalone repo, 2019 HoC | developer | 2026-08-28 (unreliable) | fresh - migration history + usage stats, matches ai-literacy-oceans export project | frontend/packages/labs/ailab/README.md (similar ported-lab pattern); apps/src/dance/ai/README.md (same HoC-era AI feature family)
frontend/packages/labs/oceans/src/utils/textToSpeech/README.md | one-line attribution: files sourced from external voices repo | developer | 2026-08-28 (unreliable) | fresh - simple attribution note | none
frontend/packages/lesson-deep-dive/README.md | dev shell for AI Tutor+ lesson review flow; package ships nothing yet | developer | 2026-08-28 (unreliable) | fresh - explicitly transitional, matches lesson-deep-dive migration project in progress | apps/src/aiTutor/ (source still lives there per this doc)
frontend/packages/lint-config/README.md | shared ESLint/TS/Prettier/Stylelint configs for frontend/ only | developer | 2026-08-28 (unreliable) | fresh - clear preset table, explicitly excludes legacy apps/ | frontend/AGENTS.md
frontend/packages/markdown/README.md | Markdown component: sanitized HTML render via rehype-sanitize | developer | 2026-08-28 (unreliable) | fresh - clear security-relevant usage doc | none
frontend/packages/playwright-support/README.md | shared Playwright test support: visualCheck fixture (local vs Applitools Eyes) | developer | 2026-08-28 (unreliable) | fresh - matches Argos trial / eyes-port projects in memory | frontend/packages/e2e-tests/README.md
frontend/packages/users/README.md | "My Account" app-shaped feature package: profile/login/language editing | developer | 2026-08-28 (unreliable) | fresh - matches Accounts module v1 locked project, cites packages.md convention | frontend/docs/conventions/packages.md; frontend/packages/core/src/api/mocks/README.md
frontend/templates/CONTRIBUTING.md | placeholder CONTRIBUTING template, 3 unfilled bullet points | developer | 2026-08-28 (unreliable) | fresh (template by design, never meant to be filled in-place) | frontend/templates/README.md; scaffolded output filled per frontend/packages/component-library/CONTRIBUTING.md
frontend/templates/README.md | placeholder README template with bracketed sections | developer | 2026-08-28 (unreliable) | fresh (template by design) | frontend/templates/CONTRIBUTING.md; used by turbo/generators
frontend/turbo/generators/AGENTS.md | rule: config.ts/templates/ must stay in sync with packages.md | developer | 2026-08-28 (unreliable) | fresh - short, points at the coupling explicitly | frontend/docs/conventions/packages.md
frontend/turbo/generators/README.md | how to scaffold a new package/lab via `yarn turbo gen` | developer | 2026-08-28 (unreliable) | fresh - matches packages.md and studio AGENTS.md registration steps | frontend/docs/conventions/packages.md; frontend/apps/studio/AGENTS.md
frontend/.specify/memory/constitution.md | speckit constitution: Design-System-First, Modular Package Architecture principles | developer | untracked (in .git/info/exclude, personal/local) | fresh - filled-in v1.0.0, not a bare template | frontend/AGENTS.md (overlapping principles, different tool)
frontend/.specify/templates/agent-file-template.md | unfilled speckit boilerplate: auto-generated dev-guidelines template | developer | untracked (local, spec-kit tool scaffold) | fresh (template by design, all placeholders unfilled) | sibling .specify/templates/*.md
frontend/.specify/templates/checklist-template.md | unfilled speckit boilerplate: feature checklist template | developer | untracked (local, spec-kit tool scaffold) | fresh (template by design) | sibling .specify/templates/*.md
frontend/.specify/templates/constitution-template.md | unfilled speckit boilerplate: project constitution template | developer | untracked (local, spec-kit tool scaffold) | fresh (template by design) | frontend/.specify/memory/constitution.md (the filled instance)
frontend/.specify/templates/plan-template.md | unfilled speckit boilerplate: implementation plan template | developer | untracked (local, spec-kit tool scaffold) | fresh (template by design) | frontend/specs/001-header-signed-in-button/plan.md (a filled instance)
frontend/.specify/templates/spec-template.md | unfilled speckit boilerplate: feature spec template | developer | untracked (local, spec-kit tool scaffold) | fresh (template by design) | frontend/specs/001-header-signed-in-button/spec.md (a filled instance)
frontend/.specify/templates/tasks-template.md | unfilled speckit boilerplate: task list template | developer | untracked (local, spec-kit tool scaffold) | fresh (template by design) | frontend/specs/001-header-signed-in-button/tasks.md (a filled instance)
frontend/specs/001-header-signed-in-button/contracts/component-api.md | SignedInUserButton component API contract: stateless, props | developer | untracked (in .git/info/exclude, personal/local); spec dated 2026-04-09 in-doc | COMPLETE/stale-as-a-plan - component IS implemented at frontend/packages/component-library/src/header/components/SignedInUserButton/, spec-kit artifacts should be archived | frontend/packages/component-library/src/header/components/SignedInUserButton/SignedInUserButton.tsx (built)
frontend/specs/001-header-signed-in-button/data-model.md | SignedInUserButton data model: UserAuthProp discriminated union | developer | untracked (local); spec dated 2026-04-09 | COMPLETE/stale-as-a-plan - feature shipped, doc describes a finished plan not live code | frontend/packages/component-library/src/header/components/SignedInUserButton/
frontend/specs/001-header-signed-in-button/plan.md | implementation plan for SignedInUserButton, dated 2026-04-09 | developer | untracked (local); spec dated 2026-04-09 | COMPLETE/stale-as-a-plan - superseded by shipped component | frontend/packages/component-library/src/header/README.md
frontend/specs/001-header-signed-in-button/quickstart.md | validation steps: yarn dev/lint:fix/release:dryrun | developer | untracked (local) | COMPLETE/stale-as-a-plan - feature shipped | frontend/AGENTS.md; frontend/README.md
frontend/specs/001-header-signed-in-button/research.md | design decision: co-locate button in header/ package, not new top-level pkg | developer | untracked (local) | COMPLETE/stale-as-a-plan - feature shipped, decision now baked into code | frontend/packages/component-library/src/header/README.md
frontend/specs/001-header-signed-in-button/spec.md | feature spec: signed-in user button attached to MUI header | developer | untracked (local); Created 2026-04-09, Status: Draft | COMPLETE/stale-as-a-plan - "Draft" status stale, feature is shipped; recommend archiving this openspec-style change | frontend/packages/component-library/src/header/README.md
frontend/specs/001-header-signed-in-button/tasks.md | task list for SignedInUserButton implementation | developer | untracked (local) | COMPLETE/stale-as-a-plan - tasks marked prerequisites done (checkmarks), feature shipped, ripe for archive/delete | frontend/specs/001-header-signed-in-button/plan.md

## Section 2: Package structure

### frontend/ top-level dirs (excluding node_modules, .turbo, .yarn, .playwright-mcp, .claude)

- `apps/` — Turborepo apps (studio, design-system-storybook, mobile)
- `docs/` — cross-cutting frontend conventions (packages.md)
- `openspec/` — LOCAL ONLY (`.git/info/exclude`), in-progress change proposals, not shared with team
- `packages/` — Turborepo libraries and labs
- `.specify/` — LOCAL ONLY (`.git/info/exclude`), spec-kit tool scaffold + one filled constitution
- `specs/` — LOCAL ONLY (`.git/info/exclude`), spec-kit feature specs (currently: 001-header-signed-in-button, already shipped)
- `templates/` — checked-in blank README/CONTRIBUTING templates for new packages
- `turbo/` — Turborepo code generators (`yarn turbo gen package|lab`)

### frontend/packages/* (real workspace members, matched by root `workspaces: ["apps/*","packages/*","packages/labs/*"]`)

path | package.json name | purpose | README?
--- | --- | --- | ---
packages/ai-tutor | (none — no package.json, no tracked files) | UNTRACKED, contains only gitignored `dist/`; no source in this checkout — likely local build-cache leftover or reserved future workspace slot, not a real package here | NO
packages/audio | (none) | same as above: untracked, `dist/`-only stub | NO
packages/blockly | (none) | same as above: untracked, `dist/`-only stub | NO
packages/blockly-workspace | (none) | same as above: untracked, `dist/`-only stub | NO
packages/changelogs | @code-dot-org/changelogs | tiny internal tool: single `index.js`, changesets-related helper | NO
packages/component-library | @code-dot-org/component-library | Design System React component library (DSCO, migrating to MUI) | YES
packages/component-library-styles | @code-dot-org/component-library-styles | shared CSS variables/mixins/typography/colors | YES
packages/core | @code-dot-org/core | shared runtime: SiteConfig, DashboardApiClient, plugin model (consent/localization/observability) | YES
packages/e2e-tests | @code-dot-org/e2e-tests | Playwright e2e suite targeting studio.code.org | YES
packages/fonts | @code-dot-org/fonts | Code.org web fonts + Font Awesome Pro loader | YES
packages/lesson-deep-dive | @code-dot-org/lesson-deep-dive | dev shell for AI Tutor+ post-lesson review flow (source still in apps/) | YES
packages/lint-config | @code-dot-org/lint-config | shared ESLint/TS/Prettier/Stylelint/lint-staged configs for frontend/ | YES
packages/markdown | @code-dot-org/markdown | sanitized Markdown-to-React renderer (rehype-sanitize) | YES
packages/platform | (none) | UNTRACKED, `dist/`-only stub, same pattern as ai-tutor/audio/blockly | NO
packages/playwright-support | @code-dot-org/playwright-support | shared Playwright fixtures: visualCheck (local screenshots / Applitools Eyes) | YES
packages/progress | (none) | UNTRACKED, `dist/`-only stub, same pattern | NO
packages/teacher-dashboard | (none) | UNTRACKED, `dist/`-only stub, same pattern | NO
packages/users | @code-dot-org/users | "My Account" app-shaped feature package (profile/login/language editing) | YES
packages/labs/ailab | @code-dot-org/ailab | AI Lab: KNN classification/regression teaching tool, ported from standalone repo | YES
packages/labs/ai-trainer | (none) | UNTRACKED, `dist/`-only stub | NO
packages/labs/base | @code-dot-org/lab | Lab2 framework host: lab shell, level-properties context, error/loading UI | YES
packages/labs/datasci | (none) | UNTRACKED, `dist/`-only stub | NO
packages/labs/maze | (none) | UNTRACKED, `dist/`-only stub | NO
packages/labs/music | @code-dot-org/music-lab | NEW standalone Music Lab port for Studio (Vite/TanStack) | YES
packages/labs/oceans | @code-dot-org/oceans-lab | AI for Oceans lab, ported from ml-activities standalone repo (2019 HoC) | YES
packages/labs/standalone-video | (none) | UNTRACKED, `dist/`-only stub | NO
apps/design-system-storybook | @code-dot-org/design-system-storybook | Storybook instance for component-library | YES
apps/mobile | (none — untracked, 0 files besides local android/ dir) | LOCAL ONLY: Capacitor mobile-app wrap experiment (see project memory), not committed | NO
apps/studio | @code-dot-org/studio | Code Studio (experimental) — Rails/Vite SPA shell, primary new-frontend architecture | YES

Note on the `dist/`-only stub packages (ai-tutor, audio, blockly, blockly-workspace,
platform, progress, teacher-dashboard, labs/ai-trainer, labs/datasci, labs/maze,
labs/standalone-video): each contains only a gitignored `dist/` directory and zero
files tracked by git (`git ls-files` returns empty). They match the `packages/*` /
`packages/labs/*` workspace globs by name alone but ship no `package.json` and no
source — almost certainly local build-cache leftovers from a prior experiment or
placeholder slots reserved for future packages named in AGENTS.md / planning docs
("teacher-dashboard", "progress", etc. show up in memory notes as separate,
still-in-planning projects). Not real, shippable code in this checkout.


### apps/src/* top-level directories (72 total)

Bucketed lab (student learning-activity engine) / teacher-tool / shared
(infrastructure used by multiple labs or tools) / other (build artifacts,
routing, vendored code, marketing widgets).

dir | bucket | purpose guess
--- | --- | ---
accounts | shared | account settings/edit UI, account-unlink warning modal
acemode | shared | Ace/CodeMirror-style editor mode config for JS syntax
aichat | shared | AI chat API client, context manager, event logging (used by AI labs)
aichatLab | lab | AI chat delivered as a Lab2 lab (entrypoint + redux)
aiComponentLibrary | shared | AI-specific UI widgets (tutor version alerts, chat message bubbles)
aiDifferentiation | teacher-tool | AI Differentiation feature: exit tickets, lesson hooks, floating action button
aiEvaluation | teacher-tool | AI-assisted student-work evaluation APIs and types
aiGateway | shared | AI gateway: generateText/transcribe API wrappers, shared contract
ailab | lab | AI Lab (legacy apps/ implementation; see frontend/packages/labs/ailab for the new port)
aiTeacherDrawer | teacher-tool | AI Differentiation teacher-facing chat drawer UI
aiTutor | shared | AI Tutor prompts/hooks/APIs consumed by pythonlab and weblab2
applab | lab | App Lab (Droplet-based programming environment)
assetManagement | shared | asset upload/download utilities, animation library API
blockTooltips | shared | Droplet editor autocomplete/parameter tooltip managers
blockly | shared | Blockly workspace core + manual regression testing checklist
bounce | lab | Bounce game (Blockly-based physics lab)
bubbleChoice | lab | Lab2 client for the bubble_choice level type
code-studio | shared | core Studio components + legacy react-router v3→v6 routing shim
codebridge | shared | Codebridge: bridges JS-authored labs to native code execution (used by javalab2/weblab2)
codemirror | shared | CodeMirror editor configuration
cookieBanner | shared | cookie-consent banner widget
courseExplorer | teacher-tool | course/curriculum browsing UI
craft | lab | Craft (Phaser-based game lab, per active native-port project)
dance | lab | Dance Party lab, includes the Dance AI emoji-to-effect modal
fish | lab | AI for Oceans legacy webpack consumer (Fish.js wraps @code-dot-org/oceans-lab)
flappy | lab | Flappy Bird-style game (Blockly-based lab)
flashes | shared | flash/toast message handler
flowlab | lab | Flow Lab (flow-diagram based level type)
generated | other | build-generated output directory, not for source files
hamburger | shared | hamburger navigation menu component
javalab | lab | Java Lab (includes lab2/ subfolder for the Lab2+codebridge port)
jigsaw | lab | Jigsaw puzzle game (Blockly-based lab)
jsonVideo | shared | JSON-driven video component, used by AI Tutor video responses
lab2 | shared | Lab2 framework: shared components/infra for all newer labs
legacySharedComponents | shared | old generic UI components, mid-deprecation toward component-library
levelbuilder | teacher-tool | curriculum-authoring UI (levelbuilder editors, AI iteration tools)
lib | shared | low-level tool/utility helpers
localization | shared | dynamic translation module (LocalizeJS-based, legacy vs. frontend/core plugin)
maker | lab | Maker Toolkit lab (microbit/board integrations)
maze | lab | Maze lab (bee/collector Blockly game)
metrics | shared | analytics/metrics reporting (legacy firehose-style, AnalyticsReporter)
miniApps | lab | small standalone mini-apps (neighborhood, theater widgets)
music | lab | Music Lab (legacy webpack implementation; see frontend/packages/labs/music for new port)
musicMenu | shared | music-lab-adjacent menu component
netsim | lab | Internet Simulator lab (client entrypoint; docs live in apps/docs/netsim)
p5lab | lab | p5.js-based lab (Gamelab/Spritelab family)
panels | lab | Lab2 client for the panels level type (image+text panels)
pixelEditor | shared | pixel-art editor widget used across labs
publicKeyCryptography | lab | Public Key Cryptography lab (Alice/Bob characters)
pythonlab | lab | Python Lab (pyodide-based, in-browser Python)
redux | shared | shared/common Redux reducers used across the legacy bundle
regionalPartnerMiniContact | other | regional-partner contact-form widget (marketing/partnerships)
schoolInfo | teacher-tool | school-info confirmation dialog/interstitial (onboarding)
scrapbook | shared | Scrapbook feature (student project gallery/save UI)
sharedComponents | shared | generic reusable UI components without a Design System counterpart yet
signIn | shared | sign-in page and form
signUpFlow | shared | multi-step sign-up flow (account type, finish student/teacher account)
simpleSignUp | shared | simplified sign-up incl. LTI and link-account flows
sites | other | per-site page entrypoints (routing glue, e.g. sites/studio)
sketchlab | lab | Sketch Lab (React Flow-based accessible diagramming tool)
standaloneVideo | lab | Lab2 client for the standalone_video level type
storage | shared | App Lab data-storage/datablock UI
studio | shared | legacy StudioApp core (shared game-engine base for classic labs)
templates | shared | shared page-level templates/components (account, admin, dialogs)
third-party | other | vendored third-party libraries (canvg, hammer.js, maker vendor code)
turtle | lab | Turtle/Artist lab (classic turtle graphics)
types | shared | shared TypeScript type definitions (progress, redux, rubric)
userHeaderEventLogger | shared | header-interaction analytics logger
userLevelInteractionsLogger | shared | logs per-level user interactions via API (README.md itself is 0 bytes)
util | shared | general-purpose utilities (audio recording, browser detection, auth token store)
weblab | lab | Weblab (legacy Bramble-based HTML/CSS editor)
weblab2 | lab | Web Lab 2 (HTML/CSS/JS lab, iframe+service-worker preview)
