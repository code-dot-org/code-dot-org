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
      puts "In LangfuseClientHelper::Client.add_dataset_item with dataset_item: #{dataset_item}"
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
      puts "Received response from Langfuse: #{response.code} - #{response.body}"
      response
    end

    def log_trace(trace)
      puts "In LangfuseClientHelper::Client.log_trace with trace: #{trace}"
      headers = {
        "Content-Type" => "application/json",
        # OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic ${AUTH_STRING}"
      }
      response = HTTParty.post(
        "#{LANGFUSE_URL}/otel/v1/traces",
        basic_auth: {
          username: @public_key,
          password: @secret_key
        },
        headers: headers,
        body: trace.to_json
      )
      puts "Received response from Langfuse log_trace: #{response.code} - #{response.body}"
      response
    end
  end
end
