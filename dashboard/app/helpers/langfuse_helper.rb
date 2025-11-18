module LangfuseHelper
  include LevelsHelper

  LANGFUSE_SECRET_KEY = CDO.langfuse_secret_key
  LANGFUSE_PUBLIC_KEY = CDO.langfuse_public_key

  def self.fetch_prompts(prompt_name)
    response = client.fetch_prompts(prompt_name)

    if response.code == 200
      {status: :ok, json: JSON.parse(response.body)}
    else
      {status: response.code, json: {error: response.body}}
    end
  end

  def self.client
  puts "=========="
  puts "Langfuse Helper initialized with Public Key: #{LANGFUSE_PUBLIC_KEY}"
  puts "=========="
  puts "Langfuse Helper initialized with Secret Key: #{LANGFUSE_SECRET_KEY}"
    LangfuseClientHelper::Client.new(LANGFUSE_SECRET_KEY, LANGFUSE_PUBLIC_KEY)
  end

  private_class_method :client
end
