#!/usr/bin/env ruby

# Uploads English source files to Crowdin for all our projects:
# 1. from i18n/locales/source to Code.org project
# 2. from pegasus/sites.v3/code.org/public to Code.org - Markdown project
# 3. from i18n/locales/source/hourofcode to Hourofcode project

require_relative 'i18n_script_utils'

def sync_up
  puts "Beginning sync up"

  CROWDIN_PROJECTS.each do |name, options|
    puts "Uploading source strings to #{name} project"
    command = "crowdin --config #{options[:config_file]} --identity #{options[:identity_file]} upload sources"
    Open3.popen2(command) do |_stdin, stdout, status_thread|
      stdout.each_line do |line|
        # skip lines detailing individual file upload, unless that file
        # resulted in an unexpected response
        next if line.start_with?("File ") && line.end_with?("OK\n", "SKIPPED\n")

        puts line
      end

      raise "Sync up failed" unless status_thread.value.success?
    end
  end

  puts "Sync up complete"
end

sync_up if __FILE__ == $0
