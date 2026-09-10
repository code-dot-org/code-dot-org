# Frontend/Apps Markdown Catalog

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
