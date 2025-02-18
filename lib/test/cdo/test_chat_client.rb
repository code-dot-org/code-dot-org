require_relative '../test_helper'
require 'cdo/chat_client'

class ChatClientTest < Minitest::Test
  FAKE_MESSAGE = 'fake-message'.freeze
  FAKE_ROOM = 'fake-room'.freeze

  def setup
    CDO.stubs(hip_chat_logging: true)
  end

  def test_message_calls_slack
    Slack.expects(:message).returns(false)
    Logger.any_instance.expects(:info).with('[fake-room] fake-message')
    ChatClient.message(FAKE_ROOM, FAKE_MESSAGE)
  end

  def test_log_calls_slack
    ENV.expects(:[]).returns(false)
    Slack.expects(:message).with do |_text, params|
      params[:channel] == CDO.slack_log_room
    end.returns(false)
    Logger.any_instance.expects(:info)
    ChatClient.log(FAKE_MESSAGE)
  end

  def test_log_with_notify_group
    ENV.expects(:[]).returns(false)
    Slack.expects(:tag_user_group).with do |_message, group|
      group == "teacher-tools-on-call"
    end.returns(FAKE_MESSAGE)
    Slack.expects(:message).with do |_text, params|
      params[:channel] == CDO.slack_log_room
    end.returns(false)
    ChatClient.log(FAKE_MESSAGE, notify_group: 'teacher-tools-on-call')
  end
end
