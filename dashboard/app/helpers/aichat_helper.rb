module AichatHelper
  ASSISTANT = "assistant"
  USER = "user"
  BASE_PROMPT = "You are a helpful chatbot for children. Limit your responses to a small paragraph."
  INSTRUCTIONS_START_TAG = "[INST]"
  INSTRUCTIONS_END_TAG = "[/INST]"
  SENTENCE_START_TAG = "<s>"
  SENTENCE_END_TAG = "</s>"
  MAX_NEW_TOKENS = 300
  SAGEMAKER_CLIENT = Aws::SageMakerRuntime::Client.new
  SAGEMAKER_MODEL_ENDPOINT = "mistral-7b-inst-v01" # "BioMistral-7B"
  TOP_P = 0.9

  # The instruction-tuned version of Mistral accepts formatted instructions where conversation roles
  # must start with a user prompt and alternate between user and assistant.
  def self.format_inputs_for_sagemaker_request(aichat_params, stored_messages, new_message)
    all_messages = [*stored_messages, {role: USER, content: new_message}]
    inputs = BASE_PROMPT + aichat_params[:systemPrompt]
    inputs += aichat_params[:retrievalContexts].join(" ") if aichat_params[:retrievalContexts]
    inputs = SENTENCE_START_TAG + wrap_as_instructions(inputs)
    # Filter only messages from user or assistant - ignore model update messages.
    all_messages.each do |msg|
      if msg[:role] == USER
        inputs += wrap_as_instructions(msg[:content])
      elsif msg[:role] == ASSISTANT
        inputs += msg[:content] + SENTENCE_END_TAG
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

  def self.request_sagemaker_chat_completion(input_json)
    SAGEMAKER_CLIENT.invoke_endpoint(
      endpoint_name: SAGEMAKER_MODEL_ENDPOINT, # required
      body: input_json.to_json, # required
      content_type: "application/json"
    )
  end

  def self.get_sagemaker_assistant_response(sagemaker_response)
    parsed_response = JSON.parse(sagemaker_response.body.string)
    generated_text = parsed_response[0]["generated_text"]
    parts = generated_text.split(INSTRUCTIONS_END_TAG)
    parts.last
  end

  def self.wrap_as_instructions(message)
    INSTRUCTIONS_START_TAG + message + INSTRUCTIONS_END_TAG
  end

  def self.can_request_aichat_chat_completion?
    DCDO.get("aichat_chat_completion", true)
  end
end
