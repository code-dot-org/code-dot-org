require 'httparty'
require 'json'

class OpenaiController < ApplicationController
  # POST /openai/image_generate
  def image_generate
    base_uri = "https://api.openai.com/v1"
    api_key = CDO.openai_api_key
    organization = CDO.openai_org

    puts 'to api_key: ' + api_key + ' and organization: ' + organization

    # prompt = params[:prompt] ? params[:prompt] : 'a husky wearing a blue sweater and holding a banana'
    prompt = "#{params[:prompt]}, kindergarten-appropriate, transparent background"
    puts prompt
    
    options = {
      headers: {
        'Authorization' => "Bearer #{api_key}",
        'Content-Type' => 'application/json',
        'OpenAI-Organization' => organization
      },
      body: {
        'prompt' => prompt,
        'size' => '256x256',
        'n' => 2,
        'response_format' => 'b64_json'
      }.to_json
    }

    response = HTTParty.post("#{base_uri}/images/generations", options)
    if response.code == 200
      result = response['data']
      puts "Generated data: #{result}"
      render json: result
    else
      puts response
      raise StandardError, "Image generation failed: #{response.message}"
    end
    # render json: [{"url"=>'https://picsum.photos/200/300'}]
  end
end