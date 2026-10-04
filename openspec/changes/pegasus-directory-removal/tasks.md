# Tasks: pegasus-directory-removal

Prerequisites: `pegasus-cron-detach`, `pegasus-shared-resources-port`,
`pegasus-db-retire` merged. Verify the directory is inert first:
`grep -rn "pegasus/" lib/rake/ shared/rake/ .github/ --include=*.rake --include=*.yml | grep -v openspec`
should show only the references this change deletes.

## 1. Repoint surviving cache paths

- [ ] 1.1 `lib/cdo/aws/cloudfront.rb` (~:78):
      `CLOUDFRONT_ALIAS_CACHE = pegasus_dir 'cache', 'cloudfront_aliases.json'`
      → `deploy_dir 'tmp', 'cloudfront_aliases.json'`; confirm the
      three consumers (`lib/cdo/rack/allowlist.rb:6`,
      `lib/cdo/cloud_formation/cdo_app.rb:11`,
      `lib/rake/infra.rake:5`) reference the constant, not the path
- [ ] 1.2 `lib/cdo/analytics/milestone_parser.rb` (~:29-30,99): the
      three `pegasus_dir('cache', ...)` refs →
      `deploy_dir('tmp', ...)`;
      `shared/test/test_milestone_parser.rb` (~:28) follows
- [ ] 1.3 Run `cd shared && bundle exec ruby -Itest test/test_milestone_parser.rb`
      — passes

## 2. Delete the directory

- [ ] 2.1 `git rm -r pegasus/`
- [ ] 2.2 `.gitattributes`: remove the `pegasus/cache/i18n/**` LFS
      rule (~:23), the `pegasus/cache/i18n/en-US.json` merge-driver
      exception (~:54), and all dead `pegasus/sites*` patterns
      (~:24-25, :55-65, :85-87 — verify by
      `grep -n pegasus .gitattributes`)

## 3. Tooling references

- [ ] 3.1 `lib/rake/lint.rake` (~:16): drop `pegasus` from the
      haml-lint argument list
- [ ] 3.2 `.haml-lint.yml` (~:200-201) and `.haml-lint_todo.yml`
      (~:65-81): remove pegasus-path excludes
- [ ] 3.3 `lib/cdo/github.rb`: remove `PEGASUS_DB_DIR` (~:12) and
      the migration-detection branch using it (~:40-49); check
      callers of the removed method/constant
      (`grep -rn "PEGASUS_DB_DIR\|pr_changed_files" --include=*.rb lib/ bin/`)
      and adjust
- [ ] 3.4 `bin/content-push` (~:7): `CONTENT_PATHS` loses the
      `pegasus` token
- [ ] 3.5 Delete `tools/customLinters/rubocop_pegasus_requires.rb`
      and its registration (same mechanism found in
      `pegasus-db-retire` task 4.2)
- [ ] 3.6 `deployment.rb` (~:83-84): delete `pegasus_dir` (LAST —
      after 1.x and 2.x; verify zero references:
      `grep -rn "pegasus_dir" --exclude-dir=.git . | grep -v openspec`)

## 4. k8s

- [ ] 4.1 Delete `k8s/docker/code-dot-org-pegasus.dockerfile` and
      `k8s/docker/code-dot-org-pegasus.dockerfile.dockerignore`
- [ ] 4.2 `k8s/docker/code-dot-org.dockerfile`: remove the pegasus
      layer ARG/COPY references (~:15, :205-207) keeping the
      remaining layer chain intact
- [ ] 4.3 Re-run `k8s/docker/update-dockerignore-from-gitignore.rb`
      and commit the regenerated
      `code-dot-org.dockerfile.dockerignore` (the pegasus rules
      disappear because their source .gitignore files are gone)
- [ ] 4.4 `k8s/kustomize/skaffold.yaml`: remove the
      `code-dot-org-pegasus` artifact, its sync rules, and
      `mimic-pegasus` entries (~:23,49,71,79,82,174,180,204 —
      verify each)
- [ ] 4.5 `k8s/docker/README.md` (~:23) and
      `k8s/docker/benchmark-skaffold-rebuilds/*`: remove pegasus
      mentions
- [ ] 4.6 If the local toolchain allows, run the skaffold/docker
      build for the composite image; otherwise flag the k8s owner as
      a required reviewer in the PR

## 5. Docs (functional only)

- [ ] 5.1 Delete `docs/pegasus-dashboard-integration.md`
      (architecture doc for deleted code; prose sweep of other docs
      is `pegasus-gem-final-sweep`)

## 6. Verify

- [ ] 6.1 All spec grep gates pass
- [ ] 6.2 `bundle exec rake --tasks` exits zero at repo root;
      `bin/dashboard-server` boot smoke (or
      `bin/rails runner 'true'` from dashboard/)
- [ ] 6.3 `./tools/hooks/pre-commit` passes (exercises the lint
      config edits)
- [ ] 6.4 `git lfs ls-files | grep pegasus` returns nothing
- [ ] 6.5 Full drone run on the PR (build system + lint + k8s config
      all touched)
