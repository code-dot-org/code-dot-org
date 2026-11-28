module Unit::TextToSpeech
  extend ActiveSupport::Concern

  included do
    include SerializedProperties

    serialized_attrs %w[tts]

    scope :tts_enabled, -> {where(arel_table[Arel.sql('properties->"$.tts"')].eq(true))}
  end

  # The method conditions must be reflected in the `tts_enabled` scope method
  def text_to_speech_enabled?
    tts == true
  end
end
