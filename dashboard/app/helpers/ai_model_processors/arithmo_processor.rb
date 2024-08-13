class AiModelProcessors::ArithmoProcessor < AiModelProcessors::MistralProcessor
  ARITHMO = {
    QUESTION_LABEL: 'Question: ',
    ANSWER_LABEL: 'Answer:'
  }.freeze

  def format_model_inputs(instructions, new_message, stored_messages)
    # Format input for Arithmo model as detailed at https://huggingface.co/akjindal53244/Arithmo-Mistral-7B.
    # Note the Question-Answer format - prior user and assistant messages are NOT included.
    inputs = ARITHMO[:QUESTION_LABEL] + instructions + " " + new_message[:chatMessageText]
    inputs << (NEWLINE + ARITHMO[:ANSWER_LABEL])
    inputs
  end

  def format_model_output(generated_text)
    generated_text.split(ARITHMO[:ANSWER_LABEL]).last
  end
end
