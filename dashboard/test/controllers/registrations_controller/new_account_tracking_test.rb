require 'test_helper'

module RegistrationsControllerTests
  class NewAccountTrackingTest < ActionDispatch::IntegrationTest
    EMAIL = 'upgraded@code.org'
    PASSWORD = '1234567'
    UUID = 'abcdefg1234567'
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
    end

    test 'loading sign up page sends Firehose event' do
      FirehoseClient.instance.expects(:put_record).with do |data|
        data[:study] == STUDY &&
          data[:event] == 'load-sign-up-page' &&
          data[:data_string] == UUID
      end
      get '/users/sign_up'
    end

    test 'successful email sign up sends Firehose event' do
      events = %w(load-sign-up-page email-sign-up-success)
      FirehoseClient.instance.expects(:put_record).at_most(2).with do |data|
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

    test 'email sign up with wrong password confirmation sends Firehose event' do
      events = %w(load-sign-up-page email-sign-up-error)
      FirehoseClient.instance.expects(:put_record).at_most(2).with do |data|
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
  end
end
