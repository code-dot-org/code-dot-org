#!/usr/bin/env ruby

# Pulls in all strings that need to be translated. Pulls source
# files from blockly-core, apps, pegasus, and dashboard
# as well as instructions for levelbuilder supported levels and
# collects them to the single source folder i18n/locales/source.

require_relative 'metrics'

Dir[File.expand_path('../resources/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module SyncIn
    def self.perform
      puts "Sync in starting"
      I18n::Metrics.report_runtime('Apps', 'in') {I18n::Resources::Apps.sync_in}
      I18n::Metrics.report_runtime('Dashboard', 'in') {I18n::Resources::Dashboard.sync_in}
      I18n::Metrics.report_runtime('Pegasus', 'in') {I18n::Resources::Pegasus.sync_in}
      I18n::Metrics.report_success(true, 'in', 'sync-in')
      puts "Sync in completed successfully"
    rescue => exception
      I18n::Metrics.report_success(false, 'in', 'sync-in', "Sync in failed from the error: #{exception}")
      puts "Sync in failed from the error: #{exception}"
      raise exception
    end
  end
end

I18n::SyncIn.perform if __FILE__ == $0
