require 'test_helper'

module RegistrationsControllerTests
  class NewAccountTrackingTest < ActionDispatch::IntegrationTest
    EMAIL = 'upgraded@code.org'
    PASSWORD = '1234567'
    DEFAULT_UID = '1111' # sso uid
    UUID = 'abcdefg1234567' # tracking uuid
    STUDY = 'account-sign-up'

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
      OmniAuth.config.mock_auth[:google_oauth2] = generate_auth_user_hash(provider: 'google_oauth2')
    end

    test 'loading sign up page sends Firehose page load event' do
      FirehoseClient.instance.expects(:put_record).once.with do |data|
        data[:study] == STUDY &&
          data[:event] == 'load-sign-up-page' &&
          data[:data_string] == UUID
      end
      get '/users/sign_up'
    end

    test 'successful email sign up sends Firehose success event' do
      events = %w(load-sign-up-page email-sign-up-success)
      FirehoseClient.instance.expects(:put_record).times(2).with do |data|
        data[:study] == STUDY &&
          data[:event] == events.shift &&
          data[:data_string] == UUID
      end

      get '/users/sign_up'

      assert_creates(User) do
        post '/users.json', params: {
          user: USER_PARAMS_GOOD
        }
      end
    end

    test 'email sign up with wrong password confirmation sends Firehose error event' do
      events = %w(load-sign-up-page email-sign-up-error)
      FirehoseClient.instance.expects(:put_record).times(2).with do |data|
        data[:study] == STUDY &&
          data[:event] == events.shift &&
          data[:data_string] == UUID
      end

      get '/users/sign_up'

      assert_does_not_create(User) do
        post '/users.json', params: {
          user: USER_PARAMS_ERROR
        }
      end
    end

    test 'successful oauth sign up after hitting sign up page sends Firehose success events' do
      events = %w(load-sign-up-page google_oauth2-sign-up-success)
      FirehoseClient.instance.expects(:put_record).times(2).with do |data|
        data[:study] == STUDY &&
          data[:event] == events.shift &&
          data[:data_string] == UUID
      end

      get '/users/sign_up'

      @request.env["devise.mapping"] = Devise.mappings[:user]
      assert_creates(User) do
        get '/users/auth/google_oauth2'
        follow_redirect!
      end
    end

    test 'login to existing account after hitting sign up page sends Firehose sign in event' do
      create :teacher, :unmigrated_google_sso, uid: DEFAULT_UID, email: EMAIL
      events = %w(load-sign-up-page google_oauth2-sign-in)
      FirehoseClient.instance.expects(:put_record).times(2).with do |data|
        data[:study] == STUDY &&
            data[:event] == events.shift &&
            data[:data_string] == UUID
      end

      get '/users/sign_up'

      assert_does_not_create(User) do
        get '/users/auth/google_oauth2'
        follow_redirect!
      end
    end

    test 'tracking cookie is cleared when hitting another random page on the site' do
      create :teacher, :unmigrated_google_sso, uid: DEFAULT_UID, email: EMAIL
      events = %w(load-sign-up-page)
      FirehoseClient.instance.expects(:put_record).once.with do |data|
        data[:study] == STUDY &&
            data[:event] == events.shift &&
            data[:data_string] == UUID
      end

      get '/users/sign_up'
      get '/courses' # should clear tracking variable, events should not be sent afterwards

      @request.env["devise.mapping"] = Devise.mappings[:user]
      assert_does_not_create(User) do
        get '/users/auth/google_oauth2'
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
