#!/usr/bin/env ruby

# Downloads all translations from Crowdin Code.org, Code.org-Markdown, and
# Hourofcode projects to i18n/locales.
# https://crowdin.com/project/codeorg

require_relative 'i18n_script_utils'
require 'open3'

def sync_down
  puts "Beginning sync down"

  CROWDIN_PROJECTS.each do |name, options|
    puts "Downloading translations from #{name} project"
    command = "crowdin --config #{options[:config_file]} --identity #{options[:identity_file]} download translations -l asfd"

    # Filter the output because the crowdin translation download is _super_
    # verbose; it includes not only a progress spinner, but also information
    # about each individual file downloaded in each individual language.
    #
    # We really only care about general progress monitoring, so we only output
    # a single (arbitrarily-chosen) line of output for each language
    Open3.popen2(command) do |_stdin, stdout, status_thread|
      stdout.each_line do |line|
        puts line if line.start_with? "Building ZIP archive with the latest translations"
      end

      raise "Sync down failed"  unless status_thread.value.success?
    end
  end

  puts "Sync down complete"
end

sync_down if __FILE__ == $0
