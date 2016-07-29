require 'acapela'
require 'net/http'
require 'uri'
require 'redcarpet'
require 'redcarpet/render_strip'

TTS_BUCKET = 'cdo-tts'

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

  def self.tts_upload_to_s3(text, filename)
    uri = URI.parse(acapela_text_to_audio_url(text))
    Net::HTTP.start(uri.host) { |http|
      resp = http.get(uri.path)
      AWS::S3.upload_to_bucket(TTS_BUCKET, filename, resp.body, no_random: true)
    }
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

  def tts_instructions_audio_file
    content_hash = Digest::MD5.hexdigest(self.tts_instructions_text)
    "#{content_hash}/#{self.name}.mp3"
  end

  def tts_markdown_instructions_audio_file
    content_hash = Digest::MD5.hexdigest(self.tts_markdown_instructions_text)
    "#{content_hash}/#{self.name}.mp3"
  end

  def tts_update
    if self.tts_should_update_instructions?
      TextToSpeech.tts_upload_to_s3(self.tts_instructions_text, self.tts_instructions_audio_file)
    end
    if self.tts_should_update_markdown_instructions?
      TextToSpeech.tts_upload_to_s3(self.tts_markdown_instructions_text, self.tts_markdown_instructions_audio_file)
    end
  end
end
