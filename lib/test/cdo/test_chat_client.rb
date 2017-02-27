require_relative '../../../shared/test/test_helper'
require 'cdo/chat_client'

class ChatClientTest < Minitest::Test
  def test_message_calls_slack
    Slack.expects(:message).returns(false)
    ChatClient.message('fake-room', 'fake-message')
  end

  # TODO(asher): This test currently fails, as ChatClient#message mutates the
  # channel before calling Slack#message. Fix this, then uncomment the test.
  def test_log_calls_slack
    # Slack.expects(:message).with(channel: CDO.hip_chat_log_room).returns(false)
    # ChatClient.log('fake-message')
  end
end
