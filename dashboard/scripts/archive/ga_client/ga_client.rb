require 'google/apis/analytics_v3'
require 'googleauth'

# Google Analytics Client helper.
# Authentication instructions here:
# https://github.com/google/google-api-ruby-client-samples/tree/master/service_account#setup-authentication
#
# After setting up authentication, provide the following CDO.* attributes (example values below):
#   CDO.ga_profile_id: 01234567 [this is the "View ID", not the "Account ID"]
#   CDO.ga_account: {"type": "service_account", ...etc...} [JSON service-account credentials]

class GAClient
  # Query Parameters Summary https://developers.google.com/analytics/devguides/reporting/core/v3/reference#q_summary
  # Dimensions and Metrics Reference: https://developers.google.com/analytics/devguides/reporting/core/dimsmets
  # A single dimension data request to be retrieved from the API is limited to a maximum of 7 dimensions
  # A single metrics data request to be retrieved from the API is limited to a maximum of 10 metrics

  # Function to query google for a set of analytics attributes
  def self.query_ga(start_date, end_date, dimensions, metrics, filter)
    analytics = Google::Apis::AnalyticsV3::AnalyticsService.new
    analytics.authorization = Google::Auth::ServiceAccountCredentials.make_creds(
      scope: 'https://www.googleapis.com/auth/analytics',
      json_key_io: StringIO.new(CDO.ga_account.to_json)
    )
    analytics.get_ga_data(
      'ga:' + CDO.ga_profile_id.to_s, # ids
      start_date,
      end_date,
      metrics,
      dimensions: dimensions,
      filters: filter,
      sampling_level: 'HIGHER_PRECISION',
      max_results: 10000
    )
  end
end
