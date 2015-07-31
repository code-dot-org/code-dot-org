# Build setup
This document describes how to set up your workstation to develop for Code.org.

## Install OS-specific prerequisites
You can do Code.org development using OSX, Ubuntu, or Windows (running Ubuntu in a VM). Setup for Windows is more complicated and relatively few developers use it. Start with the instructions for your platform in the subsections below, followed by the Common Setup section.   

### OS X Mavericks / Yosemite

1. Install Homebrew: `ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
1. Run `sudo chown -R $(whoami):admin /usr/local/`. (Brew assumes it can write to subdirectories of /usr/local/, which not all installs of OSXallow. Running brew as root is discouraged.)
1. `brew install https://raw.github.com/quantiverge/homebrew-binary/pdftk/pdftk.rb enscript gs mysql imagemagick rbenv ruby-build coreutils`
  1. If it complains about an old version of `<package>`, run `brew unlink <package>` and run `brew install <package>` again
1. Set up MySQL
  1. Have launchd start mysql at login: `ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents`
  1. Start mysql now: `launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist`
1. Set up [RBENV](https://github.com/sstephenson/rbenv#homebrew-on-mac-os-x), ruby-build, and Ruby 2.0
  1. Add `if which rbenv > /dev/null; then eval "$(rbenv init -)"; fi` to `~/.profile`
  1. source `~/.profile`
  1. `git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build`
  1. `rbenv install 2.0.0-p451`
  1. `rbenv global 2.0.0-p451`
  1. `rbenv rehash`

### Ubuntu 14.04

1. `sudo apt-get install aptitude`
1. `sudo aptitude update`
1. `sudo aptitude upgrade`
1. `sudo aptitude install -y git mysql-server mysql-client libmysqlclient-dev libxslt1-dev libssl-dev zlib1g-dev imagemagick libmagickcore-dev libmagickwand-dev openjdk-7-jre-headless libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev curl pdftk ruby2.0 ruby2.0-dev`
  * **Hit enter and select default options for any configuration popups**
1. Upgrade npm to 2.0. If `npm -v` says less than 2.0,
  * `sudo add-apt-repository ppa:chris-lea/node.js  `
  * `sudo apt-get update`
  * `sudo apt-get install nodejs`
1. Either setup RBENV or configure your default ruby and gem version to 2.0
  1. Option A - RBENV: ([instructions](https://github.com/sstephenson/rbenv#installation))
    1. Install RBENV and ruby-build
    1. `rbenv install 2.0.0-p451`
    1. `rbenv global 2.0.0-p451`
    1. `rbenv rehash`
  1. Option B - Symlinks:
    1. Ruby: `sudo ln -sf /usr/bin/ruby2.0 /usr/bin/ruby`
    1. Gem: `sudo ln -sf /usr/bin/gem2.0 /usr/bin/gem`
    1. <code>sudo chown $(whoami) /usr/bin/gem/</code>`
1. Install Node.js 0.12.4 and npm 2.10.1
  1. Option A - nodesource repository
    1. `curl -sL https://deb.nodesource.com/setup | sudo bash -`
    1. `sudo aptitude install -y nodejs`
  1. Option B - Manual install
    1. [Nodejs.org](https://nodejs.org/download/)

#### Windows note: use an Ubuntu VM

Many Windows developers have found that setting up an Ubuntu virtual machine is less painful than getting Ruby and other prerequisites running on Windows.

* Option A: Use [VMWare Player](https://my.vmware.com/web/vmware/free#desktop_end_user_computing/vmware_player/4_0) and an [Ubuntu 14.04 iso image](http://releases.ubuntu.com/14.04.2/ubuntu-14.04.2-desktop-amd64.iso)
* Option B: Use vagrant ([install](https://docs.vagrantup.com/v2/installation/)):
  1. First clone the code.org git repo to get the provided Vagrantfile (you will be able to skip step 1 of the common setup instructions): `git clone https://github.com/code-dot-org/code-dot-org.git`
  1. `cd code-dot-org`
  1. `vagrant up`
  1. `vagrant ssh`
  1. Goto step 2 of the common setup instructions
* Option C: Use AWS EC2: [launch Ubuntu 14.04 AMI](https://console.aws.amazon.com/ec2/home?region=ap-northeast-1#launchAmi=ami-d9fdddd8)

## Common setup

1. `git clone https://github.com/code-dot-org/code-dot-org.git`
1. `sudo gem install bundler -v 1.10.4`
1. `rbenv rehash` (if using rbenv)
1. `cd code-dot-org/aws`
1. `bundle install`
1. `cd ..`
1. `rake install`
1. `sudo chown -R $(whoami) $HOME/.npm`


## Organizational Structure

Our code is segmented into four parts:

* Blockly Core is the visual programming language platform used for the interactive tutorials.
* Blockly includes apps—blockly puzzles built based on Blockly Core.
  * [Hour of Code](http://studio.code.org/hoc/1)
* Dashboard, is the tutorial platform which organizes blockly levels into tutorials.
  * [Code Studio](http://studio.code.org)
* Pegasus is the main site which also includes the teacher dashboard (support for teachers to track student progress).
  * [code.org](http://code.org)
  * [csedweek.org](http://csedweek.org)
  * [Teacher Dashboard](http://code.org/teacher-dashboard)

## Running Dashboard

1. `cd code-dot-org`
2. `rake build:dashboard` (Generally, do this after each pull)
3. `bin/dashboard-server`
4. Visit [http://localhost.studio.code.org:3000/](http://localhost.studio.code.org:3000/)

## Running Pegasus

1. `cd code-dot-org`
2. `rake build:pegasus` (Generally, do this after each pull)
3. `bin/pegasus-server`
4. Visit [http://localhost.code.org:3000/](http://localhost.code.org:3000/)

## Building Apps and Blockly-core (optional)

The studio.code.org default dashboard install includes a static build of blockly, but if you want to make modifications to blockly or blockly-core you'll want to enable building them in the build:

### Enabling Apps Builds

You'll need to do this once:

1. OS X:
  1. Install the [Java 8 JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
1. `cd code-dot-org`
1. Edit `locals.yml`
  1. Add `build_apps: true`
  1. Add `build_blockly_core: true`
  1. Add `use_my_apps: true`
1. `rake install`

This configures your system to build apps (and blockly-core) whenever you run `rake build` and to use the version of blockly that you build yourself.

### Building Apps and Blockly-Core

1. `cd code-dot-org`
1. `rake build`

This will build everything you have set to build in `locals.yml`.

You can use `rake build:apps` and `rake build:blockly_core` to build a specific project.

You can also set `build_dashboard: false` and/or `build_pegasus: false` in `locals.yml` if you don't need to build these frequently. They default to `true`.

Alternatively, you can run: `rake build:core_and_apps_dev`, which will build blockly core and the apps bundle without running tests and without localization.

## Contributing

We'd love to have you join our group of contributors! Please e-mail your areas of interest and your availability to Alice (alice@code.org), and we’ll be happy to match you with a project. You can start setting up with these next steps.

1. Anyone who would like to contribute to **[code.org](https://github.com/code-dot-org/)** projects **must read and sign the [Contributor License Agreement](https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=8eb90665-c9f7-4b06-81a5-11d12020f251)**. We can't accept pull requests from contributors who haven't yet signed the CLA.

2. [Join our community development HipChat room](http://www.hipchat.com/gBebkHP6g) for help getting set up, picking a task, etc. We're happy to have you! If you want to make sure you get our attention, include an **@all** (everyone) or **@here** (everyone currently in the room) in your message.

3. Get your build setup, following this README. Fork our repo and make sure to merge our staging branch in **WEEKLY** as we do update frequently.

## Submitting Contributions
Please check your PR against our tests before submitting.

#### Code style

Running `rake lint` locally will find any Ruby warnings. For other languages see the [style guide](STYLEGUIDE.md).

#### Manually

We support recent versions of Firefox, Chrome, IE9, iOS Safari and the Android browsers ([full list of supported browsers and versions](https://support.code.org/hc/en-us/articles/202591743)). Be sure to try your feature out in IE9, iOS and Android if it's a risk. [BrowserStack live](http://www.browserstack.com) or [Sauce Labs manual](https://saucelabs.com/manual) let you run manual tests in these browsers remotely.

#### Unit tests

For dashboard changes, be sure to test your changes using `rake test`. For [apps or blockly](./apps) changes, see our [grunt testing instructions](./apps#running-tests).

#### UI tests

Our continuous integration server regularly runs a suite of [UI tests](./dashboard/test/ui) using Selenium / Cucumber which run against many browsers via [BrowserStack Automate](https://www.browserstack.com/automate), and can also be run locally using `chromedriver`. See the [README](./dashboard/test/ui) in that folder for instructions.

If your changes might affect level paths, blockly UI, or critical path site logic, be sure to test your changes with a local UI test.

### Submitting your Pull Request

Contributors should follow the GitHub [fork-and-pull model](https://help.github.com/articles/using-pull-requests) to submit pull requests into this repository.

1. On your fork, you'll either push to your own finished branch or checkout a new branch for your feature before you start your feature
    - `git checkout -b branch_name`
2. Develop the new feature and push the changes to **your** fork and branch
    - `git add YYY`
    - `git commit -m "ZZZ"`
    - `git push origin branch_name`
3. Go to the code-dot-org GitHub page
    - [https://github.com/code-dot-org/code-dot-org](https://github.com/code-dot-org/code-dot-org)
4. For your submission to be reviewed
    - Click on the "Pull Request" link, look over and confirm your diff
    - Submit a pull request for your branch to be merged into staging
    - For bonus points, include screenshots in the description. Command + Ctrl + Shift + 4 in OS X lets you copy a screen selection to your clipboard, which GitHub will let you paste right into the description
5. After your pull request is merged into staging, you can review your changes on the following sites:
  * [https://staging.code.org/](https://staging.code.org/)
  * [https://staging-studio.code.org/](https://staging-studio.studio.code.org/)
  * [https://staging.csedweek.org/](https://staging.csedweek.org/)
