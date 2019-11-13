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
    system "crowdin --config #{options[:config_file]} --identity #{options[:identity_file]} upload sources"
  end

  puts "Sync up complete"
end

sync_up if __FILE__ == $0
