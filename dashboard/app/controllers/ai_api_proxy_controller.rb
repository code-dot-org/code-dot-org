# Bare-bones proxy controller to forward AI API requests from the client to the appropriate AI provider.
# Attaches the necessary API key headers to avoid exposing them to the client.
class AiApiProxyController < ApplicationController
  API_KEYS = {
    'google' => CDO.google_gemini_ai_chat_lab_api_key,
    'openai' => CDO.openai_student_learning_api_key
  }

  # POST /ai_api_proxy/:provider
  def proxy_request
    unless current_user.has_aichat_access?
      return render status: :forbidden, json: {user_type: current_user.user_type}
    end

    provider = params[:provider]

    unless API_KEYS.key?(provider)
      return render json: {error: "Invalid or missing provider: #{provider}"}, status: :bad_request
    end

    url = params[:url]
    body = params[:body]
    headers = params[:headers] || {}

    unless url.present? && body
      return render json: {error: "Missing required parameters: url and body"}, status: :bad_request
    end

    api_key = API_KEYS[provider]
    headers = headers.merge(auth_header(provider, api_key))

    response = HTTParty.post(url, headers: headers, body: body)
    render json: response.parsed_response, status: response.code
  rescue JSON::ParserError
    render json: {error: "Invalid request body"}, status: :bad_request
  end

  private def auth_header(provider, api_key)
    case provider
    when 'openai'
      {'Authorization' => "Bearer #{api_key}"}
    when 'google'
      {'x-goog-api-key' => api_key}
    end
  end
end
