#!/usr/bin/env ruby

# Uploads English source files to Crowdin for all our projects:
# 1. from i18n/locales/source to Code.org project
# 2. from pegasus/sites.v3/code.org/public to Code.org - Markdown project
# 3. from i18n/locales/source/hourofcode to Hourofcode project

require_relative 'i18n_script_utils'

def sync_up
  system "crowdin --config #{CODEORG_CONFIG_FILE} --identity #{CODEORG_IDENTITY_FILE} upload sources"
  system "crowdin --config #{CODEORG_MARKDOWN_CONFIG_FILE} --identity #{CODEORG_MARKDOWN_IDENTITY_FILE} upload sources"
  system "crowdin --config #{HOUROFCODE_CONFIG_FILE} --identity #{HOUROFCODE_IDENTITY_FILE} upload sources"
end

sync_up if __FILE__ == $0
