class AiModelProcessors::KarenProcessor < AiModelProcessors::MistralProcessor
  SYSTEM = "system".freeze
  KAREN_PRETEXT = "Edit the following text for spelling and grammar mistakes: ".freeze
  CHAT_ML_BEGIN_TOKEN = "<|im_start|>".freeze
  CHAT_ML_END_TOKEN = "<|im_end|>".freeze
  NEWLINE = "\n".freeze
  ASSISTANT = "assistant".freeze
  USER = "user".freeze

  def format_model_inputs(instructions, new_message, stored_messages)
    # Format input for Karen model using ChatML as detailed at https://huggingface.co/FPHam/Karen_TheEditor_V2_CREATIVE_Mistral_7B.
    # Note that prior user and assistant messages are NOT included and the customized
    # pretext is always used so that the given user message is edited and not responded to.
    inputs = AiModelProcessors::KarenProcessor::CHAT_ML_BEGIN_TOKEN + AiModelProcessors::KarenProcessor::SYSTEM + AiModelProcessors::KarenProcessor::NEWLINE + instructions + AiModelProcessors::KarenProcessor::CHAT_ML_END_TOKEN + AiModelProcessors::KarenProcessor::NEWLINE
    inputs << (AiModelProcessors::KarenProcessor::CHAT_ML_BEGIN_TOKEN + AiModelProcessors::KarenProcessor::USER + AiModelProcessors::KarenProcessor::NEWLINE + AiModelProcessors::KarenProcessor::KAREN_PRETEXT + new_message[:chatMessageText] + AiModelProcessors::KarenProcessor::CHAT_ML_END_TOKEN + AiModelProcessors::KarenProcessor::NEWLINE)
    inputs << (AiModelProcessors::KarenProcessor::CHAT_ML_BEGIN_TOKEN + AiModelProcessors::KarenProcessor::ASSISTANT)
    inputs
  end

  def format_model_output(generated_text)
    generated_text.split(CHAT_ML_BEGIN_TOKEN + ASSISTANT).last
  end
end
