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
  MODELS = {
    BASE: "gen-ai-mistral-7b-inst-v01",
    ARITHMO: "gen-ai-arithmo2-mistral-7b",
    PIRATE: "gen-ai-mistral-pirate-7b",
    KAREN: "gen-ai-karen-creative-mistral-7b",
    BIOMISTRAL: "gen-ai-biomistral-7b"
  }

  def self.create_sagemaker_client
    Aws::SageMakerRuntime::Client.new
  end

  def self.get_instructions(system_prompt, retrieval_contexts)
    instructions = ""
    instructions = system_prompt + " " unless system_prompt.empty?
    instructions << retrieval_contexts.join(" ") if retrieval_contexts
    instructions
  end

  def self.format_inputs_for_sagemaker_request(aichat_params, stored_messages, new_message)
    selected_model_id = aichat_params[:selectedModelId]
    # Add system prompt and retrieval contexts if available to inputs as part of instructions that will be sent to model.
    instructions = get_instructions(aichat_params[:systemPrompt], aichat_params[:retrievalContexts])  
    model_processor = get_model_processor(selected_model_id)
    inputs = model_processor.format_inputs(instructions, stored_messages, new_message)
    stopping_strings = model_processor.get_stop_strings

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

  def self.get_model_processor(selected_model_id)
    case selected_model_id      
    when MODELS[:PIRATE]
      return PirateProcessor.new
    when MODELS[:KAREN]
      return KarenProcessor.new
    when MODELS[:ARITHMO]
      return ArithmoProcessor.new
    else
      return MistralProcessor.new
    end    
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
      if selected_model_id == MODELS[:KAREN]
        generated_text.split(CHAT_ML_BEGIN_TOKEN + ASSISTANT)
      elsif selected_model_id == MODELS[:ARITHMO]
        generated_text.split("Answer:")
      else
        generated_text.split(INSTRUCTIONS_END_TOKEN)
      end
    last = parts.last
    if selected_model_id == MODELS[:PIRATE]
      # These characters is used to separate the assistant response received from the Pirate model
      # from the rest of the generated text which sometimes includes jargon, extraneous characters
      # or code snippets.
      last = last.split(/[}~*`]/).first
      # Remove double quotes in assistant response.
      last = last.delete("\"")
    elsif selected_model_id == MODELS[:KAREN]
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
