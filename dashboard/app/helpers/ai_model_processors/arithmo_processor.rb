class AiModelProcessors::ArithmoProcessor < AiModelProcessors::MistralProcessor
  NEWLINE = "\n".freeze

  def format_model_inputs(instructions, new_message, stored_messages)
    # Format input for Arithmo model as detailed at https://huggingface.co/akjindal53244/Arithmo-Mistral-7B.
    # Note the Question-Answer format - prior user and assistant messages are NOT included.
    inputs = "Question: " + instructions + " " + new_message[:chatMessageText]
    inputs << (AiModelProcessors::ArithmoProcessor::NEWLINE + "Answer:")
    inputs
  end

  def format_model_output(generated_text)
    generated_text.split("Answer:").last
  end
end
