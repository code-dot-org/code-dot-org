# Design: pegasus-marketing-rename

## Context

The rename set and its consumers are enumerated in the proposal and
`specs/pegasus-removal/inventory-gems-infra.md` §B4/B5/B8/B9. Key
verified facts: the only in-repo CloudFormation call building a
distribution config is `cloudfront_config('Dashboard')`
(`cloud_formation_stack.yml.erb:421`) — the `:pegasus` entry in
`AWS::CloudFront::CONFIG`/`HTTP_CACHE` is consumed by infra tooling
(`get_app_config`, `:hourofcode` mapping) and rake tasks, not by a
template that would re-create resources on rename.
`CDO.code_org_url` (lib/cdo.rb:164, ~57 dashboard callsites) builds
marketing links via `site_host('code.org')`, which reads
`override_pegasus`/`pegasus_port` — the rename transitively affects
every marketing link, hence the smoke requirements.

## Goals / Non-Goals

**Goals:** no identifier in code or config named "pegasus" refers to
the marketing site; behavior byte-identical (URLs, headers, CDN,
chef converge output).

**Non-Goals:** renaming runtime-store keys (DCDO `pegasus_*_max_age`,
Gatekeeper `pegasus_read_replica`) — changing live flag names
requires coordinated store writes for zero benefit; renaming
AWS-side names (CloudFront log prefix `-pegasus-cdn`, origin
`#{env}-pegasus.code.org` DNS, Redshift schema names) — real
resource moves; deleting `lib/cdo/url_converter.rb` (Cucumber
tooling; dies with the Cucumber suite).

## Decisions

**1. `code_org` as the replacement token,** matching the existing
`code_org_url`/`code_org_dir` naming family and the
`MARKETING_SITES_HOSTS` constant's domain. Rejected: `marketing`
(the config keys name a specific host, not a role).

**2. Straight rename, no alias period.** All consumers are in-repo;
`config.yml.erb` and its readers deploy atomically. Chef-managed
globals that set `override_pegasus`/`pegasus_hostname` on specific
environments must be renamed by infra in the same window — task
lists a pre-merge sweep (`grep the globals store`) and the rename
lands only after infra confirms which environments set them.

**3. Chef teardown recipe deletion is gated on converge history.**
`cdo-apps::pegasus` only stops/removes a systemd unit; every
production instance has converged hundreds of times since it landed.
Verify with infra (one prompt), then delete recipe + include.

**4. UI-test env vars.** `PEGASUS_TEST_DOMAIN` (steps.rb) renames to
`CODE_ORG_TEST_DOMAIN` with a fallback read of the old name for one
cycle, because CI/drone job definitions outside this repo may export
it — the fallback is removed when drone config is confirmed updated
(follow-up noted in PR).

## Risks / Trade-offs

- **Missed old-name reader in chef globals or out-of-repo tooling**
  → that environment loses its override (e.g. adhoc pointing
  code.org links somewhere custom). Mitigation: infra sweep task +
  staging/adhoc converge with link smoke (`code_org_url` renders,
  hamburger shows marketing links, CORS origin intact).
- **Blast radius is wide but shallow** — every file is a token
  rename; the verification burden (staging converge) is the real
  cost, which is why this change is last-priority and standalone.
