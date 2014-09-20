# Code.org Community Internationalization

Code.org's various projects are translated by the community using Crowdin.

This project provides scripts for centralizing source assets to be localized,
synchronizing with Crowdin, and then re-integrated the localized assets back
in to their respective projects.


## Set Up

### Install crowdin-cli

```bash
gem install crowdin-cli
```

### Initialize config with API Key:

If you've got the Code.org secrets files, simply run:

```bash
secrets/path/cdo-env ./init.sh
```

That will generate `crowdin.yaml` and populate it with the API key.


## Syncing with Crowdin

Full process includes four verbs: "in", "up", "down", and "out".

```bash
# Gather files from each subproject and stores them in ./locales/en-US
./in.sh

# Validate before uploading
git status locales/en-US
git diff locales/en-US
git add .
git commit

# Upload to Crowdin
./up.sh

# ... time passses ...

# Download from Crowdin
# NOTE: You might not see output for a few minutes while Crowdin builds.
./down.sh

# Validate after downloading
git status
# etc
git commit

# Move translated files out to each subproject.
./out.sh

# (Optional) update submodules for cdo-curriculum
git add projects # from cdo-curriculum directory
git commit
git push

```


## Submodules

Each project is tracked by a Git submodule in the `./projects` directory. When
adding new components, be sure to configure the correct branch in the
`./.gitmodules` file.


## Project-Specific Notes

Each project and file format has it's own idiosyncrasies that must be addressed
by the scripts in this project. Notes about these issues are collected below.

These notes are reified in code in the `./in.sh` and `./out.sh` scripts.  In
order to add a new sub-project, those scripts must be updated and a note should
be added here.

### Dashboard

- Rails-style YAML Files
- Locales in file names use `en-US` format. Note: Upper case with dash.
- Source strings use `en` language, not full `en-US` locale.
- The top-level key of the YAML is 'en'; Crowdin seems to patch this up for us.

### Blockly Mooc

- JSON files with a flat object mapping string keys to strings.
- Locales in file names use `en_us` format. Note: Lower case with underscore.

### Blockly Core

- JSON files with a flat object mapping string keys to strings.
- Files arranged in directories with full standard locale names.
- See codeorg-messages.sh in our blockly-core fork for more details.

### Pegasus

- Rails-style YAML files
- Uses full standard locale names.
- Tracks the staging branch, not master.


## Issues

If you see an error similar to the following:
```
/Users/brent/.rbenv/versions/2.0.0-p247/lib/ruby/gems/2.0.0/gems/json-1.8.1/lib/json/common.rb:155:in `encode': "\xC3" on US-ASCII (Encoding::InvalidByteSequenceError)
```
check the values of environment variables LANG and LC_ALL.  On my MacBook this only seemed to work when these values were not set.  On my Linux machine, this only seemed to work when these were set to LINUX=en_US.UTF-8 and LC_ALL=POSIX
