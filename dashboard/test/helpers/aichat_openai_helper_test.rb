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
    @encrypted_channel_id = 12345
  end

  test 'formats messages with level system prompt' do
    expected_messages = [
      {role: 'system', content: "Be safe. test prompt test retrieval"},
      {role: 'user', content: [{type: 'text', text: 'hello from user'}]},
      {role: 'assistant', content: [{type: 'text', text: 'assistant response'}]},
      {role: 'user', content: [{type: 'text', text: 'new message from user'}]}
    ]

    messages = AichatOpenaiHelper.format_messages(
      @common_model_customizations,
      @stored_messages,
      @new_message,
      @level.id,
      @encrypted_channel_id
    )

    assert_equal expected_messages, messages
  end

  test 'formats messages without level system prompt' do
    expected_messages = [
      {role: 'system', content: "test prompt test retrieval"},
      {role: 'user', content: [{type: 'text', text: 'hello from user'}]},
      {role: 'assistant', content: [{type: 'text', text: 'assistant response'}]},
      {role: 'user', content: [{type: 'text', text: 'new message from user'}]}
    ]

    messages = AichatOpenaiHelper.format_messages(
      @common_model_customizations,
      @stored_messages,
      @new_message,
      @level_without_level_system_prompt.id,
      @encrypted_channel_id
    )

    assert_equal expected_messages, messages
  end

  test 'includes asset URLs if present' do
    image_uri = "data:image/png;base64,12345"
    pdf_uri = "data:application/pdf;base64,12345"
    AichatAssetHelper.stubs(:get_asset_data_uri).returns(image_uri, pdf_uri)
    message_with_assets = {
      role: 'user',
       chatMessageText: 'message with assets',
       assets: [
         {filename: 'image.png', source: 'project'},
         {filename: 'file.pdf', source: 'level'}
       ]
    }.deep_stringify_keys

    expected_messages = [
      {role: 'system', content: "test prompt test retrieval"},
      {role: 'user', content: [{type: 'text', text: 'hello from user'}]},
      {role: 'assistant', content: [{type: 'text', text: 'assistant response'}]},
      {role: 'user', content: [
        {type: 'text', text: 'message with assets'},
        {type: 'image_url', image_url: {url: image_uri}},
        {type: 'file', file: {filename: 'file.pdf', file_data: pdf_uri}}
      ]}
    ]

    messages = AichatOpenaiHelper.format_messages(
      @common_model_customizations,
      @stored_messages,
      message_with_assets,
      @level_without_level_system_prompt.id,
      @encrypted_channel_id
    )

    assert_equal expected_messages, messages
  end
end
