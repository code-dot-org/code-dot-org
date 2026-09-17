require 'erb'
include ERB::Util

# HTTP client for the Langfuse public API.
#
# Tracing data goes to the OTLP/HTTP endpoint as OpenTelemetry spans. Langfuse
# v4 has no separate trace record: a trace is just the set of spans sharing a
# trace id, and each span is written once and never updated. Trace-wide
# attributes are therefore repeated on every span, because v4 queries
# observations directly and cannot see attributes that sit only on the root.
#
# Prompt and dataset-item calls are ordinary REST and are unaffected by v4.
module LangfuseClientHelper
  class Client
    attr_accessor :api_key

    LANGFUSE_URL = "https://us.cloud.langfuse.com/api/public"
    OTLP_TRACES_URL = "#{LANGFUSE_URL}/otel/v1/traces".freeze

    # Without this header Langfuse routes spans through the legacy pipeline and
    # they take up to 10 minutes to appear.
    OTLP_HEADERS = {
      "Content-Type" => "application/json",
      "x-langfuse-ingestion-version" => "4",
    }.freeze

    SPAN_KIND_INTERNAL = 1

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

    # Send completed OTLP spans to Langfuse. Spans are immutable once accepted:
    # re-sending a span id duplicates the observation rather than updating it.
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

    # Export a trace holding a root observation and one generation beneath it.
    # The root carries the overall input and output, which is what
    # observation-level evaluators read; they do not see sibling or child spans.
    # Only the user's message text should be passed as input (not system prompts).
    def export_generation_trace(trace_name:, generation_name:, model:, user_id: nil, input: nil, output: nil, usage: nil, metadata: nil, tags: nil, start_time: nil, end_time: nil, prompt_name: nil, prompt_version: nil)
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
        kind: SPAN_KIND_INTERNAL,
        startTimeUnixNano: start_nanos,
        endTimeUnixNano: end_nanos,
        attributes: attributes,
      }.compact
    end

    private def trace_attributes(trace_name:, user_id:, tags:, metadata:)
      attributes = [
        otlp_attribute("langfuse.trace.name", trace_name),
        # Every rack env shares one Langfuse project, so without this, adhoc and
        # development traffic is indistinguishable from production. Langfuse's
        # UI filter defaults to the "default" environment, which nothing here
        # sends to any more.
        otlp_attribute("langfuse.environment", CDO.rack_env.to_s),
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

    # Langfuse only filters on top-level metadata keys, so every mapped value has
    # to be a scalar or an array of scalars.
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

    private def json_string(value)
      value.is_a?(String) ? value : value.to_json
    end

    # OTLP JSON carries 64-bit timestamps as decimal strings.
    private def unix_nanos(time)
      ((time || Time.now).to_r * 1_000_000_000).to_i.to_s
    end
  end
end
