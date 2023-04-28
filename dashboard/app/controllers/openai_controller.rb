require 'httparty'
require 'json'
require 'cdo/web_purify'

class OpenaiController < ApplicationController
  # POST /openai/image_generate
  def image_generate
    base_uri = "https://api.openai.com/v1"

    puts "Profanity check enabled: #{params[:profanityCheckEnabled]}"
    if params[:profanityCheckEnabled] == 'true'
      profanities = WebPurify.find_potential_profanities(params[:prompt], ['en'])
      if profanities.present?
        return render json: {error: "We found the following profanities in your prompt: #{profanities}. Please modify your prompt and try again."}, status: :bad_request
      end
    end

    prompt = "A single, cute image of #{params[:prompt]} on a white background, for use as a character in a computer game designed for a kindergartner."
    options = {
      headers: {
        'Authorization' => "Bearer #{CDO.openai_api_key}",
        'Content-Type' => 'application/json',
        'OpenAI-Organization' => CDO.openai_org
      },
      body: {
        'prompt' => prompt,
        'size' => '256x256',
        'n' => 1,
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
      render json: {error: "Image generation failed: #{response.to_json}"}, status: :bad_request
    end
  end
end
