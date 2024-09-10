<!-- markdownlint-disable MD033 -->
# Setup

👋 This document describes how to set up your workstation to develop for Code.org.

You can do Code.org development using macOS, Ubuntu, or Windows (running Ubuntu in a VM/WSL). Setup for Windows is more complicated and relatively few developers use it. Make sure you follow the instructions for your platform in the subsections below.

## Overview

1. Request and Configure AWS access (code.org staff) or configure local secrets (open source contributors). See [Configure AWS Access or Secrets](#configure-aws-access-or-secrets) below. This step is not required until rake is first run below, but staff may wish to submit the request first so its ready when rake is.

1. Clone the repo:
    - Via SSH (simpler): `git clone git@github.com:code-dot-org/code-dot-org.git`
    - OR via HTTP (faster): `git clone https://github.com/code-dot-org/code-dot-org.git`.
        - Although faster than SSH, this option requires you to reauthenticate every time you want to update. You will therefore probably want to switch to SSH after the initial clone with: `git remote set-url origin git@github.com:code-dot-org/code-dot-org.git`

1. `cd code-dot-org`

1. Install OS-specific prerequisites
    - See the appropriate section below: [macOS](#macos), [Ubuntu](#ubuntu-2004), [Windows](#windows)
    - *Important*: When done, check for correct versions of these dependencies:

     ```sh
     ruby --version     # --> ruby 3.0.5
     node --version     # --> v18.16.0
     git-lfs --version  #  >= git-lfs/3.0
     pdm --version    #  >= 2.17
     ```

1. `git lfs pull`

1. `gem install bundler -v 2.3.22 && rbenv rehash`

1. `bundle install`
    - This step often fails to due environment-specific issues. Look in the [Bundle Install Tips](#bundle-install-tips) section below for steps to resolve many common issues.

1. `bundle exec rake install:hooks`
    <details>
      <summary>Troubleshoot: wrong version of rake </summary>

      - You might get a message at some point about having the wrong version of rake. If so, try:

        ```sh
        gem uninstall rake
        bundle update rake
        ```

    </details>
    <details>
      <summary>Troubleshoot: <code>FrozenError: can't modify frozen String...Aws::Errors::MissingCredentialsError</code> or similar <code>Aws::SecretsManager</code> errors</summary>
      Reported when missing credentials for access to our AWS Account or local secret configuration.

      See [Configure AWS Access or Secrets](#configure-aws-access-or-secrets)
    </details>
    <details>
      <summary>Troubleshoot: <code>WSL: Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock'</code> </summary>

      - This is an issue specific to Windows System for Linux (WSL) OS configuration where connection to mysql without sudo would fail with the above error. This can be rectified with some permission updates on mysql files and updating SQL client side configuration as called out [in this SO post](https://stackoverflow.com/a/66949451)
    </details>

1. `bundle exec rake install`
    <details>
        <summary>This will take 30 minutes, or more</summary>
        The most expensive are the "seeding" tasks, where your local DB is populated from data in the repository. Some of the seeding rake tasks can take several minutes. The longest one, <code>seed:scripts</code>, can take > 10 minutes, but it should at least print out progress as it goes.
    </details>
    <details>
        <summary>If <code>bundle exec rake install</code> is interrupted before finishing...</summary>
        If, for any reason, you are forced to interrupt the <code>bundle exec rake install</code> command before it completes,
        cd into dashboard and run <code>bundle exec rake db:drop</code> before trying <code>bundle exec rake install</code> again.
        <code>bundle exec rake install</code> must always be called from the local project's root directory, or it won't work.
    </details>

1. fix your database charset and collation to match our servers
    - `bin/mysql-client-admin`
    - `ALTER DATABASE dashboard_development CHARACTER SET utf8 COLLATE utf8_unicode_ci;`
    - `ALTER DATABASE dashboard_test CHARACTER SET utf8 COLLATE utf8_unicode_ci;`

1. `bundle exec rake build`
    - This may fail for external contributors who don't have permissions to access Code.org AWS Secrets. Assign placeholder values to any configuration settings that are [ordinarily populated in Development environments from AWS Secrets](https://github.com/code-dot-org/code-dot-org/blob/staging/config/development.yml.erb) as indicated in this example: https://github.com/code-dot-org/code-dot-org/blob/5b3baed4a9c2e7226441ca4492a3bca23a4d7226/locals.yml.default#L136-L139

1. Run the website `bin/dashboard-server`

1. **Open <http://studio.code.org.localhost:3000/>** to verify its running.

After setup, [configure your editor](#editor-configuration), read about our [code styleguide](./STYLEGUIDE.md), our [test suites](./TESTING.md), or find more docs on [the wiki](https://github.com/code-dot-org/code-dot-org/wiki/For-Developers).

## Configure AWS Access or Secrets

### For Code.org Staff

Staff should see instructions for requesting AWS account access in our "AWS Account Access" doc linked from "Getting started as a Developer", and follow the setup steps in the "API access (for local development)" section.
Some functionality will not work on your local site without this, for example, some project-backed level types such as <https://studio.code.org/projects/gamelab>. 
### For external contributors

External contributors can supply alternate placeholder values for secrets normally retrieved from AWS Secrets Manager by creating a file named "locals.yml", copying contents from ["locals.yml.default"](locals.yml.default) and uncommenting following configurations to use placeholder values

```
slack_bot_token: localoverride
pardot_private_key: localoverride
properties_encryption_key: ''
```

## OS-specific prerequisites

### macOS

These steps are for Apple devices running **macOS 14.x**, including those running on [Apple Silicon (M1|M2|M3) ARM architecture CPUs](https://en.wikipedia.org/wiki/Apple_silicon#M_series). 

1. Open a Terminal.

1. Install **Xcode Command Line Tools**:
    ```
    xcode-select --install
    ```

1. Install **[brew](https://brew.sh/)**: 
   ```
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

1. Install **brew packages**:
   ```
   brew install rbenv ruby-build nvm pdm mysql@8.0 redis git-lfs enscript gs imagemagick coreutils parallel tidy-html5 openssl libffi pdftk-java
   ```

1. Initialize **Git LFS**:
   ```
   git lfs install --skip-repo
   ```
1. Start your local **Redis server**
   1. Start redis server:
       ```
       brew services start redis
       ```
   2. The output from `brew` should confirm that `redis` has started
       ```
       ==> Successfully started `redis` (label: homebrew.mxcl.redis)
       ```
   3. macOS will notify you that `redis` has been configured to start automatically upon user login. Confirm this in System Settings --> General --> Login Items --> `redis-server` 
1. Setup your local **MySQL database server**
   1. Link MySQL 8
        ```
        brew link --force --overwrite mysql@8.0
        ```
   2. Verify Link
        ```
        mysql --version  # should show: mysql  Ver 8.0.[xx]
        ```
   3. Start mysql server:
        ```
        brew services start mysql # Should notify you that MySQL server has been added to Login Items
        ```
   2. Confirm that MySQL has started by running:
        ```
        brew services    # should show: "started"
        ```

      If the status is instead "stopped", you may need initialize your mysql database:
        ```
        brew services stop mysql
        mysqld --initialize-insecure  # this will leave the root password blank, which is required
        brew services start mysql
        brew services   # should show: "started"
        ```

1.  Install **Ruby**
    1. Configure zsh to load rbenv ([other shells](https://github.com/rbenv/rbenv#basic-git-checkoutshells)): 
        ```
        echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc && source ~/.zshrc
        ```
    2. Install ruby version specified by [.ruby-version](.ruby-version):
        ```
        rbenv install --skip-existing    # run from the project root directory
        ```

1.  Install **Node.js**
    1. Install node version specified by [.nvmrc](.nvmrc):
        ```
        nvm install    # run from the project root directory
        ```
      <details>
        <summary>If you get an error <code>nvm: command not found</code></summary>
        Run `brew info nvm` and follow the instructions there. They will include making an `.nvm` folder and updating your shell configuration file.
      </details>

    2. Set default node version:
        ```
        nvm alias default $(cat ./.nvmrc)
        ```
    3. Enable corepack to install **yarn**:
        ```
        corepack enable
        ```

1. Install [Google Chrome](https://www.google.com/chrome/), needed for some local app tests.

1. *(Optional)* Install **pdftk.rb**. Skipping this will cause some PDF related tests to fail.
    ```
    curl -O https://raw.githubusercontent.com/zph/homebrew-cervezas/master/pdftk.rb
    brew install ./pdftk.rb
    rm ./pdftk.rb
    ```

1. Return to the [Overview](#overview) to continue setup.

### Ubuntu 20.04
[Ubuntu 20.04 iso download][ubuntu-iso-url]

Note: Virtual Machine Users should check the [Alternative note](#alternative-use-an-ubuntu-vm) below before starting

1. `sudo apt-get update`
1. `sudo apt-get install -y git mysql-server mysql-client libmysqlclient-dev libxslt1-dev libssl-dev zlib1g-dev imagemagick libmagickcore-dev libmagickwand-dev openjdk-11-jre-headless libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev curl pdftk enscript build-essential redis-server rbenv chromium-browser parallel python3-pip`
    * **Hit enter and select default options for any configuration popups, leaving mysql passwords blank**
    <details> 
      <summary>Troubleshoot: <code>E: Package 'pdftk' has no installation candidate</code>.</summary>
      - If you run into this error, remove `pdftk` from the previous command and run it again. Then try installing `pdftk` another way:
          - Ubuntu 18.04: `sudo snap install pdftk`.
          - If you can't get `pdftk` installed, it is ok to skip installing this package, and keep in mind that the `PDFMergerTest` test may fail when you try to run the pegasus tests locally.
    </details>
1. *(If working from an EC2 instance)* `sudo apt-get install -y libreadline-dev libffi-dev`
1. configure your system so that `~/.bashrc` (or another startup file of your choice) will be run whenever you open a shell
    1. if you are using bash and setting up a new linux system, you may need to modify `~/.bash_profile` or `~/.profile` (your login shell configuration file) as per [this explanation](https://joshstaiger.org/archives/2005/07/bash_profile_vs.html), which recommends adding these lines:

        ```
        if [ -f ~/.bashrc ]; then
          source ~/.bashrc
        fi     
        ```
1. Install git-lfs >= 3.0
    1. The default version of git-lfs in Ubuntu 20.04 is 2.9. This does not have support for Git SSH operations. Therefore, you'll want to add packagecloud.io apt repositories to your system to get a newer version of Git LFS (this step is not required if using Ubuntu >= 22.04): 
        `curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash`
    1. `apt-get install git-lfs`
    1. Ensure `git-lfs --version` is >= 3.0. Git LFS < 3.0 only supports HTTPS, not SSH.
    1. From your homedir, run: `git lfs install`
       - This adds a `[filter "lfs"]` section to your `~/.gitconfig`.
       - Note: the install command must be run while you are **outside** a git repo directory. If you run it from inside a git repo, it will instead try to install git hooks in that repo.

1. Install Node and Nodejs
    1. Install the latest version of [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)
    1. Running `nvm install` or `nvm use` within the project directory will install and use the version specified in [.nvmrc](.nvmrc)
    1. `node --version` Double check the version of node you are using. If it is wrong, then try restarting your terminal.
1. Ensure rbenv and ruby-build are properly installed
    1. run `rbenv init` and follow the instructions.
    1. Install [ruby-build as a rbenv plugin](https://github.com/rbenv/ruby-build#readme)
        1. `mkdir -p "$(rbenv root)"/plugins`
        1. `git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build`
    1. If there are any errors (they appear red), follow the [`rbenv` installation instructions] (https://github.com/rbenv/rbenv#basic-github-checkout) to properly configure `rbenv`, following steps for **Ubuntu Desktop** so that config changes go into `.bashrc`.
    1. **Note:** Ubuntu 22.04 ships with versions of `libssl` and `openssl` that are incompatible with `ruby-build`; see https://github.com/rbenv/ruby-build/discussions/1940 for context
        1. As a result, attempts to run `rbenv install` will fail. To resolve, compile a valid version of `openssl` locally and direct `rbenv` to configure ruby to use it as described here: https://github.com/rbenv/ruby-build/discussions/1940#discussioncomment-2663209
1. Install Ruby with rbenv
    1. Execute `rbenv install --skip-existing` from the root directory, which will install the version specified in ".ruby-version"
    1. If your PATH is missing `~/.rbenv/shims`, the next two commands might not work. Edit your .bashrc to include the following line:
       `export PATH="$HOME/.rbenv/bin:~/.rbenv/shims:$PATH"`, then run `source .bashrc` for the change to take effect (as seen in [this github issue](https://github.com/rbenv/rbenv/issues/877)).
    1. `rbenv rehash`
1. Install pdm, which will be used later by `rake install` to install python
    1. `sudo pip3 install --prefix=/usr/local --upgrade pdm`
        - alternatively, if you prefer pipx and have it configured path-wise: `pipx install pdm`
1. Enable **corepack** to install **yarn**: `corepack enable`
1. Make it so that you can run apps tests locally
    1. Add the following to `~/.bashrc` or your desired shell configuration file:
        1. `export CHROME_BIN=$(which chromium-browser)`
1. Finally, configure your mysql to allow for a proper installation. You may run into errors if you did not leave mysql passwords blank
    1. `echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" | sudo mysql`
1. Return to the [overview](#overview) and continue setup.

### Windows

Windows Subsystem for Linux (WSL) allows you to run a GNU/Linux environment directly on Windows without the overhead of a virtual machine. This is the easiest way to get Ruby and other prerequisites running on Windows.

It is worthwhile to make sure that you are using WSL 2. Attempting to use WSL 1 in the past resulted in errors with mysql and pdftk installation. In order to use WSL 2, you must be running Windows 10, updated to version 2004, Build 19041 or higher. If your Windows update service doesn't give you the update automatically, you can download it [from the Windows download page](https://www.microsoft.com/en-us/software-download/windows10).

1. Enable WSL ([unabridged WSL instructions here](https://docs.microsoft.com/en-us/windows/wsl/install-win10)). You should run Powershell as Administrator for the following commands:
    1. `dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart`
    1. `dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart`
    1. Restart your machine. WSL 2 will be the default if your Windows version is sufficiently updated.
    1. `wsl --set-default-version 2`
        1. You may need to [update the WSL 2 Linux kernel](https://docs.microsoft.com/en-us/windows/wsl/wsl2-kernel)
1. Make sure virtualization is turned on your BIOS settings.
1. Install [Ubuntu 20.04](https://www.microsoft.com/store/productId/9NBLGGH4MSV6) or [Ubuntu 22.04.3 LTS](https://apps.microsoft.com/detail/9PN20MSR04DW) 
    * If you want to follow the Ubuntu setup exactly, Ubuntu 18.04 is available from the [Microsoft docs](https://docs.microsoft.com/en-us/windows/wsl/install-manual).
1. From the command line, run `wsl`, or from the Start menu, find and launch 'Ubuntu'. When this runs for the first time, WSL will complete installation in the resulting terminal window.
1. Optionally configure your **zsh** experience. [instructions](https://itsfoss.com/zsh-ubuntu/)
1. Make it so that you can run apps tests locally by setting up the `CHROME_BIN` env var. You have a few options here:
    1. If you have Google Chrome installed on Windows, add the path to chrome.exe to `~/.bashrc` or your desired shell configuration file to make it accessible from WSL, likely one of the following paths:
        1. `export CHROME_BIN="/mnt/c/Program\ Files\ (x86)/Google/Chrome/Application/chrome.exe"` or
        1. `export CHROME_BIN="/mnt/c/Program\ Files/Google/Chrome/Application/chrome.exe"`
    1. Alternatively, ensure chromium-browser or google-chrome is installed in WSL
        1. Try running `chromium-browser`.
            1. If that works, add `export CHROME_BIN=$(which chromium-browser)` to your `~/.bashrc` or desired shell configuration file.
        1. If this does not work with the error message `Command '/usr/bin/chromium-browser' requires the chromium snap to be installed.`, you can instead install google chrome by running the following:
            1. `wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb`
            1. `sudo apt install ./google-chrome-stable_current_amd64.deb`
            1. Add `export CHROME_BIN=$(which google-chrome)` to your `~/.bashrc` or desired shell configuration file.
        
1. Follow the [Ubuntu instructions](#ubuntu-2004) to install required tools on the Ubuntu instance, _with the following modifications_:
    * There is an ongoing clock skew issue going on with wsl. This can cause issues with `apt update`, ssl certs, among other things. You can force your clock to sync with `sudo hwclock -s` to fix these issues temporarily. See the [megathread](https://github.com/microsoft/WSL/issues/10006) for more details.
    * Skip exporting `CHROME_BIN` since you already did so above.
    * Before updating the root password to empty in SQL (step 10), restart MySQL using `sudo /etc/init.d/mysql restart`
1. Follow the [overview instructions](#overview), _with the following modifications_:
    * Before running `bundle exec rake install`, restart the mysql service: `sudo service mysql start`
    * If localhost responds slowly and you have exhausted conventional options (e.g. turning off Firewall during testing), try moving the code-dot-org repo outside of the /mnt/ directory (e.g. ~) to improve responsiveness

### Alternative: Use an Ubuntu VM

* Option A: Use [VMWare Player](https://my.vmware.com/en/web/vmware/free#desktop_end_user_computing/vmware_workstation_player/12_0) or [Virtual Box](http://download.virtualbox.org/virtualbox/5.1.24/VirtualBox-5.1.24-117012-Win.exe) and an [Ubuntu 20.04 iso image][ubuntu-iso-url]
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
     * **Step 1: Choose AMI**: Select Ubuntu Server 20.04
     * **Step 2: Choose instance type**: Choose at least 16 GiB memory (e.g. `t2.xlarge`)
     * **Step 3: Configure Instance**: 
       * Set IAM Instance Profile to `DeveloperEC2`
       * Set VPC to `vpc-a48462c3`
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
  1. Go back up to the [overview](#overview) and run the commands there but when you have completed steps in overview, return to instructions below.
  1. Once you have successfully completed `bundle exec rake build`, you can connect to it as follows:
     * run `ssh -L 3000:127.0.0.1:3000 yourname-ec2` and then `~/code-dot-org/bin/dashboard-server` on your local machine. This sets up SSH port forwarding from your local machine to your ec2 dev instance for as long as your ssh connection is open.
     * navigate to http://studio.code.org.localhost:3000/ on your local machine

## Piskel
### Local Development Between code-dot-org and forked piskel repo
If you want the Code.org repo to point to the local version of the Piskel you are working on, your apps package must be linked to a local development copy of the Piskel repository with a complete dev build. 

**[You can also find the steps below in apps/Gruntfile.js of the code-dot-org repo](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/Gruntfile.js)**

#### The Steps:
1. `git clone https://github.com/code-dot-org/piskel.git <new-directory>`
2. `cd <new-directory>`
3. `npm install && grunt build-dev`
4. `npm link`
5. `cd <code-dot-org apps directory>`
6. `npm link @code-dot-org/piskel`
7. rerun `yarn start` in the `<code-dot-org apps directory>`

#### Note: Using `grunt serve --force`
- If you try grunt serve and it is aborted due to warnings do `grunt serve --force`

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

## Enabling internationalization(i18n) / translations
If you want to enable the ability to switch Code.org to display different languages:
1. Edit `locals.yml` and enable the following options:
   ```
   # code-dot-org/locals.yml
   load_locales: true
   ```
## Editor configuration

We enforce linting rules for all our code, and we recommend you set up your editor to integrate with that linting.

### Javascript

We use [eslint](https://eslint.org/) to lint our Javascript; see [the official integrations guide](https://eslint.org/docs/user-guide/integrations) for instructions for your editor of choice.

Our lint configuration uses formatting rules provided by [Prettier](https://prettier.io/). You can configure your editor to auto-format your code to meet our requirements, in addition to the error highlighting provided by eslint. See [the official integrations guide](https://prettier.io/docs/en/editors.html) for instructions for your editor of choice.

### Ruby

We use [RuboCop](https://docs.rubocop.org/rubocop/index) to lint our Ruby; see [the official integrations guide](https://docs.rubocop.org/rubocop/integration_with_other_tools) for instructions for your editor of choice.

### SCSS

We use [Stylelint](https://stylelint.io/) to lint our SCSS in the `apps` directory. There are plugins available for both [VS Code](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) and [JetBrains](https://www.jetbrains.com/help/idea/using-stylelint-code-quality-tool.html#ws_stylelint_configure).

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

#### ImageMagick with Pango

**Note:** Most developers won't need to peronsonalize certificates locally, but some will.  Here are notes on getting this working on macOS.

Certificates have been greatly improved with the ability to apply text in many languages.  

This is done by using “pango”.  It seems on Linux machines, ImageMagick already contains Pango, but on macOS it doesn’t... at least as installed using brew.

So we need to install a version of ImageMagick that includes Pango.  There are tons of threads online where people can’t get it to work.

The good news is that we figured out a solution.

First modify the ImageMagick formula in brew, using

```sh
brew edit imagemagick
```

Note that one developer found they needed to `brew edit imagemagick@6`.)

Change `--without-pango` to `--with-pango`.  However, that’s not enough.  Add

```text
depends_on "pango"
```

near the similar entries.  This is the step that we couldn’t find online anywhere.

Then

```sh
brew uninstall imagemagick
```

(Note that one developer found they needed to  and `brew uninstall imagemagick@6`.)
Then

```sh
brew install imagemagick@6 --build-from-source
```

Then, because it’s `@6`, we need to

```sh
brew link imagemagick@6 --force
```

to make it generally accessible from both the command line and from rmagick.
(We still use `imagemagick@6` because we need magicwand, whatever that is.)
Now, we have Pango in our ImageMagick, which we can test with

```sh
convert pango:"test text" test.png
```

Finally, it’s likely that we now have a slightly different version of ImageMagick.
We need rmagick to rediscover that with

```sh
bundle remove rmagick
bundle add rmagick
```

Restart `dashboard-server` and if all went well, we see text rendering on customized certificates again.

#### mysql2

If you run into an issue about mysql2 while running `bundle install` and the error output includes "ld: library not found for -lssl" try :

- `brew install openssl`
- `export LIBRARY_PATH=$LIBRARY_PATH:/usr/local/opt/openssl/lib/`

(Steps from [this github issue](https://github.com/brianmario/mysql2/issues/795#issuecomment-439579677))

If you run into an error like "Don't know how to set rpath on your system, if MySQL libraries are not in path mysql2 may not load" during `bundle install` and are running on a Mac with M1, try :

- `gem install mysql2 -v '0.5.2' -- --with-opt-dir=$(brew --prefix openssl) --with-ldflags=-L/opt/homebrew/Cellar/zstd/1.5.0/lib`

#### bundler gem

If you run into the error message `can't find gem bundler (>= 0.a) with executable bundler (Gem::GemNotFoundException)` while running `bundle install` try (as seen in this [StackOverflow](https://stackoverflow.com/questions/47026174/find-spec-for-exe-cant-find-gem-bundler-0-a-gemgemnotfoundexception)):

- `gem install bundler -v BUNDLED_WITH_VERSION`, where the version is the `BUNDLED WITH` version in [Gemfile.lock](./Gemfile.lock)).
- `bundle install`

#### thin

If you run into error messages about `implicit declaration of function thin_xxx` when trying to compile the native extensions for thin:

- `gem install thin -v THIN_VERSION -- --with-cflags="-Wno-error=implicit-function-declaration"` where THIN_VERSION is the current version of thin in [Gemfile.lock](./Gemfile.lock)).

(More info [here](https://github.com/macournoyer/thin/pull/364))

#### mimemagic

If you run into an error message about `Could not find MIME type database in the following locations...` while installing the `mimemagic` gem, try:

- `brew install shared-mime-info`

(More info on mimemagic dependencies [here](https://github.com/mimemagicrb/mimemagic#dependencies), including help for OSes that don't support Homebrew.)

#### eventmachine

If bundle install fails with an error referencing `eventmachine`, try

- `gem install eventmachine -v [VERSION] -- --with-openssl-dir=$(brew --prefix libressl)`

Where [VERSION] is the current version of eventmachine in Gemfile.lock. For example:

- `gem install eventmachine -v 1.2.7 -- --with-openssl-dir=$(brew --prefix libressl)`

#### Xcode Set Up

OS X: when running `bundle install`, you may need to also run `xcode-select --install`. See [stackoverflow](http://stackoverflow.com/a/39730475/3991031). If this doesn't work, step 9 in the overview will not run correctly. In that case run the following command in the Terminal (found from
  <https://github.com/nodejs/node-gyp/issues/569>): `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`

### Recommended hardware

While it's possible to run the server locally without these, we've found the following hardware specifications to be best for fast development.

- Memory: minimum of 8GB RAM for `dashboard-server` and `yarn`
- Storage: The repository takes up 20GB

[ubuntu-iso-url]: https://releases.ubuntu.com/focal/ubuntu-20.04.6-desktop-amd64.iso
