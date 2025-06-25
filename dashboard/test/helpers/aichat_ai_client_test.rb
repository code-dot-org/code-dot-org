require 'test_helper'


class AichatAiClientTest < ActionView::TestCase

  setup do
    @stored_messages = [
      {
        role: 'user',
        chatMessageText: 'hello from user',
      }.stringify_keys,
      {
        role: 'assistant',
        chatMessageText: 'assistant response',
      }.stringify_keys
    ]
    @new_message = {role: 'user', chatMessageText: 'new message from user'}.stringify_keys
    @temperature = 0.5
    @system_prompt = 'test prompt'
    @retrieval_contexts = ['test retrieval']
    @level_id = 'Aichat level'
    @encrypted_channel_id = 12345
    @user_id = 'test-user'
    @project_id = 'Aichat project'

    #TODO - these were in original test not sure what we're doing with them
    @level_without_level_system_prompt_id = 'Aichat level without level system prompt'
    @level = Level.create({name: @level_id, properties: {aichat_settings: {levelSystemPrompt: "Be safe."}}})
    @level_without_level_system_prompt = Level.create({name: @level_without_level_system_prompt_id, properties: {aichat_settings: {}}})
   
  end


  private def call_get_response_test(model_id)
    AichatAiClient.create_instance(model_id).get_response_text(
         @stored_messages,
         @new_message,
         @temperature,
         @system_prompt,
         @retrieval_contexts,
         model_id,
         @level.id,
         @encrypted_channel_id,
         @user_id,
         @project_id
      )
  end
end