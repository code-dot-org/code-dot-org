require 'json'
require 'redcarpet'
require 'redcarpet/render_strip'

class TTSSafe < Redcarpet::Render::StripDown
  def block_code(code, language)
    ''
  end

  def block_html(raw_html)
    ''
  end

  def raw_html(raw_html)
    ''
  end

  def link(link, title, content)
    ''
  end

  def image(link, title, alt_text)
    ''
  end
end

module TextToSpeech
  extend ActiveSupport::Concern

  TTS_BUCKET = 'cdo-tts'.freeze
  UPDATED_TTS_PATH_DCDO_KEY = 'updated_tts_path'.freeze

  # Pull the VOICES out of the SharedConstants (updating the locale keys to
  # match the expectation of the I18n gem since these locale keys are using
  # the JavaScript i18n expectations)
  VOICES = SharedConstants::VOICES.transform_keys do |locale|
    return locale unless locale.to_s.include?('_')
    lang, country = locale.to_s.split('_')
    :"#{lang}-#{country.upcase}"
  end.freeze

  included do
    # We require the SerializedProperties to be included first
    unless respond_to? :serialized_attrs
      raise "Module must include SerializedProperties before TextToSpeech"
    end

    before_save :refresh_authored_hint_tts_urls

    serialized_attrs %w(
      tts_short_instructions_override
      tts_long_instructions_override
    )
  end

  def self.tts_safe_renderer
    @@tts_safe_renderer ||= Redcarpet::Markdown.new(TTSSafe)
  end

  def self.tts_safe_scrubber
    @@tts_safe_scrubber ||= Rails::Html::TargetScrubber.new.tap do |scrubber|
      scrubber.tags = ['xml']
    end
  end

  def self.locale_supported?(locale)
    VOICES.key?(locale.to_sym)
  end

  def self.localized_voice(locale: I18n.locale)
    # Use localized voice if we have a setting for the current locale;
    # default to English otherwise.
    loc = TextToSpeech.locale_supported?(locale) ? locale.to_sym : :'en-US'
    VOICES[loc]
  end

  def self.tts_path(text, name, locale: I18n.locale)
    content_md5 = Digest::MD5.hexdigest(text)
    content_sha = Digest::SHA256.hexdigest(text)
    loc_voice = TextToSpeech.localized_voice(locale: locale)

    # Determine the location based on the experiment enabled
    use_new_path = DCDO.get(UPDATED_TTS_PATH_DCDO_KEY, false)
    if use_new_path
      # New path
      "#{locale}/#{content_md5}/#{content_sha}/#{loc_voice[:VOICE]}-#{loc_voice[:SPEED]}-#{loc_voice[:SHAPE]}.mp3"
    else
      # Old path
      "#{loc_voice[:VOICE]}/#{loc_voice[:SPEED]}/#{loc_voice[:SHAPE]}/#{content_md5}/#{name}.mp3"
    end
  end

  def self.sanitize(text)
    # Use both Redcarpet and Loofah for double the cleansing action!
    # Actually, use both Redcarpet and Loofah because Redcarpet doesn't
    # recognize XML blocks as block-level HTML, so any inlined Blockly blocks
    # are treated as just a stream of raw HTML; that would normally be fine,
    # except for <title> elements which include text content; because that text
    # content is just treated as raw text, we end up including it in our final
    # render.
    #
    # To avoid this, we use a targeted Loofah scrubber to prune any XML blocks
    # and only XML blocks before passing the result through Redcarpet
    text = Loofah.fragment(text).scrub!(tts_safe_scrubber).scrub!(:prune).to_s
    tts_safe_renderer.render(text)
  end

  # Returns the URL where the TTS audio file can be downloaded for the given text and locale
  # @param text [String] The text which is being read aloud in the TTS file.
  # @param locale [Symbol] The locale of the language being spoken e.g. :'en-US', :'es-MX'
  # @return [String] URL where the TTS audio file can be downloaded from. `nil` is returned if any of
  # the params are blank or if TTS is not supported for the given locale.
  def tts_url(text, locale = I18n.locale)
    return nil unless TextToSpeech.locale_supported?(locale) && text.present?
    "https://tts.code.org/#{tts_path(text, locale: locale)}"
  end

  def tts_path(text, locale: I18n.locale)
    TextToSpeech.tts_path(text, name, locale: locale)
  end

  def tts_short_instructions_text(locale: I18n.locale)
    I18n.with_locale(locale) do
      localized_short_instructions = try(:localized_short_instructions) || ''
      return TextToSpeech.sanitize(localized_short_instructions) unless I18n.locale == I18n.default_locale

      # We still have to try localized instructions here for the levels.js-defined levels
      tts_short_instructions_override || TextToSpeech.sanitize(short_instructions || localized_short_instructions) || ''
    end
  end

  def tts_long_instructions_text(locale: I18n.locale)
    # Instructions content priority:
    #
    # 1. manual override if it exists (English only)
    # 2. contained level content if it exists
    # 3. instructions content
    I18n.with_locale(locale) do
      if tts_long_instructions_override && I18n.locale == I18n.default_locale
        tts_long_instructions_override
      elsif contained_level_text = tts_for_contained_level
        TextToSpeech.sanitize(contained_level_text)
      else
        TextToSpeech.sanitize(try(:localized_long_instructions) || long_instructions || "")
      end
    end
  end

  def tts_for_contained_level
    all_instructions = contained_levels.map do |contained|
      contained_level_text(contained)
    end
    all_instructions.empty? ? nil : all_instructions.join("\n")
  end

  def contained_level_text(contained)
    # For multi questions, create a string for TTS of the markdown, question, and answers
    if contained.long_instructions.nil?
      combined_text = []
      if contained.properties["markdown"]
        combined_text << contained.localized_property("markdown")
      end
      if contained.properties["questions"]
        contained.localized_property("questions").each do |question|
          combined_text << question["text"]
        end
      end
      if contained.properties["answers"]
        contained.localized_property("answers").each do |answer|
          combined_text << answer["text"]
        end
      end
      combined_text.join("\n")
    else
      # For free response, create a string for TTS of the instructions
      contained.try(:localized_long_instructions) || contained.long_instructions
    end
  end

  def tts_authored_hints_texts
    JSON.parse(authored_hints || '[]').map do |hint|
      TextToSpeech.sanitize(hint["hint_markdown"])
    end
  end

  def refresh_authored_hint_tts_urls
    return unless authored_hints && property_changed?('authored_hints')
    return unless Policies::LevelFiles.write_to_file?(self) && published

    hints = JSON.parse(authored_hints)
    hints.each do |hint|
      hint["tts_url"] = tts_url(TextToSpeech.sanitize(hint["hint_markdown"]))
    end
    self.authored_hints = JSON.dump(hints)
  end
end
