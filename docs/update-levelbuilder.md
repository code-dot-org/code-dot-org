# Complete, external-facing Level Builder instructions live in this  [gdoc](https://docs.google.com/a/code.org/document/d/1HcYloRHibxk0Axnuw3A3w_Ht3AEmBHO0IUCaYFfs838/edit#heading=h.ihuilew1afmk).
This .md file should only contain information which is specific to Code.org engineers.

# How to update level builder

## To update levelbuilder to match staging:

1. On GitHub, open a pull request from `staging` into `levelbuilder`
  1. Or in your local repository:
    - `git checkout levelbuilder`
    - `git pull origin levelbuilder` To make sure you're up-to-date.
    - `git pull origin staging` To fetch and merge `staging` directly into `levelbuilder`.
    - You'll likely get "both modified" merge conflicts in `dashboard/public/blockly-package/*`, `blockly-core/blockly_compressed.js` and `blockly-core/blockly_uncompressed.js`. We don't need staging's copies of these build products - they're out of date and about to be rebuilt anyway, so do:
      1. `git checkout --ours blockly-core/blockly_compressed.js blockly-core/blockly_uncompressed.js`
      1. `git add blockly-core/blockly_compressed.js blockly-core/blockly_uncompressed.js`
      1. `git checkout --ours dashboard/public/blockly-package`
      1. `git add dashboard/public/blockly-package`
      1. Fix remaining merge conficts, if any.
      1. `git commit`
    - `git push`
1. Wait for levelbuilder to deploy.

## To commit changes from levelbuilder into staging:

1. Integrate `staging` into `levebuilder` as described above; wait for levelbuilder finish deploying.
1. `ssh levelbuilder.studio.code.org`
1. `cd levelbuilder`
1. `git branch` **If it doesn't say `levelbuilder` get the dev-of-the-week and/or Geoffrey.**
1. `git add --all dashboard`
1. `git commit -m "levelbuilder changes committed by YOUR NAME HERE"`
1. `git push`
1. On GitHub, open a pull request from `levelbuilder` into `staging`.

# Did it break?

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

(you may have to remove the .seeded file as above also).

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
