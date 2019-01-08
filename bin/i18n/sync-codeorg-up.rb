#!/usr/bin/env ruby

# Uploads all English source files from i18n/locales/source to Code.org
# project, and all source files from pegasus/sites.v3/code.org/public to
# Code.org - Markdown project on Crowdin.
# https://crowdin.com/project/codeorg

require_relative 'i18n_script_utils'

def sync_up
  system "crowdin --config #{CODEORG_CONFIG_FILE} --identity #{CODEORG_IDENTITY_FILE} upload sources"
  system "crowdin --config #{CODEORG_MARKDOWN_CONFIG_FILE} --identity #{CODEORG_MARKDOWN_IDENTITY_FILE} upload sources"
end

sync_up if __FILE__ == $0
