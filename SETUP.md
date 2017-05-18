# Setup
This document describes how to set up your workstation to develop for Code.org.

You can do Code.org development using OSX, Ubuntu, or Windows (running Ubuntu in a VM). Setup for Windows is more complicated and relatively few developers use it. Make sure you follow the instructions for your platform in the subsections below.

## Overview

1. Install OS-specific prerequisites
   - See the appropriate section below: [OSX](#os-x-mavericks--yosemite--el-capitan), [Ubuntu](#ubuntu-1404), [Windows](#windows-note-use-an-ubuntu-vm)
   - When done, check for correct versions of these dependencies:

     ```
     ruby --version  # --> ruby 2.2.3
     node --version  # --> v6.9.0
     npm --version   # --> 3.10.8
     yarn -V         # --> 0.23.2
     ```
1. `git clone https://github.com/code-dot-org/code-dot-org.git`
1. `gem install bundler -v 1.10.6`
1. `rbenv rehash`
1. `cd code-dot-org`
1. `bundle install` (Problems with rmagick? See [tips](#tips) below.)
1. `rake install`
1. (Optional) [Enable JavaScript builds](#enabling-javascript-builds)
1. `rake build`

## OS-specific prerequisites

### OS X Mavericks / Yosemite / El Capitan / Sierra

1. Install Homebrew: `ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
1. Install Redis: `brew install redis`
1. Run `brew install https://raw.github.com/quantiverge/homebrew-binary/pdftk/pdftk.rb enscript gs mysql nvm imagemagick rbenv ruby-build coreutils sqlite phantomjs`
  1. If it complains about `Formula.sha1` is disabled, removing https://raw.github.com/quantiverge/homebrew-binary/pdftk/pdftk.rb seems to not have serious side effects (it will cause `PDFMergerTest` to fail).
  1. If it complains about an old version of `<package>`, run `brew unlink <package>` and run `brew install <package>` again
1. Set up MySQL
  1. Have `launchd` start mysql at login: `ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents`
  1. Start mysql now: `launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist`
1. Set up rbenv
  1. Run `rbenv init`
  1. Add the following to `~/.bash_profile` or your desired shell: `eval "$(rbenv init -)"`. More info [here](https://github.com/rbenv/rbenv#homebrew-on-mac-os-x).
  1. Pick up those changes: `source ~/.bash_profile`
1. Install Ruby 2.2.3
  1. `rbenv install 2.2.3`
  1. Set the global version of Ruby: `rbenv global 2.2.3`
  1. Install shims for all Ruby executables: `rbenv rehash`. More info [here](https://github.com/rbenv/rbenv#rbenv-rehash).
1. Set up [nvm](https://github.com/creationix/nvm)
  1. Create nvm's working directory if it doesnt exist: `mkdir ~/.nvm`
  1. Add the following to `~/.bash_profile` or your desired shell configuration file:

     ```
     # Load nvm function into the shell
     export NVM_DIR=~/.nvm
     source $(brew --prefix nvm)/nvm.sh
     ```

  1. Pick up those changes: `source ~/.bash_profile`
1. Install Node, npm, and yarn
  1. `nvm install 6.9.0 && nvm alias default 6.9` this command should make this version the default version and print something like: `Creating default alias: default -> 6.9.0 (-> v6.9.0)`
  1. `curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 0.23.2`
  1. (You can reinstall with your updated version after you clone the repository if necessary) Reinstall node_modules `cd apps; yarn; cd ..`
1. (El Capitan) Ensure that openssl is linked: `brew link --force openssl`
1. when running `bundle install`, you may need to also run `xcode-select --install`. See [stackoverflow](http://stackoverflow.com/a/39730475/3991031).


### Ubuntu 14.04

1. `sudo apt-get update`
1. `sudo apt-get install -y git mysql-server mysql-client libmysqlclient-dev libxslt1-dev libssl-dev zlib1g-dev imagemagick libmagickcore-dev libmagickwand-dev openjdk-7-jre-headless libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev curl pdftk enscript libsqlite3-dev phantomjs build-essential redis-server`
  * **Hit enter and select default options for any configuration popups, leaving mysql passwords blank**
1. Upgrade npm to 3.10.8 If `npm -v` says less than 3.10.8 then
  * `sudo add-apt-repository ppa:chris-lea/node.js`
  * `sudo apt-get update`
  * `sudo apt-get install nodejs`
1. Either A. Install Ruby 2.2 from OS packages; B. Setup `rbenv`; or C. Setup `rvm`
    - A. OS packages (from the [Brightbox Ubuntu PPA](https://www.brightbox.com/docs/ruby/ubuntu/)):
        - `sudo apt-get install software-properties-common`
        - `sudo apt-add-repository ppa:brightbox/ruby-ng`
        - `sudo apt-get update`
        - `sudo apt-get install ruby2.2 ruby2.2-dev`
    - B. `rbenv`: ([instructions](https://github.com/sstephenson/rbenv#installation))
        1. Install `rbenv` and `ruby-build`
        1. `rbenv install 2.2.3`
        1. `rbenv global 2.2.3`
        1. `rbenv rehash`
    - C. `rvm`. A few folks have had more luck with rvm vs rbenv on linux.
        1. Install rvm from https://rvm.io/
        1. `rvm install 2.2.3`
        1. `rvm use 2.2.3 --default`
1. Install Node, npm, and yarn
  1. Option A - [nvm](https://github.com/creationix/nvm)
    1. `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash`
      - After completion, close your current terminal window and open a new one.
    1. `nvm install` (this will install the version defined in `.nvmrc`)
  1. Option B - nodesource repository
    1. `curl -sL https://deb.nodesource.com/setup_0.12 | sudo -E bash -`
    1. `sudo apt-get install -y nodejs`
  1. Option C - Manual install
    1. [Nodejs.org](https://nodejs.org/download/)
  1. Finally, install yarn: `npm install -g yarn@0.23.2`
1. When running `bundle install`, you may need to run

   `bundle config build.nokogiri --use-system-libraries=true --with-xml2-include=/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.12.sdk/usr/include/libxml2`

   first so that nokogiri picks up the built in libxml2 library. See this [stackoverflow answer](http://stackoverflow.com/a/40038954/186771).

### Windows note: use an Ubuntu VM

Many Windows developers have found that setting up an Ubuntu virtual machine is less painful than getting Ruby and other prerequisites running on Windows.

* Option A: Use [VMWare Player](https://my.vmware.com/en/web/vmware/free#desktop_end_user_computing/vmware_workstation_player/12_0) and an [Ubuntu 14.04 iso image](http://releases.ubuntu.com/14.04.2/ubuntu-14.04.2-desktop-amd64.iso)
  1. Maximum Disk Size should be set to 30.0 GB (the default is 20 GB and it is too small)
  2. Memory Settings for the VM should be 2 GB or higher (Right click the machine -> Settings -> "Memory for this virtual machine"  )
* Option B: Use vagrant ([install](https://docs.vagrantup.com/v2/installation/)):
  1. First clone the code.org git repo to get the provided Vagrantfile (you will be able to skip step 1 of the common setup instructions): `git clone https://github.com/code-dot-org/code-dot-org.git`
  1. `cd code-dot-org`
  1. `vagrant up`
  1. `vagrant ssh`
  1. Goto step 2 of the common setup instructions
* Option C: Use AWS EC2: [launch Ubuntu 14.04 AMI](https://console.aws.amazon.com/ec2/home?region=ap-northeast-1#launchAmi=ami-d9fdddd8)

## Enabling JavaScript builds
The default dashboard install uses a static build of JS, but if you want to make modifications to these you'll want to enable local builds of the JavaScript packages. You'll need to do this once:

1. (OS X) Install the [Java 8 JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
1. Edit locals.yml and enable the following options:

   ```
   # code-dot-org/locals.yml

   # These enable the local apps build
   build_apps: true
   use_my_apps: true
   ```

1. Run `rake package` for the changes to take effect.

This configures dashboard to rebuild apps whenever you run `rake build` and to use the version that you built yourself.  See the documentation in that directory for faster ways to build and iterate.

If waiting around for javascript builds is making you sad, consider sending build time logs to New Relic so we can track the slowness. You can do this by copying our license key from [the New Relic account page](https://rpm.newrelic.com/accounts/501463) and pasting it into `locals.yml`:

    new_relic_license_key: <license key here>

## More Information
Please also see our other documentation, including our:
* [Main README](./README.md)
* [Contributing Documentation](./CONTRIBUTING.md)
* [Testing Documentation](./TESTING.md)
* [Styleguide Documentation](./STYLEGUIDE.md)
* [License](./LICENSE)

Wondering where to start?  See our [contribution guidelines](CONTRIBUTING.md) for more information on helping us out.

---
### Tips
If rmagick doesn't install, check your version of imagemagick, and downgrade if >= 7
- `convert --version`
- `gem install imagemagick@6`
- `brew unlink imagemagick`
- `brew link imagemagick@6 --force`
