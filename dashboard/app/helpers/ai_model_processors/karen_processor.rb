class KarenProcessor
  def self.format_inputs
    # Format input for Karen model using ChatML as detailed at https://huggingface.co/FPHam/Karen_TheEditor_V2_CREATIVE_Mistral_7B.
    # Note that prior user and assistant messages are NOT included and the customized
    # pretext is always used so that the given user message is edited and not responded to.
    inputs = CHAT_ML_BEGIN_TOKEN + SYSTEM + NEWLINE + instructions + CHAT_ML_BEGIN_TOKEN + NEWLINE
    inputs << (CHAT_ML_BEGIN_TOKEN + USER + NEWLINE + KAREN_PRETEXT + new_message[:chatMessageText] + CHAT_ML_END_TOKEN + NEWLINE)
    inputs << (CHAT_ML_BEGIN_TOKEN + ASSISTANT)
    inputs
  end
  
  def self.format_outputs
  end
  
  def self.get_stop_strings
    []
  end
end