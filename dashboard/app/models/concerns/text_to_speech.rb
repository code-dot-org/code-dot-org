require 'acapela'
require 'net/http'
require 'uri'

TTS_BUCKET = 'cdo-tts'

module TextToSpeech
  extend ActiveSupport::Concern

  # TODO: this concern actually depends on the SerializedProperties
  # concern ... I'm not sure how best to deal with that.

  included do
    after_save :tts_update

    serialized_attrs %w(
      custom_tts
    )
  end

  def self.tts_upload_to_s3(text, filename)
    uri = URI.parse(acapela_text_to_audio_url(text))
    Net::HTTP.start(uri.host) { |http|
      resp = http.get(uri.path)
      AWS::S3.upload_to_bucket(TTS_BUCKET, filename, resp.body, no_random: true)
    }
  end

  def tts_text
    self.custom_tts || self.instructions
  end

  def tts_should_update?
    changed = self.property_changed?(self.custom_tts ? 'custom_tts' : 'instructions')
    changed && write_to_file? && self.published
  end

  def tts_audio_file
    content_hash = Digest::MD5.hexdigest(self.tts_text)
    "#{content_hash}/#{self.name}.mp3"
  end

  def tts_update
    if self.tts_should_update?
      TextToSpeech.tts_upload_to_s3(self.tts_text, self.tts_audio_file)
    end
  end
end
