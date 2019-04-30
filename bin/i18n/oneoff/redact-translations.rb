#!/usr/bin/env ruby

# Applies redaction to strings that were translated before we started redacting
# the source strings.

require File.expand_path('../../../../pegasus/src/env', __FILE__)
require 'cdo/languages'
require 'fileutils'
require 'json'
require 'yaml'
require 'tempfile'

require_relative '../i18n_script_utils'

FILES_TO_REDACT = [
  "dashboard/long_instructions.yml",
  "dashboard/short_instructions.yml",
  "dashboard/authored_hints.yml"
]

def redact_translations
  FILES_TO_REDACT.each do |file|
    Languages.get_locale.each do |prop|
      locale = prop[:locale_s]
      source = "i18n/locales/#{locale}/#{file}"
      redact(source, source, nil)
      #puts source
    end
  end
end

redact_translations if __FILE__ == $0
