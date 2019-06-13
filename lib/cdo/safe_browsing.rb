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

    response_time = Benchmark.realtime do
      response = http.start {http.request(req)}
    end

    threat_type = "Determined safe"

    response_value = response.nil? ? nil : JSON.parse(response.body).empty?

    # Determine safe if bad request (response code is 400) or if rate-limited (429)
    error_response = response.nil? ? false : (response.code == '400' || response.code == '429')

    # Create human readable text to log the type of response
    if response_value.nil?
      threat_type = 'No response from API'
    elsif !response_value
      threat_type = JSON.parse(response.body)['matches'][0]['threatType']
    elsif error_response
      threat_type = "Error code: #{response.code}"
    end

    # Record to Firehose the response time of request rounded to thousandths of a second
    FirehoseClient.instance.put_record(
      study: "safe-browsing-request",
      study_group: "v1",
      event: "api-response",
      data_json: {
        response_time: response_time.round(3),
        request_url: url_to_check,
        response_value: threat_type
      }.to_json
    )

    # Safe Browsing API returns empty JSON object if no threat matches found
    # Do determine safe if response is nil
    response_value.nil? ? true : (error_response || response_value)
  end
end
