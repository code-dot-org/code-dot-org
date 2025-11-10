# frozen_string_literal: true

require 'request_store'
require 'cdo/request_tracing'

module Rack
  # Rack middleware that normalizes the CloudFront-generated request id so it
  # can be used consistently across downstream applications and emitted in
  # logs. When the CloudFront header `X-Amz-Cf-Id` is present we promote it to
  # `X-Request-Id`, persist it in the Rack environment, and expose it via
  # RequestStore so background work triggered during the request can reference
  # the same identifier. If the header is missing (for example in local
  # development) we preserve any existing `X-Request-Id` value and otherwise
  # fall back to the framework defaults.
  class CloudFrontRequestId
    CLOUDFRONT_HEADER = 'HTTP_X_AMZ_CF_ID' # CloudFront request ID header
    REQUEST_ID_HEADER = 'HTTP_X_REQUEST_ID' # Standard Rack request ID header
    REQUEST_ID_ENV    = 'action_dispatch.request_id' # Standard Rails request ID env var, passed to downstream services

    def initialize(app)
      @app = app
    end

    def call(env)
      cf_request_id = extract_header(env, CLOUDFRONT_HEADER)
      request_id = cf_request_id || extract_header(env, REQUEST_ID_HEADER)

      if request_id
        # HTTP_X_REQUEST_ID: Standard Rack env var for request ID headers.
        # Used by Rack::Request#correlation_id and other middleware.
        env[REQUEST_ID_HEADER] = request_id

        # action_dispatch.request_id: Rails ActionDispatch reads this and includes
        # it in event.payload[:request_id] for Lograge/Rails logging.
        #
        # Concretely this unlocks a few things in our stack today:
        # * `request.uuid` / `request.request_id` in controllers comes from this key. Keeping it aligned with the
        #   CloudFront ID means any feature that saves the request UUID (audit trails, email flows, etc.) stays
        #   in sync with CDN logs.
        # * Rails pushes the same value into controller instrumentation payloads; our Lograge initializer
        #   (`dashboard/config/initializers/lograge.rb`) reads `event.payload[:request_id]` so log lines retain the
        #   CloudFront correlation ID instead of a Rails-generated one.
        # * Rails echoes the value to response headers as `X-Request-Id`, which we verify in
        #   `dashboard/test/integration/cloudfront_request_id_test.rb`. That keeps parity with CloudFront’s
        #   `X-Amz-Cf-Id` header when troubleshooting CDN issues.
        # * Background jobs and downstream services can forward it—`EvaluateRubricJob` sends it to AI Proxy as
        #   `X-Request-Id`, and Javabuilder upload requests now include the same header.
        # Forwarding this ID to downstream services (AI Proxy, Javabuilder, AWS SDK clients, etc.) still requires
        # explicit instrumentation—those calls do not yet consume the Rack env automatically.
        env[REQUEST_ID_ENV] = request_id

        RequestTracing.ensure_traceparent!(request_id)

        # No additional aliases—callers should rely on the standard Rack / Rails keys above.
      end

      if defined?(RequestStore) && request_id
        # RequestStore: Allows background jobs/threads spawned during request to
        # access the request ID. Used by Lograge initializer (lograge.rb).
        RequestStore.store[:request_id] = request_id
      end

      status, headers, body = @app.call(env)

      # Rails may have set action_dispatch.request_id if we didn't. Capture it.
      request_id ||= env[REQUEST_ID_ENV]
      RequestStore.store[:request_id] ||= request_id if defined?(RequestStore) && request_id

      if request_id
        # Response headers: Standard X-Request-Id header for downstream services.
        headers['X-Request-Id'] = request_id
        # Also echo CloudFront ID if present (for debugging/correlation).
        headers['X-Amz-Cf-Id'] ||= cf_request_id if cf_request_id
      end

      [status, headers, body]
    ensure
      RequestStore.store.delete(:request_id) if defined?(RequestStore)
    end

    private def extract_header(env, header)
      value = env[header]
      return unless value

      value = value.strip if value.respond_to?(:strip)
      value.empty? ? nil : value
    end
  end
end
