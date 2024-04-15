require 'test_helper'

class Services::Lti::AuthIdGeneratorTest < ActiveSupport::TestCase
  setup do
    @id_token = {
      iss: 'some_issuer',
      aud: 'some_audience',
      sub: 'some_subject'
    }
  end

  test 'when aud is a String call should return an auth id string' do
    auth_id_generator = Services::Lti::AuthIdGenerator.new(@id_token)
    assert_equal 'some_issuer|some_audience|some_subject', auth_id_generator.call
  end

  test 'when aud is an Array call should return an auth id string' do
    @id_token[:aud] = ['some_audience']
    auth_id_generator = Services::Lti::AuthIdGenerator.new(@id_token)
    assert_equal 'some_issuer|some_audience|some_subject', auth_id_generator.call
  end

  test 'when aud is an Array with more than one client_id call should raise an error' do
    @id_token[:aud] = ['some_audience', 'another_audience']
    auth_id_generator = Services::Lti::AuthIdGenerator.new(@id_token)
    assert_raises ArgumentError do
      auth_id_generator.call
    end
  end

  test 'when aud is not a String or an Array call should raise an error' do
    @id_token[:aud] = 123
    auth_id_generator = Services::Lti::AuthIdGenerator.new(@id_token)
    assert_raises ArgumentError do
      auth_id_generator.call
    end
  end
end
