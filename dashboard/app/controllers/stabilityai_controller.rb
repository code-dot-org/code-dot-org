require 'httparty'
require 'json'
require 'cdo/web_purify'

class StabilityaiController < ApplicationController
  def replace_user_input(system_input, user_input)
    # Replace the substring "user_prompt" with the value of the user_prompt argument
    modified_string = system_input.gsub("user_input", user_input)
    modified_string
  end

  # POST /stabilityai/image_generate
  def image_generate
    engine_id = 'stable-diffusion-v1-5'
    api_key = CDO.stabilityai_api_key

    raise 'Missing Stability API key.' if api_key.nil?

    system_input = "user_input with a white background"
    user_input = params[:prompt] || "a lighthouse"
    prompt = replace_user_input(system_input, user_input)
    style_preset = params[:stylePreset] || "pixel-art"

    puts "Prompt: #{prompt}"
    puts "Style preset: #{style_preset}"

    url = "https://api.stability.ai/v1/generation/#{engine_id}/text-to-image"
    headers = {
      'Content-Type' => 'application/json',
      'Accept' => 'application/json',
      'Authorization' => "Bearer #{api_key}"
    }
    body = {
      'text_prompts' => [
        {
          'text' => prompt
        }
      ],
      # How strictly the diffusion prompt adheres to the prompt text (0-35)
      'cfg_scale' => 7,
      # TODO: I don't know what this means (default value is "NONE")
      'clip_guidance_preset' => 'FAST_BLUE',
      'height' => 512, # height * width must be >= 262,144 (512x512)
      'width' => 512,
      'samples' => 1,
      # TODO: Can be modified from 10-150
      'steps' => 30,
      # style_preset guides the image towards a particular style
      # ENUM values here: https://api.stability.ai/docs#tag/v1generation/operation/textToImage
      'style_preset' => style_preset,
    }

    response = HTTParty.post(url, headers: headers, body: body.to_json)

    if response.code != 200
      raise "Non-200 response: #{response.body}"
    end

    data = response.parsed_response
    render json: data
    # data['artifacts'].each_with_index do |image, i|
    #   File.binwrite("./out/v1_txt2img_#{i}.png", Base64.decode64(image['base64']))
    # end
  end
end
