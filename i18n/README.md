# Code.org Community Internationalization

Code.org's various projects are translated by volunteers using Crowdin. For more information about our translation process, please visit [code.org/translate](http://code.org/translate). Join our [Code.org project]() on Crowdin to start translating immediately!

This project provides scripts for centralizing source assets to be localized, synchronizing with Crowdin, and then re-integrated the localized assets back in to their respective projects.

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
5. `./out.sh` Move translated files out to each subproject
6. Commit and push all translations
```bash
git add .
git commit -m "code.org translations mm/dd" # use today's date
git push
```

### Steps for Hour of Code Project
1. `cd code-dot-org/i18n/hourofcode.com`
2. `./sync.rb`

### Steps for Curriculum Project
1. `cd code-dot-org/i18n/curriculum`
2. `./sync.rb`

## Adding a new string

### Pegasus

1. Add a unique key and your string value to the [i18n Gsheet](https://docs.google.com/a/code.org/spreadsheet/ccc?key=0AuZfRa__4CAYdHhObnJqQkViMUx0cGpESHc3VWtDUXc&usp=sharing). NOTE: Make sure your string value only has plain HTML. Organization is by category/page; try to prepend each string of a common category with the same key. For example, all teacher dashboard strings begin with 'dashboard'
2. `ssh staging.code.org` and check that your changes were synced to `staging/pegasus/cache/i18n/en-US.yml`
3. Commit and push en-US.yml
4. On your development environment, pull staging branch and do the following to sync the string for all locales.
```bash
cd i18n/code.org
./sync-pegasus.sh
```
5. Commit and push all locale files (i18n/locales and pegasus/cache/i18n)
```bash
git add .
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


## Common Issues

If you see an error similar to the following:
```
/Users/brent/.rbenv/versions/2.0.0-p247/lib/ruby/gems/2.0.0/gems/json-1.8.1/lib/json/common.rb:155:in `encode': "\xC3" on US-ASCII (Encoding::InvalidByteSequenceError)
```
check the values of environment variables LANG and LC_ALL.  On my MacBook this only seemed to work when these values were not set.  On my Linux machine, this only seemed to work when these were set to LINUX=en_US.UTF-8 and LC_ALL=POSIX
