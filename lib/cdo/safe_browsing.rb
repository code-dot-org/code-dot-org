require 'net/http'
require 'uri'
require 'json'
require 'benchmark'
require 'cdo/firehose'

SAFE_BROWSING_THREAT_TYPES = %w(THREAT_TYPE_UNSPECIFIED MALWARE SOCIAL_ENGINEERING UNWANTED_SOFTWARE POTENTIALLY_HARMFUL_APPLICATION)

module SafeBrowsing
  # Returns whether Google Safe Browsing API identified threats in given URL
  # @param [String] url The url to lookup in Google Safe Browsing API.
  # @return [Boolean] False, if Google Safe Browsing has identified threat at given website. True, otherwise.
  def self.determine_safe_to_open(url_to_check)
    return false unless valid_url?(url_to_check)
    return false unless CDO.google_safe_browsing_key

    uri = URI("https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + CDO.google_safe_browsing_key)
    req = Net::HTTP::Post.new(uri)
    req.body = {
      threatInfo: {
        threatTypes: SAFE_BROWSING_THREAT_TYPES,
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{url: url_to_check}]
      }
    }.to_json

    req.basic_auth 'user', 'pass'
    req['Content-Type'] = 'application/json'

    http = Net::HTTP.new(uri.hostname, uri.port)
    http.use_ssl = true

    site_approved = true

    response = http.start {http.request(req)}

    # Safe Browsing API returns empty JSON object if no threat matches found.
    unless JSON.parse(response.body).empty?
      site_approved = false
    end

    site_approved
  end

  def self.valid_url?(url)
    uri = URI.parse(url)
    uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
  rescue URI::InvalidURIError
    false
  end
end
