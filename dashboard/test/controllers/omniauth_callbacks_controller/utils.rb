module OmniauthCallbacksControllerTests
  # Methods reusable across OmniauthCallbacksController integration tests
  module Utils
    #
    # Mock OAuth in integration tests to immediately redirect to the
    # oauth callback for the given provider with the given auth_hash.
    #
    def mock_oauth_for(provider, auth_hash)
      # We should only have one @auth_hash for a given test, so make it
      # available everywhere for use when checking results.
      @auth_hash = auth_hash

      # See https://github.com/omniauth/omniauth/wiki/Integration-Testing
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[provider.to_sym] = @auth_hash
    end
  end
end
