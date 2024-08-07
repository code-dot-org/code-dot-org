require_relative '../test_helper'
require 'cdo/slack'

class SlackTest < Minitest::Test
  FAKE_CHANNEL = 'abcxyz'.freeze
  FAKE_CHANNEL_ID = 'abcxyz-channel_id'.freeze
  FAKE_ENDPOINT = 'fake-endpoint'.freeze
  FAKE_MESSAGE = 'fake-message'.freeze
  FAKE_TOPIC = 'fake-topic'.freeze

  def setup
    Slack.stubs(:get_channel_id).with(FAKE_CHANNEL).returns(FAKE_CHANNEL_ID)
    CDO.stubs(:slack_endpoint).returns(FAKE_ENDPOINT)
  end

  def test_get_topic
    Slack.expects(:post_to_slack).returns(
      {
        'ok' => true,
        'channel' => {
          'topic' => {
            'value' => FAKE_TOPIC
          }
        }
      }
    )
    actual_topic = Slack.get_topic FAKE_CHANNEL
    assert_equal FAKE_TOPIC, actual_topic
  end

  def test_get_topic_with_error_response
    Slack.stubs(:post_to_slack).returns(false)
    assert_nil Slack.get_topic FAKE_CHANNEL
  end

  def test_update_topic
    Slack.stubs(:post_to_slack).returns({'ok' => true})
    assert Slack.update_topic(FAKE_CHANNEL, FAKE_TOPIC)
  end

  def test_join_room
    Slack.stubs(:post_to_slack).returns({'ok' => true})
    assert Slack.join_room(FAKE_CHANNEL)
  end

  def test_update_topic_with_error_response
    Slack.stubs(:post_to_slack).returns(false)
    refute Slack.update_topic(FAKE_CHANNEL, FAKE_TOPIC)
  end

  def test_replace_user_links
    Slack.stubs(:get_display_name).returns('elsa')
    assert_equal 'DOTD: @elsa; DTS: yes',
      Slack.replace_user_links('DOTD: <@SLACKID99>; DTS: yes')
    assert_equal 'DOTD: @elsa; DTS: no (ask @elsa)',
      Slack.replace_user_links('DOTD: <@SLACKID99>; DTS: no (ask <@SLACKID99>)')
  end

  def test_message
    CDO.stubs(:slack_endpoint).returns('fake-slack-endpoint')
    Net::HTTP.expects(:post_form).returns(stub(code: 200))
    assert Slack.message(FAKE_MESSAGE, channel: FAKE_CHANNEL)
  end

  def test_message_uses_channel_map
    Net::HTTP.expects(:post_form).with do |_url, params|
      JSON.parse(params[:payload])['channel'] == '#infra-test'
    end.returns(stub(code: 200))
    assert Slack.message(FAKE_MESSAGE, channel: 'test')
  end

  def test_message_slackifies_bold
    Net::HTTP.expects(:post_form).with do |_url, params|
      JSON.parse(params[:payload])['text'] == 'this should be *bold*'
    end.returns(stub(code: 200))
    message_with_bold = 'this should be <b>bold</b>'
    assert Slack.message(message_with_bold, channel: FAKE_CHANNEL)
  end

  def test_message_slackifies_italic
    Net::HTTP.expects(:post_form).with do |_url, params|
      JSON.parse(params[:payload])['text'] == 'this should be _italic_'
    end.returns(stub(code: 200))
    message_with_italic = 'this should be <i>italic</i>'
    assert Slack.message(message_with_italic, channel: FAKE_CHANNEL)
  end

  def test_message_slackifies_code_block
    Net::HTTP.expects(:post_form).with do |_url, params|
      JSON.parse(params[:payload])['text'] == "this should be\n```\na block of code\n```"
    end.returns(stub(code: 200))
    message_with_code_block = "this should be\n<pre>\na block of code\n</pre>"
    assert Slack.message(message_with_code_block, channel: FAKE_CHANNEL)
  end

  def test_message_slackifies
    Net::HTTP.expects(:post_form).with do |_url, params|
      "*dashboard* tests failed <https://a-link.to/somewhere|html output>" \
      "\n_rerun: bundle exec ./runner.rb -c iPhone " \
      "-f features/applab/sharedApps.feature --html_" ==
        JSON.parse(params[:payload])['text']
    end.returns(stub(code: 200))
    message_with_all = '<b>dashboard</b> tests failed ' \
      '<a href="https://a-link.to/somewhere">html output</a><br/>' \
      '<i>rerun: bundle exec ./runner.rb -c iPhone ' \
      '-f features/applab/sharedApps.feature --html</i>'
    assert Slack.message(message_with_all, channel: FAKE_CHANNEL)
  end

  def test_message_with_error_message
    Net::HTTP.expects(:post_form).returns(stub(code: 400))
    refute Slack.message(FAKE_MESSAGE, channel: FAKE_CHANNEL)
  end

  def test_tag_user_group_with_valid_group
    message = "test message"
    user_group = "teacher-tools-on-call"
    assert_equal "<!subteam^S07FB3XSAR5> test message", Slack.tag_user_group(message, user_group)
  end

  def test_tag_user_group_with_invalid_group
    message = "test message"
    user_group = "invalid-group"
    assert_equal "<!subteam^> test message", Slack.tag_user_group(message, user_group)
  end
end
