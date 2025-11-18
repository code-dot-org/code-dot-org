module LangfuseClientHelper
  class Client
    attr_accessor :api_key

    LANGFUSE_URL = "https://us.cloud.langfuse.com/api/public"

    def initialize(secret_key, public_key)
      @secret_key = secret_key
      @public_key = public_key
      puts "----------"
      puts "Langfuse Client initialized with Public Key: #{@public_key}"
      puts "----------"
      puts "Langfuse Client initialized with Secret Key: #{@secret_key}"
    end

    def fetch_prompts(prompt_name)
      headers = {
        "Content-Type" => "application/json",
      }
      response = HTTParty.get(
        "#{LANGFUSE_URL}/v2/prompts",
        basic_auth: {
          username: @public_key,
          password: @secret_key
        },
        headers: headers,
      )
      # TODO: Error handling if the response is not 200
      response
    end
  end
end