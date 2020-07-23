#!/usr/bin/env ruby

# Applies redaction to strings that were translated before we started redacting
# the source strings.

require File.expand_path('../../../../pegasus/src/env', __FILE__)
require 'cdo/languages'

require_relative '../i18n_script_utils'
require_relative '../sync-codeorg-in'

CLEAR = "\r\033[K"
CODEORG_CONFIG_FILE = CROWDIN_PROJECTS["codeorg"][:config_file]
CODEORG_IDENTITY_FILE = CROWDIN_PROJECTS["codeorg"][:identity_file]

def download_translations(locale)
  system "crowdin --config #{CODEORG_CONFIG_FILE} --identity #{CODEORG_IDENTITY_FILE} -l #{locale} download translations"
end

def redact_translations(locale, language)
  Dir.glob("i18n/locales/#{language}/course_content/**/*.json").each do |source_path|
    redact_level_file(source_path)
  end
end

def upload_translations(locale)
  system "crowdin --config #{CODEORG_CONFIG_FILE} --identity #{CODEORG_IDENTITY_FILE} -l #{locale} upload translations"
end

Languages.get_crowdin_name_and_locale.each do |prop|
  locale = prop[:locale_s]
  language = prop[:crowdin_name_s]
  print "#{CLEAR}Redacting #{locale}"
  $stdout.flush
  download_translations(locale)
  redact_translations(locale, language)
  upload_translations(locale)
end
