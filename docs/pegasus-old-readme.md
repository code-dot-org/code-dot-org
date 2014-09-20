# Pegasus

Pegasus is the name we've given to a *migration in progress*. This migration is from a world of disparate silos held together with a rewriting layer and creative use of caching to a glorious single application. We're probably never going to get to the end goal, but it's the target we keep in mind.

## Development Machine Setup

OS X is the OS most developers are working on and the one likely to have the best instructions for development work. In production we deploy on Ubuntu 13.10 so that's a good bet if you're using Linux.

### OS X Mavericks

If you haven't already, just upgrade to Mavericks. It has the entire Ruby 2.0 stack right out of the box. You may be prompted to install the command-line build tools, do it.

1. Install MySQL (using Homebrew)
    a. Install Homebrew: `ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"`
    a. Install MySQL: `brew install homebrew/versions/mysql55`
    a. Start MySQL at startup: `ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents`
    a. Start MySQL now: `launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist`
1. Install bundle and rake: `sudo gem install bundle rake`
1. Clone the repository: `git clone --recursive git@github.com:code-dot-org/pegasus.git`

### Ubuntu 13.10

NOTE: This is based on the Ubuntu 13.10 **server** install. A desktop install may require additional or other steps.

1. Install Ubuntu 13.10
1. Update package info: `sudo aptitude update`
1. Install dependencies: `sudo aptitude install git ruby2.0 ruby2.0-dev rake build-essential mysql-server mysql-client libssl-dev zlib1g-dev libmysqlclient-dev imagemagick libmagickcore-dev libmagickwand-dev`
1. Start MySQL now: `sudo start mysql`
1. Install bundle and rake: `sudo gem install bundle rake`
1. Clone the repository: `git clone --recursive git@github.com:code-dot-org/pegasus.git`


### Setup Pegasus

1. `cd pegasus`
1. `bundle --without production staging test`
1. `cd config`
1. `rake`
1. `mysql -u root -e "CREATE DATABASE IF NOT EXISTS pegasus_development"`
1. `cd ..`
1. `rake db:reset`
1. `rake seed:reset`
1. `./up`
1. Visit a Pegasus site:
	a. [http://localhost.code.org:9393/](http://localhost.code.org:9393/)
	a. [http://localhost.uk.code.org:9393/](http://localhost.uk.code.org:9393/)
	a. [http://localhost.csedweek.org:9393/](http://localhost.csedweek.org:9393/)

**OS X** If you have a problem building the bundle, try prepending the command like so: `sudo ARCHFLAGS=-Wno-error=unused-command-line-argument-hard-error-in-future bundle --without production staging test`. The latest OS X compiler considers unfamiliar command-line arguments as errors otherwise.

### Setup Dashboard

1. `cd pegasus/sites/learn.code.org`
1. `bundle --without production staging test`
1. `bundle exec rake db:create`
1. `bundle exec rake db:migrate`
1. `bundle exec rake seed:all`
1. `bundle exec rails s`
1. Visit the Dashboard:
	a. [http://localhost.learn.code.org:3000/](http://localhost.learn.code.org:3000/)

**OS X** If you have a problem building the bundle, try prepending the command like so: `sudo ARCHFLAGS=-Wno-error=unused-command-line-argument-hard-error-in-future bundle --without production staging test`. The latest OS X compiler considers unfamiliar command-line arguments as errors otherwise.

## Deploying to Staging

### To update Pegasus

1. `cd pegasus`
2. Commit your changes to the `finished` branch.
3. `git push [origin finished]`

### To update Dashboard:

1. `cd pegasus/sites/learn.code.org`
2. Commit your changes to the `master` branch
3. `git push [origin master]`
4. `cd ..`
5. `git add learn.code.org`
6. Commit this change to the `finished` branch.
7. `git push [origin finished]`

The staging.code.org server will upgrade itself automatically and send a notification mail when complete. The upgrade generally begins within 1 minute of push.

The following sites are available:

- [http://staging.code.org/](http://staging.code.org/)
- [http://staging.uk.code.org/](http://staging.uk.code.org/)
- [http://staging.csedweek.org/](http://staging.csedweek.org/)
- [http://staging.learn.code.org/](http://staging.learn.code.org/)

## Deploying to Test

1. Create a [pull request](https://help.github.com/articles/creating-a-pull-request) from the **staging** branch.
2. Yourself, or another developer (ideally) [merge the pull request](https://help.github.com/articles/merging-a-pull-request) into the **master** branch.

The test.code.org server will upgrade itself automatically and send a notification mail when complete. The upgrade generally begins within 1 minute of push.

The following sites are available:

- [http://test.code.org/](http://test.code.org/)
- [http://test.uk.code.org/](http://test.uk.code.org/)
- [http://test.csedweek.org/](http://test.csedweek.org/)
- [http://test.learn.code.org/](http://test.learn.code.org/)

Why a pull request instead of just merging locally and pushing? Two compelling reasons:

1. Once comprehensive automated tests run on on the test server we intend to automatically deploy the build to production (immediately or on some regular schedule, TBD) so we want shared awareness that this is happening.
1. The pull request system creates a commit (and commit message) specifically for the deployment. Without careful attention a merge will generally just do a fast-forward leaving deploy points ambiguous in the git history.

## Deploying to Production

Only the **master** branch is ever deployed to production and that currently happens manually by a developer from their local machine:

1. `cd pegasus`
2. `bin/deploy production`

You will see (and are expected to monitor) the deploy log as it spews out on your local machine. No email will be sent.

The following sites are available:

- [http://code.org/](http://code.org/)
- [http://uk.code.org/](http://uk.code.org/)
- [http://csedweek.org/](http://csedweek.org/)
- [http://learn.code.org/](http://learn.code.org/)




