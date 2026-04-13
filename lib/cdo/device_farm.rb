require 'aws-sdk-devicefarm'

# Manages AWS Device Farm Desktop Browser Testing sessions.
#
# Unlike Sauce Labs, Device Farm does not require a proxy tunnel — browsers run
# in AWS and connect directly to whatever URL the test points them at. This means
# tests must target a publicly accessible host (e.g. test-studio.code.org), not
# localhost. No equivalent of `bin/sauce_connect` is needed.
#
# Prerequisites:
#   1. Create a Desktop Browser Testing project in AWS Device Farm (one-time):
#        aws devicefarm create-test-grid-project --name cdo-ui-tests --region us-west-2
#   2. Set device_farm_project_arn in locals.yml (local dev) or via the
#      DEVICE_FARM_PROJECT_ARN environment variable (CI).
#   3. Ensure AWS credentials are available (instance profile, env vars, etc.).

module Cdo
  module DeviceFarm
    # How long (seconds) each test grid session URL remains valid.
    # Device Farm will terminate sessions that exceed this duration.
    SESSION_EXPIRY_SECONDS = 600 # 10 minutes

    # AWS region where the Device Farm project lives.
    # Desktop Browser Testing is only available in us-west-2.
    REGION = 'us-west-2'.freeze

    # Returns a one-time WebDriver endpoint URL for a new Device Farm session.
    # Pass this URL directly to Selenium::WebDriver::Remote as the server URL.
    def self.create_test_grid_url
      raise 'Please define CDO.device_farm_project_arn in locals.yml or set DEVICE_FARM_PROJECT_ARN' \
        if CDO.device_farm_project_arn.blank?

      resp = client.create_test_grid_url(
        project_arn: CDO.device_farm_project_arn,
        expires_in_seconds: SESSION_EXPIRY_SECONDS
      )
      resp.url
    end

    # Fetches and logs the pass/fail counters for a completed Device Farm job.
    # Uses get_job, which returns counters: total, passed, failed, warned, errored, skipped.
    # See: https://docs.aws.amazon.com/devicefarm/latest/APIReference/API_GetJob.html
    #
    # @param job_arn [String] the ARN of the Device Farm job (see job_arn_for)
    def self.log_result(job_arn)
      return unless job_arn

      job = client.get_job(arn: job_arn).job
      counters = job.counters
      puts "Device Farm job #{job_arn}: " \
           "result=#{job.result}, " \
           "passed=#{counters.passed}, " \
           "failed=#{counters.failed}, " \
           "errored=#{counters.errored}, " \
           "total=#{counters.total}"
    rescue => exception
      puts "Error fetching Device Farm job result: #{exception}"
    end

    # Constructs a Device Farm job ARN from the project ARN and the WebDriver
    # session ID returned by browser.session_id after connecting a RemoteWebDriver.
    #
    # Job ARN format:
    #   arn:aws:devicefarm:<region>:<account-id>:job:<project-uuid>/<session-id>
    #
    # @param selenium_session_id [String] the session ID from browser.session_id
    # @return [String, nil] the job ARN, or nil if project ARN is not configured
    def self.job_arn_for(selenium_session_id)
      return nil if CDO.device_farm_project_arn.blank?

      # project ARN: arn:aws:devicefarm:us-west-2:<account-id>:testgrid-project:<project-uuid>
      arn_parts = CDO.device_farm_project_arn.split(':')
      account_id = arn_parts[4]
      project_uuid = arn_parts[6]

      "arn:aws:devicefarm:#{REGION}:#{account_id}:job:#{project_uuid}/#{selenium_session_id}"
    end

    def self.client
      @client ||= Aws::DeviceFarm::Client.new(region: REGION)
    end
    private_class_method :client
  end
end
