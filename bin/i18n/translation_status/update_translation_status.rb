#!/usr/bin/env ruby
require_relative '../../cron/only_one'
abort 'Script already running' unless only_one_running?(__FILE__)

require_relative './translation_status_service'
# This script is scheduled to run regularly on the i18n-dev server.
I18n::TranslationStatus::Updater.new.update_translation_status(90)
