require 'json'
require 'acapela'
require 'net/http'
require 'uri'
require 'redcarpet'
require 'redcarpet/render_strip'

TTS_BUCKET = 'cdo-tts'

VOICES = {
  # british child candidate
  rosie: {
    VOICE: 'rosie22k',
    SPEED: 180,
    SHAPE: 100
  },
  # american child candidate
  ella: {
    VOICE: 'ella22k',
    SPEED: 140,
    SHAPE: 98
  },
  # american adult candidate
  sharon: {
    VOICE: 'sharon22k',
    SPEED: 180,
    SHAPE: 100
  }
}

class TTSSafe < Redcarpet::Render::StripDown
  def block_code(code, language)
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

module TextToSpeech
  extend ActiveSupport::Concern

  # TODO: this concern actually depends on the SerializedProperties
  # concern ... I'm not sure how best to deal with that.

  included do
    before_save :tts_update

    serialized_attrs %w(
      tts_instructions_override
      tts_markdown_instructions_override
    )
  end

  def self.tts_upload_to_s3(text, filename, voice=:sharon)
    return if text.blank?
    return if CDO.acapela_login.blank? || CDO.acapela_storage_app.blank? || CDO.acapela_storage_password.blank?
    return if AWS::S3.exists_in_bucket(TTS_BUCKET, filename)

    url = acapela_text_to_audio_url(text, VOICES[voice][:VOICE], VOICES[voice][:SPEED], VOICES[voice][:SHAPE])
    return if url.nil?
    uri = URI.parse(url)
    Net::HTTP.start(uri.host) do |http|
      resp = http.get(uri.path)
      AWS::S3.upload_to_bucket(TTS_BUCKET, filename, resp.body, no_random: true)
    end
  end

  def tts_upload_to_s3(text, voice=:sharon)
    filename = self.tts_path(text)
    TextToSpeech.tts_upload_to_s3(text, filename, voice)
  end

  def tts_url(text, voice=:sharon)
    "https://#{TTS_BUCKET}.s3.amazonaws.com/#{self.tts_path(text, voice)}"
  end

  def tts_path(text, voice=:sharon)
    content_hash = Digest::MD5.hexdigest(text)
    "#{VOICES[voice][:VOICE]}/#{VOICES[voice][:SPEED]}/#{VOICES[voice][:SHAPE]}/#{content_hash}/#{self.name}.mp3"
  end

  def tts_should_update(property)
    changed = self.property_changed?(property)
    changed && write_to_file? && self.published
  end

  def tts_instructions_text
    self.tts_instructions_override || self.instructions || ""
  end

  def tts_should_update_instructions?
    relevant_property = self.tts_instructions_override ? 'tts_instructions_override' : 'instructions'
    return self.tts_should_update(relevant_property)
  end

  def tts_markdown_instructions_text
    self.tts_markdown_instructions_override || TTSSafeRenderer.render(self.markdown_instructions || "")
  end

  def tts_should_update_markdown_instructions?
    relevant_property = self.tts_markdown_instructions_override ? 'tts_markdown_instructions_override' : 'markdown_instructions'
    return self.tts_should_update(relevant_property)
  end

  def tts_authored_hints_texts
    JSON.parse(self.authored_hints || '[]').map do |hint|
      TTSSafeRenderer.render(hint["hint_markdown"])
    end
  end

  def tts_update
    self.tts_upload_to_s3(self.tts_instructions_text) if self.tts_should_update_instructions?

    self.tts_upload_to_s3(self.tts_markdown_instructions_text) if self.tts_should_update_markdown_instructions?

    if self.authored_hints && self.tts_should_update('authored_hints')
      hints = JSON.parse(self.authored_hints)
      hints.each do |hint|
        text = TTSSafeRenderer.render(hint["hint_markdown"])
        self.tts_upload_to_s3(text)
        hint["tts_url"] = self.tts_url(text)
      end
      self.authored_hints = JSON.dump(hints)
    end
  end
end
