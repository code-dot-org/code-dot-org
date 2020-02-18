#!/usr/bin/env ruby

# Downloads all translations from Crowdin Code.org, Code.org-Markdown, and
# Hourofcode projects to i18n/locales.
# https://crowdin.com/project/codeorg

require_relative 'i18n_script_utils'
require 'open3'

def sync_down
  I18nScriptUtils.with_syncronous_stdout do
    puts "Beginning sync down"

    CROWDIN_PROJECTS.each do |name, options|
      puts "Downloading translations from #{name} project"
      command = "crowdin --config #{options[:config_file]} --identity #{options[:identity_file]} download translations"

      # Filter the output because the crowdin translation download is _super_
      # verbose; it includes not only a progress spinner, but also information
      # about each individual file downloaded in each individual language.
      #
      # We really only care about general progress monitoring, so we remove or
      # ignore any things we identify as "noise" in the output.
      Open3.popen2(command) do |_stdin, stdout, status_thread|
        while line = stdout.gets
          # strip out the progress spinner, which is implemented as the sequence
          # \-/| followed by a backspace character
          line.gsub!(/[\|\/\-\\][\b]/, '')

          # skip lines detailing individual file extraction
          next if line.start_with?("Extracting: ")

          # skip warning that happens if the sync is run multiple times in succession
          next if line == "Warning: Export was skipped. Please note that this method can be invoked only once per 30 minutes.\n"

          puts line
        end

        raise "Sync down failed"  unless status_thread.value.success?
      end
    end

    puts "Sync down complete"
  end
end

sync_down if __FILE__ == $0
