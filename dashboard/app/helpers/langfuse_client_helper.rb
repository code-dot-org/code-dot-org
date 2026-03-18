require 'erb'
include ERB::Util

module LangfuseClientHelper
  class Client
    attr_accessor :api_key

    LANGFUSE_URL = "https://us.cloud.langfuse.com/api/public"

    def initialize(secret_key, public_key)
      @secret_key = secret_key
      @public_key = public_key
    end

    def fetch_prompt(prompt_name)
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

    # Send a batch of events to the Langfuse ingestion endpoint.
    # Events can be trace-create, generation-create, span-create, etc.
    def ingest(batch)
      HTTParty.post(
        "#{LANGFUSE_URL}/ingestion",
        basic_auth: {
          username: @public_key,
          password: @secret_key
        },
        headers: {"Content-Type" => "application/json"},
        body: {batch: batch}.to_json
      )
    rescue => e
      Rails.logger.warn("Langfuse ingestion error: #{e.message}")
      nil
    end

    # Create a trace with a single generation observation in one batch request.
    # Only the user's message text should be passed as input (not system prompts).
    def create_trace_and_generation(trace_name:, generation_name:, model:, user_id: nil, input: nil, output: nil, usage: nil, metadata: nil, tags: nil, start_time: nil, end_time: nil)
      trace_id = SecureRandom.uuid
      now = Time.now.utc.iso8601(3)

      batch = [
        {
          type: "trace-create",
          id: SecureRandom.uuid,
          timestamp: now,
          body: {
            id: trace_id,
            name: trace_name,
            userId: user_id,
            input: input,
            output: output,
            metadata: metadata,
            tags: tags,
            timestamp: now,
          }.compact,
        },
        {
          type: "generation-create",
          id: SecureRandom.uuid,
          timestamp: now,
          body: {
            id: SecureRandom.uuid,
            traceId: trace_id,
            name: generation_name,
            model: model,
            input: input,
            output: output,
            usage: usage,
            metadata: metadata,
            startTime: start_time&.utc&.iso8601(3),
            endTime: end_time&.utc&.iso8601(3),
          }.compact,
        },
      ]

      ingest(batch)
    end
  end
end
