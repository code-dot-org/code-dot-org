# Setup
This document describes how to set up your workstation to develop for Code.org.

You can do Code.org development using OSX, Ubuntu, or Windows (running Ubuntu in a VM). Setup for Windows is more complicated and relatively few developers use it. Make sure you follow the instructions for your platform in the subsections below.

## Overview

1. Install OS-specific prerequisites
   - See the appropriate section below: [OSX](#os-x-mavericks--yosemite--el-capitan--sierra), [Ubuntu](#ubuntu-1404), [Windows](#windows-note-use-an-ubuntu-vm)
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
1. `bundle install` (Problems with rmagick? See [tips](#tips) below.) (OS X: when running `bundle install`, you may need to also run `xcode-select --install`. See [stackoverflow](http://stackoverflow.com/a/39730475/3991031))
1. `rake install:hooks`
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
  1. `nvm install 6.9.0 && nvm alias default 6.9.0` this command should make this version the default version and print something like: `Creating default alias: default -> 6.9.0 (-> v6.9.0)`
  1. `curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 0.23.2`
  1. (You can reinstall with your updated version after you clone the repository if necessary) Reinstall node_modules `cd apps; yarn; cd ..`
1. (El Capitan) Ensure that openssl is linked: `brew link --force openssl`

### Ubuntu 17.04 ([Download iso][ubuntu-iso-url]) Note: Virtual Machine Users should check the Windows Note below before starting

1. `sudo apt-get update`
1. `sudo apt-get install -y git mysql-server mysql-client libmysqlclient-dev libxslt1-dev libssl-dev zlib1g-dev imagemagick libmagickcore-dev libmagickwand-dev openjdk-9-jre-headless libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev curl pdftk enscript libsqlite3-dev phantomjs build-essential redis-server`
    * **Hit enter and select default options for any configuration popups, leaving mysql passwords blank**
1. Install npm with `sudo apt install npm`, then
    * `sudo apt-get install nodejs`
1. Install Ruby 2.2.3 with rbenv
     1. Install rbenv with `sudo apt install rbenv` and ruby-build with `sudo apt install ruby-build`
     1. `rbenv install 2.2.3`
     1. `rbenv global 2.2.3`
     1. `rbenv rehash`
1. Install Node and yarn
    1. Node: `sudo apt install nodejs-legacy`
    1. yarn: `sudo npm install -g yarn@0.23.2`
1. Run `gem install bundler -v 1.14.6`. Don't worry about using version 1.10.6 from the overview
1. Run `sudo apt install ruby2.3-dev`
1. Finally, configure your mysql to allow for a proper installation
   1. If you properly left all the default options blank, type `sudo mysql` to start it up
   1. Type `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';`
   1. Then `FLUSH PRIVILEGES;`
   1. And finally `exit;` to close out
1. Read the following notes, then go back up to the overview and run the commands there. 
	1. In the overview sections, where it says to type `rake install`, make sure to instead type `bundle exec rake install`
   1. If, for any reason, you are forced to interrupt `bundle exec rake install` before it completes,
      cd into dashboard and run `bundle exec rake db:drop` before trying `bundle exec rake install` again
   1. `bundle exec rake install` must always be called from the local project's root directory, or it won't work.
   1. Finally, don't worry if your versions don't match the versions in the overview if you're following this method; the installation should still work properly regardless

### Windows note: use an Ubuntu VM

Many Windows developers have found that setting up an Ubuntu virtual machine is less painful than getting Ruby and other prerequisites running on Windows.

* Option A: Use [VMWare Player](https://my.vmware.com/en/web/vmware/free#desktop_end_user_computing/vmware_workstation_player/12_0) or [Virtual Box](http://download.virtualbox.org/virtualbox/5.1.24/VirtualBox-5.1.24-117012-Win.exe) and an [Ubuntu 17.04 iso image][ubuntu-iso-url]
  1. Maximum Disk Size should be set to 30.0 GB (the default is 20 GB and it is too small)
  2. Memory Settings for the VM should be 2 GB or higher (Right click the machine -> Settings -> "Memory for this virtual machine"  )
* Option B: Use vagrant ([install](https://docs.vagrantup.com/v2/installation/)):
  1. First clone the code.org git repo to get the provided Vagrantfile (you will be able to skip step 1 of the common setup instructions): `git clone https://github.com/code-dot-org/code-dot-org.git`
  1. `cd code-dot-org`
  1. `vagrant up`
  1. `vagrant ssh`
  1. Goto step 2 of the common setup instructions

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
- `brew install imagemagick@6`
- `brew unlink imagemagick`
- `brew link imagemagick@6 --force`

[ubuntu-iso-url]: http://releases.ubuntu.com/17.04/ubuntu-17.04-desktop-amd64.iso
