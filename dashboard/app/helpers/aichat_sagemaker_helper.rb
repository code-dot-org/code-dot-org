module AichatSagemakerHelper
  ASSISTANT = "assistant"
  USER = "user"
  SYSTEM = "system"
  INSTRUCTIONS_BEGIN_TOKEN = "[INST]"
  INSTRUCTIONS_END_TOKEN = "[/INST]"
  SENTENCE_BEGIN_TOKEN = "<s>"
  SENTENCE_END_TOKEN = "</s>"
  KAREN_PRETEXT = "Edit the following text for spelling and grammar mistakes: "
  CHAT_ML_BEGIN_TOKEN = "<|im_start|>"
  CHAT_ML_END_TOKEN = "<|im_end|>"
  NEWLINE = "\n"
  MAX_NEW_TOKENS = 512
  TOP_P = 0.9
  FINE_TUNED_MODELS = {
    ARITHMO: "gen-ai-arithmo2-mistral-7b",
    PIRATE: "gen-ai-mistral-pirate-7b",
    KAREN: "gen-ai-karen-creative-mistral-7b",
    BIOMISTRAL: "gen-ai-biomistral-7b"
  }

  def self.create_sagemaker_client
    Aws::SageMakerRuntime::Client.new
  end

  def self.format_inputs_for_sagemaker_request(aichat_params, stored_messages, new_message)
    selected_model_id = aichat_params[:selectedModelId]
    if selected_model_id == FINE_TUNED_MODELS[:ARITHMO]
      # Format input for Arithmo model with customized format as detailed at https://huggingface.co/akjindal53244/Arithmo-Mistral-7B.
      inputs = "Question: " + new_message[:chatMessageText]
      inputs = inputs + NEWLINE + "Answer:"
    elsif selected_model_id == FINE_TUNED_MODELS[:KAREN]
      # Format input for Karen model using ChatML. Details at https://huggingface.co/FPHam/Karen_TheEditor_V2_CREATIVE_Mistral_7B.
      inputs = CHAT_ML_BEGIN_TOKEN + SYSTEM + NEWLINE + aichat_params[:systemPrompt] + CHAT_ML_BEGIN_TOKEN + NEWLINE
      inputs = inputs + CHAT_ML_BEGIN_TOKEN + USER + NEWLINE + KAREN_PRETEXT + new_message[:chatMessageText] + CHAT_ML_END_TOKEN + NEWLINE
      inputs = inputs + CHAT_ML_BEGIN_TOKEN + ASSISTANT
    else
      # The instruction-tuned version of Mistral accepts formatted instructions where conversation roles
      # must start with a user prompt and alternate between user and assistant.
      # Mistral-7B-Instruction LLM instruction format doc at https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1.
      inputs = ""
      if aichat_params[:systemPrompt].length > 0
        inputs = aichat_params[:systemPrompt] + " "
      end
      inputs += aichat_params[:retrievalContexts].join(" ") if aichat_params[:retrievalContexts]
      inputs = SENTENCE_BEGIN_TOKEN + wrap_as_instructions(inputs)
      all_messages = [*stored_messages, new_message]
      all_messages.each do |msg|
        if msg[:role] == USER
          inputs += wrap_as_instructions(msg[:chatMessageText])
        elsif msg[:role] == ASSISTANT
          # Note that each assistant message in the conversation history is followed by
          # the end-of-sentence token but a begin-of-sentence token is not required.
          inputs += msg[:chatMessageText] + SENTENCE_END_TOKEN
        end
      end
    end
    {
      inputs: inputs,
      parameters: {
        temperature: aichat_params[:temperature].to_f,
        max_new_tokens: MAX_NEW_TOKENS,
        top_p: TOP_P
      }
    }
  end

  def self.request_sagemaker_chat_completion(input, selected_model_id)
    create_sagemaker_client.invoke_endpoint(
      endpoint_name: selected_model_id, # required
      body: input.to_json, # required
      content_type: "application/json"
    )
  end

  def self.get_sagemaker_assistant_response(sagemaker_response, selected_model_id)
    parsed_response = JSON.parse(sagemaker_response.body.string)   
    generated_text = parsed_response[0]["generated_text"]
    format_sagemaker_assistant_response_output(generated_text, selected_model_id)
  end

  def self.format_sagemaker_assistant_response_output(generated_text, selected_model_id)
    if selected_model_id == FINE_TUNED_MODELS[:KAREN]
      parts = generated_text.split(CHAT_ML_BEGIN_TOKEN + ASSISTANT)
    elsif selected_model_id == FINE_TUNED_MODELS[:ARITHMO]
      parts = generated_text.split("Answer:")
    else
      parts = generated_text.split(INSTRUCTIONS_END_TOKEN)
    end
    last = parts.last
    if selected_model_id == FINE_TUNED_MODELS[:PIRATE]
      # Custom stopping string characters is used to separate the assistant's response from the rest of the generated text.
      # https://huggingface.co/phanerozoic/Mistral-Pirate-7b-v0.3
      last = last.split(/[}~*`]/).first
      # Remove double quotes in assistant's response.
      last = last.gsub(/\"/, "")
    elsif selected_model_id == FINE_TUNED_MODELS[:KAREN]
      last = last.split("}").first
    end  
    last
  end

  def self.wrap_as_instructions(message)
    if message.length > 0
      return INSTRUCTIONS_BEGIN_TOKEN + message + INSTRUCTIONS_END_TOKEN
    end
    message
  end

  def self.can_request_aichat_chat_completion?
    DCDO.get("aichat_chat_completion", true)
  end
end
