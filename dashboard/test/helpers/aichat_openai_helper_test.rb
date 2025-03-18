require 'test_helper'

class AichatOpenaiHelperTest < ActionView::TestCase
  include AichatOpenaiHelper

  setup do
    @common_model_customizations = {temperature: 0.5, retrievalContexts: ["test retrieval"], systemPrompt: "test prompt"}.stringify_keys
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
    @level = Level.create({name: 'Aichat level', properties: {aichat_settings: {levelSystemPrompt: "Be safe."}}})
    @level_without_level_system_prompt = Level.create({name: 'Aichat level without level system prompt', properties: {aichat_settings: {}}})
  end

  test 'formats messages with level system prompt' do
    expected_messages = [
      {role: 'system', content: "Be safe. test prompt test retrieval"},
      {role: 'user', content: 'hello from user'},
      {role: 'assistant', content: 'assistant response'},
      {role: 'user', content: 'new message from user'}
    ]

    messages = AichatOpenaiHelper.format_messages(
      @common_model_customizations,
      @stored_messages,
      @new_message,
      @level.id
    )

    assert_equal expected_messages, messages
  end

  test 'formats messages without level system prompt' do
    expected_messages = [
      {role: 'system', content: "test prompt test retrieval"},
      {role: 'user', content: 'hello from user'},
      {role: 'assistant', content: 'assistant response'},
      {role: 'user', content: 'new message from user'}
    ]

    messages = AichatOpenaiHelper.format_messages(
      @common_model_customizations,
      @stored_messages,
      @new_message,
      @level_without_level_system_prompt.id
    )

    assert_equal expected_messages, messages
  end
end
