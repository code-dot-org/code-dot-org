# Tasks: frontend-release-validation-truth

## 1. Rulings

- [ ] 1.1 MANUAL-TASK (release owner): rule automate-publish (workflow)
      vs document-manual-policy. Blocks section 4 only; sections 2-3
      and 5 proceed regardless
- [ ] 1.2 Checkpoint: measure validation overhead on a full
      `yarn release:dryrun`; if >60s added wall time, execute the
      rename fallback instead; record the measurement either way

## 2. Packaging validation

- [ ] 2.1 Add `publint` as a workspace devDep; new turbo task per
      `private: false` package: publint against the built package +
      node ESM/CJS resolution smoke over every `exports` subpath +
      `yarn pack --dry-run` file-list check; wire into the
      `release:dryrun` graph
- [ ] 2.2 Write component-library-styles `exports` map covering all
      currently consumed deep paths (enumerate consumers first); verify
      legacy portal consumers still resolve
- [ ] 2.3 Negative test: break a subpath on a scratch branch, watch the
      check fail

## 3. CI reproducibility

- [ ] 3.1 `--immutable` in `.github/actions/frontend/setup/action.yml`;
      contributor note in `frontend/README.md`
- [ ] 3.2 Lockstep script: `PLAYWRIGHT_IMAGE_TAG` in frontend-ci.yml /
      dtt.yml / component-library-deploy.yml vs the exact playwright
      pin in `frontend/.yarnrc.yml`; run in the setup action;
      negative-test it

## 4. Publish path (per ruling 1.1)

- [ ] 4.1 Either: `workflow_dispatch` release workflow invoking
      `release-it` with GitHub Packages auth — or README policy text on
      both publishable packages

## 5. Validation

- [ ] 5.1 Full `yarn release:dryrun` timing before/after; attach delta
- [ ] 5.2 All frontend CI jobs green on the change's own PR
