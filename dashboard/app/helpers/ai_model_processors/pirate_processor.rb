class AiModelProcessors::PirateProcessor < AiModelProcessors::MistralProcessor
  def format_model_output(generated_text)
    last = generated_text.split(MISTRAL[:INSTRUCTIONS_END_TOKEN]).last
    # These characters is used to separate the assistant response received from the Pirate model
    # from the rest of the generated text which sometimes includes jargon, extraneous characters
    # or code snippets.
    assistant_response = last.split(/[}~*`]/).first
    # Remove double quotes in assistant response.
    assistant_response.delete("\"")
  end

  # Custom stopping strings used for output quality for Pirate model.
  # Using these seem to help with latency in receiving assistant response.
  # https://huggingface.co/phanerozoic/Mistral-Pirate-7b-v0.3
  def get_stop_strings
    ["},"]
  end
end
