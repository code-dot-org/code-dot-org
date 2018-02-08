#!/usr/bin/env ruby

# Uploads all English source files from i18n/locales/source
# to Code.org project on Crowdin for translation.
# https://crowdin.com/project/codeorg

require_relative 'i18n_script_utils'

exec "crowdin --config #{CODEORG_CONFIG_FILE} --identity #{CODEORG_IDENTITY_FILE} upload sources"
