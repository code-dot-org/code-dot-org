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

module TextToSpeech
  extend ActiveSupport::Concern

  # TODO: this concern actually depends on the SerializedProperties
  # concern ... I'm not sure how best to deal with that.

  included do
    after_save :tts_update

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

  def tts_instructions_text
    self.tts_instructions_override || self.instructions || ""
  end

  def tts_should_update_instructions?
    changed = self.property_changed?(self.tts_instructions_override ? 'tts_instructions_override' : 'instructions')
    changed && write_to_file? && self.published
  end

  def tts_markdown_instructions_text
    self.tts_markdown_instructions_override || Redcarpet::Markdown.new(Redcarpet::Render::StripDown).render(self.markdown_instructions || "")
  end

  def tts_should_update_markdown_instructions?
    changed = self.property_changed?(self.tts_markdown_instructions_override ? 'tts_markdown_instructions_override' : 'markdown_instructions')
    changed && write_to_file? && self.published
  end

  def tts_instructions_audio_file(voice=:sharon)
    content_hash = Digest::MD5.hexdigest(self.tts_instructions_text)
    "#{VOICES[voice][:VOICE]}/#{VOICES[voice][:SPEED]}/#{VOICES[voice][:SHAPE]}/#{content_hash}/#{self.name}.mp3"
  end

  def tts_markdown_instructions_audio_file(voice=:sharon)
    content_hash = Digest::MD5.hexdigest(self.tts_markdown_instructions_text)
    "#{VOICES[voice][:VOICE]}/#{VOICES[voice][:SPEED]}/#{VOICES[voice][:SHAPE]}/#{content_hash}/#{self.name}.mp3"
  end

  def tts_update
    TextToSpeech.tts_upload_to_s3(
      self.tts_instructions_text,
      self.tts_instructions_audio_file
    ) if self.tts_should_update_instructions?

    TextToSpeech.tts_upload_to_s3(
      self.tts_markdown_instructions_text,
      self.tts_markdown_instructions_audio_file
    ) if self.tts_should_update_markdown_instructions?
  end
end
