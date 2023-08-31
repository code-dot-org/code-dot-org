#!/usr/bin/env ruby

# Uploads English source files to Crowdin for all our projects:
# 1. from i18n/locales/source to Code.org project
# 2. from pegasus/sites.v3/code.org/public to Code.org - Markdown project
# 3. from i18n/locales/source/hourofcode to Hourofcode project
# 4. from i18n/locales/source/**/restricted.yml to Code.org - Restricted project

require_relative 'i18n_script_utils'

def sync_up
  I18nScriptUtils.with_synchronous_stdout do
    puts "Sync up starting"
    CROWDIN_TEST_PROJECTS.each do |name, options|
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

    puts "Sync up completed successfully"
  rescue => exception
    puts "Sync up failed from the error: #{exception}"
    raise exception
  end
end

sync_up if __FILE__ == $0
