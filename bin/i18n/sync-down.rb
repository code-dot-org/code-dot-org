#!/usr/bin/env ruby

# Downloads all translations from Crowdin Code.org, Code.org-Markdown, and
# Hourofcode projects to i18n/locales.
# https://crowdin.com/project/codeorg

require_relative 'i18n_script_utils'

def sync_down
  system "crowdin --config #{CODEORG_CONFIG_FILE} --identity #{CODEORG_IDENTITY_FILE} download translations"
  system "crowdin --config #{CODEORG_MARKDOWN_CONFIG_FILE} --identity #{CODEORG_MARKDOWN_IDENTITY_FILE} download translations"
  system "crowdin --config #{HOUROFCODE_CONFIG_FILE} --identity #{HOUROFCODE_IDENTITY_FILE} download translations"
end

sync_down if __FILE__ == $0
