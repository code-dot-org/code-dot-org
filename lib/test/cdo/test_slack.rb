require_relative '../../../shared/test/test_helper'
require 'cdo/slack'

class SlackTest < Minitest::Test
  FAKE_CHANNEL = 'abcxyz'.freeze
  FAKE_CHANNEL_ID = 'abcxyz-channel_id'.freeze
  FAKE_MESSAGE = 'fake-message'.freeze
  FAKE_TOPIC = 'fake-topic'.freeze

  def setup
    Slack.stubs(:get_channel_id).with(FAKE_CHANNEL).returns(FAKE_CHANNEL_ID)
  end

  def test_get_topic
    Slack.expects(:open).returns(
      stub(
        read: {
          'ok' => true,
          'channel' => {
            'topic' => {
              'value' => FAKE_TOPIC
            }
          }
        }.to_json
      )
    )
    actual_topic = Slack.get_topic FAKE_CHANNEL
    assert_equal FAKE_TOPIC, actual_topic
  end

  def test_get_topic_with_error_response
    Slack.expects(:open).returns(stub(read: {'ok' => false}.to_json))
    assert_nil Slack.get_topic FAKE_CHANNEL
  end

  def test_update_topic
    Slack.expects(:open).returns(stub(read: {'ok' => true}.to_json))
    assert Slack.update_topic(FAKE_CHANNEL, FAKE_TOPIC)
  end

  def test_update_topic_with_error_response
    Slack.expects(:open).returns(stub(read: {'ok' => false}.to_json))
    refute Slack.update_topic(FAKE_CHANNEL, FAKE_TOPIC)
  end

  def test_message
    CDO.stubs(:slack_endpoint).returns('fake-slack-endpoint')
    Net::HTTP.expects(:post_form).returns(stub(code: 200))
    assert Slack.message(FAKE_CHANNEL, channel: FAKE_MESSAGE)
  end

  def test_message_with_error_message
    CDO.stubs(:slack_endpoint).returns('fake-slack-endpoint')
    Net::HTTP.expects(:post_form).returns(stub(code: 400))
    refute Slack.message(FAKE_CHANNEL, channel: FAKE_MESSAGE)
  end
end
