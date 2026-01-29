# frozen_string_literal: true

class Clients::CleverRest
  API_HOST = 'https://api.clever.com'
  API_VERSION = 'v2.1'

  attr_reader :oauth_token

  def initialize(oauth_token:)
    @oauth_token = oauth_token
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
    File.join(API_HOST, API_VERSION, endpoint)
  end
end
