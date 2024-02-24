#!/usr/bin/env ruby

# Uploads English source files to Crowdin for all our projects:
# 1. from i18n/locales/source to Code.org project
# 2. from pegasus/sites.v3/code.org/public to Code.org - Markdown project
# 3. from i18n/locales/source/hourofcode to Hourofcode project
# 4. from i18n/locales/source/**/restricted.yml to Code.org - Restricted project

require_relative 'metrics'

Dir[File.expand_path('../resources/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  class SyncUp
    def self.parse_options
      I18n::Utils::SyncUpBase.parse_options
    end

    # Sync-up all i18n resources.
    #
    # @param [Hash] opts
    # @option opts [true, false] :testing Whether to run in testing mode
    # @return [void]
    def self.perform(opts = parse_options)
      I18nScriptUtils.with_synchronous_stdout do
        puts 'Sync up starting'

        I18n::Resources::Apps.sync_up(**opts)
        I18n::Resources::Dashboard.sync_up(**opts)
        I18n::Resources::Pegasus.sync_up(**opts)

        I18n::Metrics.report_status(true, 'sync-up', 'Sync up completed successfully')
        puts 'Sync up completed successfully'
      rescue => exception
        I18n::Metrics.report_status(false, 'sync-up', "Sync up failed from the error: #{exception}")
        puts "Sync up failed from the error: #{exception}"
        raise exception
      end
    end
  end
end

I18n::SyncUp.perform if __FILE__ == $0
