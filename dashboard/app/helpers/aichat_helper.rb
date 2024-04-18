module AichatHelper
  SAGEMAKER_CLIENT = Aws::SageMakerRuntime::Client.new
  SAGEMAKER_MODEL_ENDPOINT = "mistral-7b-inst-v01" # "BioMistral-7B"
  BASE_PROMPT = "You are a helpful chatbot for children. Limit your responses to a small paragraph."
  ASSISTANT = 'assistant'
  USER = 'user'

  # The instruction-tuned version of Mistral accepts formatted instructions where conversation roles
  # must start with a user prompt and alternate between user and assistant.
  def self.format_inputs_for_sagemaker_request(aichat_params, stored_messages, new_message)
    stored_messages.push({role: USER, content: new_message})
    inputs = BASE_PROMPT + aichat_params[:systemPrompt]
    inputs += aichat_params[:retrievalContexts].join(" ") if aichat_params[:retrievalContexts]
    inputs = "<s> " + wrap_as_instructions(inputs)
    # Filter only messages from user or assistant - ignore model update messages.
    stored_messages.each do |msg|
      if msg[:role] == USER
        inputs += wrap_as_instructions(msg[:content])
      elsif msg[:role] == ASSISTANT
        inputs += msg[:content] + "</s>"
      end
    end
    {
      inputs: inputs,
      parameters: {
        temperature: aichat_params[:temperature].to_f,
        max_new_tokens: 300,
        top_p: 0.9
      }
    }
  end

  def self.request_sagemaker_chat_completion(input_json)
    SAGEMAKER_CLIENT.invoke_endpoint(
      endpoint_name: SAGEMAKER_MODEL_ENDPOINT, # required
      body: input_json.to_json.to_s, # required
      # target_model: 'mistral-7b-inst.tar.gz',
      content_type: "application/json"
    )
  end

  def self.wrap_as_instructions(message)
    "[INST] #{message} [/INST]"
  end
end
