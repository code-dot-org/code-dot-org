require_relative '../cdo.rb'
require 'net/http'
require 'json'

module OpenAI
  def self.generate_image(prompt, resolution = "256x256")
    url = URI.parse("https://api.openai.com/v1/images/generations")
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true

    headers = {
      "Authorization" => "Bearer #{CDO.openai_api_key}",
      "Content-Type" => "application/json"
    }

    data = {
      "prompt" => prompt,
      "n" => 1,
      "size" => resolution
    }

    response = http.post(url.path, data.to_json, headers)
    response_data = JSON.parse(response.body)

    if response.code != "200"
      raise Exception.new("API request failed with status code #{response.code}")
    end

    if response_data.key?('error')
      raise Exception.new(response_data['error'])
    end

    return response_data
  end

  def self.gpt(system_prompt, prompt, timeout_override = nil)
    system_role_content = system_prompt
    url = URI.parse("https://api.openai.com/v1/chat/completions")
    http = Net::HTTP.new(url.host, url.port)
    if timeout_override
      http.read_timeout = timeout_override
    end
    http.use_ssl = true

    headers = {
      "Authorization" => "Bearer #{CDO.openai_api_key}",
      "Content-Type" => "application/json"
    }

    data = {
      "model" => "gpt-4",
      "temperature" => 0,
      "messages" => [
        {"role" => "system", "content" => system_role_content},
        {"role" => "user", "content" => prompt}
      ]
    }

    response = http.post(url.path, data.to_json, headers)
    response_data = JSON.parse(response.body)

    if response.code != "200"
      puts response.body
      raise Exception.new("API request failed with status code #{response.code}")
    end

    if response_data.key?('error')
      raise Exception.new(response_data['error'])
    end

    puts """
      FYI! This completion used #{response_data['usage']['total_tokens']} tokens,
      #{response_data['usage']['prompt_tokens']} for the prompt
      and #{response_data['usage'][completion_tokens]} for the completion.
    """
    message_content = response_data['choices'][0]['message']['content']
    return message_content
  end
end
