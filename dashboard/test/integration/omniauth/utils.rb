module OmniauthCallbacksControllerTests
  # Methods reusable across OmniauthCallbacksController integration tests
  module Utils
    #
    # Mock OAuth in integration tests to immediately redirect to the
    # oauth callback for the given provider with the given auth_hash.
    #
    # @return [OmniAuth::AuthHash] that will be passed to the callback when test-mode OAuth is invoked
    #
    def mock_oauth_for(provider, auth_hash)
      # See https://github.com/omniauth/omniauth/wiki/Integration-Testing
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[provider.to_sym] = auth_hash
      auth_hash
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
      post "/users/auth/#{provider}"
      assert_redirected_to "/users/auth/#{provider}/callback"
      follow_redirect!
    end

    def finish_sign_up(auth_hash, user_type)
      post '/users', params: finish_sign_up_params(
        name: auth_hash[:info]&.name,
        user_type: user_type
      )
    end

    # Intentionally fail to finish sign-up by _not_ checking the terms-of-service box
    def fail_sign_up(auth_hash, user_type)
      post '/users', params: finish_sign_up_params(
        name: auth_hash[:info]&.name,
        user_type: user_type,
        terms_of_service_version: 0
      )
    end

    def finish_sign_up_params(override_params)
      user_type = override_params[:user_type] || User::TYPE_STUDENT
      if user_type == User::TYPE_STUDENT
        {
          user: {
            locale: 'en-US',
            user_type: user_type,
            name: 'Student User',
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
            name: 'Teacher User',
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
      created_auth = on_created_user.primary_contact_info
      refute_nil created_auth

      assert_equal from_auth_hash.provider, created_auth.credential_type
      assert_equal from_auth_hash.uid, created_auth.authentication_id

      if from_auth_hash.credentials
        refute_nil created_auth.data_hash
        assert_equal from_auth_hash.credentials.token, created_auth.data_hash[:oauth_token]
        assert_equal from_auth_hash.credentials.expires_at, created_auth.data_hash[:oauth_token_expiration]
        unless from_auth_hash.credentials.refresh_token.nil?
          assert_equal from_auth_hash.credentials.refresh_token, created_auth.data_hash[:oauth_refresh_token]
        end
      end
    end

    def assert_valid_student(user, expected_email: nil)
      assert user.valid?
      assert user.student?
      # For some providers (e.g. Clever) we expect _not_ to save email at all.
      if expected_email.nil?
        assert_empty user.email
        assert_empty user.hashed_email
      else
        assert_equal User.hash_email(expected_email), user.hashed_email
      end
    end

    def assert_valid_teacher(user, expected_email:)
      assert user.valid?
      assert user.teacher?
      assert_equal expected_email, user.email
    end

    # Skip firehose logging for these tests
    # Instead record the sequence of events logged, for easy validation in test cases.
    def stub_firehose
      @firehose_requests = []
      FirehoseClient.instance.stubs(:put_record).with do |stream, args|
        @firehose_requests << [stream, args]
        true
      end
    end

    def assert_sign_up_tracking(expected_study_group, expected_events)
      study_requests = @firehose_requests.select {|e| e[1][:study] == SignUpTracking::STUDY_NAME && e[0] == :analysis}
      study_records = study_requests.map {|e| e[1]}
      study_groups = study_records.map {|e| e[:study_group]}.uniq.compact
      study_events = study_records.map {|e| e[:event]}

      assert study_records.all? {|record| record[:data_string].present?}
      assert_equal 1, study_records.map {|r| r[:data_string]}.uniq.count
      assert_equal [expected_study_group], study_groups
      assert_equal expected_events, study_events
    end

    def refute_sign_up_tracking
      study_requests = @firehose_requests.select {|e| e[1][:study] == SignUpTracking::STUDY_NAME && e[0] == :analysis}
      assert_empty study_requests
    end
  end
end
