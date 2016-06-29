require 'google/api_client'
require 'yaml'

# Google Analytics Client helper.
# Authentication instructions here:
# https://github.com/google/google-api-ruby-client-samples/tree/master/service_account#setup-authentication
#
# After setting up authentication, provide the following CDO.* attributes (example values below):
#   CDO.ga_service_account_email: xxx-abcdef@developer.gserviceaccount.com
#   CDO.ga_api_key: ABCDEF123456 [Base64-encoded pkcs12 key file]
#   CDO.ga_api_secret: notasecret
#   CDO.ga_profile_id: 01234567 [this is the "View ID", not the "Account ID"]

class GAClient
# Modified from https://github.com/google/google-api-ruby-client-samples/blob/master/service_account/analytics.rb
  API_VERSION = 'v3'.freeze
  CACHED_API_FILE = File.join(__dir__, "analytics-#{API_VERSION}.cache")

  ## Query Parameters Summary https://developers.google.com/analytics/devguides/reporting/core/v3/reference#q_summary
  ## Dimensions and Metrics Reference: https://developers.google.com/analytics/devguides/reporting/core/dimsmets
  ## A single dimension data request to be retrieved from the API is limited to a maximum of 7 dimensions
  ## A single metrics data request to be retrieved from the API is limited to a maximum of 10 metrics

  ## Function to query google for a set of analytics attributes
  def self.query_ga(start_date, end_date, dimensions, metrics, filter)
    client, analytics = get_client
    # noinspection RubyStringKeysInHashInspection,RubyClassVariableUsageInspection
    client.execute(:api_method => analytics.data.ga.get, :parameters => {
                                                             'ids' => 'ga:' + @@profile_id,
                                                             'start-date' => start_date,
                                                             'end-date' => end_date,
                                                             'dimensions' => dimensions,
                                                             'metrics' => metrics,
                                                             'filters' => filter,
                                                             'sampleLevel' => 'HIGHER_PRECISION',
                                                             'max-results' => 10000
                                                         })
  end

  # noinspection RubyClassVariableUsageInspection,RubyResolve
  def self.get_client
    if class_variable_defined?(:@@client) && class_variable_defined?(:@@analytics)
      return [@@client, @@analytics]
    end

    ## Update these to match your own apps credentials in the ga_config.yml file
    service_account_email = CDO.ga_service_account_email   # Email of service account
    pkcs12_key = Base64.strict_decode64(CDO.ga_api_key)     # private key
    key_secret = CDO.ga_api_secret                         # Password to unlock private key
    @@profile_id = CDO.ga_profile_id.to_s                   # Analytics profile ID.

    @@client = Google::APIClient.new(
      :application_name => 'cdo-ga-analytics',
      :application_version => '0.0.1')

    ## Load our credentials for the service account
    signing_key = Google::APIClient::KeyUtils.load_from_pkcs12(pkcs12_key, key_secret)

    @@client.authorization = Signet::OAuth2::Client.new(
      :token_credential_uri => 'https://accounts.google.com/o/oauth2/token',
      :audience => 'https://accounts.google.com/o/oauth2/token',
      :scope => 'https://www.googleapis.com/auth/analytics.readonly',
      :issuer => service_account_email,
      :signing_key => signing_key)

    ## Request a token for our service account
    @@client.authorization.fetch_access_token!

    @@analytics = nil
    ## Load cached discovered API, if it exists. This prevents retrieving the
    ## discovery document on every run, saving a round-trip to the discovery service.
    if File.exist? CACHED_API_FILE
      File.open(CACHED_API_FILE) do |file|
        @@analytics = Marshal.load(file)
      end
    else
      @@analytics = @@client.discovered_api('analytics', API_VERSION)
      File.open(CACHED_API_FILE, 'w') do |file|
        Marshal.dump(@@analytics, file)
      end
    end

    [@@client, @@analytics]
  end
end
