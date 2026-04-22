require 'aws-sdk-devicefarm'

# Manages AWS Device Farm sessions for both desktop and mobile browser testing.
#
# Desktop Browser Testing uses TestGrid projects and create_test_grid_url to get
# a one-shot WebDriver endpoint. Mobile Device Testing uses standard Device Farm
# projects with create_remote_access_session to provision a real iOS/Android
# device and return an Appium-compatible WebDriver endpoint.
#
# Neither path requires a proxy tunnel -- browsers/devices run in AWS and connect
# directly to whatever URL the test points them at (e.g. test-studio.code.org).
#
# Prerequisites:
#   1. Desktop: create a Desktop Browser Testing (TestGrid) project:
#        aws devicefarm create-test-grid-project --name cdo-ui-tests --region us-west-2
#      Set device_farm_desktop_project_arn in AWS Secrets Manager or locals.yml.
#   2. Mobile: create a standard Device Farm project via the AWS console.
#      Set device_farm_mobile_project_arn in AWS Secrets Manager or locals.yml.
#   3. Ensure AWS credentials are available (instance profile, env vars, etc.).

module Cdo
  module DeviceFarm
    # How long (seconds) each desktop test grid session URL remains valid.
    SESSION_EXPIRY_SECONDS = 600 # 10 minutes

    # Polling parameters for mobile session provisioning.
    MOBILE_SESSION_TIMEOUT = 360 # 6 minutes -- time for device to boot
    MOBILE_CONCURRENCY_TIMEOUT = 300 # 5 minutes -- time waiting for a free slot
    MOBILE_SESSION_POLL_INTERVAL = 10 # seconds

    # Retry budget for the WebDriver connect (not the session provisioning)
    # after a mobile session reaches RUNNING. The Appium endpoint can return
    # 400 briefly while the server finishes binding to the device;
    # 6 tries * 10s covers roughly 1 minute.
    MOBILE_CONNECT_TRIES = 6
    MOBILE_CONNECT_RETRY_SLEEP = 10 # seconds

    # AWS region where Device Farm projects live.
    # As of April 2026, Device Farm only available in us-west-2.
    REGION = 'us-west-2'.freeze

    # Internal keys in browser configs that are not Selenium capabilities.
    INTERNAL_KEYS = %w[name mobile device_arn].freeze

    # ---- Desktop (TestGrid) -------------------------------------------------

    # Returns a one-time WebDriver endpoint URL for a desktop browser session.
    def self.create_test_grid_url
      arn = project_arn_for(mobile: false)
      resp = client.create_test_grid_url(
        project_arn: arn,
        expires_in_seconds: SESSION_EXPIRY_SECONDS
      )
      resp.url
    end

    # AWS console URL for a desktop TestGrid session's Selenium logs.
    def self.desktop_session_url(selenium_session_id)
      arn = CDO.device_farm_desktop_project_arn
      return nil if arn.blank?
      project_uuid = arn.split(':')[6]
      "https://#{REGION}.console.aws.amazon.com/devicefarm/home" \
        "#/browser/projects/#{project_uuid}/runsselenium/logs/#{selenium_session_id}"
    end

    # ---- Mobile (Remote Access Session) -------------------------------------

    # Provisions a real device, waits for it to be ready, and returns the
    # Appium WebDriver endpoint URL plus the session ARN (for later logging).
    #
    # @param device_arn [String] ARN of the device to provision, from browsers_device_farm.json.
    #   These ARNs correspond to devices in the project's static device pool
    #   and should be updated if the pool changes.
    #   TODO: if these devices fall behind, update the pool + JSON to newer models.
    # @return [Hash] { url: String, session_arn: String }
    def self.create_mobile_session(device_arn:)
      project_arn = project_arn_for(mobile: true)

      puts "Device Farm: provisioning device #{device_arn} ..."

      resp = client.create_remote_access_session(
        project_arn: project_arn,
        device_arn: device_arn,
        name: "ui-test-#{Time.now.to_i}"
      )
      session_arn = resp.remote_access_session.arn
      endpoint = wait_for_session_endpoint(session_arn)

      {url: endpoint, session_arn: session_arn}
    end

    # AWS console URL for a mobile remote access session's files/logs view.
    # Parses session ARN tail <project>/<session>/<sub> into the console path.
    def self.mobile_session_url(session_arn)
      return nil if session_arn.blank?
      tail = session_arn.split(':', 7)[6]
      return nil if tail.blank?
      project_uuid, session_uuid, sub_id = tail.split('/')
      return nil unless project_uuid && session_uuid && sub_id
      "https://#{REGION}.console.aws.amazon.com/devicefarm/home" \
        "#/mobile/projects/#{project_uuid}/sessions/#{session_uuid}/#{sub_id}/files"
    end

    # Stops a mobile remote access session so the device is released back to
    # the pool. Without this, the session stays open until it times out
    # (defaultJobTimeoutMinutes) and blocks subsequent sessions with
    # PENDING_CONCURRENCY.
    def self.stop_session(session_arn)
      return unless session_arn
      puts "Device Farm: stopping session #{session_arn}"
      client.stop_remote_access_session(arn: session_arn)
    rescue => exception
      puts "Error stopping Device Farm session: #{exception}"
    end

    # ---- Private helpers ----------------------------------------------------

    # Returns the appropriate project ARN and raises if blank.
    def self.project_arn_for(mobile: false)
      if mobile
        raise 'Please define CDO.device_farm_mobile_project_arn AWS Secrets Manager or locals.yml' \
          if CDO.device_farm_mobile_project_arn.blank?
        CDO.device_farm_mobile_project_arn
      else
        raise 'Please define CDO.device_farm_desktop_project_arn AWS Secrets Manager or locals.yml' \
          if CDO.device_farm_desktop_project_arn.blank?
        CDO.device_farm_desktop_project_arn
      end
    end

    # Polls until the remote access session is RUNNING and returns its
    # WebDriver endpoint URL. Raises on timeout or unexpected terminal state.
    #
    # Two separate timeout windows:
    #   MOBILE_CONCURRENCY_TIMEOUT -- how long to wait for a device slot
    #     (PENDING_CONCURRENCY). Another session may be finishing up.
    #   MOBILE_SESSION_TIMEOUT -- how long to wait for the device to boot
    #     once a slot is acquired.
    TERMINAL_STATUSES = %w[COMPLETED STOPPING STOPPED].freeze

    def self.wait_for_session_endpoint(session_arn)
      concurrency_deadline = Time.now + MOBILE_CONCURRENCY_TIMEOUT
      boot_deadline = nil # set once we leave PENDING_CONCURRENCY
      last_status = nil

      loop do
        resp = client.get_remote_access_session(arn: session_arn)
        session = resp.remote_access_session

        if session.status != last_status
          puts "Device Farm: session #{session_arn} status=#{session.status}"
          last_status = session.status
        end

        if session.status == 'RUNNING'
          driver_endpoint = session.endpoints&.remote_driver_endpoint
          legacy_endpoint = session.endpoint
          puts "Device Farm: session ready, endpoint=#{(driver_endpoint || legacy_endpoint).inspect}"
          url = driver_endpoint || legacy_endpoint
          raise "Device Farm session RUNNING but no endpoint URL available" unless url
          return url
        end

        if TERMINAL_STATUSES.include?(session.status)
          raise "Device Farm mobile session ended unexpectedly: " \
                "status=#{session.status}, result=#{session.result}, message=#{session.message}"
        end

        if session.status == 'PENDING_CONCURRENCY'
          if Time.now > concurrency_deadline
            raise "Timed out after #{MOBILE_CONCURRENCY_TIMEOUT}s waiting for a free device slot " \
                  "(PENDING_CONCURRENCY) for session #{session_arn}"
          end
        else
          # We have a slot; start the boot timer on first non-concurrency status.
          boot_deadline ||= Time.now + MOBILE_SESSION_TIMEOUT
          if Time.now > boot_deadline
            raise "Timed out after #{MOBILE_SESSION_TIMEOUT}s waiting for device to boot " \
                  "for session #{session_arn} (last status: #{session.status})"
          end
        end

        sleep MOBILE_SESSION_POLL_INTERVAL
      end
    end

    def self.client
      @client ||= Aws::DeviceFarm::Client.new(region: REGION)
    end

    private_class_method :project_arn_for, :wait_for_session_endpoint, :client
  end
end
