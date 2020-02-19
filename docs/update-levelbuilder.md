# Complete, external-facing Level Builder instructions live in this [wiki](https://github.com/code-dot-org/code-dot-org/wiki/For-Levelbuilders).
This .md file should only contain information which is specific to Code.org engineers.

# How to update level builder

## To update levelbuilder to match test:

1. On GitHub, open a pull request from `test` into `levelbuilder`, link: [levelbuilder...test](https://github.com/code-dot-org/code-dot-org/compare/levelbuilder...test?expand=1)
1. Click the "Merge pull request" button and watch the "levelbuilder" room in Slack to make sure the build succeeds. If anything breaks, see the "Did it break section" below.

## To commit changes from levelbuilder into staging:

1. `ssh -t gateway.code.org ssh -t levelbuilder-staging levelbuilder/bin/content-push`
1. On GitHub, open a pull request from `levelbuilder` into `staging`. link: [staging...levelbuilder](https://github.com/code-dot-org/code-dot-org/compare/staging...levelbuilder)
2. Click the "Merge pull request" button and watch the "infra-staging" room in Slack to make sure the build succeeds. If anything breaks, see the "Did it break section" below. 

# Did it break?

## Open issues and workarounds:

- Updating English-language strings from .script file doesn't automatically update localized strings ([#82514628](https://www.pivotaltracker.com/story/show/82514628)). Workarounds:
 1. After updating the description in the .script file, delete the entry for the script in scripts.en.yml, then run rake seed:scripts (or rake seed:all.
 1. Modify the entry in scripts.en.yml directly to update description text (you don't even need to modify the text in the .script file).
- Renaming a level in LB keeps the old .level file around ([#78597388](https://www.pivotaltracker.com/story/show/78597388)). Workaround: Manually delete the old level after rename.

## Record not found

Did you get an error message like:

````
ActiveRecord::RecordNotFound: ActiveRecord::RecordNotFound, Level: {"name":"Course 4 Maze 1","stage":"Maze and Bee","concept_ids":null}, Script: course4
````

If so, one of two things might have happened:

### .seeded file is out of sync

Levelbuilder and staging only reseed scripts when script files have
changed since the last time rake:seed was run. It keeps track of this
using the .seeded file, but if a git pull was happening at the same
time as a rake:seed the date could be wrong.

To fix:

````
> cd dashboard
> rm config/scripts/.seeded
> rake seed:all
````

### you just pulled .level and .script files that were created by a different levelbuilder

Levelbuilders by default do not read levels from files into the
database. If you just pulled files from git that were created by a
different levelbuilder environment, you need to force it to read in
those new levels or they will be missing:

To fix:

````
> cd dashboard
> rake seed:all FORCE_CUSTOM_LEVELS=1
````

If you also need to rebuild levelbuilder:
````
> cd ..
> touch build-started
````

(you may have to remove the .seeded file as above also).

## Merge conflict with `dashboard/config/locales/dsls.en.yml`

This file is owned by levelbuilder, but can be (incorrectly) modified by
the staging build process. If you experience a merge conflict, resolve it
in favor of levelbuilder.

## Master failed to start, check stderr log for details?

Getting an error like:

```
RAILS_ENV=levelbuilder RACK_ENV=levelbuilder bundle exec rake assets:precompile
sudo service levelbuilder start
master failed to start, check stderr log for details
rake aborted!
'sudo service levelbuilder start' returned 1
/home/ubuntu/levelbuilder/lib/cdo/rake_utils.rb:33:in `system'
```

View the contents of `levelbuilder/dashboard/log/unicorn_stderr.log`.

### Already running?

Does `unicorn_stderr.log` then say have something like `/var/lib/gems/2.0.0/gems/unicorn-4.8.2/lib/unicorn/http_server.rb:206:in 'pid=': Already running on PID:9070 (or pid=/home/ubuntu/levelbuilder/dashboard/config/unicorn.rb.pid is stale) (ArgumentError)`?

Try restarting unicorn:

1. `kill -9 9070` (or whichever `PID` showed up above)
1. `rake build:dashboard`
