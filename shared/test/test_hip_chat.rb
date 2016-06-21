require_relative 'test_helper'
require 'webmock/minitest'

require 'cdo/hip_chat'

class HipchatTest < Minitest::Test

  # Use a short retry backoff for this test to keep the test fast.
  BACKOFF = 0.02

  def setup
    WebMock.reset!
    CDO.hip_chat_logging = true
    @old_log_level = CDO.log.level
    CDO.log.level = Logger::Severity::ERROR  # Log only fatal exceptions to avoid test spew.
    HipChat.reset_test_statistics
    HipChat.set_backoff_for_test(BACKOFF)
  end

  def teardown
    CDO.log.level = @old_log_level  # restore default log level
    WebMock.reset!
  end

  # Verify correct behavior in the simple success case.
  def test_post_to_hipchat
    stub_request(:post, 'http://api.hipchat.com/v1/rooms/message').to_return(
      :body => 'OK'
    )

    HipChat.post_to_hipchat('fake_room', 'my_message1')
    HipChat.await_retries_for_test
    assert_requested :post, 'http://api.hipchat.com/v1/rooms/message' do |req|
      req.body.match /message=my_message1/
    end

    assert_equal 0, HipChat.retries_for_test
    assert_equal 0.0, HipChat.total_backoff_for_test
  end

  # Verify that we retry with exponential backoff on a HipChat failure.
  def test_post_to_hipchat_with_failures
    stub_request(:post, 'http://api.hipchat.com/v1/rooms/message').to_return(
      {:status => ['500', 'Server Error']},
      {:status => ['500', 'Server Error']},
      {:body => 'OK'}
    )

    HipChat.post_to_hipchat('fake_room', 'my_message2')
    HipChat.await_retries_for_test
    assert_requested :post, 'http://api.hipchat.com/v1/rooms/message', times: 3 do |req|
      req.body.match /message=my_message2/
    end

    assert_equal 2, HipChat.retries_for_test
    assert_in_delta BACKOFF + (2 * BACKOFF), HipChat.total_backoff_for_test
  end

  # Verify that we retry with exponential backoff on a HipChat failure.
  def test_post_to_hipchat_with_net_timeout
    stub_request(:post, 'http://api.hipchat.com/v1/rooms/message').
        to_timeout.
        to_return({body: 'OK'})

    # This should not throw.
    HipChat.post_to_hipchat('fake_room', 'my_message2')
    HipChat.await_retries_for_test
    assert_requested :post, 'http://api.hipchat.com/v1/rooms/message', times: 2 do |req|
      req.body.match /message=my_message2/
    end

    assert_equal 1, HipChat.retries_for_test
    assert_in_delta BACKOFF, HipChat.total_backoff_for_test
  end

  # Verify that we give up if there are too many HipChat failures.
  def test_post_to_hipchat_with_repeated_failure
    stub_request(:post, 'http://api.hipchat.com/v1/rooms/message').to_return(
      {:status => ['500', 'Server Error']}
    )

    CDO.log.info 'Expecting following HipChat post to fail:'
    HipChat.post_to_hipchat('fake_room', 'my_message3')
    HipChat.await_retries_for_test

    # Make we only tried 3 times (HipChat.MAX_RETRIES)
    assert_equal 3, HipChat.retries_for_test
    assert_in_delta BACKOFF + (2 * BACKOFF) + (4 * BACKOFF),
      HipChat.total_backoff_for_test
  end

  # Verify correct behavior when hip chat logging is disabled.
  def test_disable_hip_chat_logging
    stub_request(:post, 'http://api.hipchat.com/v1/rooms/message').to_return(
      {:status => ['500', 'Server Error']}
    )

    CDO.hip_chat_logging = false

    HipChat.post_to_hipchat('fake_room', 'my_message1')
    HipChat.await_retries_for_test
    assert_not_requested :post, 'http://api.hipchat.com/v1/rooms/message'

    assert_equal 0, HipChat.retries_for_test
    assert_equal 0.0, HipChat.total_backoff_for_test
  end

  def test_slackify
    assert_equal 'this should be *bold*', HipChat.slackify('this should be <b>bold</b>')
    assert_equal 'this should be _italic_', HipChat.slackify('this should be <i>italic</i>')
    assert_equal "this should be\n```\na block of code\n```", HipChat.slackify("this should be\n<pre>\na block of code\n</pre>")

    assert_equal "*dashboard* tests failed <https://a-link.to/somewhere|html output>\n_rerun: bundle exec ./runner.rb -c iPhone -f features/applab/sharedApps.feature --html_",
      HipChat.slackify('<b>dashboard</b> tests failed <a href="https://a-link.to/somewhere">html output</a><br/><i>rerun: bundle exec ./runner.rb -c iPhone -f features/applab/sharedApps.feature --html</i>')
  end

end
