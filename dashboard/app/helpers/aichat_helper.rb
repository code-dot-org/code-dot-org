module AichatHelper
  SAGEMAKER_CLIENT = Aws::SageMakerRuntime::Client.new
  BASE_PROMPT = "You are a helpful chatbot for children. Limit your responses to a small paragraph."

  # The instruction-tuned version of Mistral accepts formatted instructions where conversation roles
  # must start with a user prompt and alternate between user and assistant.
  def self.format_input_for_sagemaker_request(aichat_params, stored_messages, new_message)
    inputs = BASE_PROMPT + aichat_params[:systemPrompt]
    inputs += aichat_params[:retrievalContexts].join(" ") if aichat_params[:retrievalContexts]

    if stored_messages.empty?
      inputs = "<s>[INST] #{inputs + " " + new_message} [/INST]"
    else
      inputs = "<s>[INST] #{inputs} [/INST]"
      # Filter only messages from user or assistant - ignore model update messages.
      stored_messages.each do |msg|
        if msg[:role] == 'user'
          inputs += "[INST] #{msg[:content]} [/INST] "
        elsif msg[:role] == 'assistant'
          inputs += msg[:content] + "</s>"
        end
      end
      inputs += "[INST] #{new_message} [/INST] "
    end
    puts "inputs: #{inputs}"
    input_json = {
      inputs: inputs,
      parameters: {
        temperature: aichat_params[:temperature].to_f,
        max_new_tokens: 300,
        top_p: 0.9
      }
    }
    rescue => exception
      p exception
  end

  def self.request_sagemaker_chat_completion(input_json)
    response = SAGEMAKER_CLIENT.invoke_endpoint(
      # endpoint_name: "BioMistral-7B",
      endpoint_name: "mistral-7b-inst-v01", # required
      body: input_json.to_json.to_s, # required
      # target_model: 'mistral-7b-inst.tar.gz',
      content_type: "application/json"
    )
  end
end
