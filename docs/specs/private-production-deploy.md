# Private production deploys

Production deploys from a private mirror, `code-dot-org/code-dot-org-production`,
so a security fix can ship before its diff is public. Everything else stays on
the public repo `code-dot-org/code-dot-org`.

The fix's source is hidden; its effect is not. Client-side fixes ship in
production JS bundles and anyone can read them.

## Shape

    public staging ──► public production (DTP, unchanged)
          │                  │
          │  sync, 5 min     │  sync, 5 min
          ▼                  ▼
    private staging    private production ◄── security-fix PRs
                             │
                             ▼
                  production-daemon, production-console

The private repo is a mirror push of the public one, not a GitHub fork, so
commit SHAs are shared and history moves freely between the two.

`.github/workflows/private-production-sync.yml` is the same file in both
repos; a repository guard makes it a no-op in the public one.
For each of `staging` and `production` it fast-forwards the private branch to
the public one when it can, and otherwise merges public into it with a merge
commit. On a conflict or a rejected push it posts to Slack and leaves the
private branch alone. Nothing flows from private to public except by hand.

Staging, test and levelbuilder keep using the public repo. They push commits
(schema cache, dsls, cookbook versions, trusted proxies); production does not.

## Repository setup

    git clone --mirror https://github.com/code-dot-org/code-dot-org.git
    cd code-dot-org.git
    git lfs fetch --all
    git push --mirror git@github.com:code-dot-org/code-dot-org-production.git
    git lfs push --all git@github.com:code-dot-org/code-dot-org-production.git

`git push --mirror` also copies `refs/pull/*`, which GitHub rejects; push
`refs/heads/*` and `refs/tags/*` if it complains. Set the private repo's
default branch to `staging`: scheduled workflows run from the default branch,
and the sync workflow is in it.

The sync pushes with a GitHub App token, not `GITHUB_TOKEN`: GitHub refuses
`GITHUB_TOKEN` pushes that add or change files under `.github/workflows/`, and
public merges do that routinely. An org admin creates the App by hand:

1. Create a GitHub App owned by `code-dot-org`, no webhook, with repository
   permissions Contents: read and write, Workflows: read and write.
2. Install it on `code-dot-org-production` only.
3. In the private repo, set the variable `PRIVATE_PRODUCTION_SYNC_APP_ID` and
   the secret `PRIVATE_PRODUCTION_SYNC_APP_PRIVATE_KEY`.
4. If `staging` or `production` are protected, let the App bypass the rules
   for pushes.

A fine-grained PAT with the same two permissions on the private repo also
works, but expires and belongs to a person.

Other private repo secrets and settings:

- `PRIVATE_PRODUCTION_SYNC_SLACK_WEBHOOK_URL`: incoming webhook for the channel
  that should hear about conflicts. Without it the workflow still fails
  visibly in Actions but posts nothing.
- Every workflow in the public repo arrives in the private one and runs there
  on its triggers. Disable the ones production does not need in the private
  repo's Actions settings, and give the private repo only the secrets the
  remaining workflows need. Secrets set there are readable by any workflow
  file that a sync brings in from public.
- CODEOWNERS already assigns `/.github/` to `@code-dot-org/infrastructure`.
  Turn on required code-owner review in the private repo's branch rules so
  it is enforced there too.

## Access

- Chef-managed hosts clone over SSH as `deploy-code-org`. That user needs read
  on the private repo. Its key is in the chef role attributes
  `cdo-github-access.id_rsa`.
- Adhocs clone over https with the PAT `code-dot-org-read-only-cicd`
  (`cookbooks/cdo-github-access`). The token must be able to read the private
  repo: add the repo to a fine-grained token, or grant `deploy-code-org`
  read on it for a classic one.
- Engineers who write fixes need write on the private repo. Keep the list short.

## Configuration

`node['cdo-repository']['repo']` names the repository as `owner/name`. It
defaults to `code-dot-org/code-dot-org`. The recipe turns it into
`git@github.com:<repo>.git` when the node has the deploy SSH key and
`https://github.com/<repo>.git` otherwise. A `cdo-repository.url` set at
normal or higher precedence overrides the derived URL.

