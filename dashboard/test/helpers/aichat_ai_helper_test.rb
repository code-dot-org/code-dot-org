require 'test_helper'

class AichatAiHelperTest < ActionView::TestCase
  describe '.get_api_model' do
    it 'returns latest OpenAI model version for gpt-4o-mini' do
      _(AichatAiHelper.get_api_model('gpt-4o-mini')).must_equal SharedConstants::AICHAT_MODEL_VERSION
    end

    it 'returns the provided model id for non-OpenAI models' do
      _(AichatAiHelper.get_api_model('gemini-1.5-flash')).must_equal 'gemini-1.5-flash'
    end
  end

  describe '.format_message_parts' do
    let(:encrypted_channel_id) {'encrypted-id'}
    let(:level_name) {'Level Name'}
    let(:message_payload) do
      {
        'chatMessageText' => 'Hello AI',
        'assets' => [
          {'filename' => 'image.png', 'source' => 'project'},
          {'filename' => 'notes.pdf', 'source' => 'level'}
        ]
      }
    end

    before do
      AichatAssetHelper.expects(:get_asset_base64_string).
        with('image.png', 'project', encrypted_channel_id, level_name).
        returns('image-base64')
      AichatAssetHelper.expects(:get_asset_base64_string).
        with('notes.pdf', 'level', encrypted_channel_id, level_name).
        returns('pdf-base64')
    end

    it 'includes text and file message parts with mime types' do
      parts = AichatAiHelper.format_message_parts(message_payload, encrypted_channel_id, level_name)

      _(parts.length).must_equal 3
      _(parts.first.type).must_equal 'text'
      _(parts.first.content).must_equal 'Hello AI'

      _(parts.second.type).must_equal 'file'
      _(parts.second.content.name).must_equal 'image.png'
      _(parts.second.content.mimeType).must_equal 'image/png'
      _(parts.second.content.data).must_equal 'image-base64'

      _(parts.third.type).must_equal 'file'
      _(parts.third.content.name).must_equal 'notes.pdf'
      _(parts.third.content.mimeType).must_equal 'application/pdf'
      _(parts.third.content.data).must_equal 'pdf-base64'
    end
  end

  describe '.convert_json_schema_to_ruby_types' do
    it 'builds nested RubyTypes objects for objects and arrays' do
      schema = {
        'type' => 'object',
        'description' => 'Root object',
        'properties' => {
          'items' => {
            'type' => 'array',
            'description' => 'List of strings',
            'items' => {
              'type' => 'string',
              'description' => 'Item name'
            }
          }
        },
        'required' => ['items'],
        'additionalProperties' => false
      }

      result = AichatAiHelper.convert_json_schema_to_ruby_types(schema)

      _(result).must_be_instance_of AichatAiClientTypes::JsonObjectSchema
      _(result.description).must_equal 'Root object'
      _(result.required).must_equal ['items']
      _(result.additionalProperties).must_equal false

      array_schema = result.properties.items
      _(array_schema).must_be_instance_of AichatAiClientTypes::JsonArraySchema
      _(array_schema.description).must_equal 'List of strings'

      _(array_schema.items).must_be_instance_of AichatAiClientTypes::JsonStringSchema
      _(array_schema.items.description).must_equal 'Item name'
    end

    it 'raises an error for unsupported schema types' do
      err = _(-> {AichatAiHelper.convert_json_schema_to_ruby_types({'type' => 'date'})}).must_raise StandardError
      _(err.message).must_include "Unexpected schema type='date'"
    end
  end

  describe '.get_config_request_context' do
    let(:level_id) {123}
    let(:model_id) {'gpt-4o-mini'}
    let(:temperature) {0.4}
    let(:system_prompt) {'System prompt'}
    let(:retrieval_contexts) {['retrieved context']}
    let(:encrypted_channel_id) {'encrypted-channel'}
    let(:user_id) {456}
    let(:project_id) {789}
    let(:client_type) {SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB]}
    let(:json_schema) do
      {
        'type' => 'object',
        'properties' => {'answer' => {'type' => 'string'}},
        'required' => ['answer'],
        'additionalProperties' => false
      }
    end
    let(:stored_messages) do
      [
        {'role' => 'user', 'chatMessageText' => 'Hi there'},
        {'role' => 'assistant', 'chatMessageText' => 'Hello'}
      ]
    end
    let(:new_message) do
      {
        'role' => 'user',
        'chatMessageText' => 'New question',
        'hiddenContext' => 'hidden context'
      }
    end

    before do
      level = OpenStruct.new(
        properties: {'aichat_settings' => {'levelSystemPrompt' => 'Level system prompt'}},
        name: 'Level Name'
      )
      Level.stubs(:find_by).with(id: level_id).returns(level)
      DCDO.stubs(:get).with('openai_temperature_scaling_factor', 1.5).returns(1.25)

      @new_message_parts = [AichatAiClientTypes::TextMessagePart.new(type: 'text', content: 'new')]
      @stored_message_parts = [
        [AichatAiClientTypes::TextMessagePart.new(type: 'text', content: 'old user')],
        [AichatAiClientTypes::TextMessagePart.new(type: 'text', content: 'old assistant')]
      ]

      AichatAiHelper.stubs(:format_message_parts).
        with(new_message, encrypted_channel_id, 'Level Name').
        returns(@new_message_parts)
      AichatAiHelper.stubs(:format_message_parts).
        with(stored_messages.first, encrypted_channel_id, 'Level Name').
        returns(@stored_message_parts.first)
      AichatAiHelper.stubs(:format_message_parts).
        with(stored_messages.second, encrypted_channel_id, 'Level Name').
        returns(@stored_message_parts.second)
    end

    it 'returns config, request, and context with scaled temperature and system instructions' do
      config, request, context = AichatAiHelper.get_config_request_context(
        stored_messages,
        new_message,
        temperature,
        system_prompt,
        retrieval_contexts,
        model_id,
        level_id,
        encrypted_channel_id,
        user_id,
        project_id,
        client_type,
        json_schema
      )

      _(config.model).must_equal SharedConstants::AICHAT_MODEL_VERSION
      _(config.temperature).must_equal temperature * 1.25
      _(config.systemInstructions.map(&:content)).must_equal [
        'Level system prompt',
        system_prompt,
        'retrieved context',
        'hidden context'
      ]
      _(config.response).must_be_instance_of AichatAiClientTypes::JsonResponseConfig

      _(request).must_equal @new_message_parts

      _(context.length).must_equal 2
      _(context.first.role).must_equal 'user'
      _(context.first.parts).must_equal @stored_message_parts.first
      _(context.second.role).must_equal 'model'
      _(context.second.parts).must_equal @stored_message_parts.second
    end
  end

  describe '.build_request_attributes' do
    let(:stored_messages) do
      [
        {
          status: SharedConstants::AI_INTERACTION_STATUS[:OK],
          chatMessageText: 'keep this'
        },
        {
          status: 'ERROR',
          chatMessageText: 'drop this'
        },
        {
          status: SharedConstants::AI_INTERACTION_STATUS[:OK],
          chatMessageText: ''
        }
      ]
    end

    let(:params) do
      {
        aichatContext: {
          clientType: SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB],
          currentLevelId: 7,
          scriptId: 3,
        },
        modelParameters: {temperature: 0.8},
        storedMessages: stored_messages,
        newMessage: {chatMessageText: 'latest message'}
      }
    end

    it 'builds attributes with filtered messages and context' do
      attributes = AichatAiHelper.build_request_attributes(10, params)

      _(attributes[:user_id]).must_equal 10
      _(attributes[:model_customizations][:temperature]).must_equal 0.8
      _(attributes[:model_customizations][:clientType]).must_equal SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB]

      _(attributes[:stored_messages]).must_equal [stored_messages.first]
      _(attributes[:new_message]).must_equal params[:newMessage]
      _(attributes[:level_id]).must_equal 7
      _(attributes[:script_id]).must_equal 3
      _(attributes[:project_id]).must_be_nil
    end
  end

  describe '.successful_stored_chat_messages' do
    it 'filters out non-OK or blank messages' do
      messages = [
        {status: SharedConstants::AI_INTERACTION_STATUS[:OK], chatMessageText: 'keep'},
        {status: SharedConstants::AI_INTERACTION_STATUS[:ERROR], chatMessageText: 'drop'},
        {status: SharedConstants::AI_INTERACTION_STATUS[:OK], chatMessageText: ''}
      ]

      result = AichatAiHelper.successful_stored_chat_messages(messages)

      _(result).must_equal [messages.first]
    end
  end

  describe '.project_id_from_context' do
    it 'returns decrypted project id from channel id' do
      AichatAiHelper.stubs(:get_storage_id_and_project_id).with('encrypted').returns([456, 789])

      _(AichatAiHelper.project_id_from_context({channelId: 'encrypted'})).must_equal 789
    end

    it 'returns nil if no channel id' do
      AichatAiHelper.stubs(:get_storage_id_and_project_id).with('encrypted').returns([456, 789])

      _(AichatAiHelper.project_id_from_context({})).must_be_nil
    end

    it 'raises an error when decryption fails' do
      AichatAiHelper.stubs(:get_storage_id_and_project_id).raises(StandardError.new('boom'))

      err = _(-> {AichatAiHelper.project_id_from_context({channelId: 'encrypted'})}).must_raise StandardError
      _(err.message).must_include "boom"
    end
  end

  describe '.stream_assistant_response' do
    let(:model_id) {'gpt-4o-mini'}
    let(:client_type) {SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB]}
    let(:level_id) {101}
    let(:project_id) {202}
    let(:user_id) {303}
    let(:encrypted_channel_id) {'encrypted-channel-id'}
    let(:customizations) do
      {
        'selectedModelId' => model_id,
        'temperature' => '0.6',
        'clientType' => client_type,
        'systemPrompt' => 'System prompt',
        'retrievalContexts' => ['context'],
        'responseJsonSchema' => {'type' => 'string'}
      }
    end
    let(:stored_messages) {[]}
    let(:new_message) {{'chatMessageText' => 'Hello'}}

    before do
      AichatAiHelper.stubs(:storage_id_for_user_id).with(user_id).returns('storage-id')
      AichatAiHelper.stubs(:storage_encrypt_channel_id).with('storage-id', project_id).returns(encrypted_channel_id)
    end

    it 'streams deltas and returns the full response' do
      usage_reporter = stub('usage_reporter')
      client = Class.new do
        def stream_response(_, _, _)
          yield 'Hello'
          yield nil
          yield ''
          yield ' world'
        end
      end.new
      config = stub('config')
      request = stub('request')
      context = stub('context')

      AichatAiUsageReporter.expects(:new).with(model_id, user_id, project_id, level_id).returns(usage_reporter)
      AichatAiHelper.expects(:create_ai_client_instance).with(client_type, model_id, usage_reporter).returns(client)
      AichatAiHelper.expects(:get_config_request_context).with(
        stored_messages,
        new_message,
        0.6,
        'System prompt',
        ['context'],
        model_id,
        level_id,
        encrypted_channel_id,
        user_id,
        project_id,
        client_type,
        {'type' => 'string'}
      ).returns([config, request, context])

      deltas = []
      full_text = AichatAiHelper.stream_assistant_response(
        customizations,
        stored_messages,
        new_message,
        level_id,
        project_id,
        user_id
      ) do |delta, error|
        deltas << [delta, error]
      end

      _(full_text).must_equal 'Hello world'
      _(deltas).must_equal [['Hello', nil], [' world', nil]]
    end

    it 'raises an error when client does not support streaming' do
      usage_reporter = stub('usage_reporter')
      client = Object.new

      AichatAiUsageReporter.expects(:new).with(model_id, user_id, nil, level_id).returns(usage_reporter)
      AichatAiHelper.expects(:create_ai_client_instance).with(client_type, model_id, usage_reporter).returns(client)

      err = _(
        lambda do
          AichatAiHelper.stream_assistant_response(
            customizations,
            stored_messages,
            new_message,
            level_id,
            nil,
            user_id
          )
        end
      ).must_raise ArgumentError

      _(err.message).must_include "Streaming is not supported for model #{model_id}"
    end
  end

  describe '.broadcast_error' do
    it 'broadcasts a standardized error payload' do
      AichatAiHelper.expects(:broadcast_to_stream).with(
        'stream-name',
        {event: 'error', code: 'MODEL_TIMEOUT', details: 'details', request_id: 5}
      )

      AichatAiHelper.broadcast_error('stream-name', 'MODEL_TIMEOUT', 5, 'details')
    end
  end

  describe '.broadcast_to_stream' do
    it 'uses ActionCable to broadcast a payload' do
      ActionCable.server.expects(:broadcast).with('stream-name', {event: 'ping'})

      AichatAiHelper.broadcast_to_stream('stream-name', {event: 'ping'})
    end
  end

  describe '.token_throttling_key' do
    it 'includes model and user identifiers' do
      key = AichatAiHelper.token_throttling_key('model-id', 42)

      _(key).must_equal 'aichat/tokens/model/model-id/user/42'
    end
  end

  describe '.handle_error' do
    it 'updates the request and notifies Honeybadger' do
      request = mock('request')
      details = 'Something went wrong'

      AichatAiHelper.stubs(:rack_env?).with(:development).returns(false)
      request.expects(:update!).with(response: details, execution_status: 500)
      request.stubs(:to_json).returns('{"id":1}')
      request.stubs(:user_id).returns(123)
      Honeybadger.expects(:notify).with(
        'source',
        context: {
          request: '{"id":1}',
          user_id: 123,
          details: details,
          locale: 'en'
        }
      )

      AichatAiHelper.handle_error('source', details, request, 'en', 500)
    end
  end

  describe '.report_job_start' do
    it 'pushes a start metric with environment and model id' do
      request = OpenStruct.new(model_customizations: {'selectedModelId' => 'model-id'})
      metrics_payload = nil

      CDO.stubs(:rack_env).returns('test')
      Cdo::Metrics.expects(:push).with do |_, payload|
        metrics_payload = payload
      end

      AichatAiHelper.report_job_start('TestJob', request)

      _(metrics_payload.length).must_equal 1
      metric = metrics_payload.first
      _(metric[:metric_name]).must_equal 'TestJob.Start'
      _(metric[:dimensions]).must_equal [
        {name: 'Environment', value: 'test'},
        {name: 'ModelId', value: 'model-id'}
      ]
    end
  end

  describe '.report_job_finish' do
    it 'pushes finish and execution time metrics including multimodal dimension' do
      model_id = SharedConstants::AI_CHAT_MODEL_IDS[:CHATGPT]
      request = OpenStruct.new(
        execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS],
        model_customizations: {'selectedModelId' => model_id},
        new_message: {'assets' => [{'filename' => 'image.png'}]},
        stored_messages: []
      )
      metrics_payload = nil

      CDO.stubs(:rack_env).returns('test')
      AichatAiHelper.instance_variable_set(:@start_time, Time.at(0))
      Time.stubs(:now).returns(Time.at(10))
      Cdo::Metrics.expects(:push).with do |_, payload|
        metrics_payload = payload
      end

      AichatAiHelper.report_job_finish('TestJob', request)

      _(metrics_payload.length).must_equal 3
      finish_metric = metrics_payload.find {|metric| metric[:metric_name] == 'TestJob.Finish'}
      _(finish_metric[:dimensions]).must_include({name: 'Environment', value: 'test'})
      _(finish_metric[:dimensions]).must_include({name: 'ModelId', value: model_id})
      _(finish_metric[:dimensions]).must_include({name: 'ExecutionStatus', value: 'SUCCESS'})

      execution_metrics = metrics_payload.select {|metric| metric[:metric_name] == 'TestJob.ExecutionTime'}
      _(execution_metrics.length).must_equal 2
      _(execution_metrics.all? {|metric| metric[:value] == 10}).must_equal true
      _(execution_metrics.any? {|metric| metric[:dimensions].include?({name: 'Multimodal', value: 'true'})}).must_equal true
    end
  end

  describe '.request_multimodal?' do
    it 'returns true when the new message includes assets' do
      request = OpenStruct.new(new_message: {'assets' => [{'filename' => 'image.png'}]}, stored_messages: [])

      _(AichatAiHelper.request_multimodal?(request)).must_equal true
    end

    it 'returns false when no assets are present' do
      request = OpenStruct.new(new_message: {}, stored_messages: [{'chatMessageText' => 'hi'}])

      _(AichatAiHelper.request_multimodal?(request)).must_equal false
    end
  end

  describe '.openai_or_gemini?' do
    it 'recognizes OpenAI and Gemini model ids' do
      model_id = SharedConstants::AI_CHAT_MODEL_IDS[:CHATGPT]

      _(AichatAiHelper.openai_or_gemini?(model_id)).must_equal true
      _(AichatAiHelper.openai_or_gemini?('other-model')).must_equal false
    end
  end

  describe '.get_model_id' do
    it 'returns the selected model id from the request' do
      request = OpenStruct.new(model_customizations: {'selectedModelId' => 'model-id'})

      _(AichatAiHelper.get_model_id(request)).must_equal 'model-id'
    end
  end
end
