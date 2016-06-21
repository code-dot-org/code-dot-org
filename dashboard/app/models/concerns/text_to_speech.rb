require 'acapela'
require 'net/http'
require 'uri'

TTS_BUCKET = 'cdo-tts'

module TextToSpeech
  extend ActiveSupport::Concern

  # TODO: this concern actually depends on hte SerializedProperties
  # concern ... I'm not sure how best to deal with that.

  included do
    before_save :tts_update

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

  def tts_audio_file(env=Rails.env)
    md5 = Digest::MD5.hexdigest(self.name)
    "#{env}/#{md5}/#{self.name}.mp3"
  end

  def tts_update
    if self.tts_should_update?
      TextToSpeech.tts_upload_to_s3(self.tts_text, self.tts_audio_file)
      self.tts_updated_at = DateTime.now
    end
  end

  def tts_copy
    #return unless Rails.env.production?
    if self.changed? && self.changed.include?('tts_updated_at')
      #AWS::S3.copy_within_bucket(TTS_BUCKET, self.tts_audio_file('levelbuilder'), self.tts_audio_file)
      AWS::S3.copy_within_bucket(TTS_BUCKET, self.tts_audio_file('development'), self.tts_audio_file('test'))
    end
  end
end
