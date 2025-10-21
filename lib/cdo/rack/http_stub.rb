# frozen_string_literal: true

require 'active_support'
require 'json'

module Rack
  # Middleware for stubbing HTTP requests using VCR and WebMock based on cookie data.
  #
  # It uses VCR to record and replay HTTP interactions,
  # and WebMock to stub requests and return expected value.
  #
  # Cookie-driven behavior:
  # The middleware looks for a cookie keyed by COOKIE_KEY (default: "http_stub").
  # If present, it must contain a JSON object with the following structure:
  #
  # {
  #   "name": "cassette_identifier",    # String. Name of the VCR cassette to use.
  #   "stubs": [                        # Array of per-request stub definitions.
  #     {
  #       "method": "get",              # String. HTTP method (case-insensitive).
  #       "pattern": "escaped_regex",   # String. CGI-escaped, Regexp-escaped pattern matched against full request URI.
  #       "value": { ... }              # Optional JSON value returned as the stubbed response body.
  #     },
  #     {
  #       "method": "get",
  #       "pattern": "escaped_regex"    # If no "value" key, the real request response will be stored in VCR cassette.
  #     }
  #   ]
  # }
  #
  # Notes on fields:
  # - pattern: Produced by Regexp.escape and then CGI.escape when set (see test step definitions).
  #            At match time we wrap it in a Regexp (`%r[#{stub['pattern']}]`) so it should represent
  #            the raw (unescaped) content once decoded. The cookie stores the escaped form.
  # - value: When present, the request is fully stubbed via WebMock and never reaches VCR.
  #          The response content-type is application/json and body is JSON.dump(value).
  # - Missing or empty cookie / missing "name" / empty "stubs" => middleware is a no-op.
  #
  # Example cookie value (URL-decoding applied for readability):
  # {
  #   "name": "users_index",
  #   "stubs": [
  #     {
  #       "method": "get",
  #       "pattern": "^https:\/\/api\.example\.com\/users$",
  #       "value": {"users": [{"id":1,"name":"Artem"}]}
  #     }
  #   ]
  # }
  #
  # @note This middleware is intended for testing purposes only.
  # @see `dashboard/test/ui/features/http_stubbing.feature`
  class HttpStub
    COOKIE_KEY = 'http_stub'

    def initialize(app, fixtures_dir:)
      @app = app
      @fixtures_dir = fixtures_dir
    end

    def call(env)
      stub_requests(env) do
        @app.call(env)
      end
    end

    private def stub_requests(env, &)
      request = Request.new(env)

      cassette_name, request_stubs = JSON.parse(request.cookies[COOKIE_KEY].presence || '{}')&.values_at('name', 'stubs')
      return yield if cassette_name.blank? || request_stubs.blank?

      require 'vcr'
      require 'webmock'

      # Sets up WebMock stubs for requests that include a predefined 'value'.
      # These requests are intercepted and return the specified response
      # instead of being executed and recorded by VCR.
      request_stubs.each do |stub|
        next unless stub.key?('value')

        WebMock.stub_request(stub['method'].downcase.to_sym, %r[#{stub['pattern']}]).to_return(
          headers: {'Content-Type' => 'application/json'},
          body: JSON.dump(stub['value']),
        )
      end

      # Reset VCR configs and hooks to ensure a clean state.
      VCR.send(:initialize_ivars)

      # Records and replays all requests that match the cookie data,
      # except those intercepted by the WebMock stubs defined above.
      VCR.use_cassette(cassette_name, record: :new_episodes) do
        VCR.configure do |config|
          config.cassette_library_dir = @fixtures_dir
          config.hook_into :webmock
          config.allow_http_connections_when_no_cassette = true
          config.debug_logger = $stdout if rack_env?(:development)

          config.before_record do |interaction|
            interaction.request.headers = {}
          end

          config.ignore_request do |stubbed_request|
            request_stubs.none? do |stub|
              stubbed_request.method.to_s.casecmp?(stub['method']) && stubbed_request.uri.match?(%r[#{stub['pattern']}])
            end
          end
        end

        yield
      end
    ensure
      WebMock.reset!
    end
  end
end
