#!/usr/bin/env ruby

# Downloads all translations from Crowdin Code.org, Code.org-Markdown, and
# Hourofcode projects to i18n/locales.
# https://crowdin.com/project/codeorg

require_relative 'i18n_script_utils'

require 'cdo/crowdin/legacy_utils'
require 'cdo/crowdin/project'

def with_elapsed
  before = Time.now
  yield
  after = Time.now
  return Time.at(after - before).utc.strftime('%H:%M:%S')
end

def sync_down
  I18nScriptUtils.with_synchronous_stdout do
    puts "Sync down starting"
    logger = Logger.new(STDOUT)
    logger.level = Logger::INFO

    CROWDIN_PROJECTS.each do |name, options|
      puts "Downloading translations from #{name} project"
      api_key = YAML.load_file(options[:identity_file])["api_key"]
      project_identifier = YAML.load_file(options[:config_file])["project_identifier"]
      project = Crowdin::Project.new(project_identifier, api_key)
      options = {
        etags_json: options[:etags_json],
        files_to_sync_out_json: options[:files_to_sync_out_json],
        locales_dir: File.join(I18N_SOURCE_DIR, '..'),
        logger: logger
      }

      # download strings not in the regular codeorg project to
      # a specific subdirectory within the locale directory
      case name.to_s
      when "codeorg-markdown"
        options[:locale_subdir] = "codeorg-markdown"
      when "hour-of-code"
        options[:locale_subdir] = "hourofcode"
      end

      utils = Crowdin::LegacyUtils.new(project, options)

      puts "Fetching list of changed files"
      elapsed = with_elapsed {utils.fetch_changes}
      puts "Changes fetched in #{elapsed}"
      puts "Downloading changed files"
      elapsed = with_elapsed {utils.download_changed_files}
      puts "Files downloaded in #{elapsed}"
    end

    puts "Sync down completed successfully"
  rescue => e
    puts "Sync down failed from the error: #{e}"
    raise e
  end
end

sync_down if __FILE__ == $0
