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

    def generate_auth_hash(args = {})
      OmniAuth::AuthHash.new(
        uid: args[:uid] || SecureRandom.uuid,
        provider: args[:provider] || AuthenticationOption::GOOGLE,
        info: {
          name: args[:name] || 'someone',
          email: args[:email] || 'auth_test@code.org',
          user_type: args[:user_type].presence,
          dob: args[:dob] || Date.today - 20.years,
          gender: args[:gender] || 'f'
        },
        credentials: {
          token: args[:token] || 'fake-token',
          expires_at: args[:expires_at] || 'fake-token-expiration',
          refresh_token: args[:refresh_token] || nil
        }
      )
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

    def finish_sign_up(user_type)
      post '/users', params: finish_sign_up_params(user_type: user_type)
    end

    def finish_sign_up_params(override_params)
      user_type = override_params[:user_type] || User::TYPE_STUDENT
      if user_type == User::TYPE_STUDENT
        {
          user: {
            locale: 'en-US',
            user_type: user_type,
            name: @auth_hash.info.name,
            age: '13',
            gender: 'f',
            school_info_attributes: {
              country: 'US'
            },
            terms_of_service_version: 1,
            email_preference_opt_in: nil,
          }.merge(override_params)
        }
      else
        {
          user: {
            locale: 'en-US',
            user_type: user_type,
            name: @auth_hash.info.name,
            age: '21+',
            gender: nil,
            school_info_attributes: {
              country: 'US'
            },
            terms_of_service_version: 1,
            email_preference_opt_in: 'yes',
          }.merge(override_params)
        }
      end
    end

    def assert_credentials(from_auth_hash, on_created_user)
      assert_equal from_auth_hash.provider, on_created_user.provider
      assert_equal from_auth_hash.uid, on_created_user.uid
      if from_auth_hash.credentials
        assert_equal from_auth_hash.credentials.token, on_created_user.oauth_token
        assert_equal from_auth_hash.credentials.expires_at, on_created_user.oauth_token_expiration
        unless from_auth_hash.credentials.refresh_token.nil?
          assert_equal from_auth_hash.credentials.refresh_token, on_created_user.oauth_refresh_token
        end
      end
    end

    def assert_valid_student(user, expected_email: nil)
      assert user.valid?
      assert user.student?
      # For some providers (e.g. Clever) we expect _not_ to save email at all.
      if expected_email.nil?
        assert_empty user.email
        assert_nil user.hashed_email
      else
        assert_equal User.hash_email(expected_email), user.hashed_email
      end
    end

    def assert_valid_teacher(user, expected_email:)
      assert user.valid?
      assert user.teacher?
      assert_equal expected_email, user.email
    end
  end
end
