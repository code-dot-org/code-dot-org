# WIP notes: darin/pr-warnings

Written 2026-09-09. Parked, not abandoned. Delete this file before the PR is
marked ready for review.

## Purpose

Extend the GitHub Actions workflow that comments on PRs touching
`aws/dms/tasks.yml` so it also warns when a PR touches:

1. CloudFormation stacks that the regular deploy never applies (vpc, iam,
   data). Someone on infrastructure has to run them by hand, and merging
   without doing so leaves the template and the live stack out of step.
2. Inputs to the application stack whose update can interrupt service
   instead of rolling through it: the daemon/console bootstrap script, the
   application stack template, and everything under
   `aws/cloudformation/components/`.

The workflow file was renamed from
`.github/workflows/pr_check_for_manual_deploy_requirement.yml` to
`.github/workflows/pr_check_for_warnings_and_deploy_requirements.yml`. The
rewrite is large enough that git may not pair the two paths as a rename;
use the old path to find the pre-branch history.

## Where things stand

- Branch point: 27032c033e1. `staging` has moved on by ~160 commits since,
  but none of them touch the workflow or SETUP.md, so a rebase should apply
  cleanly.
- Two commits on the branch, plus this file:
  - "WIP: PR warnings for hand-deployed and disruptive infra changes"
  - "SETUP.md: version sources of truth, docker note, mysql check" (unrelated
    to the branch topic, see below)
- `origin/darin/pr-warnings` exists but sits at the branch point with no
  commits. The local branch has not been pushed since.
- No PR opened. The workflow has never run in CI.
- Verification done locally: the YAML parses, and both embedded scripts pass
  `node --check` once wrapped in an async function with `github` and
  `context` stubbed. No actionlint or yamllint on this machine, and the repo
  pre-commit hook does not lint `.github/` YAML.

## What the workflow does now

Two `actions/github-script@v7` steps in one job, `check-files`, on
`pull_request` (opened, synchronize) into `staging`.

Changes common to both steps versus the original:

- Job-level `permissions:` grants `pull-requests: write` and `issues: write`,
  nothing else.
- File and comment listings go through `github.paginate`. The original read
  only the first page (30 items), so a PR with more than 30 changed files or
  more than 30 comments could miss the trigger or repost the warning.
- A `postOnce(prefix, body)` helper posts a comment unless one containing
  `prefix` already exists on the PR. This is the same dedup rule the DMS
  warning used, just factored out. It is currently pasted into both steps.

Step `check_manual_deploy`:

- DMS warning, unchanged in wording: `aws/dms/tasks.yml`, prefix
  `[WARN: DMS Config Modified]`.
- New: `aws/cloudformation/{data,vpc,iam}.yml.erb`, prefix
  `[WARN: Manually Deployed Stack Modified]`, lists the matched files.

Step `check_disruptive_infra`:

- Exact matches `aws/cloudformation/bootstrap_chef_stack.sh.erb` and
  `aws/cloudformation/cloud_formation_stack.yml.erb`, plus anything under
  `aws/cloudformation/components/` that does not end in `.md`.
- Prefix `[WARN: Disruptive Infrastructure Change]`, lists the matched files.

## Claims made in the workflow comments, and where they are backed

Each comment in the workflow asserts something about the deploy. Checked
against the tree at the branch point:

- "The regular deploy never touches vpc/iam/data." `lib/rake/infra.rake`,
  task `deploy_stack`, runs `rake stack:start`, which builds
  `Cdo::CloudFormation::CdoApp` from `cloud_formation_stack.yml.erb`. The
  vpc, iam and data stacks live in their own namespaces in
  `lib/rake/stack.rake` and nothing in the deploy path invokes them.
- "bootstrap_chef_stack.sh.erb becomes the UserData of the daemon and
  console instances." `lib/cdo/cloud_formation/cdo_app.rb:37` defines
  `BOOTSTRAP_CHEF` as that file; `cloud_formation_stack.yml.erb` renders it
  into `UserData` for the Daemon (line ~778) and Console (line ~839)
  resources. Both are `AWS::EC2::Instance` with an EBS root volume and
  `UpdateReplacePolicy: Retain`. A UserData change on an EBS-backed instance
  is applied by stopping and starting it.
- "BlockDeviceMappings is immutable." The template says so itself in a
  comment at line ~752 of `cloud_formation_stack.yml.erb`.
- "components/ is rendered into the application template."
  `lib/cdo/cloud_formation/stack_template.rb:76` and `:83` read
  `components/<name>.yml.erb` and splice the result in.

## Before opening a PR

Ordered roughly by how much they matter.

1. Fix the hand-deploy instruction. The comment text says
   `rake stack:<name>`. The actual task is `rake stack:<name>:start`
   (`lib/rake/stack.rake`). IAM additionally needs `ADMIN=1` and the admin
   AWS profile; `aws/cloudformation/README.md` has the exact incantation.
   `aws/dms/tasks.yml` shows the data stack form in its header comment.
2. Decide whether `handDeployedStacks` is complete. `stack.rake` also
   defines namespaces for `lambda`, `alerting` and `ami`, and
   `aws/cloudformation/data-policy.yml.erb` sits next to `data.yml.erb`.
   None of these are in the list. Also note `ami.yml.erb` lives under
   `components/`, so step 2 catches it, not step 1.
3. Forked PRs. On a `pull_request` event from a fork the token is read-only
   whatever `permissions:` says, so `createComment` returns 403 and the job
   goes red. The DMS-only version had the same problem; the wider trigger
   set makes it more likely to surface. Options: wrap `createComment` in a
   try/catch that logs and continues, set `continue-on-error`, or move to
   `pull_request_target` (safe here since the script checks out nothing,
   but worth saying so in a comment if chosen).
4. `postOnce` and the `listFiles` call are duplicated across the two steps.
   Either fold both checks into one step or accept the duplication for the
   sake of separate step names in the Actions log. One step is probably
   right; the step boundary buys little.
5. Renaming a workflow file makes GitHub show a new workflow in the Actions
   tab; the old one's run history stays under the old name. Required status
   checks in branch protection key on the job name, `check-files`, which
   did not change. Confirm that in repository settings before merging.
6. Exercise it. Push the branch, open a draft PR, then push a throwaway
   commit that touches one file from each category (a comment change in
   `aws/cloudformation/components/redis.yml.erb`, a whitespace change in
   `aws/cloudformation/components/README.md` which must not trigger, and so
   on). Check that each warning posts once and does not repeat on the next
   push. Revert the throwaway commit before review.

## The SETUP.md commit

Unrelated to PR warnings. It was in the working tree when the branch was
parked and has been committed separately so it can be cherry-picked onto
its own branch or dropped. Contents:

- Version checks now point at `.ruby-version` and `.nvmrc` as the source of
  truth instead of hard-coded numbers. The doc said ruby 3.1.7;
  `.ruby-version` says 3.2.11.
- A note that MySQL and Redis can run in containers via
  `docker/developers/README.md`, and that installing them both ways leaves
  two servers fighting over ports 3306 and 6379.
- The macOS mysql link check now uses `which mysql` and explains that
  `mysql --version` reports the client, so a newer client than the server is
  fine.

## Picking this up

```sh
git fetch origin
git checkout darin/pr-warnings
git rebase origin/staging
```

Then work the list above, at minimum items 1 and 2, push, open a draft PR,
run item 6, and delete this file.
