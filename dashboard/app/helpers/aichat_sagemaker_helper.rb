module AichatSagemakerHelper
  ASSISTANT = "assistant"
  USER = "user"
  INSTRUCTIONS_BEGIN_TOKEN = "[INST]"
  INSTRUCTIONS_END_TOKEN = "[/INST]"
  SENTENCE_BEGIN_TOKEN = "<s>"
  SENTENCE_END_TOKEN = "</s>"
  MAX_NEW_TOKENS = 512
  TOP_P = 0.9
  ARITHMO_MODEL = "gen-ai-arithmo2-mistral-7b"
  PIRATE_MODEL = "gen-ai-mistral-pirate-7b"
  KAREN_MODEL = "gen-ai-karen-creative-mistral-7b"

  def self.create_sagemaker_client
    Aws::SageMakerRuntime::Client.new
  end

  # The instruction-tuned version of Mistral accepts formatted instructions where conversation roles
  # must start with a user prompt and alternate between user and assistant.
  # Mistral-7B-Instruction LLM instruction format doc at https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1.
  def self.format_inputs_for_sagemaker_request(aichat_params, stored_messages, new_message)
    selected_model = aichat_params[:selectedModelId]
    if selected_model == ARITHMO_MODEL
      inputs = "Question: " + new_message[:chatMessageText]
    elsif selected_model == KAREN_MODEL
      inputs = "<|im_start|>system\nYou are a helpful assistant<|im_end|>\n"
      inputs = inputs + "<|im_start|>user\nEdit the following text for spelling and grammar mistakes: " + new_message[:chatMessageText] + "<|im_end|>\n"
      inputs = inputs + "<|im_start|>assistant"
    else
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
    puts "parsed_response: #{parsed_response}"
    generated_text = parsed_response[0]["generated_text"]
    if selected_model_id == KAREN_MODEL
      parts = generated_text.split('<|im_start|>assistant')
    else
      parts = generated_text.split(INSTRUCTIONS_END_TOKEN)
    end
    last = parts.last
    if selected_model_id == PIRATE_MODEL
      # Custom stopping string characters is used to separate the assistant's response from the rest of the generated text.
      last = last.split(/[}~*`]/).first
      # Remove double quotes in assistant's response.
      last = last.gsub(/\"/, "")
    elsif selected_model_id == KAREN_MODEL
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
