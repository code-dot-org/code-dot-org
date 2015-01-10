# Code.org Community Internationalization

Code.org's various projects are translated by volunteers using Crowdin. For more information about our translation process, please visit [code.org/translate](http://code.org/translate). Join our [Code.org project](https://crowdin.com/project/codeorg/invite) on Crowdin to start translating immediately!

This project provides scripts for centralizing source assets to be localized, synchronizing with Crowdin, and then re-integrating the localized assets back in to their respective projects.

## Set Up

### Install crowdin-cli

`gem install crowdin-cli`

### Initialize config with API Key:

TODO: how to use Chef to update crowdin.yaml with API Key

## Syncing Translations

### Steps for Code.org Project

1. `cd i18n/code.org`
2. `./in.sh` Gather files from each subproject and store them in ../locales/en-US
3. `./up.sh` Upload new and updated strings to Crowdin
4. `./down.sh` Download latest translations from Crowdin. NOTE: You might not see output for a few minutes while Crowdin builds.
5. `./out.sh` Move translated files out to each subproject. NOTE: This takes a while too.
6. Commit and push all translations
```bash
git commit -m "code.org translations mm/dd" # use today's date
git push
```

### Steps for Hour of Code Project
1. `cd code-dot-org/i18n/hourofcode.com`
2. `./sync.rb`

### Steps for Curriculum Project
1. `cd code-dot-org/i18n/curriculum`
2. `./sync.rb`

## Modifying/Adding a new string

### Pegasus

#### Modifying
1. Update the string in the [i18n Gsheet](https://docs.google.com/a/code.org/spreadsheet/ccc?key=0AuZfRa__4CAYdHhObnJqQkViMUx0cGpESHc3VWtDUXc&usp=sharing)
2. `ssh staging.code.org` and check that your changes were synced to `staging/pegasus/cache/i18n/en-US.yml`
3. Commit and push `en-US.yml`

#### Adding
1. Add a unique key and your string value to the [i18n Gsheet](https://docs.google.com/a/code.org/spreadsheet/ccc?key=0AuZfRa__4CAYdHhObnJqQkViMUx0cGpESHc3VWtDUXc&usp=sharing). NOTE: Make sure your string value only has plain HTML. Organization is by category/page; try to prepend each string of a common category with the same key. For example, all teacher dashboard strings begin with 'dashboard'
2. `ssh staging.code.org` and check that your changes were synced to `staging/pegasus/cache/i18n/en-US.yml`
3. Commit and push `en-US.yml` NOTE: If you see that it switched from "en-US" to en-US, it's OK to commit.
```bash
@@ -1,4 +1,4 @@
-"en-US":
+en-US:
```
4. On your development environment, pull staging branch and do the following to sync the string for all locales.
```bash
cd i18n/code.org
./sync-pegasus.sh
```
5. Commit and push all locale files
```bash
git commit -m "new pegasus string XYZ"
git push
```

### Blockly-core
1. Make changes in `blockly-core/i18n/en-US/core.json`                                                                
2. Run: `i18n/codeorg-messages.sh && cp msg/js/en_us.js ../blockly/lib/blockly/ && cd ../blockly && grunt build && cd -`
3. Check in the resulting changes in the files:
  * `blockly-core/i18n/locales/en-US/core.json`
  * `blockly-core/msg/js/en_us.js`
  * `blockly/lib/blockly/en_us.js`

[Example changelist adding a new string.](https://github.com/code-dot-org/code-dot-org/commit/d7fa8719bef9ec2e46ab2f6c91f722288218d517)

### Apps
1. Make changes in `apps/i18n/<app>/en_us.json`

### Dashboard
1. Make changes in `dashboard/config/locales` NOTE: Choose from the following files depending on where it best fits categorically.
* contract_match.en.yml
* data.en.yml
* devise.en.yml
* dsls.en.yml
* en.yml
* scripts.en.yml
* slides.en.yml
* text_match.en.yml
* unplugged.en.yml
2. DO NOT directly modify `match.en.yml` or `multi.en.yml` Please make changes to the levels directly in levelbuilder.

## Common Issues

If you see an error similar to the following:
```
/Users/brent/.rbenv/versions/2.0.0-p247/lib/ruby/gems/2.0.0/gems/json-1.8.1/lib/json/common.rb:155:in `encode': "\xC3" on US-ASCII (Encoding::InvalidByteSequenceError)
```
check the values of environment variables LANG and LC_ALL.  On my MacBook this only seemed to work when these values were not set.  On my Linux machine, this only seemed to work when these were set to LINUX=en_US.UTF-8 and LC_ALL=POSIX