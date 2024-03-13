#!/usr/bin/env ruby

# Downloads all translations from Crowdin Code.org, Code.org-Markdown, and
# Hourofcode projects to i18n/locales.
# https://crowdin.com/project/codeorg

require 'optparse'

require_relative 'metrics'
require_relative 'i18n_script_utils'

require 'cdo/crowdin/legacy_utils'
require 'cdo/crowdin/project'

module I18n
  class SyncDown
    def self.parse_options
      options = {
        testing: I18nScriptUtils::TESTING_BY_DEFAULT,
      }

      OptionParser.new do |opts|
        opts.on('-t', '--testing', 'Run in testing mode') do
          options[:testing] = true
        end
      end.parse!

      options
    end

    def self.with_elapsed
      runtime = Benchmark.realtime {yield}
      Time.at(runtime).utc.strftime('%H:%M:%S')
    end

    # Sync-down all i18n resources.
    #
    # @param [Hash] opts
    # @option opts [true, false] :testing Whether to run in testing mode
    # @return [void]
    def self.perform(opts = parse_options)
      I18nScriptUtils.with_synchronous_stdout do
        puts "Sync down starting"
        logger = Logger.new(STDOUT)
        logger.level = Logger::INFO

        CDO.crowdin_project_test_mapping.each do |prod_project_name, test_project_name|
          name = opts[:testing] ? test_project_name : prod_project_name
          puts "Downloading translations from #{name} project"
          api_token = I18nScriptUtils.crowdin_creds['api_token']
          project_identifier = CDO.crowdin_projects.dig(name, 'id')
          project = Crowdin::Project.new(project_identifier, api_token)
          options = {
            etags_json: CDO.dir("bin/i18n/crowdin/etags/#{name}_etags.json"),
            locales_dir: CDO.dir(I18N_LOCALES_DIR),
            logger: logger
          }

          # download strings not in the regular codeorg project to
          # a specific subdirectory within the locale directory
          case name.to_s
          when "codeorg-markdown-testing", "codeorg-markdown"
            options[:locale_subdir] = "codeorg-markdown"
          when "hour-of-code-test", "hour-of-code"
            options[:locale_subdir] = "hourofcode"
          end

          utils = Crowdin::LegacyUtils.new(project, options)

          puts "Downloading changed files"
          elapsed = with_elapsed {utils.download_changed_files}
          puts "Files downloaded in #{elapsed}"
        end

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
