class OpenaiController < ApplicationController
  # POST /openai/chat_completion
  def chat_completion
    puts "got here!"
    # Set up the API endpoint URL and request headers
    url = "https://api.openai.com/v1/chat/completions"
    puts CDO.openai_api_key
    headers = {
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{CDO.openai_api_key}"
    }
    headers["OpenAI-Organization"] = CDO.openai_org if CDO.openai_org

    body = JSON.parse(request.body.read)
    # Set up the API endpoint URL and request headers
    data = {
      model: 'gpt-3.5-turbo',
      temperature: 0,
      messages: body["messages"],
    }

    # Send the request to the API endpoint
    response = HTTParty.post(url, headers: headers, body: data.to_json)

    # Parse the response JSON and return the completed text
    response_body = JSON.parse(response.body)
    puts "body:"
    puts response_body
    response = response_body['choices'][0]['message']
    puts "response:"
    puts response
    render json: response
  end
end
