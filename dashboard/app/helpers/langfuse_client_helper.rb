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
  end
end