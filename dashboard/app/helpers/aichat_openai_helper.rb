require 'cdo/aws/metrics'

class OpenaiUserInputResponseTimeout < StandardError; end

# Prepares the input (user/level system prompt, context, existing chat history)
# from AI Chat lab to be sent to the AI API, and then sends the request to the API.

module AichatOpenaiHelper
  TOKEN_THROTTLING_PREFIX = "aichat/tokens/".freeze

  def self.get_openai_assistant_response(aichat_model_customizations, stored_messages, new_message, level_id, project_id, user_id)
    encrypted_channel_id = storage_encrypt_channel_id(storage_id_for_user_id(user_id), project_id)

    model_id = aichat_model_customizations["selectedModelId"]

    temperature = aichat_model_customizations['temperature'].to_f

    # system prompt - string or nil
    system_prompt = aichat_model_customizations['systemPrompt']

    # system prompt - array of strings or nil
    retrieval_contexts = aichat_model_customizations['retrievalContexts']

    client = AichatAiClient.get_instance(model_id)

    # Note for PR (TODO - discuss and remove this note before PR merged):
    # --------------------------------------------------------------------
    # There are various errors that can occur but are not rescued except in
    # aichagt_request_chat_comlpetion_job.rb. Specifically there are  various errors raised or
    # propagated through `AichatAssetHelper` when messages contain assets (i.e. multimodal)
    #  and should probably be dealt with somehow (with a response to the user).
    # --------------------------------------------------------------------
    begin
      response = client.get_response_text(
        stored_messages,
        new_message,
        temperature,
        system_prompt,
        retrieval_contexts,
        model_id,
        level_id,
        encrypted_channel_id,
        user_id,
        project_id
      )
    rescue Net::ReadTimeout
      raise OpenaiUserInputResponseTimeout.new("Timeout waiting for AI client to provide response to user input.")
    end

    response
  end

  def self.token_throttling_key(model_id, user_id)
    # "/user/" included to leave space for potential throttling at the classroom/teacher level.
    # Token throttling also only currently in place for gpt-4o-mini, but inclusion of model ID leaves space for other models.
    TOKEN_THROTTLING_PREFIX + 'model/' + model_id + '/user/' + user_id.to_s
  end
end
