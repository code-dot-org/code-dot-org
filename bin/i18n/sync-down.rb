#!/usr/bin/env ruby

# Downloads all translations from Crowdin Code.org, Code.org-Markdown, and
# Hourofcode projects to i18n/locales.
# https://crowdin.com/project/codeorg

require_relative 'i18n_script_utils'

def sync_down
  puts "Beginning sync down"

  CROWDIN_PROJECTS.each do |name, options|
    puts "Downloading translations from #{name} project"
    system "crowdin --config #{options[:config_file]} --identity #{options[:identity_file]} download translations"
  end

  puts "Sync down complete"
end

sync_down if __FILE__ == $0
