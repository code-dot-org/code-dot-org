#!/usr/bin/env ruby

# Downloads all translations from Crowdin Code.org
# project to i18n/locales.
# https://crowdin.com/project/codeorg

require_relative 'i18n_script_utils'

exec "crowdin --config #{CODEORG_CONFIG_FILE} --identity #{CODEORG_IDENTITY_FILE} download"
