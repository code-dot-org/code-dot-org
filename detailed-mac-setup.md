# Setup

## Mac
These steps are for Apple devices running **macOS 14.x**, including those running on [Apple Silicon (M1|M2|M3) ARM architecture CPUs](https://en.wikipedia.org/wiki/Apple_silicon#M_series). 

1. Clone the repo:
    - Via SSH (highly recommended): `git clone git@github.com:code-dot-org/code-dot-org.git`

1. `cd code-dot-org`


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
   brew install rbenv ruby-build nvm uv mysql@8.0 redis git-lfs enscript gs imagemagick coreutils parallel tidy-html5 openssl libffi pdftk-java
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
        brew services start mysql@8.0 # Should notify you that MySQL server has been added to Login Items
        ```
   4. Confirm that MySQL has started by running:
        ```
        brew services    # should show: "started"
        ```

      If the status is instead "stopped", you may need initialize your mysql database:
        ```
        brew services stop mysql@8.0
        mysqld --initialize-insecure  # this will leave the root password blank, which is required
        brew services start mysql@8.0
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

1. If you are on an M-series Mac, you will need to install Rosetta if you have not done so already, otherwise the apps build may fail:
    ```sh
    softwareupdate --install-rosetta
    ```
    ```sh
    arch -x86_64 /bin/bash -c 'echo "Rosetta is working!"'
    ```

1. *(Optional)* Install **pdftk.rb**. Skipping this will cause some PDF related tests to fail.
    ```
    curl -O https://raw.githubusercontent.com/zph/homebrew-cervezas/master/pdftk.rb
    brew install ./pdftk.rb
    rm ./pdftk.rb
    ```

1. Test to see if your libarary versions are at least the following

     ```sh
     ruby --version     # --> ruby 3.1.0
     node --version     # --> v20.18.3
     git-lfs --version  #  >= git-lfs/3.0
     uv --version       #  >= 0.5.8
     ```

1. `git lfs pull`

1. `bundle config --local without staging test production levelbuilder`
    - This step prevents installation of gems that are not needed for local development, some of which can break during the next step.
    
1. `bundle install`
    - This step often fails to due environment-specific issues. Look in the [Bundle Install Tips](#bundle-install-tips) section below for steps to resolve many common issues.

1. `cp locals.yml.default locals.yml` (❗❗NOTE: this command should only be executed once, as it overrides `locals.yml`❗❗)
    - This step is necessary to enable javascript builds. It also provides further options for customizing your local environment.
    - For external contributors without AWS access, make sure the contents of `locals.yml` (after executing the `cp` command) include the following:
    ```
    slack_bot_token: localoverride
pardot_private_key: localoverride
openai_student_learning_api_key: localoverride
openai_measures_of_learning_api_key: localoverride
devinternal_db_writer: localoverride
applications_gsheet_key: localoverride
eir_teacher_enrollments_gsheet_key: localoverride
javabuilder_private_key: localoverride
javabuilder_key_password: localoverride
redshift_host: localoverride
redshift_password: localoverride
redshift_username: localoverride
google_gemini_ai_chat_lab_api_key: localoverride
google_gemini_ai_tutor_api_key: localoverride
dashboard_enable_pegasus: true
build_apps: true
use_my_apps: true
properties_encryption_key: ""
aws_s3_emulated: true

    ```


1. `bundle exec rake package:apps:symlink`
    - Another step necessary to enable javascript builds.

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

1. (Technically optional) fix your database timezone to match our servers
    - `bin/mysql-client-admin`
    - `SET GLOBAL time_zone = '+00:00';` Set time zone for all new database connections
    - `SET PERSIST time_zone = '+00:00';` Save the setting to the mysqld-auto.cnf file which is read on restart
    - `SELECT @@global.time_zone;` Verify the setting

1. `bundle exec rake build`
    - This may fail for external contributors who don't have permissions to access Code.org AWS Secrets. Assign placeholder values to any configuration settings that are [ordinarily populated in Development environments from AWS Secrets](https://github.com/code-dot-org/code-dot-org/blob/staging/config/development.yml.erb) as indicated in this example: https://github.com/code-dot-org/code-dot-org/blob/5b3baed4a9c2e7226441ca4492a3bca23a4d7226/locals.yml.default#L136-L139. Most of this work should've already been taken care of in the code snippet provided in step 18.
