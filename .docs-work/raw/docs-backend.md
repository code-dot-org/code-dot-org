# Backend/infra markdown catalog

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
