require 'test_helper'
require 'twilio-ruby'

class TwilioSmsTest < ActionDispatch::IntegrationTest
  # Required magic 'number' for test API.
  # See: https://www.twilio.com/docs/api/rest/test-credentials
  TEST_PHONE_FROM = '+15005550006'

  # This can be any number, but this is the one Twilio uses in its own examples.
  TEST_PHONE_TO = '+14108675309'

  test 'Twilio SMS test API' do
    if CDO.twilio_sid_test.blank? || CDO.twilio_auth_test.blank?
      skip 'twilio_sid_test credential not provided'
    else
      skip 'todo mock API requests'
    end

    account_sid = CDO.twilio_sid_test
    auth_token = CDO.twilio_auth_test

    @client = Twilio::REST::Client.new account_sid, auth_token
    test_body = "Test: #{SecureRandom.urlsafe_base64}."
    sms = @client.messages.create(
      from: TEST_PHONE_FROM,
      to: TEST_PHONE_TO,
      body: test_body
    )
    assert_equal test_body, sms.body
  end

  test 'Send and receive Twilio SMS on carrier network' do
    skip 'Run this test manually with TEST_SMS=1' unless ENV['TEST_SMS']

    # This end-to-end SMS test requires a smartphone with carrier-specific (e.g. AT&T) phone number twilio_phone_test_to,
    # running an auto-forwarder configured to forward SMS messages from twilio_phone to twilio_phone_test_forward.
    #
    # Tested using Auto SMS(lite) https://play.google.com/store/apps/details?id=com.tmnlab.autoresponder
    #
    # The test will use the Twilio API to send a test message from twilio_phone to twilio_phone_test_to,
    # wait for a short period of time, then use the Twilio API to locate an inbound message to
    # twilio_phone_test_forward containing the same unique ID.

    # credentials
    ACCOUNT_SID = CDO.twilio_sid
    AUTH_TOKEN = CDO.twilio_auth
    MESSAGING_SERVICE = CDO.twilio_messaging_service
    SMS_TEST_FORWARD = CDO.twilio_phone_test_forward
    SMS_TEST_TO = CDO.twilio_phone_test_to

    # Send a message from twilio_phone to test_to number
    @client = Twilio::REST::Client.new ACCOUNT_SID, AUTH_TOKEN
    test_body = "Test: #{SecureRandom.urlsafe_base64}."
    @client.messages.create(
      messaging_service_sid: MESSAGING_SERVICE,
      to: SMS_TEST_TO,
      body: test_body
    )

    # Wait for test_forward number to receive the auto-forwarded response
    TOTAL_TRIES = 20
    num_tries = 0
    loop do
      sleep 5
      @client = Twilio::REST::Client.new ACCOUNT_SID, AUTH_TOKEN
      break if @client.messages.list(
        to: SMS_TEST_FORWARD,
        date_sent: DateTime.now.utc.strftime('%F')
      ).detect {|message| message.body.include? test_body}
      num_tries += 1
      if num_tries > TOTAL_TRIES
        raise "SMS test failed. To: #{SMS_TEST_TO}, forward: #{SMS_TEST_FORWARD}, message: #{test_body}"
      end
    end
  end
end
