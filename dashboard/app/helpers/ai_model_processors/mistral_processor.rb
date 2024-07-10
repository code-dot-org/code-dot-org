class MistralProcessor
  def self.format_inputs(instructions, stored_messages, new_message)
    # The instruction-tuned version of Mistral accepts formatted instructions where conversation roles
    # must start with a user prompt and alternate between user and assistant.
    # Mistral-7B-Instruction LLM instruction format doc at https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1.
    # Biomistral and Pirate models also use this input format.
    inputs = (SENTENCE_BEGIN_TOKEN + wrap_as_instructions(instructions))
    # Add user and assistant messages including most recent user message.
    all_messages = [*stored_messages, new_message]
    all_messages.each do |msg|
      if msg[:role] == USER
        inputs << wrap_as_instructions(msg[:chatMessageText])
      elsif msg[:role] == ASSISTANT
        # Note that each assistant message in the conversation history is followed by
        # the end-of-sentence token but a begin-of-sentence token is not required.
        inputs << msg[:chatMessageText] + SENTENCE_END_TOKEN
      end
    end
    inputs
  end

  def self.format_outputs
  end

  def self.get_stop_strings
    []
  end
end
