# frozen_string_literal: true

class Clients::CleverRest
  API_HOST = 'https://api.clever.com'

  attr_reader :oauth_token, :api_version

  def initialize(oauth_token:, api_version: AuthenticationOption::Clever::VERSION[:v3])
    @oauth_token = oauth_token
    @api_version = api_version
  end

  def get(endpoint)
    JSON.parse RestClient.get(url_for(endpoint), headers)
  end

  private def headers
    @headers ||= {
      authorization: "Bearer #{oauth_token}",
    }
  end

  private def url_for(endpoint)
    File.join(API_HOST, version_path, endpoint)
  end

  private def version_path
    case api_version
    when AuthenticationOption::Clever::VERSION[:v3]
      'v3.0'
    else
      raise "Unsupported Clever API version: #{api_version}"
    end
  end
end
