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

    response = nil
    response_message = "Determined safe"
    site_approved = true

    response_time = Benchmark.realtime do
      response = http.start {http.request(req)}
    end

    # Safe Browsing API returns empty JSON object if no threat matches found.
    # If threat matches found, log the threat type.
    # If the api returns an error for a bad request or rate-limiting, default to
    # informed-redirect model and record the error value
    if response.nil?
      response_message = 'No response from API'
    elsif response.code == '400' || response.code == '429'
      # Note: with a 400 response, the body has no 'matches' field
      response_message = "Error code: #{response.code}"
    elsif !JSON.parse(response.body).empty?
      response_message = JSON.parse(response.body)['matches'][0]['threatType']
      site_approved = false
    end

    # Record to Firehose the response time of request rounded to thousandths of a second,
    # url, and human-readable response message
    FirehoseClient.instance.put_record(
      study: "safe-browsing-request",
      study_group: "v1",
      event: "api-response",
      data_json: {
        response_time: response_time.round(3),
        request_url: url_to_check,
        response_value: response_message
      }.to_json
    )

    site_approved
  end
end
