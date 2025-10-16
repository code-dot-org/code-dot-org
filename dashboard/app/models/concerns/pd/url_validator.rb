module Pd::UrlValidator
  extend ActiveSupport::Concern

  class_methods do
    # It checks if the URL is valid by attempting to parse it
    # Optionally, it can skip checking for the protocol (http/https)
    # It does not check if the URL is reachable or if it points to a valid resource
    # @param url [String] The URL to validate
    # @param skip_protocol_check [Boolean] Optional. When true, skips checking for http/https. Default is false
    # @return [Boolean] Returns true if the URL is valid, false if not
    def valid_url?(url, skip_protocol_check = false)
      uri = URI.parse(url)
      skip_protocol_check || uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
    rescue URI::InvalidURIError
      false
    end
  end
end
