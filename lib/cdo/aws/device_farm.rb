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
  module AWS
    module DeviceFarm
      # How long (seconds) each desktop test grid session URL remains valid.
      SESSION_EXPIRY_SECONDS = 600 # 10 minutes

      # Polling parameters for mobile session provisioning. The three timeouts
      # correspond to the three gating statuses AWS walks a session through:
      #   PENDING_CONCURRENCY -- waiting on a free concurrency slot (quota)
      #   PENDING_DEVICE      -- slot acquired, waiting for a free device
      #   PREPARING (and any  -- device found, booting / installing
      #   other intermediate
      #   non-terminal state)
      # Isolating PENDING_DEVICE lets us tune the PREPARING timeout to actual
      # device boot time rather than absorbing queue-wait time.
      MOBILE_CONCURRENCY_TIMEOUT = 600 # 10 minutes -- time waiting for a slot
      MOBILE_PENDING_DEVICE_TIMEOUT = 300 # 5 minutes -- time waiting for a device
      MOBILE_PREPARING_TIMEOUT = 600 # 10 minutes -- time for device to boot
      MOBILE_SESSION_POLL_INTERVAL = 10 # seconds

      # Retry budget for the WebDriver connect (not the session provisioning)
      # after a mobile session reaches RUNNING. The Appium endpoint can return
      # 400 briefly while the server finishes binding to the device;
      # 6 tries * 10s covers roughly 1 minute.
      MOBILE_CONNECT_TRIES = 6
      MOBILE_CONNECT_RETRY_SLEEP = 10 # seconds

      # Retry budget for the whole mobile session at the device level.
      # Some physical devices in a pool have persistent problems (e.g. Web
      # Inspector disabled -- Appium times out waiting for web apps, no
      # amount of Appium-level retrying helps). Tearing down the DF session
      # and picking a fresh device from the pool side-steps those.
      MOBILE_DEVICE_TRIES = 3

      # AWS region where Device Farm projects live.
      # As of April 2026, Device Farm only available in us-west-2.
      REGION = 'us-west-2'.freeze

      # Internal keys in browser configs that are not Selenium capabilities.
      # Device Farm also rejects `appium:orientation` as a session capability
      # (reserved), so we strip it from caps and apply it after session-start
      # via the WebDriver /orientation endpoint.
      INTERNAL_KEYS = %w[name mobile device_arns appium:orientation].freeze

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

      # Provisions a real device from a candidate list, waits for it to be
      # ready, and returns the Appium WebDriver endpoint URL plus the session
      # ARN (for later logging). AWS doesn't accept a device pool on
      # create_remote_access_session (pools are a create_run concept), so the
      # caller passes the candidate ARNs directly from configuration. We
      # query AWS for each device's current availability and pick from the
      # healthiest tier to avoid queueing behind a BUSY device.
      #
      # @param device_arns [Array<String>] candidate device ARNs. One is
      #   picked client-side based on current availability.
      # @return [Hash] { url: String, session_arn: String, device: Aws::DeviceFarm::Types::Device }
      def self.create_mobile_session(device_arns:)
        raise "Device Farm: no candidate device ARNs provided" if device_arns.blank?
        project_arn = project_arn_for(mobile: true)
        devices = lookup_devices(device_arns)
        device = pick_best_device(devices)
        puts "Device Farm: provisioning device #{device.arn} (#{device.availability}) " \
             "from #{device_arns.size} candidate(s)..."

        resp = client.create_remote_access_session(
          project_arn: project_arn,
          device_arn: device.arn,
          name: "ui-test-#{Time.now.to_i}"
        )
        session_arn = resp.remote_access_session.arn

        # If waiting for the endpoint fails (typically a PENDING_CONCURRENCY /
        # PENDING_DEVICE timeout), stop the session before re-raising so we
        # release the device back to AWS -- otherwise the next run queues
        # behind this stuck session and hits the same timeout.
        endpoint = begin
          wait_for_mobile_session_endpoint(session_arn)
        rescue
          stop_mobile_session(session_arn)
          raise
        end

        {url: endpoint, session_arn: session_arn, device: device}
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
      def self.stop_mobile_session(session_arn)
        return unless session_arn
        puts "Device Farm: stopping mobile session #{session_arn}"
        client.stop_remote_access_session(arn: session_arn)
      rescue => exception
        puts "Error stopping Device Farm mobile session: #{exception}"
      end

      # ---- Private helpers ----------------------------------------------------

      # Fetches Device objects for the given ARNs so we can inspect current
      # availability. Uses get_device per ARN rather than list_devices with
      # an ARN-IN filter; list_devices silently returned empty results for
      # some iPad ARNs despite those ARNs being valid and visible in the
      # console (suspected fleet-scope / pagination nuance). Per-ARN
      # lookups are ~3 API calls per session but give explicit per-ARN
      # errors on mismatch.
      def self.lookup_devices(device_arns)
        device_arns.filter_map do |arn|
          client.get_device(arn: arn).device
        rescue ::Aws::DeviceFarm::Errors::NotFoundException => exception
          puts "Device Farm: skipping unresolved device #{arn}: #{exception.message}"
          nil
        end
      end

      # Availability tiers AWS reports for each device, in descending order
      # of desirability. TEMPORARY_NOT_AVAILABLE is excluded entirely -- the
      # device is out of service and requesting it wastes time.
      AVAILABILITY_PREFERENCE = %w[HIGHLY_AVAILABLE AVAILABLE BUSY].freeze

      # Groups candidate devices by availability, picks the best-tier group,
      # and samples within it at random to spread load across equal-priority
      # devices. Raises if no device is in any usable tier.
      def self.pick_best_device(devices)
        by_tier = devices.group_by(&:availability)
        AVAILABILITY_PREFERENCE.each do |tier|
          candidates = by_tier[tier]
          return candidates.sample if candidates&.any?
        end
        raise "Device Farm: no usable device among candidates " \
              "(availabilities: #{by_tier.keys.sort})"
      end

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
      # Each gating status has its own deadline so we can tell from a timeout
      # message which phase ran long.
      TERMINAL_STATUSES = %w[COMPLETED STOPPING STOPPED].freeze

      def self.wait_for_mobile_session_endpoint(session_arn)
        concurrency_deadline = Time.now + MOBILE_CONCURRENCY_TIMEOUT
        pending_device_deadline = nil # set on first PENDING_DEVICE observation
        preparing_deadline = nil # set on first PREPARING / other intermediate
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

          case session.status
          when 'PENDING_CONCURRENCY'
            if Time.now > concurrency_deadline
              raise "Timed out after #{MOBILE_CONCURRENCY_TIMEOUT}s waiting for a free concurrency slot " \
                    "(PENDING_CONCURRENCY) for session #{session_arn}"
            end
          when 'PENDING_DEVICE'
            pending_device_deadline ||= Time.now + MOBILE_PENDING_DEVICE_TIMEOUT
            if Time.now > pending_device_deadline
              raise "Timed out after #{MOBILE_PENDING_DEVICE_TIMEOUT}s waiting for a free device " \
                    "(PENDING_DEVICE) for session #{session_arn}"
            end
          else
            # PREPARING and any other intermediate status. First observation
            # of such a status starts the preparing (boot) timer.
            preparing_deadline ||= Time.now + MOBILE_PREPARING_TIMEOUT
            if Time.now > preparing_deadline
              raise "Timed out after #{MOBILE_PREPARING_TIMEOUT}s waiting for device to boot " \
                    "for session #{session_arn} (last status: #{session.status})"
            end
          end

          sleep MOBILE_SESSION_POLL_INTERVAL
        end
      end

      def self.client
        # Scope-resolve to be explicit that we mean the AWS SDK's top-level
        # Aws module (unrelated to our Cdo::AWS namespace). Our module's
        # case-different name already protects against collision, but the
        # `::` prefix makes intent unambiguous at the call site.
        @client ||= ::Aws::DeviceFarm::Client.new(region: REGION)
      end

      private_class_method :lookup_devices, :pick_best_device, :project_arn_for,
        :wait_for_mobile_session_endpoint, :client
    end
  end
end
