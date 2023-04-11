require 'httpparty'
require 'json'

class OpenAIController < ApplicationController
  # POST /openai/image_generate
  def image_generate
    base_uri = "https://api.openai.com/v1"
    api_key = CDO.openai_api_key

    options = {
      headers: {
        'Authorization' => "Bearer #{@api_key}",
        'Content-Type' => 'application/json'
      },
      body: {
        'prompt' => params[:prompt],
        'size' => 1,
        'model' => 'image-dalle-256'
      }.to_json
    }

    response = HTTParty.post("#{base_uri}/images/generations", options)

    if response.code == 200
      image_url = response['data'][0]['url']
      puts "Generated image: #{image_url}"
      render json: {image_url: image_url}
    else
      raise StandardError, "Image generation failed: #{response.message}"
    end
  end
end