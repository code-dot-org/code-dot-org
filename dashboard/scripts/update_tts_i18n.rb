#!/usr/bin/env ruby
require_relative('../config/environment')
require 'cdo/properties'

ENABLED_LANGUAGES = [:'es-ES', :'it-IT', :'pt-BR'].freeze
k1_scripts = Script.all.select(&:text_to_speech_enabled?)

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

      # Instructions

      translated_text = TextToSpeech.sanitize(level.localized_instructions || "")
      english_text = TextToSpeech.sanitize(level.instructions || "")

      if text_translated?(translated_text, english_text)
        level.tts_upload_to_s3(translated_text)
      end

      # Authored Hints

      next unless level.localized_authored_hints
      translated_hints = JSON.parse(level.localized_authored_hints)
      english_hints = JSON.parse(level.authored_hints)

      translated_hints.zip(english_hints).each do |translated_hint, english_hint|
        translated_text = TextToSpeech.sanitize(translated_hint["hint_markdown"])
        english_text = TextToSpeech.sanitize(english_hint["hint_markdown"])

        if text_translated?(translated_text, english_text)
          level.tts_upload_to_s3(translated_text)
        end
      end
    end
  end
end
