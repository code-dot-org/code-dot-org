#!/usr/bin/env ruby
require_relative('../config/environment')
require 'cdo/properties'

ENABLED_LANGUAGES = [:'es-ES', :'it-IT', :'pt-BR']

k1_script_names = [
  Script::COURSEA_DRAFT_NAME,
  Script::COURSEB_DRAFT_NAME,
  Script::COURSE1_NAME
]
k1_scripts = Script.where(name: k1_script_names)

def clean(value)
  if value.nil?
    return ''
  elsif value.instance_of? String
    return value.gsub(/\s+/, '')
  elsif value.instance_of? Array
    return clean(value.join(''))
  elsif value.instance_of? Hash
    return clean(value.values)
  end
end

def text_translated?(left, right)
  clean(left) != clean(right)
end

ENABLED_LANGUAGES.each do |lang|
  I18n.locale = lang
  puts "updating text-to-speech for #{I18n.locale}"
  k1_scripts.each do |script|
    script.levels.each do |level|
      next unless level.is_a?(Blockly)

      translated_text = TTSSafeRenderer.render(level.localized_instructions || "")
      english_text = TTSSafeRenderer.render(level.instructions || "")

      if text_translated?(translated_text, english_text)
        level.tts_upload_to_s3(translated_text)
      end
    end
  end
end
