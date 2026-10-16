# Complete, external-facing Level Builder instructions live in this [wiki](https://github.com/code-dot-org/code-dot-org/wiki/For-Levelbuilders).
This .md file should only contain information which is specific to Code.org engineers.

# How to update level builder

## To update levelbuilder to match test:

1. On GitHub, open a pull request from `test` into `levelbuilder`, link: [levelbuilder...test](https://github.com/code-dot-org/code-dot-org/compare/levelbuilder...test?expand=1)
1. Click the "Merge pull request" button and watch the "levelbuilder" room in Slack to make sure the build succeeds. If anything breaks, see the "Did it break section" below.

## To commit changes from levelbuilder into staging:

1. `ssh -t gateway.code.org ssh -t levelbuilder levelbuilder/bin/content-push`
1. On GitHub, open a pull request from `levelbuilder` into `staging`. link: [staging...levelbuilder](https://github.com/code-dot-org/code-dot-org/compare/staging...levelbuilder)
2. Click the "Merge pull request" button and watch the "infra-staging" room in Slack to make sure the build succeeds. If anything breaks, see the "Did it break section" below. 

# Did it break?

## Open issues and workarounds:

- Updating English-language strings from .script file doesn't automatically update localized strings. Workarounds:
 1. After updating the description in the .script file, delete the entry for the script in scripts/en.yml, then run rake seed:scripts (or rake seed:all.
 1. Modify the entry in scripts/en.yml directly to update description text (you don't even need to modify the text in the .script file).
- Renaming a level in LB keeps the old .level file around. Workaround: Manually delete the old level after rename.

## Merge conflict with `dashboard/config/locales/dsls/en.yml`

This file is owned by levelbuilder, but can be (incorrectly) modified by
the staging build process. If you experience a merge conflict, resolve it
in favor of levelbuilder.

## Master failed to start, check stderr log for details?

Getting an error like:

```
RAILS_ENV=levelbuilder RACK_ENV=levelbuilder bundle exec rake assets:precompile
sudo systemctl start levelbuilder
master failed to start, check stderr log for details
rake aborted!
'sudo systemctl start levelbuilder' returned 1
/home/ubuntu/levelbuilder/lib/cdo/rake_utils.rb:33:in `system'
```

View the contents of `levelbuilder/dashboard/log/puma_stderr.log`.

### Already running?

Does `puma_stderr.log` then say have something like `Already running on PID:9070 (or pid=/home/ubuntu/levelbuilder/dashboard/config/puma.rb.pid is stale) (ArgumentError)`?

Try restarting puma:

1. `kill -9 9070` (or whichever `PID` showed up above)
1. `rake build:dashboard`
