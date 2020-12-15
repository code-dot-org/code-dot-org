require 'test_helper'

class SmsControllerTest < ActionController::TestCase
  setup do
    Gatekeeper.clear
    CDO.stubs(:twilio_sid).returns('fake')
    CDO.stubs(:twilio_auth).returns('fake')
    CDO.stubs(:twilio_messaging_service).returns('fake_messaging_service_sid')
  end

  test "send to phone with level_source succeeds when twilio succeeds" do
    level_source = create :level_source
    expected_twilio_options = {
      messaging_service_sid: 'fake_messaging_service_sid',
      to: 'xxxxxx',
      body: "Check this out on Code Studio: http://test.host/c/#{level_source.id} (reply STOP to stop receiving this)"
    }

    twilio_messages_mock = stub(:messages)
    twilio_messages_mock.expects(:create).with(expected_twilio_options).returns(true)
    Twilio::REST::Client.any_instance.stubs(:messages).returns(twilio_messages_mock)

    post :send_to_phone, params: {
      level_source: level_source.id,
      phone: 'xxxxxx'
    }

    assert_response :ok
  end

  test "send to phone with project succeeds when twilio succeeds" do
    channel_id = "xxproject_channelxx"
    project_share_url = "http://test.host/projects/applab/#{channel_id}"
    expected_twilio_options = {
      messaging_service_sid: 'fake_messaging_service_sid',
      to: 'xxxxxx',
      body: "Check this out on Code Studio: #{project_share_url} (reply STOP to stop receiving this)"
    }

    twilio_messages_mock = stub(:messages)
    twilio_messages_mock.expects(:create).with(expected_twilio_options).returns(true)
    Twilio::REST::Client.any_instance.stubs(:messages).returns(twilio_messages_mock)

    post :send_to_phone, params: {
      type: 'applab',
      channel_id: channel_id,
      phone: 'xxxxxx'
    }

    assert_response :ok
  end

  test "send download url to phone succeeds when twilio succeeds" do
    download_url = "http://test.host/foo.apk"
    expected_twilio_options = {
      messaging_service_sid: 'fake_messaging_service_sid',
      to: 'xxxxxx',
      body: "Install this app created in Code Studio on your Android device: #{download_url} (reply STOP to stop receiving this)"
    }

    twilio_messages_mock = stub(:messages)
    twilio_messages_mock.expects(:create).with(expected_twilio_options).returns(true)
    Twilio::REST::Client.any_instance.stubs(:messages).returns(twilio_messages_mock)

    post :send_download_url_to_phone, params: {
      url: download_url,
      phone: 'xxxxxx'
    }

    assert_response :ok
  end

  test "send to phone fails instead of raising an exception when the phone number is invalid" do
    twilio_messages_mock = stub(:messages)
    twilio_messages_mock.expects(:create).raises(Twilio::REST::RestError.new("The 'To' number +12141870331 is not a valid phone number.", OpenStruct.new(body: {})))
    Twilio::REST::Client.any_instance.stubs(:messages).returns(twilio_messages_mock)

    post :send_to_phone, params: {
      level_source: create(:level_source).id,
      phone: 'xxxxxx'
    }

    assert_response :bad_request
  end

  test "send to phone pretends to succeed instead of raising an exception when the recipient unsubscribed" do
    twilio_messages_mock = stub(:messages)
    twilio_messages_mock.expects(:create).raises(Twilio::REST::RestError.new("The message From/To pair violates a blacklist rule.", OpenStruct.new(body: {})))
    Twilio::REST::Client.any_instance.stubs(:messages).returns(twilio_messages_mock)

    post :send_to_phone, params: {
      level_source: create(:level_source).id,
      phone: 'xxxxxx'
    }

    assert_response :ok
  end

  test "send to phone with project pretends to succeed when twilio is disabled by gatekeeper flag" do
    Gatekeeper.set('twilio', where: {}, value: false)

    channel_id = "xxproject_channelxx"

    twilio_messages_mock = stub(:messages)
    Twilio::REST::Client.any_instance.stubs(:messages).returns(twilio_messages_mock)
    twilio_messages_mock.expects(:create).never

    post :send_to_phone, params: {
      type: 'applab',
      channel_id: channel_id,
      phone: 'xxxxxx'
    }

    assert_response :ok
  end

  test "send to phone raises an exception when twilio returns an error we don't know about" do
    twilio_messages_mock = stub(:messages)
    twilio_messages_mock.expects(:create).raises(Twilio::REST::RestError.new("New exception??", OpenStruct.new(body: {})))
    Twilio::REST::Client.any_instance.stubs(:messages).returns(twilio_messages_mock)

    assert_raises(Twilio::REST::RestError) do
      post :send_to_phone, params: {
        level_source: create(:level_source).id,
        phone: 'xxxxxx'
      }
    end
  end

  test "send to phone fails with invalid arguments" do
    Twilio::REST::Client.any_instance.expects(:messages).never

    post :send_to_phone, params: {phone: 'xxxxxx'}

    assert_response :not_acceptable
  end
end
