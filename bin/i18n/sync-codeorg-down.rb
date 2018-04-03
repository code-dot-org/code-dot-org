#!/usr/bin/env ruby

# Downloads all translations from Crowdin Code.org
# project to i18n/locales.
# https://crowdin.com/project/codeorg

require_relative 'i18n_script_utils'

def sync_down
  exec "crowdin --config #{CODEORG_CONFIG_FILE} --identity #{CODEORG_IDENTITY_FILE} download"
end

sync_down if __FILE__ == $0
