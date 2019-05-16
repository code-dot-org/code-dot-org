#!/usr/bin/env ruby

# Applies redaction to strings that were translated before we started redacting
# the source strings.

require File.expand_path('../../../../pegasus/src/env', __FILE__)
require 'cdo/languages'

require_relative '../i18n_script_utils'

FILES_TO_REDACT = [
  "dashboard/long_instructions.yml",
  "dashboard/short_instructions.yml",
  "dashboard/authored_hints.yml"
]

def download_translations(locale)
  system "crowdin --config #{CODEORG_CONFIG_FILE} --identity #{CODEORG_IDENTITY_FILE} -l #{locale} download translations"
end

def redact_translations(locale, language)
  FILES_TO_REDACT.each do |file|
    source = "i18n/locales/#{language}/#{file}"
    redact(source, source, nil)
  end
end

def upload_translations(locale)
  system "crowdin --config #{CODEORG_CONFIG_FILE} --identity #{CODEORG_IDENTITY_FILE} -l #{locale} upload translations"
end

Languages.get_crowdin_name_and_locale.each do |prop|
  locale = prop[:locale_s]
  language = prop[:crowdin_name_s]
  download_translations(locale)
  redact_translations(locale, language)
  upload_translations(locale)
end
