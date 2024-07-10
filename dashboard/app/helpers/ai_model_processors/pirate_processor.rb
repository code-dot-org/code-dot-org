class PirateProcessor < MistralProcessor
  # Custom stopping strings used for output quality for Pirate model.
  # Using these seem to help with latency in receiving assistant response.
  # https://huggingface.co/phanerozoic/Mistral-Pirate-7b-v0.3
  def self.get_stop_strings
    ["},"]
  end
end
