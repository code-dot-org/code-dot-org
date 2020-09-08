require 'test_helper'

module RegistrationsControllerTests
  class NewAccountTrackingTest < ActionDispatch::IntegrationTest
    EMAIL = 'upgraded@code.org'
    PASSWORD = '1234567'
    DEFAULT_UID = '1111' # sso uid
    UUID = 'abcdefg1234567' # tracking uuid
    STUDY = SignUpTracking::STUDY_NAME

    USER_PARAMS_GOOD = {
      name: 'A name',
      password: PASSWORD,
      password_confirmation: PASSWORD,
      email: EMAIL,
      hashed_email: User.hash_email(EMAIL),
      gender: 'F',
      age: '18',
      user_type: 'student',
      terms_of_service_version: 1
    }

    USER_PARAMS_ERROR = {
      name: 'A name',
      password: PASSWORD,
      password_confirmation: PASSWORD + "oops!",
      email: EMAIL,
      hashed_email: User.hash_email(EMAIL),
      gender: 'F',
      age: '18',
      user_type: 'student',
      terms_of_service_version: 1
    }

    setup do
      SecureRandom.stubs(:uuid).returns(UUID)
      OmniAuth.config.test_mode = true
      SignUpTracking.stubs(:split_test_percentage).returns(0)
    end

    test 'successful email sign up in old signup flow sends Firehose success event' do
      FirehoseClient.instance.expects(:put_record).with do |stream, data|
        data[:study] == STUDY &&
          data[:study_group] == SignUpTracking::CONTROL_GROUP &&
          data[:event] == 'load-sign-up-page' &&
          data[:data_string] == UUID &&
          stream == :analysis
      end
      FirehoseClient.instance.expects(:put_record).with do |stream, data|
        data[:study] == STUDY &&
          data[:study_group] == SignUpTracking::CONTROL_GROUP &&
          data[:event] == 'email-sign-up-success' &&
          data[:data_string] == UUID &&
          stream == :analysis
      end

      get '/users/sign_up'

      assert_creates(User) do
        post '/users.json', params: {
          user: USER_PARAMS_GOOD
        }
      end
    end

    test 'successful email sign up in new signup flow sends Firehose success event' do
      SignUpTracking.stubs(:split_test_percentage).returns(100)
      SignUpTracking.stubs(:new_sign_up_experience?).returns(true)
      FirehoseClient.instance.expects(:put_record).with do |stream, data|
        data[:study] == STUDY &&
          data[:study_group] == SignUpTracking::NEW_SIGN_UP_GROUP &&
          data[:event] == 'load-new-sign-up-page' &&
          data[:data_string] == UUID &&
          stream == :analysis
      end
      FirehoseClient.instance.expects(:put_record).with do |stream, data|
        data[:study] == STUDY &&
          data[:study_group] == SignUpTracking::NEW_SIGN_UP_GROUP &&
          data[:event] == 'email-sign-up-success' &&
          data[:data_string] == UUID &&
          stream == :analysis
      end

      get '/users/sign_up'

      assert_creates(User) do
        post '/users', params: {
          user: USER_PARAMS_GOOD
        }
      end
    end

    test 'email sign up with wrong password confirmation in old signup flow sends Firehose error event' do
      FirehoseClient.instance.expects(:put_record).with do |stream, data|
        data[:study] == STUDY &&
          data[:study_group] == SignUpTracking::CONTROL_GROUP &&
          data[:event] == 'load-sign-up-page' &&
          data[:data_string] == UUID &&
          stream == :analysis
      end
      FirehoseClient.instance.expects(:put_record).with do |stream, data|
        data[:study] == STUDY &&
          data[:study_group] == SignUpTracking::CONTROL_GROUP &&
          data[:event] == 'email-sign-up-error' &&
          data[:data_string] == UUID &&
          stream == :analysis
      end

      get '/users/sign_up'

      assert_does_not_create(User) do
        post '/users.json', params: {
          user: USER_PARAMS_ERROR
        }
      end
    end

    test 'email sign up with wrong password confirmation in new signup flow sends Firehose error event' do
      SignUpTracking.stubs(:split_test_percentage).returns(100)
      SignUpTracking.stubs(:new_sign_up_experience?).returns(true)
      FirehoseClient.instance.expects(:put_record).twice.with do |stream, data|
        data[:study] == STUDY &&
          data[:event] == 'load-new-sign-up-page' &&
          data[:data_string] == UUID &&
          stream == :analysis
      end
      FirehoseClient.instance.expects(:put_record).with do |stream, data|
        data[:study] == STUDY &&
          data[:study_group] == SignUpTracking::NEW_SIGN_UP_GROUP &&
          data[:event] == 'email-sign-up-error' &&
          data[:data_string] == UUID &&
          stream == :analysis
      end

      get '/users/sign_up'

      assert_does_not_create(User) do
        post '/users', params: {
          user: USER_PARAMS_ERROR
        }
      end
    end

    test 'tracking cookie is cleared when hitting another random page on the site' do
      OmniAuth.config.mock_auth[:google_oauth2] = generate_auth_user_hash(
        provider: 'google_oauth2'
      )
      create :teacher, :google_sso_provider, uid: DEFAULT_UID, email: EMAIL
      events = %w(load-sign-up-page)
      FirehoseClient.instance.expects(:put_record).once.with do |stream, data|
        data[:study] == STUDY &&
          data[:event] == events.shift &&
          data[:data_string] == UUID &&
          stream == :analysis
      end

      get '/users/sign_up'
      get '/courses' # should clear tracking variable, events should not be sent afterwards

      @request.env["devise.mapping"] = Devise.mappings[:user]
      assert_does_not_create(User) do
        post '/users/auth/google_oauth2'
        follow_redirect!
      end
    end

    private

    def generate_auth_user_hash(args)
      OmniAuth::AuthHash.new(
        uid: args[:uid] || DEFAULT_UID,
        provider: args[:provider] || 'facebook',
        info: {
          name: args[:name] || 'someone',
          email: args[:email] || EMAIL,
          user_type: args[:user_type] || 'teacher',
          dob: args[:dob] || Date.today - 20.years,
          gender: args[:gender] || 'f'
        },
        credentials: {
          token: args[:token] || '12345',
          expires_at: args[:expires_at] || 'some-future-time',
          refresh_token: args[:refresh_token] || nil
        }
      )
    end
  end
end
