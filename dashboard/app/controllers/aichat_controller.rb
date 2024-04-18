class AichatController < ApplicationController
  authorize_resource class: false
  SAGEMAKER_CLIENT = Aws::SageMakerRuntime::Client.new
  BASE_PROMPT = "You are a helpful chatbot for children. Limit your responses to a small paragraph."

  # params are
  # newMessage: string
  # storedMessages: Array of {role: <'user', 'system', or 'assistant'>; content: string} - does not include user's new message
  # aichatParameters: {temperature: number; retrievalContexts: string[]; systemPrompt: string;}
  # chatContext: {userId: number; currentLevelId: string; scriptId: number; channelId: string;}
  # POST /aichat/chat_completion
  def chat_completion
    puts "inside chat_completion"
    unless has_required_params?
      return render status: :bad_request, json: {}
    end

    # Check for PII / Profanity
    # Copied from ai_tutor_interactions_controller.rb - not sure if filtering is working.
    locale = params[:locale] || "en"
    new_message_text = params[:newMessage]
    # Check only the newest message from the user for inappropriate content.
    filter_result = ShareFiltering.find_failure(new_message_text, locale) if new_message_text
    # If the content is inappropriate, we skip sending to endpoint and instead hardcode a warning response on the front-end.
    return render(status: :ok, json: {status: filter_result.type, flagged_content: filter_result.content}) if filter_result

    input_json = format_input_for_sagemaker_request(params[:aichatParameters], params[:storedMessages], params[:newMessage])
    sagemaker_response = request_sagemaker_chat_completion(input_json)
    parsed = JSON.parse(sagemaker_response.body.string)
    generated_text = parsed[0]["generated_text"]
    parts = generated_text.split("[/INST]")
    response = parts.last

    payload = {
      role: "assistant",
      content: response
    }
    return render(status: :ok, json: payload.to_json)
  end

  def request_sagemaker_chat_completion(input_json)
    response = SAGEMAKER_CLIENT.invoke_endpoint(
      # endpoint_name: "BioMistral-7B",
      endpoint_name: "mistral-7b-inst-v01", # required
      body: input_json.to_json.to_s, # required
      # target_model: 'mistral-7b-inst.tar.gz',
      content_type: "application/json"
    )
    response
  end

  def format_input_for_sagemaker_request(aichat_params, stored_messages, new_message)
    inputs = BASE_PROMPT
    inputs += aichat_params[:systemPrompt]
    inputs += aichat_params[:retrievalContexts].join(" ") if aichat_params[:retrievalContexts]

    if stored_messages.empty?
      inputs += " " + new_message
      inputs = "<s>[INST] #{inputs} [/INST]"
    else
      inputs = "<s>[INST] #{inputs} [/INST]"
      stored_messages.each do |msg|
        if msg[:role] == 'user'
          inputs += "[INST] #{msg[:content]} [/INST] "
        elsif msg[:role] == 'assistant'
          inputs += msg[:content] + "</s>"
        end
      end
      inputs += "[INST] #{new_message} [/INST] "
    end

    puts "\n\ninputs is #{inputs}\n\n"

    input_json = {
      inputs: inputs,
      parameters: {
        temperature: aichat_params[:temperature].to_f,
        max_new_tokens: 300,
        top_p: 0.9
      }
    }
    input_json
  end

  private def has_required_params?
    begin
      params.require([:newMessage, :aichatParameters, :chatContext])
    rescue ActionController::ParameterMissing
      return false
    end
    true
  end
end
