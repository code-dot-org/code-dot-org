# Setup
This document describes how to set up your workstation to develop for Code.org.

You can do Code.org development using OSX, Ubuntu, or Windows (running Ubuntu in a VM). Setup for Windows is more complicated and relatively few developers use it. Make sure you follow the instructions for your platform in the subsections below.

## Overview

1. Install OS-specific prerequisites
   - See the appropriate section below: [OSX](#os-x-mavericks--yosemite--el-capitan--sierra), [Ubuntu](#ubuntu-1604-download-iso-note-virtual-machine-users-should-check-the-windows-note-below-before-starting), [Windows](#windows-note-use-an-ubuntu-vm)
   - When done, check for correct versions of these dependencies:

     ```
     ruby --version  # --> ruby 2.5.0
     node --version  # --> v6.9.0
     npm --version   # --> 3.10.8
     yarn --version  # --> 1.6.0
     ```
1. If using HTTPS: `git clone https://github.com/code-dot-org/code-dot-org.git`, if using SSH: `git@github.com:code-dot-org/code-dot-org.git`
1. `gem install bundler`
1. `rbenv rehash`
1. `cd code-dot-org`
1. `bundle install` (Problems running this step? See [tips](#bundle-install-tips) below.) 
1. `rake install:hooks`
    <details>
        <summary>Troubleshoot: `rake aborted!..` </summary>
      
        If you have issue "rake aborted! Gem::LoadError: You have already activated rake 12.3.0, but your Gemfile requires rake 11.3.0. Prepending `bundle exec` to your command may solve this." 
            * Follow the instructions and add `bundle exec` in front of the command
    </details>

1. `rake install`
1. [Enable JavaScript builds](#enabling-javascript-builds)
    1. Note: You can skip this step if not editing javascript frequently.
1. Setup AWS - Ask a Code.org engineer how to complete this step
1. `rake build`

## OS-specific prerequisites

### OS X Mojave / Mavericks / Yosemite / El Capitan / Sierra

1. Install Homebrew: `ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
1. Install Redis: `brew install redis`
1. Run `brew install https://raw.github.com/quantiverge/homebrew-binary/pdftk/pdftk.rb enscript gs mysql@5.7 nvm imagemagick rbenv ruby-build coreutils sqlite`
    <details>
        <summary>Troubleshoot: `Formula.sha1` is disabled</summary>
      
        If it complains about `Formula.sha1` is disabled, removing https://raw.github.com/quantiverge/homebrew-binary/pdftk/pdftk.rb from the above command seems to not have serious side effects (it will cause `PDFMergerTest` to fail).
    </details>
    
    <details>
          <summary>Troubleshoot: old version of `&lt;package&gt;`</summary>
          
          If it complains about an old version of `&lt;package&gt;`, run `brew unlink &lt;package&gt;` and run `brew install &lt;package&gt;` again
    </details>

1. Install PhantomJS: `brew cask install phantomjs`
1. Set up MySQL
    1. Force link 5.7 version: `brew link mysql@5.7 --force`
    1. Have `launchd` start mysql at login: `ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents`
    1. Start mysql now: `launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist`
        1. Note: if this fails check your plist file (`ls ~/Library/LaunchAgents/`) to see if it is "homebrew.mxcl.mysql@5.7.plist". If it is try: `launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql@5.7.plist` instead
1. Set up rbenv
    1. Run `rbenv init`
    1. Add the following to `~/.bash_profile` or your desired shell: `eval "$(rbenv init -)"`. More info [here](https://github.com/rbenv/rbenv#homebrew-on-mac-os-x).
    1. Pick up those changes: `source ~/.bash_profile`
1. Install Ruby 2.5.0
    1. `rbenv install 2.5.0`
    1. Set the global version of Ruby: `rbenv global 2.5.0`
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
    1. `curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 1.6.0`
    1. (You can reinstall with your updated version after you clone the repository if necessary) Reinstall node_modules `cd apps; yarn; cd ..`
1. (El Capitan only) Ensure that openssl is linked: `brew link --force openssl`
1. Prevent future problems related to the `Too many open files` error:
    1. Add the following to `~/.bash_profile` or your desired shell configuration file:
        ```
        ulimit -n 8192
        ```
    1. close and reopen your current terminal window
    1. make sure that `ulimit -n` returns 8192
1. Install the Xcode Command Line Tools:
    1. `xcode-select --install`
    
    <details>
              <summary>Troubleshoot: command line tools already installed</summary>
              
              If it complains 
              
              ```xcode-select: error: command line tools are already installed, use "Software Update" to install updates```
              
              check to make sure XCode is downloaded and up to date manually.
              
    </details>
    
### Ubuntu 16.04 ([Download iso][ubuntu-iso-url]) Note: Virtual Machine Users should check the Windows Note below before starting

1. `sudo apt-get update`
1. `sudo apt-get install -y git mysql-server mysql-client libmysqlclient-dev libxslt1-dev libssl-dev zlib1g-dev imagemagick libmagickcore-dev libmagickwand-dev openjdk-9-jre-headless libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev curl pdftk enscript libsqlite3-dev phantomjs build-essential redis-server rbenv npm`
    * **Hit enter and select default options for any configuration popups, leaving mysql passwords blank**
1. Install Node and Nodejs
    1. Type `curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -`
    1. And then `sudo apt-get install -y nodejs`
1. Ensure rbenv and ruby-build are properly installed
    1. Use the rbenv-doctor from the [`rbenv` installation instructions](https://github.com/rbenv/rbenv#installation) to verify rbenv is set up correctly.
    1. Install [ruby-build as a rbenv plugin](https://github.com/rbenv/ruby-build#readme)
1. Install Ruby 2.5.0 with rbenv
    1. `rbenv install 2.5.0`
    1. `rbenv global 2.5.0`
    1. `rbenv rehash`
1. Install yarn
    1. First, type `curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`
    1. Then `echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`
    1. And lastly, `sudo apt-get update && sudo apt-get install yarn=1.6.0-1`
1. Finally, configure your mysql to allow for a proper installation. You may run into errors if you did not leave mysql passwords blank
   1. Type `echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" | sudo mysql`
1. Read the following notes, then go back up to the overview and run the commands there.
   1. If, for any reason, you are forced to interrupt the `rake install` command before it completes,
      cd into dashboard and run `bundle exec rake db:drop` before trying `rake install` again
   1. `rake install` must always be called from the local project's root directory, or it won't work.
   1. Finally, don't worry if your versions don't match the versions in the overview if you're following this method; the installation should still work properly regardless

### Windows note: use an Ubuntu VM

Many Windows developers have found that setting up an Ubuntu virtual machine is less painful than getting Ruby and other prerequisites running on Windows.

* Option A: Use [VMWare Player](https://my.vmware.com/en/web/vmware/free#desktop_end_user_computing/vmware_workstation_player/12_0) or [Virtual Box](http://download.virtualbox.org/virtualbox/5.1.24/VirtualBox-5.1.24-117012-Win.exe) and an [Ubuntu 16.04 iso image][ubuntu-iso-url]
  1. Maximum Disk Size should be set to 30.0 GB (the default is 20 GB and it is too small)
  2. Memory Settings for the VM should be 8 GB or higher (Right click the machine -> Settings -> "Memory for this virtual machine"  )
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
### Bundle Install Tips

#### rmagick
If rmagick doesn't install, check your version of imagemagick, and downgrade if >= 7
- `convert --version`
- `brew install imagemagick@6`
- `brew unlink imagemagick`
- `brew link imagemagick@6 --force`
If you continue to have issues with rmagick, after changing your imagemagick version, you may need to uninstall/reinstall the gem
- `gem uninstall rmagick`
- `gem install rmagick -v 2.15.4`

#### libv8

If you run into an error with libv8 while running bundle install
- Uninstall libv8: `gem uninstall libv8`
- Make sure the gem no longer exists with: `gem list libv8`
- Install the current version used in code.org repo: `gem install libv8 -v CURRENT_CODEORG_VERSION -- --with-system-v8` (you can find the current version in the [Gemfile.lock](./Gemfile.lock)).

#### mysql2

If you run into an issue about mysql2 while running `bundle install` and the error output includes "ld: library not found for -lssl" try :
- `brew install openssl`
- `export LIBRARY_PATH=$LIBRARY_PATH:/usr/local/opt/openssl/lib/`

(Steps from [this github issue](https://github.com/brianmario/mysql2/issues/795#issuecomment-439579677))

#### therubyracer

If you run into an issue about therubyracer while running `bundle install` try :
- `gem uninstall libv8`
- `gem install therubyracer -v CURRENT_CODEORG_VERSION` (you can find the current version in the [Gemfile.lock](./Gemfile.lock)).
- `gem install libv8 -v CURRENT_CODEORG_VERSION -- --with-system-v8` 

(Steps from [this stackoverflow question](https://stackoverflow.com/questions/19577759/installing-libv8-gem-on-os-x-10-9))

#### Xcode Set Up

OS X: when running `bundle install`, you may need to also run `xcode-select --install`. See [stackoverflow](http://stackoverflow.com/a/39730475/3991031))


### Recomended hardware
While it's possible to run the server locally without these, we've found the following hardware specifications to be best for fast development.
- Memory: minimum of 8GB RAM for `dashboard-server` and `yarn`
- Storage: The repository takes up 16GB


[ubuntu-iso-url]: http://releases.ubuntu.com/16.04/ubuntu-16.04.3-desktop-amd64.iso
