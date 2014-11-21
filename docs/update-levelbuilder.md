# Complete, external-facing Level Builder instructions live in this  [gdoc](https://docs.google.com/a/code.org/document/d/1HcYloRHibxk0Axnuw3A3w_Ht3AEmBHO0IUCaYFfs838/edit#heading=h.ihuilew1afmk).
This .md file should only contain information which is specific to Code.org engineers.


# How to update level builder
* `ssh levelbuilder.code.org`
* `cd levelbuilder`
* `git branch -d levelbuilder`
* `git checkout -b levelbuilder`
* `git add .`
* `git commit -m "level builder changes"`
* `git push origin levelbuilder`
* handle the merge via GitHub UI ([create PR shortcut](https://github.com/code-dot-org/code-dot-org/compare/levelbuilder?expand=1))
* (if necessary, alert anyone actively working on a level to save their work)
* `git checkout staging`
* `git pull`
* `rake build:dashboard`

These steps will:
* commit level builder changes
* push latest staging changes to levelbuilder.

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
