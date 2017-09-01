# Contributing to Internet Simulator

There is plenty of work to do on the Internet Simulator. If you are internal to
Code.org you can pick up a task from the [Internet Simulator Pivotal project](https://www.pivotaltracker.com/n/projects/1407902). If not, please see
the [Contributing](../../README.md#contributing)
section of our main README to get started.

## Developer set-up

Internet Simulator depends on [our standard build
set-up](../../README.md#build-setup). It has two additional dependencies that
are not (yet) required for other development: Redis (required) and
Pusher (optional).

### Local development with Redis

Internet Simulator uses Redis as an ephemeral data store for the simulation
state, and will not function without it.

Installing Redis is easy when you use a package manager!

* OSX + Homebrew: `brew install redis`
* Ubuntu: `apt-get install redis-server`

Either method will download, install, and autostart your Redis server. If it
doesn't autostart, you can also run it with the `redis-server` command.

By default, Internet Simulator will look for Redis at its default configuration
(`redis://localhost:6379`) so you should be good to go. If you want to
point to a Redis instance somewhere else, you can override the default by
setting the `netsim_redis_groups` parameter in your locals.yml file:

```yaml
netsim_redis_groups:
  - master: 'redis://localhost:6379'
    read_replicas:
      - 'redis://localhost:6380'
      - 'redis://localhost:6381'
  - master: 'redis://localhost:6382'
    read_replicas:
      - 'redis://localhost:6383'
      - 'redis://localhost:6384'
```

### Local development with Pusher (optional)

Internet Simulator uses Pusher to notify clients immediately when their
simulation is out-of-date, but it will automatically work via polling if
Pusher is not present.

If you want to use Pusher for local development, [sign up for a free account at
Pusher.com](https://pusher.com/signup). You will get a free sandbox plan and
a default app called "Main" that you can use for your development environment.

Look at the right side of your app's dashboard page to find your `app_id`,
`key` and `secret`. Then add the keys to your locals.yml file and set
`use_pusher` to TRUE.

```yaml
use_pusher: true
pusher_app_id: '{your six-digit app_id}'
pusher_application_key: '{your key}'
pusher_application_secret: '{your secret}'
```
