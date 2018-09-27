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

    # The user signs in through OAuth
    # The oauth endpoint (which is mocked) redirects to the oauth callback,
    # which in turn does some work and redirects to something else: homepage, finish_sign_up, etc.
    # @param [String] provider
    def sign_in_through(provider)
      get "/users/auth/#{provider}"
      assert_redirected_to "/users/auth/#{provider}/callback"
      follow_redirect!
    end
  end
end
