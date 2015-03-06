require 'test_helper'
require 'twilio-ruby'

class TwilioSmsTest < ActionDispatch::IntegrationTest

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
    SMS_FROM = CDO.twilio_phone
    SMS_TEST_FORWARD = CDO.twilio_phone_test_forward
    SMS_TEST_TO = CDO.twilio_phone_test_to

    # Send a message from twilio_phone to test_to number
    @client = Twilio::REST::Client.new ACCOUNT_SID, AUTH_TOKEN
    test_body = "Test: #{SecureRandom.urlsafe_base64}."
    @client.messages.create(
      :from => SMS_FROM,
      :to => SMS_TEST_TO,
      :body => test_body
    )

    # Wait for test_forward number to receive the auto-forwarded response
    TOTAL_TRIES = 10
    num_tries = 0
    loop do
      sleep 3
      @client = Twilio::REST::Client.new ACCOUNT_SID, AUTH_TOKEN
      break if @client.messages.list(
        to: SMS_TEST_FORWARD,
        from: SMS_TEST_TO,
        date_sent: DateTime.now.strftime('%Y-%m-%d')
      ).detect { |message| message.body.include? test_body }
      num_tries += 1
      if num_tries > TOTAL_TRIES
        raise "SMS test failed. From: #{SMS_FROM}, to: #{SMS_TEST_TO}, forward: #{SMS_TEST_FORWARD}, message: #{test_body}"
      end
    end
  end
end
