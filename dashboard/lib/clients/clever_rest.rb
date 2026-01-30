# frozen_string_literal: true

class Clients::CleverRest
  API_HOST = 'https://api.clever.com'

  attr_reader :oauth_token, :api_version

  def initialize(oauth_token:, api_version: 'v2.1')
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
    File.join(API_HOST, api_version, endpoint)
  end
end
