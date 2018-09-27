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

    def assert_credentials(from_auth_hash, on_created_user)
      assert_equal from_auth_hash.provider, on_created_user.provider
      assert_equal from_auth_hash.uid, on_created_user.uid
      assert_equal from_auth_hash.credentials.token, on_created_user.oauth_token
      assert_equal from_auth_hash.credentials.expires_at, on_created_user.oauth_token_expiration
      assert_equal from_auth_hash.credentials.refresh_token, on_created_user.oauth_refresh_token
    end
  end
end
