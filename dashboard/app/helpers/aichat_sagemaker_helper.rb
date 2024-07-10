module AichatSagemakerHelper
  ASSISTANT = "assistant"
  USER = "user"
  SYSTEM = "system"
  KAREN_PRETEXT = "Edit the following text for spelling and grammar mistakes: "
  INSTRUCTIONS_BEGIN_TOKEN = "[INST]"
  INSTRUCTIONS_END_TOKEN = "[/INST]"
  SENTENCE_BEGIN_TOKEN = "<s>"
  SENTENCE_END_TOKEN = "</s>"
  CHAT_ML_BEGIN_TOKEN = "<|im_start|>"
  CHAT_ML_END_TOKEN = "<|im_end|>"
  NEWLINE = "\n"
  MAX_NEW_TOKENS = 512
  TOP_P = 0.9
  PIRATE_CUSTOM_STOPPING_STRINGS = ["},"]
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
    # Add system prompt and retrieval contexts if available to inputs as part of instructions that will be sent to model.
    inputs = ""
    inputs = aichat_params[:systemPrompt] + " " unless aichat_params[:systemPrompt].empty?
    inputs << aichat_params[:retrievalContexts].join(" ") if aichat_params[:retrievalContexts]
    if selected_model_id == FINE_TUNED_MODELS[:ARITHMO]
      # Format input for Arithmo model as detailed at https://huggingface.co/akjindal53244/Arithmo-Mistral-7B.
      # Note the Question-Answer format - prior user and assistant messages are NOT included.
      inputs = "Question: " + inputs + " " + new_message[:chatMessageText]
      inputs << (NEWLINE + "Answer:")
    elsif selected_model_id == FINE_TUNED_MODELS[:KAREN]
      # Format input for Karen model using ChatML as detailed at https://huggingface.co/FPHam/Karen_TheEditor_V2_CREATIVE_Mistral_7B.
      # Note that prior user and assistant messages are NOT included and the customized
      # pretext is always used so that the given user message is edited and not responded to.
      inputs = CHAT_ML_BEGIN_TOKEN + SYSTEM + NEWLINE + inputs + CHAT_ML_BEGIN_TOKEN + NEWLINE
      inputs << (CHAT_ML_BEGIN_TOKEN + USER + NEWLINE + KAREN_PRETEXT + new_message[:chatMessageText] + CHAT_ML_END_TOKEN + NEWLINE)
      inputs << (CHAT_ML_BEGIN_TOKEN + ASSISTANT)
    else
      # The instruction-tuned version of Mistral accepts formatted instructions where conversation roles
      # must start with a user prompt and alternate between user and assistant.
      # Mistral-7B-Instruction LLM instruction format doc at https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1.
      # Biomistral and Pirate models also use this input format.
      inputs << (SENTENCE_BEGIN_TOKEN + wrap_as_instructions(inputs))
      # Add user and assistant messages including most recent user message.
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
    # Custom stopping strings used for output quality for Pirate model.
    # Using these seem to help with latency in receiving assistant response.
    # https://huggingface.co/phanerozoic/Mistral-Pirate-7b-v0.3
    stopping_strings =
      if selected_model_id == FINE_TUNED_MODELS[:PIRATE]
        PIRATE_CUSTOM_STOPPING_STRINGS
      else
        []
      end
    {
      inputs: inputs,
      parameters: {
        temperature: aichat_params[:temperature].to_f,
        max_new_tokens: MAX_NEW_TOKENS,
        top_p: TOP_P,
        stop: stopping_strings,
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
    parts =
      if selected_model_id == FINE_TUNED_MODELS[:KAREN]
        generated_text.split(CHAT_ML_BEGIN_TOKEN + ASSISTANT)
      elsif selected_model_id == FINE_TUNED_MODELS[:ARITHMO]
        generated_text.split("Answer:")
      else
        generated_text.split(INSTRUCTIONS_END_TOKEN)
      end
    last = parts.last
    if selected_model_id == FINE_TUNED_MODELS[:PIRATE]
      # These characters is used to separate the assistant response received from the Pirate model
      # from the rest of the generated text which sometimes includes jargon, extraneous characters
      # or code snippets.
      last = last.split(/[}~*`]/).first
      # Remove double quotes in assistant response.
      last = last.delete("\"")
    elsif selected_model_id == FINE_TUNED_MODELS[:KAREN]
      # Remove extraneous characters at end of assistant response from Karen model.
      last = last.split("}").first
    end
    last
  end

  def self.wrap_as_instructions(message)
    return INSTRUCTIONS_BEGIN_TOKEN + message + INSTRUCTIONS_END_TOKEN unless message.empty?
    message
  end

  def self.can_request_aichat_chat_completion?
    DCDO.get("aichat_chat_completion", true)
  end
end
