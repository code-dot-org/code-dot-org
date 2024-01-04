#!/usr/bin/env ruby

# Uploads English source files to Crowdin for all our projects:
# 1. from i18n/locales/source to Code.org project
# 2. from pegasus/sites.v3/code.org/public to Code.org - Markdown project
# 3. from i18n/locales/source/hourofcode to Hourofcode project
# 4. from i18n/locales/source/**/restricted.yml to Code.org - Restricted project

require_relative 'metrics'
require_relative 'i18n_script_utils'

Dir[File.expand_path('../resources/*.rb', __FILE__)].sort.each {|file| require file}

# The sync-up uses crowdin-cli to upload source strings to Crowdin projects. Crowdin-cli takes a config file and
# an identity file as arguments. Within the config file, the base_path, the path to the source strings to be uploaded,
# can be specified from the environment variables. We set I18N_SOURCE_DIR as an environment variable so it can be
# globally changed for all Crowdin projects.
ENV['I18N_SOURCE_DIR'] = CDO.dir(I18N_SOURCE_DIR)

EXCLUDED_PROJECTS = %i[codeorg-restricted codeorg-restricted-test].freeze

def sync_up
  I18nScriptUtils.with_synchronous_stdout do
    puts "Sync up starting"

    I18n::Resources::Apps.sync_up
    I18n::Resources::Dashboard.sync_up

    CROWDIN_PROJECTS.each do |name, options|
      next if EXCLUDED_PROJECTS.include?(name)

      puts "Uploading source strings to #{name} project"
      command = "crowdin upload sources --config #{options[:config_file]} --identity #{options[:identity_file]}"
      Open3.popen2(command) do |_stdin, stdout, status_thread|
        while line = stdout.gets
          # skip lines detailing individual file upload, unless that file
          # resulted in an unexpected response
          next if line.start_with?("✔️  File")

          puts line
        end

        raise "Sync up failed" unless status_thread.value.success?
      end
    end

    I18n::Metrics.report_status(true, 'sync-up', 'Sync up completed successfully')
    puts "Sync up completed successfully"
  rescue => exception
    I18n::Metrics.report_status(false, 'sync-up', "Sync up failed from the error: #{exception}")
    puts "Sync up failed from the error: #{exception}"
    raise exception
  end
end

sync_up if __FILE__ == $0
