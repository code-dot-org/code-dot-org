# Tasks: frontend-release-validation-truth

## 1. Rulings

- [ ] 1.1 Release-owner ruling: automate publish (workflow) vs document
      manual policy
- [ ] 1.2 Checkpoint: pack-dry-run cost measured; confirm keep-the-name
      direction or fall back to rename (record either way)

## 2. Packaging validation

- [ ] 2.1 Add publint-class check task (exports resolution ESM+CJS,
      packed file list) for `private: false` packages; wire into the
      `release:dryrun` graph
- [ ] 2.2 Write component-library-styles `exports` map covering all
      currently consumed deep paths (enumerate consumers first); verify
      legacy portal consumers still resolve
- [ ] 2.3 Negative test: break a subpath on a scratch branch, watch the
      check fail

## 3. CI reproducibility

- [ ] 3.1 `--immutable` in `.github/actions/frontend/setup/action.yml`;
      contributor note in `frontend/README.md`
- [ ] 3.2 Lockstep script: workflows' `PLAYWRIGHT_IMAGE_TAG` vs catalog
      pin; run in the setup action; negative-test it

## 4. Publish path (per ruling 1.1)

- [ ] 4.1 Either: `workflow_dispatch` release workflow invoking
      `release-it` with GitHub Packages auth — or README policy text on
      both publishable packages

## 5. Validation

- [ ] 5.1 Full `yarn release:dryrun` timing before/after; attach delta
- [ ] 5.2 All frontend CI jobs green on the change's own PR
