module Unit::TextToSpeech
  extend ActiveSupport::Concern

  included do
    include SerializedProperties

    serialized_attrs %w[tts]

    scope :tts_enabled, -> {where(arel_table[Arel.sql('properties->"$.tts"')].eq(true))}
  end

  def text_to_speech_enabled?
    self.class.tts_enabled.exists?(id)
  end

  # Generates TTS files for each level in a unit.
  def tts_update(update_all = false)
    levels.each {|level| level.tts_update(update_all)}
  end
end
