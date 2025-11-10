# frozen_string_literal: true

require 'request_store'

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
    CLOUDFRONT_HEADER = 'HTTP_X_AMZ_CF_ID'
    REQUEST_ID_HEADER = 'HTTP_X_REQUEST_ID'
    REQUEST_ID_ENV    = 'action_dispatch.request_id'
    CDO_REQUEST_ID    = 'cdo.request_id'
    CDO_CF_REQUEST_ID = 'cdo.cloudfront_request_id'

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
        env[REQUEST_ID_ENV] = request_id

        # cdo.request_id: Code.org convention for accessing request ID in code.
        # Used by Rack::Request#correlation_id as a fallback.
        env[CDO_REQUEST_ID] = request_id
      end

      # cdo.cloudfront_request_id: Stores CloudFront ID separately for direct access.
      # Used by Rack::Request#cloudfront_request_id.
      env[CDO_CF_REQUEST_ID] = cf_request_id if cf_request_id

      if defined?(RequestStore)
        # RequestStore: Allows background jobs/threads spawned during request to
        # access the request ID. Used by Lograge initializer (lograge.rb).
        RequestStore.store[:request_id] = request_id if request_id
        RequestStore.store[:cloudfront_request_id] = cf_request_id if cf_request_id
      end

      status, headers, body = @app.call(env)

      # Rails may have set action_dispatch.request_id if we didn't. Capture it.
      request_id ||= env[REQUEST_ID_ENV]
      env[CDO_REQUEST_ID] ||= request_id if request_id

      if defined?(RequestStore) && request_id
        RequestStore.store[:request_id] ||= request_id
      end

      if request_id
        # Response headers: Standard X-Request-Id header for downstream services.
        headers['X-Request-Id'] = request_id
        # Also echo CloudFront ID if present (for debugging/correlation).
        headers['X-Amz-Cf-Id'] ||= cf_request_id if cf_request_id
      end

      [status, headers, body]
    ensure
      if defined?(RequestStore)
        RequestStore.store.delete(:request_id)
        RequestStore.store.delete(:cloudfront_request_id)
      end
    end

    private def extract_header(env, header)
      value = env[header]
      return unless value

      value = value.strip if value.respond_to?(:strip)
      value.empty? ? nil : value
    end
  end
end
