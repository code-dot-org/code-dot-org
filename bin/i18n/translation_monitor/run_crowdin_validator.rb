#!/usr/bin/env ruby
require_relative 'crowdin_validator'
require_relative '../../cron/only_one'
abort 'Script already running' unless only_one_running?(__FILE__)

# This script is scheduled to run regularly on the i18n-dev server.
# It uses a config file and history of last successful runs to determine
# what to process next.

CrowdinValidator.new.run_all_configs(
  config_file: CrowdinValidator::CONFIG_FILE,
  history_file: CrowdinValidator::HISTORY_FILE,
  dry_run: false,
  download_from_crowdin: true
)
