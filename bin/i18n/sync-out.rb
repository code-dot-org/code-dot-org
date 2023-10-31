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
      clean_up_sync_out(CROWDIN_PROJECTS)
      I18n::Metrics.report_status(true, 'sync-out', 'Sync out completed successfully')
      puts "Sync out completed successfully"
    rescue => exception
      I18n::Metrics.report_status(false, 'sync-out', "Sync out failed from the error: #{exception}")
      puts "Sync out failed from the error: #{exception}"
      raise exception
    end

    # Cleans up any files the sync-out is responsible for managing. When this function is done running,
    # the locale filesystem should be ready for a new i18n-sync cycle.
    # @param projects [Hash] The Crowdin project configurations used by the i18n-sync.
    def self.clean_up_sync_out(projects)
      # Cycle through each project and move temp files to /tmp/i18n-sync
      projects.each do |_project_identifier, project_options|
        # Move *_files_to_sync_out.json to /tmp/i18n-sync/ because these files have been successfully
        # synced and we don't want the next i18n-sync-out to redistribute the files.
        files_to_sync_out_path = project_options[:files_to_sync_out_json]
        if File.exist?(files_to_sync_out_path)
          i18n_sync_tmp_dir = '/tmp/i18n-sync'
          FileUtils.mkdir_p(i18n_sync_tmp_dir)
          puts "Backing up temp file #{files_to_sync_out_path} to #{i18n_sync_tmp_dir}"
          FileUtils.mv(files_to_sync_out_path, i18n_sync_tmp_dir)
        else
          # This will happen if a sync-down hasn't happened since the last successful sync-out.
          puts "No temp file #{files_to_sync_out_path} found to backup."
        end
      end
    end
  end
end

I18n::SyncOut.perform if __FILE__ == $0
