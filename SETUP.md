# Setup
This document describes how to set up your workstation to develop for Code.org.

You can do Code.org development using OSX, Ubuntu, or Windows (running Ubuntu in a VM). Setup for Windows is more complicated and relatively few developers use it. Make sure you follow the instructions for your platform in the subsections below.

## Overview

1. Install OS-specific prerequisites
   - See the appropriate section below: [OSX](#os-x-mojave--mavericks--yosemite--el-capitan--sierra), [Ubuntu](#ubuntu-1604-download-iso), [Windows](#windows)
   - *Important*: When done, check for correct versions of these dependencies:

     ```
     ruby --version  # --> ruby 2.5.0
     node --version  # --> v8.15.0
     yarn --version  # --> 1.16.0
     ```
1. If using HTTPS: `git clone https://github.com/code-dot-org/code-dot-org.git`, if using SSH: `git@github.com:code-dot-org/code-dot-org.git`
1. `gem install bundler -v 1.17`
1. `rbenv rehash`
1. `cd code-dot-org`
1. `bundle install` (Problems running this step? See [tips](#bundle-install-tips) below.)
1. `bundle exec rake install:hooks`
    <details>
        <summary>Troubleshoot: `rake aborted!..` </summary>

        If you have issue "rake aborted! Gem::LoadError: You have already activated rake 12.3.0, but your Gemfile requires rake 11.3.0. Prepending `bundle exec` to your command may solve this."
            * Follow the instructions and make sure you added `bundle exec` in front of the `rake install:hooks` command
    </details>
    <details>
        <summary>Troubleshoot: wrong version of rake </summary>

        You might get a message at some point about having the wrong version of rake. If so, try:
        $> gem uninstall rake
        $> bundle update rake
    </details>

1. `bundle exec rake install`
    * This can take a LONG time. You can see if progress is being made by opening up a second shell and starting `mysql -u root`. Run the following command twice, with approximately a 5-10 second delay between
  each run `select table_schema, table_name, table_rows from information_schema.tables where table_schema like 'dashboard_development' order by table_rows;`  If you see a change in the last couple of rows, the
  install is working correctly.
1. `bundle exec rake build`
    * This may fail if your are on a Mac and your OSX XCode Command Line Tools were not installed properly. See Bundle Install Tips for more information.
1. (Optional, Code.org engineers only) Setup AWS - Ask a Code.org engineer how to complete this step
   1. Some functionality will not work on your local site without this, for example, some project-backed level types such as https://studio.code.org/projects/gamelab. This setup is only available to Code.org engineers for now, but it is recommended for Code.org engineers.
1. Run the website `bin/dashboard-server`
1. Visit http://localhost-studio.code.org:3000/ to verify it is running.

After setup, read about our [code styleguide](./STYLEGUIDE.md), our [test suites](./TESTING.md), or find more docs on [the wiki](https://github.com/code-dot-org/code-dot-org/wiki/For-Developers).

## OS-specific prerequisites

### OS X Mojave / Mavericks / Yosemite / El Capitan / Sierra

1. Install Homebrew: `ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
1. Install Redis: `brew install redis`
1. Run `brew install https://raw.github.com/quantiverge/homebrew-binary/pdftk/pdftk.rb enscript gs mysql@5.7 nvm imagemagick rbenv ruby-build coreutils sqlite parallel`
    <details>
        <summary>Troubleshoot: <code>Formula.sha1</code> is disabled or <code>Error: pdftk: undefined method sha1' for #&lt;Class:...&gt;</code></summary>

        If it complains about `Formula.sha1` is disabled, removing https://raw.github.com/quantiverge/homebrew-binary/pdftk/pdftk.rb from the above command seems to not have serious side effects (it will cause `PDFMergerTest` to fail). It may be a new URL is needed in the dependency list, see https://leancrew.com/all-this/2017/01/pdftk/
    </details>
    <details>
        <summary>Troubleshoot: old version of `&lt;package&gt;`</summary>

        If it complains about an old version of `<package>`, run `brew unlink <package>` and run `brew install <package>` again
    </details>
1. Set up MySQL
    1. Force link 5.7 version: `brew link mysql@5.7 --force`
    1. Have `launchd` start mysql at login: `ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents`
        1. Note, if mysql folder name is "mysql@5.7", replace the command above by `ln -sfv /usr/local/opt/mysql@5.7/*.plist ~/Library/LaunchAgents`. (Use `ls -d /usr/local/opt/mysql*` to check for folder name.)
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
1. Install Node and yarn
    1. `nvm install 8.15.0 && nvm alias default 8.15.0` this command should make this version the default version and print something like: `Creating default alias: default -> 8.15.0 (-> v8.15.0)`
    1. `npm install -g yarn@1.16.0`.
    1. (Note: You will have to come back to this step after you clone your repository) Reinstall node_modules `cd apps; yarn; cd ..`
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

1. Install the [Java 8 JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)

1. [Download](https://www.google.com/chrome/) and install Google Chrome, if you have not already. This is needed in order to be able to run apps tests locally.

### Ubuntu 16.04 ([Download iso][ubuntu-iso-url]) 

Note: Virtual Machine Users should check the [Alternative note](#alternative-use-an-ubuntu-vm) below before starting

1. `sudo apt-get update`
1. `sudo apt-get install -y git mysql-server mysql-client libmysqlclient-dev libxslt1-dev libssl-dev zlib1g-dev imagemagick libmagickcore-dev libmagickwand-dev openjdk-9-jre-headless libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev curl pdftk enscript libsqlite3-dev build-essential redis-server rbenv chromium-browser parallel`
    * **Hit enter and select default options for any configuration popups, leaving mysql passwords blank**
1. *(If working from an EC2 instance)* `sudo apt-get install -y libreadline-dev libffi-dev`
1. Install Node and Nodejs
    1. Install the latest version of [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)
    1. `nvm install v8.15.0 && nvm alias default 8.15.0` Install nodejs v8.15.0  
    1. `node --version` Double check the version of node you are using. If it is wrong, then try restarting your terminal.
1. Ensure rbenv and ruby-build are properly installed
    1. Use the rbenv-doctor from the [`rbenv` installation instructions](https://github.com/rbenv/rbenv#basic-github-checkout) to verify rbenv is set up correctly:
        1. curl -fsSL https://github.com/rbenv/rbenv-installer/raw/master/bin/rbenv-doctor | bash
    1. If there are any errors (they appear red), follow the [`rbenv` installation instructions] (https://github.com/rbenv/rbenv#basic-github-checkout) to properly configure `rbenv`, following steps for **Ubuntu Desktop** so that config changes go into `.bashrc`.
    1. Install [ruby-build as a rbenv plugin](https://github.com/rbenv/ruby-build#readme)
1. Install Ruby 2.5.0 with rbenv
    1. `rbenv install 2.5.0`
    1. If your PATH is missing `~/.rbenv/shims`, the next two commands might not work. Edit your .bashrc to include the following line:
       `export PATH="$HOME/.rbenv/bin:~/.rbenv/shims:$PATH"`, then run `source .bashrc` for the change to take effect (as seen in [this github issue](https://github.com/rbenv/rbenv/issues/877)).
    1. `rbenv global 2.5.0`
    1. `rbenv rehash`
1. Install yarn
    1. `curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`
    1. `echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`
    1. `sudo apt-get update && sudo apt-get install yarn=1.16.0-1`
    1. `yarn --version` Double check the version of yarn is correct.
1. Make it so that you can run apps tests locally
    1. Add the following to `~/.bash_profile` or your desired shell configuration file:
        1. `export CHROME_BIN=$(which chromium-browser)`
1. Finally, configure your mysql to allow for a proper installation. You may run into errors if you did not leave mysql passwords blank
    1. `echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" | sudo mysql`
1. **IMPORTANT:** Read the following notes, then go back up to the [overview](#overview) and run the commands there.
    1. If, for any reason, you are forced to interrupt the `bundle exec rake install` command before it completes,
       cd into dashboard and run `bundle exec rake db:drop` before trying `bundle exec rake install` again
    1. `bundle exec rake install` must always be called from the local project's root directory, or it won't work.
    1. Finally, don't worry if your versions don't match the versions in the overview if you're following this method; the installation should still work properly regardless

### Windows

Windows Subsystem for Linux (WSL) allows you to run a GNU/Linux environment directly on Windows without the overhead of a virtual machine. This is the easiest way to get Ruby and other prerequisites running on Windows.

It is worthwhile to make sure that you are using WSL 2. Attempting to use WSL 1 in the past resulted in errors with mysql and pdftk installation. In order to use WSL 2, you must be running Windows 10, updated to version 2004, Build 19041 or higher. If your Windows update service doesn't give you the update automatically, you can download it [from the Windows download page](https://www.microsoft.com/en-us/software-download/windows10).

1. Enable WSL ([unabridged WSL instructions here](https://docs.microsoft.com/en-us/windows/wsl/install-win10)). You should run Powershell as Administrator for the following commands:
    1. `dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart`
    1. `dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart`
    1. Restart your machine. WSL 2 will be the default if your Windows version is sufficiently updated.
    1. `wsl --set-default-version 2`
        1. You may need to [update the WSL 2 Linux kernel](https://docs.microsoft.com/en-us/windows/wsl/wsl2-kernel)
1. [Install Ubuntu 20.04](https://www.microsoft.com/store/productId/9NBLGGH4MSV6) (Windows Store link)
    * If you want to follow the Ubuntu setup exactly, Ubuntu 16.04 is available from the [Microsoft docs](https://docs.microsoft.com/en-us/windows/wsl/install-manual).
1. Make sure virtualization is turned on your BIOS settings.
1. From the command line, run `wsl`, or from the Start menu, find and launch 'Ubuntu'. When this runs for the first time, WSL will complete installation in the resulting terminal window.

From here, you can follow the [Ubuntu procedure above](#ubuntu-1604-download-iso), _with the following observations_...
* In step 2, you may run into the error `E: Unable to locate package openjdk-9-jre-headless`. This is because openjdk-9 has been superseded by openjdk-11. Replace `openjdk-9-jre-headless` with `openjdk-11-jre-headless`. If you want, you can first check to see if this replacement package is available on your distro using `sudo apt-cache search openjdk` as per [this StackOverflow thread](https://stackoverflow.com/questions/51141224/how-to-install-openjdk-9-jdk-on-ubuntu-18-04/51141421).
* Before step 9, you may have to restart MySQL using `sudo /etc/init.d/mysql restart`

...followed by the [overview instructions](#overview), _with the following observation_:
* Before running `bundle exec rake install`, you may have to start the mysql service: `sudo service mysql start`

### Alternative: Use an Ubuntu VM

* Option A: Use [VMWare Player](https://my.vmware.com/en/web/vmware/free#desktop_end_user_computing/vmware_workstation_player/12_0) or [Virtual Box](http://download.virtualbox.org/virtualbox/5.1.24/VirtualBox-5.1.24-117012-Win.exe) and an [Ubuntu 16.04 iso image][ubuntu-iso-url]
  1. Maximum Disk Size should be set to at least 35.0 GB (the default is 20 GB and it is too small)
  2. Memory Settings for the VM should be 8 GB or higher (Right click the machine -> Settings -> "Memory for this virtual machine"  )
* Option B: Use vagrant ([install](https://docs.vagrantup.com/v2/installation/)):
  1. First clone the code.org git repo to get the provided Vagrantfile (you will be able to skip step 1 of the common setup instructions): `git clone https://github.com/code-dot-org/code-dot-org.git`
  1. `cd code-dot-org`
  1. `vagrant up`
  1. `vagrant ssh`
  1. Goto step 2 of the common setup instructions
* Option C: Use an Amazon EC2 instance:
  1. Request AWS access from [accounts@code.org](mailto:accounts@code.org) if you haven't already done so.
  1. From the [EC2 Homepage](https://console.aws.amazon.com/ec2), click on "Launch Instance" and follow the wizard:
     * **Step 1: Choose AMI**: Select Ubuntu Server 16.04
     * **Step 2: Choose instance type**: Choose at least 8GiB memory (e.g. `t2.large`)
     * **Step 3: Configure Instance**: Set IAM Role to `DeveloperEC2`
     * **Step 4: Storage**: Increase storage to 100GiB
  1. Launch the instance. When asked for a key pair, you can create a new key pair (be sure to download and save the .pem file) or use an existing key pair that you have the .pem file for.
  1. Connect to the instance by selecting the instance in the AWS EC2 dashboard and clicking "Connect". Follow the provided instructions in order to connect via ssh or PuTTY. Upon completing this step, you should be able to connect to your instance via a command like `ssh -i <keyname>.pem <public-dns-name>`.
  1. Optionally, update your ssh config so that you can connect using a shorter command:
     * move your private key to `~/.ssh/<keyname>.pem`
     * add the following lines to ~/.ssh/config:     
       ```
       Host yourname-ec2
         Hostname <public-dns-name>
         User ubuntu
         PreferredAuthentications publickey
         IdentityFile ~/.ssh/<keyname>.pem
       ```
     * run `ssh yourname-ec2` to connect to your instance
  1. Go back up to the [overview](#overview) and run the commands there.
  1. Once you have successfully completed `bundle exec rake build`, you can connect to it as follows:
     * run `ssh -L 3000:127.0.0.1:3000 yourname-ec2` and then `~/code-dot-org/bin/dashboard-server` on your local machine. This sets up SSH port forwarding from your local machine to your ec2 dev instance for as long as your ssh connection is open.
     * navigate to http://localhost-studio.code.org:3000/ on your local machine

## Enabling JavaScript builds
**Note:** the installation process now enables this by default, which is recommended. You can manually edit these values later if you want to disable local JS builds.

If you want to make JavaScript changes and have them take effect locally, you'll want to enable local builds of the JavaScript packages. You'll need to do this once:

1. Edit locals.yml and enable the following options:

   ```
   # code-dot-org/locals.yml

   # These enable the local apps build
   build_apps: true
   use_my_apps: true
   ```

1. Run `bundle exec rake package` for the changes to take effect.

This configures dashboard to rebuild apps whenever you run `bundle exec rake build` and to use the version that you built yourself.  See the documentation in that directory for faster ways to build and iterate.

## Editor configuration

We enforce linting rules for all our code, and we recommend you set up your editor to integrate with that linting.

### Javascript

We use [eslint](https://eslint.org/) to lint our Javascript; see [the official integrations guide](https://eslint.org/docs/user-guide/integrations) for instructions for your editor of choice.

Our lint configuration uses formatting rules provided by [Prettier](https://prettier.io/). You can configure your editor to auto-format your code to meet our requirements, in addition to the error highlighting provided by eslint. See [the official integrations guide](https://prettier.io/docs/en/editors.html) for instructions for your editor of choice.

### Ruby

We use [RuboCop](https://docs.rubocop.org/en/latest/) to lint our Ruby; see [the official integrations guide](https://docs.rubocop.org/en/latest/integration_with_other_tools/) for instructions for your editor of choice.

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
- Install the current version used in code.org repo: `gem install libv8 -v CURRENT_CODEORG_VERSION -- --with-system-v8` (you can find what to fill in for CURRENT_CODEORG_VERSION as the current version of libv8 in the [Gemfile.lock](./Gemfile.lock)).

#### mysql2

If you run into an issue about mysql2 while running `bundle install` and the error output includes "ld: library not found for -lssl" try :
- `brew install openssl`
- `export LIBRARY_PATH=$LIBRARY_PATH:/usr/local/opt/openssl/lib/`

(Steps from [this github issue](https://github.com/brianmario/mysql2/issues/795#issuecomment-439579677))

#### therubyracer

If you run into an issue about therubyracer while running `bundle install` try :
- `gem uninstall libv8`
- `gem install therubyracer -v CURRENT_CODEORG_VERSION` (you can find  what to fill in for CURRENT_CODEORG_VERSION as the current version of the therubyracer in the [Gemfile.lock](./Gemfile.lock)).
- `gem install libv8 -v CURRENT_CODEORG_VERSION -- --with-system-v8` (You can find what to fill in for CURRENT_CODEORG_VERSION as the current version of libv8 in the [Gemfile.lock](./Gemfile.lock)).

(Steps from [this stackoverflow question](https://stackoverflow.com/questions/19577759/installing-libv8-gem-on-os-x-10-9))

#### bundler gem

If you run into the error message `can't find gem bundler (>= 0.a) with executable bundler (Gem::GemNotFoundException)` while running `bundle install` try (as seen in this [StackOverflow](https://stackoverflow.com/questions/47026174/find-spec-for-exe-cant-find-gem-bundler-0-a-gemgemnotfoundexception)):
- `gem install bundler -v BUNDLED_WITH_VERSION`, where the version is the `BUNDLED WITH` version in [Gemfile.lock](./Gemfile.lock)).
- `bundle install`

#### Xcode Set Up

OS X: when running `bundle install`, you may need to also run `xcode-select --install`. See [stackoverflow](http://stackoverflow.com/a/39730475/3991031). If this doesn't work, step 9 in the overview will not run correctly. In that case run the following command in the Terminal (found from
  https://github.com/nodejs/node-gyp/issues/569): `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`


### Recommended hardware
While it's possible to run the server locally without these, we've found the following hardware specifications to be best for fast development.
- Memory: minimum of 8GB RAM for `dashboard-server` and `yarn`
- Storage: The repository takes up 20GB


[ubuntu-iso-url]: http://releases.ubuntu.com/16.04/ubuntu-16.04.3-desktop-amd64.iso
