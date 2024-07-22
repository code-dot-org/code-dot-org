class AiModelProcessors::KarenProcessor < AiModelProcessors::MistralProcessor
  KAREN_PRETEXT = "Edit the following text for spelling and grammar mistakes: ".freeze
  CHAT_ML = {
    BEGIN_TOKEN: '<|im_start|>',
    END_TOKEN: '<|im_end|>'
  }.freeze

  def format_model_inputs(instructions, new_message, stored_messages)
    # Format input for Karen model using ChatML as detailed at https://huggingface.co/FPHam/Karen_TheEditor_V2_CREATIVE_Mistral_7B.
    # Note that prior user and assistant messages are NOT included and the customized
    # pretext is always used so that the given user message is edited and not responded to.
    inputs = CHAT_ML[:BEGIN_TOKEN] + ROLE[:SYSTEM] + NEWLINE + instructions + CHAT_ML[:END_TOKEN] + NEWLINE
    inputs << (CHAT_ML[:BEGIN_TOKEN] + ROLE[:USER] + NEWLINE + KAREN_PRETEXT + new_message[:chatMessageText] + CHAT_ML[:END_TOKEN] + NEWLINE)
    inputs << (CHAT_ML[:BEGIN_TOKEN] + ROLE[:ASSISTANT])
    inputs
  end

  def format_model_output(generated_text)
    generated_text.split(CHAT_ML[:BEGIN_TOKEN] + ROLE[:ASSISTANT]).last
  end
end
