# One way to call Gemini's generateContent, by either route Google offers:
#
#   vertex  Vertex AI, with a service account key from our config. The AI
#           Gateway calls Vertex too, so this draws in the same place a live
#           picture is drawn when the key is for the gateway's project.
#   gemini  the Gemini API, with an API key.
#
# Both take the same request body and return the same response.

require 'googleauth'
require 'httparty'
require 'json'
require 'stringio'

require_relative 'constants'

class GoogleGenerative
  VERTEX_SCOPE = 'https://www.googleapis.com/auth/cloud-platform'

  def initialize(route, credential)
    raise "Error: unknown Google route '#{route}'" unless GOOGLE_PROVIDERS.include?(route)
    @route = route
    @credential = credential
    @lock = Mutex.new
  end

  # The Vertex project a request bills, or nil on the Gemini API.
  def project
    @route == 'vertex' ? service_account['project_id'] : nil
  end

  def generate_content(model, body, timeout:)
    HTTParty.post(url(model), headers: headers, body: JSON.generate(body), timeout: timeout)
  end

  private def url(model)
    if @route == 'vertex'
      format(VERTEX_URL, project: project, model: model)
    else
      format(GEMINI_URL, model: model)
    end
  end

  private def headers
    auth = @route == 'vertex' ? {'Authorization' => "Bearer #{access_token}"} : {'x-goog-api-key' => @credential.to_s}
    {'Content-Type' => 'application/json'}.merge(auth)
  end

  # The config holds the key as parsed JSON, or as its text.
  private def service_account
    @service_account ||= begin
      key = @credential.is_a?(String) ? JSON.parse(@credential) : @credential.to_h.transform_keys(&:to_s)
      raise 'Error: the service account key has no project_id' unless key['project_id']
      key
    end
  end

  # One token for every thread, fetched again a minute before it expires.
  private def access_token
    @lock.synchronize do
      if @token.nil? || Time.now >= @expires_at
        authorizer = Google::Auth::ServiceAccountCredentials.make_creds(
          json_key_io: StringIO.new(JSON.generate(service_account)),
          scope: VERTEX_SCOPE,
          token_credential_uri: service_account['token_uri']
        )
        data = authorizer.fetch_access_token!
        @token = data['access_token']
        @expires_at = Time.now + data['expires_in'].to_i - 60
      end
      @token
    end
  end
end
