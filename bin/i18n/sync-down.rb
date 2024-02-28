#!/usr/bin/env ruby

# Downloads all translations from Crowdin Code.org, Code.org-Markdown, and
# Hourofcode projects to i18n/locales.
# https://crowdin.com/project/codeorg

require_relative 'metrics'
require_relative 'i18n_script_utils'

Dir[File.expand_path('../resources/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  class SyncDown
    def self.parse_options
      I18n::Utils::SyncDownBase.parse_options
    end

    # Sync-down all i18n resources.
    #
    # @param [Hash] opts
    # @option opts [true, false] :testing Whether to run in testing mode
    # @return [void]
    def self.perform(opts = parse_options)
      I18nScriptUtils.with_synchronous_stdout do
        puts "Sync down starting"

        I18n::Resources::Apps.sync_down(**opts)
        I18n::Resources::Dashboard.sync_down(**opts)
        I18n::Resources::Pegasus.sync_down(**opts)

        I18n::Metrics.report_status(true, 'sync-down', 'Sync down completed successfully')
        puts "Sync down completed successfully"
      rescue => exception
        I18n::Metrics.report_status(false, 'sync-down', "Sync down failed from the error: #{exception}")
        puts "Sync down failed from the error: #{exception}"
        raise exception
      end
    end
  end
end

I18n::SyncDown.perform if __FILE__ == $0
