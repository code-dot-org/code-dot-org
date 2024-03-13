#!/usr/bin/env ruby

# Distribute downloaded translations from i18n/locales
# back to blockly-core, apps, pegasus, and dashboard.

require File.expand_path('../../../dashboard/config/environment', __FILE__)
require 'cdo/languages'

require 'cdo/crowdin/legacy_utils'
require 'cdo/crowdin/project'

require 'fileutils'
require 'json'
require 'parallel'
require 'tempfile'
require 'yaml'
require 'active_support/core_ext/object/blank'

require_relative 'i18n_script_utils'
require_relative 'redact_restore_utils'
require_relative 'metrics'
require_relative 'utils/malformed_i18n_reporter'
require_relative '../animation_assets/manifest_builder'

Dir[File.expand_path('../resources/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module SyncOut
    def self.perform
      puts "Sync out starting"
      I18n::Resources::Apps.sync_out
      I18n::Resources::Dashboard.sync_out
      I18n::Resources::Pegasus.sync_out

      I18n::Metrics.report_status(true, 'sync-out', 'Sync out completed successfully')
      puts "Sync out completed successfully"
    rescue => exception
      I18n::Metrics.report_status(false, 'sync-out', "Sync out failed from the error: #{exception}")
      puts "Sync out failed from the error: #{exception}"
      raise exception
    end
  end
end

I18n::SyncOut.perform if __FILE__ == $0