The chef `git` resource in `:checkout` mode, which daemons use, clones only
when the directory is missing. It does not rewrite the remote of an existing
checkout, so changing `repo` affects new hosts and AMIs, not running ones.

Adhocs:

    RAILS_ENV=adhoc bundle exec rake adhoc:start repo=code-dot-org-production branch=fix-foo

`repo` takes `owner/name`, or a bare name under `code-dot-org`. It checks the
branch with `git ls-remote` against that repo, so your own git credentials must
be able to read it. The value is kept in the stack's `Op:Repo` tag; later
`adhoc:start` runs reuse it unless given another. `stack:start` accepts
`REPO=` too.

## Production cutover

Do this once private `production` equals public `production` and the sync has
run cleanly for a while.

1. Confirm both hosts can read the private repo:

       git ls-remote git@github.com:code-dot-org/code-dot-org-production.git production

2. Set the production chef environment's default attribute
   `cdo-repository.repo` to `code-dot-org/code-dot-org-production`. This
   covers hosts and AMIs built from now on.

3. On production-daemon and production-console:

       cd ~/production
       git remote set-url origin git@github.com:code-dot-org/code-dot-org-production.git
       git fetch origin
       git status            # expect: up to date with 'origin/production'

   The `~/staging` worktree on production-daemon shares this config and
   follows.

4. On the next DTP, the commit link `aws/ci_build` posts should point at the
   private repo.

Rollback is the same steps with the public URL, and removing the chef
attribute. If private `production` has commits public lacks at that moment,
`git pull --ff-only` on the daemon fails until someone either backports them
or runs `git reset --hard origin/production`, which drops the fix from the
next deploy.

## Security-fix flow

1. Branch from public `production`, never from private `production`. The
   public commit is in the private repo too. A branch cut from private
   `production` carries every other unreleased fix, and backporting it would
   publish them all.
2. Push the branch to the private repo and test it on an adhoc with
   `repo=code-dot-org-production`.
3. Open a PR into private `production`. Review there. Drone does not see the
   private repo (see risks); run the relevant tests locally.
4. Merge. production-daemon picks it up within a minute, as for a DTP.
5. Public DTPs keep landing. The sync merges each into private `production`
   with a merge commit, so the fix stays deployed.

The fix skips staging and test. That is the point, and also the cost.

## Backport flow

When the fix may be public:

1. Push the fix branch to the public repo and merge it into `staging` by PR.
   Its commits keep their SHAs.
2. The next DTP carries the fix to public `production`, and the sync merges
   it into private `production` with no change to the tree.

Private `production` keeps its merge commits, so the sync writes a merge
commit for every DTP from then on. Once no fix is pending, private
`production` may be pushed to public as a branch and merged into public
`production` by PR; it is then an ancestor and the sync fast-forwards again.
Do this only when every fix in it is already public.

## Open risks

- LFS. The mirror push copies every LFS object into the private repo's store,
  which counts against the organization's LFS storage quota. Production hosts
  and adhocs building from the private repo draw on its LFS bandwidth. The sync
  copies only objects added between the last synced public commit and the new
  tip; an object present only in an intermediate commit is not copied, and
  checking out that commit from the private repo will fail to smudge it.
- Actions minutes. Public repos run Actions free; private repos do not. The
  sync runs 288 times a day and each run bills at least one minute, about
  8,600 minutes a month before any real work. A full-history checkout on the
  runs that do sync takes several minutes more. Lengthen the schedule if that
  is too much. GitHub may also delay or drop scheduled runs under load.
- Secrets live in two repos. The App key and Slack webhook are new. Any secret
  added to the private repo is exposed to workflow files written in public.
- Drone. It is not known whether Drone can attach to the private repo. If it
  cannot, fixes merge into private `production` without CI.
- Visibility. GitHub web URLs, Slack links and `bin/dotd` keep pointing at
  the public repo. Only `aws/ci_build`'s commit links follow the checkout.
