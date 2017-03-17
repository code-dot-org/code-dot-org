require_relative '../test_helper'
require 'cdo/chat_client'

class ChatClientTest < Minitest::Test
  FAKE_MESSAGE = 'fake-message'.freeze
  FAKE_ROOM = 'fake-room'.freeze

  def setup
    CDO.hip_chat_logging = true
  end

  def test_message_calls_slack
    Slack.expects(:message).returns(false)
    ChatClient.message(FAKE_ROOM, FAKE_MESSAGE)
  end

  def test_log_calls_slack
    Slack.expects(:message).with do |_text, params|
      params[:channel] == 'infra-test'
    end.returns(false)
    ChatClient.log(FAKE_MESSAGE)
  end
end
