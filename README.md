# Build setup

#### Windows note: use an Ubuntu VM

Many Windows developers have found that setting up an Ubuntu virtual machine is less painful than getting Ruby and other prerequisites running on Windows.

* Option A: Use VirtualBox and an [Ubuntu 14.04 iso image](http://releases.ubuntu.com/14.04.1/ubuntu-14.04.1-desktop-amd64.iso)
* Option B: Use vagrant ([install](https://docs.vagrantup.com/v2/installation/)):
  1. `vagrant init ubuntu/trusty64`
  1. Configure to use 2048mb rather than 512mb RAM ([instructions](https://docs.vagrantup.com/v2/virtualbox/configuration.html))
  1. `vagrant up`
  1. `vagrant ssh`
* Option C: Use AWS EC2: [launch Ubuntu 14.04 AMI](https://console.aws.amazon.com/ec2/home?region=ap-northeast-1#launchAmi=ami-d9fdddd8)

## Install OS-specific prerequisites

### OS X Mavericks

1. Install Homebrew: `ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"`
1. `brew install mysql imagemagick`
1. Set up MySQL
  1. Have launchd start mysql at login: `ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents`
  1. Start mysql now: `launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist`
1. Using rbenv is recommended for Mavericks ([install](https://github.com/sstephenson/rbenv#homebrew-on-mac-os-x))

### Ubuntu 14.04

1. `sudo apt-get install -y aptitude`
1. `sudo aptitude update`
1. `sudo aptitude upgrade`
1. `sudo aptitude install -y git mysql-server mysql-client libmysqlclient-dev libxslt1-dev libssl-dev zlib1g-dev imagemagick libmagickcore-dev libmagickwand-dev nodejs openjdk-7-jre-headless libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev curl`
  * **Hit enter and select default options for any configuration popups**
1. `sudo aptitude install npm`
1. `sudo ln -s /usr/bin/nodejs /usr/bin/node`
1. `sudo npm update -g npm`
1. `sudo npm install -g grunt-cli`

## Common setup

1. Confirm your ruby version is 2.0.x with `ruby -v`
 * If not, install Ruby 2.0 (we use `2.0.0-p451`)

   E.g., using `rvm`:
    * `\curl -sSL https://get.rvm.io | bash -s stable`
    * `source ~/.rvm/scripts/rvm`
    * `rvm install 2.0.0-p451`
1. `git clone https://github.com/code-dot-org/website-ci.git`
1. `gem install bundler`
1. `cd website-ci/aws`
1. `bundle install`
1. `cd ../dashboard`
1. `bundle install`
1. `bundle exec rake db:create db:schema:load seed:all`
1. `cd ../pegasus`
1. `bundle install`
1. `echo CREATE DATABASE pegasus_development | mysql -uroot`
1. `rake db:migrate`
1. `rake seed:migrate`

# Running Dashboard (aka [learn.code.org](http://learn.code.org))

1. `cd website-ci/dashboard`
1. `bundle exec rails server`
 * Note: after major code updates (or if something seems broken), run `bundle exec rake db:migrate seed:all`

# Running Pegasus (aka [code.org](http://code.org), [csedweek.org](http://csedweek.org), etc...)

1. `cd website-ci/pegasus`
1. `./up`
  * Note: after major code updates (or if something seems broken), run `rake db:migrate seed:migrate`

# (optional) Building blockly and blockly-core (i.e., [puzzles](http://learn.code.org/hoc/1))

The learn.code.org default dashboard install includes a static build of blockly, but if you want to make modifications to blockly or blockly-core:

1. `cd website-ci/dashboard`
1. `bundle exec rake 'blockly:dev[../blockly]'`
  * This symlinks to dashboard reference the dev version of blockly
1. Follow the blockly build instructions at `blockly/README` or blockly-core build instructions at `blockly-core/README`

## Contributing

We'd love to have you join our group of contributors!

### Before You Push

Anyone who would like to contribute to **[code.org](https://github.com/code-dot-org/)** projects **must read and sign the Contribution License Agreement**. We aren't able to accept any pull requests from contributors who haven't signed the CLA first.

For the time being—email [brian@code.org](mailto:brian@code.org) to get an electronic CLA to sign (takes less than a minute).

### Getting Started Contributing

#### HipChat room

[Join our community development HipChat room](http://www.hipchat.com/gBebkHP6g) for help getting set up, picking a task, etc. We're happy to have you!

If you want to make sure you get our attention, include an **@all** (everyone) or **@here** (everyone currently in the room) in your message.

#### Pivotal Tracker

We pull our tasks from a Pivotal Tracker and mark certain tickets as volunteer-friendly.

For the time being—for access to Pivotal Tracker, email [brian@code.org](mailto:brian@code.org).

## Submitting Contributions

### Testing your changes

#### Manually

We support recent versions of Firefox, Chrome, IE9, iOS Safari and the Android browsers. Be sure to try your feature out in IE9, iOS and Android if it's a risk. [BrowserStack live](http://www.browserstack.com) or [Sauce Labs manual](https://saucelabs.com/manual) let you run manual tests in these browsers remotely.

#### Unit tests

For dashboard changes, be sure to test your changes using `rake test`. For [blockly](https://github.com/code-dot-org/blockly) changes, see our [grunt testing instructions](https://github.com/code-dot-org/blockly#running-tests).

#### UI tests

Our continuous integration server regularly runs a suite of [UI tests](https://github.com/code-dot-org/dashboard/tree/finished/test/ui) using Selenium / Cucumber which run against many browsers via [BrowserStack Automate](https://www.browserstack.com/automate), and can also be run locally using `chromedriver`. See the [README](https://github.com/code-dot-org/dashboard/tree/finished/test/ui) in that folder for instructions.

If your changes might affect level paths, blockly UI, or critical path site logic, be sure to test your changes with a local UI test.

### Submitting your Pull Request

Contributors should follow the GitHub [fork-and-pull model](https://help.github.com/articles/using-pull-requests) to submit pull requests into this repository.

1. On your fork, you'll either push to your own finished branch or checkout a new branch for your feature before you start your feature
    - `git checkout -b branch_name`
2. Develop the new feature and push the changes to **your** fork and branch
    - `git add YYY`
    - `git commit -m "ZZZ"`
    - `git push origin branch_name`
3. Go to the website-ci GitHub page
    - [https://github.com/code-dot-org/website-ci](https://github.com/code-dot-org/website-ci)
4. Click on the "Pull Request" link, look over your diff, and submit it to others to review.
    - For bonus points, include screenshots in the description. Command + Ctrl + Shift + 4 in OS X lets you copy a screen selection to your clipboard, which GitHub will let you paste right into the description
