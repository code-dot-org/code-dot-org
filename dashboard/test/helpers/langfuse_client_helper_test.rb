require 'test_helper'

class LangfuseClientHelperTest < ActiveSupport::TestCase
  setup do
    @client = LangfuseClientHelper::Client.new('sk-lf-test', 'pk-lf-test')
  end

  # Captures the single HTTParty.post the export makes and returns the URL, the
  # request options and the decoded OTLP body.
  def capture_export(**overrides)
    captured = nil
    HTTParty.stubs(:post).with do |url, options|
      captured = [url, options, JSON.parse(options[:body])]
      true
    end.returns(stub(code: 207))

    @client.export_generation_trace(**default_args.merge(overrides))
    captured
  end

  def default_args
    {
      trace_name: 'lesson-insight',
      generation_name: 'llm-call',
      model: 'gpt-4o',
      user_id: '42',
      input: {lesson_id: 1, unit_id: 2, section_id: 3},
      output: 'the model said this',
      usage: {input: 100, output: 20, total: 120},
      metadata: {lesson_name: 'Loops', student_id: 7, variables: {levels_info: 'level 1'}},
      tags: ['lesson-insight'],
      start_time: Time.utc(2026, 1, 1, 0, 0, 0),
      end_time: Time.utc(2026, 1, 1, 0, 0, 2),
      prompt_name: 'insight-prompt',
      prompt_version: 3,
    }
  end

  def spans_from(body)
    body.dig('resourceSpans', 0, 'scopeSpans', 0, 'spans')
  end

  # Returns a span's attributes as a name => unwrapped value hash.
  def attributes_of(span)
    span['attributes'].to_h do |attribute|
      value = attribute['value']
      unwrapped =
        if value.key?('arrayValue')
          value['arrayValue']['values'].map {|element| element.values.first}
        else
          value.values.first
        end
      [attribute['key'], unwrapped]
    end
  end

  test 'export posts OTLP spans to the v4 ingestion endpoint' do
    url, options, _body = capture_export

    assert_equal 'https://us.cloud.langfuse.com/api/public/otel/v1/traces', url
    assert_equal '4', options[:headers]['x-langfuse-ingestion-version']
    assert_equal 'application/json', options[:headers]['Content-Type']
    assert_equal({username: 'pk-lf-test', password: 'sk-lf-test'}, options[:basic_auth])
  end

  test 'export emits a root observation with one generation beneath it' do
    _url, _options, body = capture_export
    root, generation = spans_from(body)

    assert_equal 'lesson-insight', root['name']
    assert_equal 'llm-call', generation['name']
    assert_equal root['traceId'], generation['traceId']
    assert_equal root['spanId'], generation['parentSpanId']
    assert_nil root['parentSpanId']

    assert_match(/\A[0-9a-f]{32}\z/, root['traceId'])
    assert_match(/\A[0-9a-f]{16}\z/, root['spanId'])
    assert_match(/\A[0-9a-f]{16}\z/, generation['spanId'])

    assert_equal 'span', attributes_of(root)['langfuse.observation.type']
    assert_equal 'generation', attributes_of(generation)['langfuse.observation.type']
  end

  test 'export stamps both spans with the call start and end times' do
    _url, _options, body = capture_export

    spans_from(body).each do |span|
      assert_equal '1767225600000000000', span['startTimeUnixNano']
      assert_equal '1767225602000000000', span['endTimeUnixNano']
    end
  end

  # V4 queries observations directly, so trace-wide context only on the root is
  # invisible when filtering its children.
  test 'export repeats trace attributes on every span' do
    _url, _options, body = capture_export

    spans_from(body).each do |span|
      attributes = attributes_of(span)
      assert_equal 'lesson-insight', attributes['langfuse.trace.name']
      assert_equal '42', attributes['langfuse.user.id']
      assert_equal ['lesson-insight'], attributes['langfuse.trace.tags']
      assert_equal 'Loops', attributes['langfuse.trace.metadata.lesson_name']
      assert_equal '7', attributes['langfuse.trace.metadata.student_id']
      assert_equal '{"levels_info":"level 1"}', attributes['langfuse.trace.metadata.variables']
    end
  end

  test 'export stamps every span with the rack environment' do
    CDO.stubs(:rack_env).returns(:staging)
    _url, _options, body = capture_export

    spans_from(body).each do |span|
      assert_equal 'staging', attributes_of(span)['langfuse.environment']
    end
  end

  test 'export puts the overall input and output on both observations' do
    _url, _options, body = capture_export

    spans_from(body).each do |span|
      attributes = attributes_of(span)
      assert_equal '{"lesson_id":1,"unit_id":2,"section_id":3}', attributes['langfuse.observation.input']
      assert_equal 'the model said this', attributes['langfuse.observation.output']
    end
  end

  test 'export maps model, usage and prompt link onto the generation only' do
    _url, _options, body = capture_export
    root, generation = spans_from(body)

    attributes = attributes_of(generation)
    assert_equal 'gpt-4o', attributes['langfuse.observation.model.name']
    assert_equal '{"input":100,"output":20,"total":120}', attributes['langfuse.observation.usage_details']
    assert_equal 'insight-prompt', attributes['langfuse.observation.prompt.name']
    assert_equal '3', attributes['langfuse.observation.prompt.version']

    assert_nil attributes_of(root)['langfuse.observation.model.name']
    assert_nil attributes_of(root)['langfuse.observation.usage_details']
  end

  test 'export omits attributes with no value' do
    _url, _options, body = capture_export(user_id: nil, tags: nil, prompt_name: nil, prompt_version: nil, usage: {input: nil, output: nil, total: nil})
    _root, generation = spans_from(body)

    attributes = attributes_of(generation)
    refute attributes.key?('langfuse.user.id')
    refute attributes.key?('langfuse.trace.tags')
    refute attributes.key?('langfuse.observation.prompt.name')
    refute attributes.key?('langfuse.observation.prompt.version')
    refute attributes.key?('langfuse.observation.usage_details')
  end

  test 'export swallows transport failures' do
    HTTParty.stubs(:post).raises(Net::ReadTimeout)
    Rails.logger.expects(:warn).with(regexp_matches(/Langfuse OTLP export error/))

    assert_nil @client.export_generation_trace(**default_args)
  end
end
