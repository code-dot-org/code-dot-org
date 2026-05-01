require 'cdo/aws/ec2'

# Generates lab2 level data on demand by prompting Claude via Bedrock.
# Used by Music and Panels levels: when a curriculum author fills in the
# "Generate prompt" field on a level, the AI produces the level-specific
# data (e.g. the panels array, or the music level_data) at the time the
# client retrieves the level properties.
module LevelGeneratorHelper
  # Sonnet 4.5 is the strongest Anthropic model wired into our Bedrock
  # access today; switch to a stronger inference profile here when one
  # is provisioned in cloud_formation_stack.yml.erb.
  MODEL_ID = 'us.anthropic.claude-sonnet-4-5-20250929-v1:0'.freeze
  MAX_TOKENS = 8000
  TEMPERATURE = 0.7
  ANTHROPIC_VERSION = 'bedrock-2023-05-31'.freeze

  class GenerationError < StandardError; end

  extend self

  # Send a system+user prompt pair to Claude and return the raw text
  # response. Returns a stub response in dev/test so curriculum authors
  # can iterate on the editor without burning tokens.
  def generate_text(system_prompt:, user_prompt:)
    body = {
      anthropic_version: ANTHROPIC_VERSION,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      system: system_prompt,
      messages: [{role: 'user', content: user_prompt}]
    }

    response = bedrock_runtime_client.invoke_model(
      model_id: MODEL_ID,
      content_type: 'application/json',
      accept: 'application/json',
      body: body.to_json
    )

    parsed = JSON.parse(response.body.read)
    text = parsed.dig('content', 0, 'text')
    raise GenerationError, "Empty response from Bedrock: #{parsed.inspect}" if text.blank?
    text
  end

  # Strip the markdown code fences Claude likes to wrap JSON in, then
  # parse. Raises GenerationError if the response isn't usable JSON.
  def generate_json(system_prompt:, user_prompt:)
    text = generate_text(system_prompt: system_prompt, user_prompt: user_prompt)
    json_text = text.strip.sub(/\A```(?:json)?\s*/m, '').sub(/\s*```\z/m, '')
    JSON.parse(json_text)
  rescue JSON::ParserError => exception
    raise GenerationError, "Generated text was not valid JSON: #{exception.message}\n#{text}"
  end

  def bedrock_runtime_client
    if stub_external_services?
      stubbed_client
    else
      Aws::BedrockRuntime::Client.new(region: region)
    end
  end

  def stub_external_services?
    # Tests stay stubbed unconditionally so they don't burn tokens or
    # depend on AWS credentials. Development hits real Bedrock — set
    # config.stub_aichat_external_services = true in a development
    # initializer if you want to opt back in to the stub.
    return true if rack_env == :test
    Rails.application.config.respond_to?(:stub_aichat_external_services) &&
      Rails.application.config.stub_aichat_external_services
  end

  def stubbed_client
    client = Aws::BedrockRuntime::Client.new(stub_responses: true, region: region)
    stub_body = {
      content: [{type: 'text', text: stub_response_text}]
    }.to_json
    client.stub_responses(:invoke_model, body: stub_body, content_type: 'application/json')
    client
  end

  # Stub returns a payload that satisfies the Music and Panels generators'
  # shape checks. The Weblab2 generator's shape check (startSources.files)
  # intentionally fails against this stub and falls back to static start
  # sources; Weblab2 tests should re-stub the bedrock client themselves.
  def stub_response_text
    {
      panels: [
        {text: '### Stub panel 1\nLocal/test stub for the level generator.',
         imagePrompt: 'A friendly placeholder illustration in flat-vector style.'},
        {text: '### Stub panel 2\nReplace with a real Bedrock call in production.',
         imagePrompt: 'A second placeholder illustration in the same style.'}
      ],
      library: 'launch2024',
      packId: 'default',
      startSources: {
        blocks: {
          languageVersion: 0,
          blocks: [{type: 'when_run', x: 30, y: 30}]
        }
      }
    }.to_json
  end

  def region
    AWS::EC2.region || CDO.aws_region
  end

  def rack_env
    Rails.env.to_sym
  end
end
