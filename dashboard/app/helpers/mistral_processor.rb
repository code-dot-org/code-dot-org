class MistralProcessor
  ASSISTANT = "assistant".freeze
  USER = "user".freeze
  INSTRUCTIONS_BEGIN_TOKEN = "[INST]".freeze
  INSTRUCTIONS_END_TOKEN = "[/INST]".freeze
  SENTENCE_BEGIN_TOKEN = "<s>".freeze
  SENTENCE_END_TOKEN = "</s>".freeze

  def format_model_inputs(instructions, new_message, stored_messages)
    # The instruction-tuned version of Mistral accepts formatted input where conversation roles
    # must start with a user prompt and alternate between user and assistant.
    # Mistral-7B-Instruction LLM instruction format doc at https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1.
    # Biomistral and Pirate models also use this input format.
    inputs = (MistralProcessor::INSTRUCTIONS_BEGIN_TOKEN + wrap_as_instructions(instructions))
    # Add user and assistant messages including most recent user message.
    all_messages = [*stored_messages, new_message]
    all_messages.each do |msg|
      if msg[:role] == MistralProcessor::USER
        inputs << wrap_as_instructions(msg[:chatMessageText])
      elsif msg[:role] == MistralProcessor::ASSISTANT
        # Note that each assistant message in the conversation history is followed by
        # the end-of-sentence token but a begin-of-sentence token is not required.
        inputs << (msg[:chatMessageText] + MistralProcessor::SENTENCE_END_TOKEN)
      end
    end
    inputs
  end

  def wrap_as_instructions(message)
    return MistralProcessor::INSTRUCTIONS_BEGIN_TOKEN + message + MistralProcessor::INSTRUCTIONS_END_TOKEN unless message.empty?
    message
  end

  def format_model_output(generated_text)
    generated_text.split(INSTRUCTIONS_END_TOKEN).last
  end

  def get_stop_strings
    []
  end
end
