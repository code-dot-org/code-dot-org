module AichatSagemakerHelper
  ASSISTANT = "assistant"
  USER = "user"
  INSTRUCTIONS_BEGIN_TOKEN = "[INST]"
  INSTRUCTIONS_END_TOKEN = "[/INST]"
  SENTENCE_BEGIN_TOKEN = "<s>"
  SENTENCE_END_TOKEN = "</s>"
  MAX_NEW_TOKENS = 512
  TOP_P = 0.9

  def self.create_sagemaker_client
    Aws::SageMakerRuntime::Client.new
  end

  # The instruction-tuned version of Mistral accepts formatted instructions where conversation roles
  # must start with a user prompt and alternate between user and assistant.
  # Mistral-7B-Instruction LLM instruction format doc at https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1.
  def self.format_inputs_for_sagemaker_request(aichat_params, stored_messages, new_message)
    all_messages = [*stored_messages, {role: USER, content: new_message}]
    inputs = aichat_params[:systemPrompt] + " "
    inputs += aichat_params[:retrievalContexts].join(" ") if aichat_params[:retrievalContexts]
    inputs = SENTENCE_BEGIN_TOKEN + wrap_as_instructions(inputs)
    all_messages.each do |msg|
      if msg[:role] == USER
        inputs += wrap_as_instructions(msg[:content])
      elsif msg[:role] == ASSISTANT
        # Note that each assistant message in the conversation history is followed by
        # the end-of-sentence token but a begin-of-sentence token is not required.
        inputs += msg[:content] + SENTENCE_END_TOKEN
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

  def self.request_sagemaker_chat_completion(input, endpoint_name)
    create_sagemaker_client.invoke_endpoint(
      endpoint_name: endpoint_name, # required
      body: input.to_json, # required
      content_type: "application/json"
    )
  end

  def self.get_sagemaker_assistant_response(sagemaker_response)
    parsed_response = JSON.parse(sagemaker_response.body.string)
    generated_text = parsed_response[0]["generated_text"]
    parts = generated_text.split(INSTRUCTIONS_END_TOKEN)
    parts.last
  end

  def self.wrap_as_instructions(message)
    INSTRUCTIONS_BEGIN_TOKEN + message + INSTRUCTIONS_END_TOKEN
  end

  def self.can_request_aichat_chat_completion?
    DCDO.get("aichat_chat_completion", true)
  end
end
