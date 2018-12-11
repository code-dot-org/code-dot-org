#!/usr/bin/env ruby
require_relative 'i18n_script_utils'

def sync_down
  system "crowdin --config #{CODEORG_MARKDOWN_CONFIG_FILE} --identity #{CODEORG_MARKDOWN_IDENTITY_FILE} download translations"
end

sync_down if __FILE__ == $0
