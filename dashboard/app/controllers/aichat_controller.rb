class AichatController < ApplicationController
  SAGEMAKER_CLIENT = Aws::SageMakerRuntime::Client.new
  BASE_PROMPT = "You are a helpful chatbot for children. "
  # params are
  # newMessage: string
  # storedMessages: Array of {role: <'user', 'system', or 'assistant'>; content: string} - does not include user's new message
  # aichatParameters: {temperature: number; retrievalContexts: string[]; systemPrompt: string;}
  # chatContext: {userId: number; currentLevelId: string; scriptId: number; channelId: string;}
  # POST /aichat/chat_completion
  def chat_completion
    aichat_params = params[:aichatParameters]
    inputs = BASE_PROMPT
    inputs += aichat_params[:systemPrompt]
    inputs += aichat_params[:retrievalContexts].join(" ") if aichat_params[:retrievalContexts]

    if params[:storedMessages].empty?
      inputs += " " + params[:newMessage]
      inputs = "<s>[INST] #{inputs} [/INST]"
    else
      inputs = "<s>[INST] #{inputs} [/INST]"
      params[:storedMessages].each do |msg|
        if msg[:role] == 'user'
          inputs += "[INST] #{msg[:content]} [/INST] "
        elsif msg[:role] == 'assistant'
          inputs += msg[:content] + "</s>"
        end
      end
      inputs += "[INST] #{params[:newMessage]} [/INST] "
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

    resp = SAGEMAKER_CLIENT.invoke_endpoint(
      # endpoint_name: "BioMistral-7B",
      endpoint_name: "mistral-7b-inst-v01", # required
      body: input_json.to_json.to_s, # required
      # target_model: 'mistral-7b-inst.tar.gz',
      content_type: "application/json"
    )

    parsed = JSON.parse(resp.body.string)
    generated_text = parsed[0]["generated_text"]
    parts = generated_text.split("[/INST]")
    response = parts.last

    puts "\n\nReceived response #{response}\n\n"

    payload = {
      role: "assistant",
      content: response
    }
    return render(status: :ok, json: payload.to_json)
  rescue => exception
    p exception

    ### Existing code - commenting out for now to test out input format. Uncomment when implementing for real.

    # params.require([:newMessage, :storedMessages, :aichatParameters, :chatContext])

    # # Check for PII / Profanity
    # # Copied from ai_tutor_interactions_controller.rb - not sure if filtering is working.
    # locale = params[:locale] || "en"
    # new_message_text = params[:newMessage]
    # # Check only the newest message from the user for inappropriate content.
    # filter_result = ShareFiltering.find_failure(new_message_text, locale) if new_message_text
    # # If the content is inappropriate, we skip sending to endpoint and instead hardcode a warning response on the front-end.
    # return render(status: :ok, json: {status: filter_result.type, flagged_content: filter_result.content}) if filter_result
    # # TODO: Format input to send to Sagemaker.
    # payload = {
    #   message: new_message_text
    # }
    # response = request_chat_completion(payload)
    # render(status: response[:status], json: response[:json])
  end

  def request_chat_completion(payload)
    response_body = {role: "assistant", content: "This is an assistant response from Sagemaker"}
    response_code = 200
    return {status: response_code, json: response_body}
  end
end
