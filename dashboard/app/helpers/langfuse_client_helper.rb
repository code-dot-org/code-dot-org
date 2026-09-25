require 'erb'
include ERB::Util

module LangfuseClientHelper
  class Client
    attr_accessor :api_key

    LANGFUSE_URL = "https://us.cloud.langfuse.com/api/public"
    OTLP_TRACES_URL = "#{LANGFUSE_URL}/otel/v1/traces".freeze

    OTLP_HEADERS = {
      "Content-Type" => "application/json",
      "x-langfuse-ingestion-version" => "4",
    }.freeze

    def initialize(secret_key, public_key)
      @secret_key = secret_key
      @public_key = public_key
    end

    def fetch_prompt(prompt_name, label: nil)
      headers = {
        "Content-Type" => "application/json",
      }
      response = HTTParty.get(
        "#{LANGFUSE_URL}/v2/prompts/#{url_encode(prompt_name)}",
        basic_auth: {
          username: @public_key,
          password: @secret_key
        },
        headers: headers,
        query: label ? {label: label} : {},
      )
      response
    end

    def add_dataset_item(dataset_item)
      headers = {
        "Content-Type" => "application/json",
      }
      response = HTTParty.post(
        "#{LANGFUSE_URL}/dataset-items",
        basic_auth: {
          username: @public_key,
          password: @secret_key
        },
        headers: headers,
        body: dataset_item.to_json
      )
      response
    end

    def export_spans(spans)
      HTTParty.post(
        OTLP_TRACES_URL,
        basic_auth: {
          username: @public_key,
          password: @secret_key
        },
        headers: OTLP_HEADERS,
        body: {
          resourceSpans: [
            {
              resource: {attributes: [otlp_attribute("service.name", "dashboard")]},
              scopeSpans: [{scope: {name: "LangfuseClientHelper"}, spans: spans}],
            },
          ],
        }.to_json
      )
    rescue => exception
      Rails.logger.warn("Langfuse OTLP export error: #{exception.message}")
      nil
    end

    # Create a trace span with a single generation span in one batch request.
    # Only the user's message text should be passed as input (not system prompts).
    def create_trace_and_generation(trace_name:, generation_name:, model:, user_id: nil, input: nil, output: nil, usage: nil, metadata: nil, tags: nil, start_time: nil, end_time: nil, prompt_name: nil, prompt_version: nil)
      trace_id = SecureRandom.hex(16)
      root_span_id = SecureRandom.hex(8)
      start_nanos = unix_nanos(start_time)
      end_nanos = unix_nanos(end_time)

      shared_attributes =
        trace_attributes(trace_name: trace_name, user_id: user_id, tags: tags, metadata: metadata) +
        observation_io_attributes(input, output)

      root_span = otlp_span(
        trace_id: trace_id,
        span_id: root_span_id,
        name: trace_name,
        start_nanos: start_nanos,
        end_nanos: end_nanos,
        attributes: shared_attributes + [otlp_attribute("langfuse.observation.type", "span")],
      )

      generation_span = otlp_span(
        trace_id: trace_id,
        span_id: SecureRandom.hex(8),
        parent_span_id: root_span_id,
        name: generation_name,
        start_nanos: start_nanos,
        end_nanos: end_nanos,
        attributes: shared_attributes + generation_attributes(
          model: model,
          usage: usage,
          prompt_name: prompt_name,
          prompt_version: prompt_version,
        ),
      )

      export_spans([root_span, generation_span])
    end

    private def otlp_span(trace_id:, span_id:, name:, start_nanos:, end_nanos:, attributes:, parent_span_id: nil)
      {
        traceId: trace_id,
        spanId: span_id,
        parentSpanId: parent_span_id,
        name: name,
        kind: 1, # default for internal spans
        startTimeUnixNano: start_nanos,
        endTimeUnixNano: end_nanos,
        attributes: attributes,
      }.compact
    end

    private def trace_attributes(trace_name:, user_id:, tags:, metadata:)
      attributes = [
        otlp_attribute("langfuse.trace.name", trace_name),
        otlp_attribute("langfuse.environment", langfuse_environment),
      ]
      attributes << otlp_attribute("langfuse.user.id", user_id) if user_id
      attributes << otlp_attribute("langfuse.trace.tags", tags.map(&:to_s)) if tags.present?
      metadata&.compact&.each do |key, value|
        attributes << otlp_attribute("langfuse.trace.metadata.#{key}", json_string(value))
      end
      attributes
    end

    private def generation_attributes(model:, usage:, prompt_name:, prompt_version:)
      attributes = [otlp_attribute("langfuse.observation.type", "generation")]
      attributes << otlp_attribute("langfuse.observation.model.name", model) if model
      token_counts = usage&.compact
      attributes << otlp_attribute("langfuse.observation.usage_details", token_counts.to_json) if token_counts.present?
      attributes << otlp_attribute("langfuse.observation.prompt.name", prompt_name) if prompt_name
      attributes << otlp_attribute("langfuse.observation.prompt.version", prompt_version.to_i) if prompt_version
      attributes
    end

    private def observation_io_attributes(input, output)
      attributes = []
      attributes << otlp_attribute("langfuse.observation.input", json_string(input)) unless input.nil?
      attributes << otlp_attribute("langfuse.observation.output", json_string(output)) unless output.nil?
      attributes
    end

    private def otlp_attribute(key, value)
      {key: key, value: otlp_value(value)}
    end

    private def otlp_value(value)
      case value
      when String then {stringValue: value}
      when Integer then {intValue: value.to_s}
      when Float then {doubleValue: value}
      when true, false then {boolValue: value}
      when Array then {arrayValue: {values: value.map {|element| otlp_value(element)}}}
      else {stringValue: value.to_json}
      end
    end

    private def langfuse_environment
      # Production uses "default" to maintain consistency with all existing traces.
      CDO.rack_env?(:production) ? "default" : CDO.rack_env.to_s
    end

    private def json_string(value)
      value.is_a?(String) ? value : value.to_json
    end

    private def unix_nanos(time)
      ((time || Time.now).to_r * 1_000_000_000).to_i.to_s
    end
  end
end
