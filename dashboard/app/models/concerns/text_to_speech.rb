require 'json'
require 'acapela'
require 'net/http'
require 'uri'
require 'redcarpet'
require 'redcarpet/render_strip'

TTS_BUCKET = 'cdo-tts'.freeze

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

TTSSafeRenderer = Redcarpet::Markdown.new(TTSSafe)

TTSSafeScrubber = Rails::Html::TargetScrubber.new
TTSSafeScrubber.tags = ['xml']

module TextToSpeech
  extend ActiveSupport::Concern

  VOICES = {
    'en-US': {
      VOICE: 'sharon22k',
      SPEED: 180,
      SHAPE: 100
    },
    'es-ES': {
      VOICE: 'ines22k',
      SPEED: 180,
      SHAPE: 100,
    },
    'es-MX': {
      VOICE: 'rosa22k',
      SPEED: 180,
      SHAPE: 100,
    },
    'it-IT': {
      VOICE: 'vittorio22k',
      SPEED: 180,
      SHAPE: 100,
    },
    'pt-BR': {
      VOICE: 'marcia22k',
      SPEED: 180,
      SHAPE: 100,
    }
  }.freeze

  # TODO: this concern actually depends on the SerializedProperties
  # concern ... I'm not sure how best to deal with that.

  included do
    before_save :tts_update

    serialized_attrs %w(
      tts_short_instructions_override
      tts_long_instructions_override
    )
  end

  def self.locale_supported?(locale)
    VOICES.key?(locale)
  end

  def self.localized_voice
    # Use localized voice if we have a setting for the current locale;
    # default to English otherwise.
    loc = TextToSpeech.locale_supported?(I18n.locale) ? I18n.locale : :'en-US'
    VOICES[loc]
  end

  def self.tts_upload_to_s3(text, filename, context = nil)
    return if text.blank?
    return if CDO.acapela_login.blank? || CDO.acapela_storage_app.blank? || CDO.acapela_storage_password.blank?
    return if AWS::S3.cached_exists_in_bucket?(TTS_BUCKET, filename)

    loc_voice = TextToSpeech.localized_voice
    url = Acapela.text_to_audio_url(text, loc_voice[:VOICE], loc_voice[:SPEED], loc_voice[:SHAPE], context)
    return if url.nil?
    uri = URI.parse(url)
    Net::HTTP.start(uri.host) do |http|
      resp = http.get(uri.path)
      AWS::S3.upload_to_bucket(TTS_BUCKET, filename, resp.body, no_random: true)
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
    text = Loofah.fragment(text).scrub!(TTSSafeScrubber).scrub!(:prune).to_s
    TTSSafeRenderer.render(text)
  end

  def tts_upload_to_s3(text, context = nil)
    filename = tts_path(text)
    TextToSpeech.tts_upload_to_s3(text, filename, context)
  end

  # Returns the URL where the TTS audio file can be downloaded for the given text and locale
  # @param text [String] The text which is being read aloud in the TTS file.
  # @param locale [Symbol] The locale of the language being spoken e.g. :'en-US', :'es-MX'
  # @return [String] URL where the TTS audio file can be downloaded from. `nil` is returned if any of
  # the params are blank or if TTS is not supported for the given locale.
  def tts_url(text, locale = I18n.locale)
    return nil unless TextToSpeech.locale_supported?(locale) && text.present?
    "https://tts.code.org/#{tts_path(text)}"
  end

  def tts_path(text)
    content_hash = Digest::MD5.hexdigest(text)
    loc_voice = TextToSpeech.localized_voice
    "#{loc_voice[:VOICE]}/#{loc_voice[:SPEED]}/#{loc_voice[:SHAPE]}/#{content_hash}/#{name}.mp3"
  end

  def tts_should_update(property, update_all = false)
    changed = property_changed?(property)
    (changed || update_all) && Policies::LevelFiles.write_to_file?(self) && published
  end

  def tts_short_instructions_text
    if I18n.locale == I18n.default_locale
      # We still have to try localized instructions here for the
      # levels.js-defined levels
      tts_short_instructions_override || TextToSpeech.sanitize(short_instructions || try(:localized_short_instructions)) || ""
    else
      TextToSpeech.sanitize(try(:localized_short_instructions) || "")
    end
  end

  def tts_should_update_short_instructions?(update_all = false)
    relevant_property = tts_short_instructions_override ? 'tts_short_instructions_override' : 'short_instructions'
    return tts_should_update(relevant_property, update_all)
  end

  def tts_long_instructions_text
    # Instructions content priority:
    #
    # 1. manual override if it exists (English only)
    # 2. contained level content if it exists
    # 3. instructions content
    if tts_long_instructions_override && I18n.locale == I18n.default_locale
      tts_long_instructions_override
    elsif contained_level_text = tts_for_contained_level
      TextToSpeech.sanitize(contained_level_text)
    else
      TextToSpeech.sanitize(try(:localized_long_instructions) || long_instructions || "")
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

  def tts_should_update_long_instructions?(update_all = false)
    # Long instruction audio should be updated if the relevant long
    # instructions property on the level itself was updated, or if the levels
    # contained by this level were updated (since we treat contained level
    # content as long instructions for TTS purposes)
    relevant_property = tts_long_instructions_override ? 'tts_long_instructions_override' : 'long_instructions'
    return tts_should_update(relevant_property, update_all) || tts_should_update('contained_level_names', update_all)
  end

  def tts_authored_hints_texts
    JSON.parse(authored_hints || '[]').map do |hint|
      TextToSpeech.sanitize(hint["hint_markdown"])
    end
  end

  def tts_update(update_all = false)
    context = 'update_level'
    tts_upload_to_s3(tts_short_instructions_text, context) if tts_should_update_short_instructions?(update_all)

    tts_upload_to_s3(tts_long_instructions_text, context) if tts_should_update_long_instructions?(update_all)

    if authored_hints && (tts_should_update('authored_hints', update_all))
      hints = JSON.parse(authored_hints)
      hints.each do |hint|
        text = TextToSpeech.sanitize(hint["hint_markdown"])
        tts_upload_to_s3(text, context)
        hint["tts_url"] = tts_url(text)
      end
      self.authored_hints = JSON.dump(hints)
    end

    # if this level is contained in another level, updating it should also
    # trigger updates in its parents, since their content is likely at least
    # partially based on this
    parent_levels.contained.each do |containing_level|
      containing_level.tts_upload_to_s3(containing_level.tts_long_instructions_text, context)
    end
  end
end
