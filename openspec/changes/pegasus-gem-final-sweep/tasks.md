# Tasks: pegasus-gem-final-sweep

Prerequisites: the EXTERNAL sinatra-port series final change
(`sinatra-port-netsim-codeprojects`) AND
`pegasus-shared-resources-port` merged, plus every other change in
this series (this is the closer).

## 1. Gate

- [ ] 1.1 HARD GATE:
      `grep -rln "sinatra" --include=*.rb lib/ dashboard/ shared/ bin/`
      returns exactly `lib/cdo/sinatra.rb`; if any middleware file
      appears, STOP — prerequisites incomplete
- [ ] 1.2 Confirm every pegasus-series change is archived/merged:
      `openspec list` shows none of the pegasus-* changes as active
      except this one

## 2. Gem removal

- [ ] 2.1 Delete `lib/cdo/sinatra.rb` (verify zero requirers:
      `grep -rn "cdo/sinatra" --include=*.rb .`)
- [ ] 2.2 Remove `gem 'sinatra'` from the Gemfile; `bundle install`;
      review the lock diff (expect sinatra + its exclusive deps
      removed; rack stays via rails)
- [ ] 2.3 Delete `lib/test/cdo/pegasus/` if any prior change left it
      (expected already gone)

## 3. Comment/config remnants

- [ ] 3.1 `lib/dynamic_config/dcdo.rb` (~:56): resolve the
      "aif-launch ... pegasus cleanup" note — check whether the
      `aif-launch` DCDO key has live readers
      (`grep -rn "aif-launch\|aif_launch" --include=*.rb --include=*.tsx --include=*.js lib/ dashboard/ apps/`);
      delete the dead handling if none, else rewrite the comment
      without the pegasus framing
- [ ] 3.2 Sweep any Gemfile comments still saying "pegasus" (expect
      none after `pegasus-dead-code-sweep`)

## 4. Documentation

- [ ] 4.1 `TESTING.md`: delete the "Pegasus Tests" section, the
      pegasus_test seeding step in the dashboard first-time setup,
      the pegasus column in the when-tests-run table, and
      `test:pegasus` mentions
- [ ] 4.2 `README.md` (~:41,56), `CONTRIBUTING.md` (~:27-28),
      `SETUP.md` (~:234): remove pegasus run/setup passages
- [ ] 4.3 `AGENTS.md`: remove the "IGNORE the pegasus/ directory"
      bullet (measure+mention token delta per that file's own rule)
- [ ] 4.4 `docs/importing-data.md`, `docs/pdf-lesson-plan-generation.md`
      (~:44-68), `docs/where-are-the-logs.md` (~:7-11),
      `docs/log-formats.md` (~:231,372): rewrite or delete pegasus
      passages; keep still-true content expressed against dashboard
- [ ] 4.5 `shared/css/README.md` (~:25,29): describe the Rails
      shared-assets serving (post `pegasus-shared-resources-port`)
- [ ] 4.6 `config/i18n/locales.yml` (~:12) comment,
      `dashboard/app/models/census/README.md` (~:11) permalink:
      clean or update

## 5. Final gate

- [ ] 5.1 Record the fossil allowlist in this file:
      DCDO `pegasus_image_max_age`, `pegasus_image_proxy_max_age`,
      `pegasus_static_max_age`, `pegasus_static_proxy_max_age` (+
      their DCDO.get callsites), Gatekeeper `pegasus_read_replica`
      (+ comment in lib/cdo/sequel.rb), AWS-side strings in
      `lib/cdo/aws/cloudfront.rb` (if `pegasus-marketing-rename`
      retained them), `openspec/`, `specs/pegasus-removal/`
- [ ] 5.2 Run
      `grep -ril "pegasus" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=openspec --exclude-dir=specs`
      — every hit is allowlisted; fix any stray in this PR and note
      which prior change missed it
- [ ] 5.3 `bin/rails runner 'true'` from dashboard/; full drone run
      green
- [ ] 5.4 `./tools/hooks/pre-commit` passes
