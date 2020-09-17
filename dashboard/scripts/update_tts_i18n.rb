#!/usr/bin/env ruby
require_relative('../config/environment')
require 'cdo/properties'

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

def update_level_tts_i18n(level, script=nil)
  # Short Instructions

  translated_text = level.tts_short_instructions_text
  english_text = TextToSpeech.sanitize(level.short_instructions || "")

  if translated_text.present? && text_translated?(translated_text, english_text)
    level.tts_upload_to_s3(translated_text)
  end

  # Long Instructions

  unless script && (script.csf_international? || script.twenty_hour?)
    translated_text = level.tts_long_instructions_text
    english_text = TextToSpeech.sanitize(level.long_instructions || "")

    if translated_text.present? && text_translated?(translated_text, english_text)
      level.tts_upload_to_s3(translated_text)
    end
  end

  # Authored Hints

  return unless level.localized_authored_hints
  translated_hints = JSON.parse(level.localized_authored_hints)
  english_hints = JSON.parse(level.authored_hints)

  translated_hints.zip(english_hints).each do |translated_hint, english_hint|
    translated_text = TextToSpeech.sanitize(translated_hint["hint_markdown"])
    english_text = TextToSpeech.sanitize(english_hint["hint_markdown"])

    if translated_text.present? && text_translated?(translated_text, english_text)
      level.tts_upload_to_s3(translated_text)
    end
  end
end

def main
  k1_scripts = Script.all.select(&:text_to_speech_enabled?)
  TextToSpeech::VOICES.keys.each do |lang|
    next if lang == :'en-US'

    I18n.locale = lang
    puts "updating text-to-speech for #{I18n.locale}"
    k1_scripts.each do |script|
      script.levels.each do |level|
        next unless level.is_a?(Blockly)
        update_level_tts_i18n(level, script)
      end
    end
  end
end

main if __FILE__ == $0
