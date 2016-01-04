# Running Production Locally

Especially with asset additions and changes, it can be a good idea to test your local build in `adhoc` mode,
which performs like production within a local, self-contained environment. IE9 also cannot load more than a certain number of stylesheets and javascript files, so running your server in `adhoc` mode to concatenate and minify assets is one workaround.

Running Code Studio from a local `adhoc` server requires a few different steps.

## Steps

1. Create/edit the file `[code-dot-org]/locals.yml` to include these lines:
```yaml
env: adhoc
override_dashboard: localhost:3000
dashboard_port: 3000
override_pegasus: localhost:3001
pegasus_port: 3001
```

2. From `code-dot-org/dashboard`, run: `RAILS_ENV=adhoc bundle exec rake db:reset seed:all assets:precompile`.
3. Run: `code-dot-org/bin/dashboard-server`.
4. `localhost:3000` should show Code Studio (dashboard).
5. In another terminal window, run: `code-dot-org/bin/pegasus-server`.
6. `localhost:3001` should show Code.org (pegasus).