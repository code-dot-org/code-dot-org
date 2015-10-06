require 'fakeweb'
require 'minitest/autorun'
require 'rack/test'
require_relative '../../deployment'
require_relative '../../lib/cdo/hip_chat'

class HipchatTest < Minitest::Test

  MAX_WAIT_SECONDS = 10

  # Use a short retry backoff for this test to keep the test fast.
  BACKOFF = 0.1

  def setup
    CDO.log.level = 5  # Log only fatal exceptions to avoid test spew.
    HipChat.reset_test_statistics
    HipChat.set_backoff_for_test(BACKOFF)
  end

  # Verify correct behavior in the simple success case.
  def test_post_to_hipchat
    FakeWeb.register_uri(:post, 'http://api.hipchat.com/v1/rooms/message',
                         :body => 'OK')

    HipChat.post_to_hipchat('fake_room', 'my_message1')
    HipChat.await_retries_for_test
    assert /message=my_message1/ =~ FakeWeb.last_request.body

    assert_equal 0, HipChat.retries_for_test
    assert_equal 0.0, HipChat.total_backoff_for_test
  end

  # Verify that we retry with exponential backoff on a HipChat failure.
  def test_post_to_hipchat_with_failures
    FakeWeb.register_uri(:post, 'http://api.hipchat.com/v1/rooms/message',
                         [{:status => ["500", "Server Error"]},
                          {:status => ["500", "Server Error"]},
                          {:body => "OK"}])

    HipChat.post_to_hipchat('fake_room', 'my_message2')
    HipChat.await_retries_for_test
    assert /message=my_message2/ =~ FakeWeb.last_request.body

    assert_equal 2, HipChat.retries_for_test
    assert_in_delta BACKOFF + (2 * BACKOFF), HipChat.total_backoff_for_test
  end

  # Verify that we give up if there are too many HipChat failures.
  def test_post_to_hipchat_with_repeated_failure
    FakeWeb.register_uri(:post, 'http://api.hipchat.com/v1/rooms/message',
                         {:status => ["500", "Server Error"]})

    CDO.log.info 'Expecting following HipChat post to fail:'
    HipChat.post_to_hipchat('fake_room', 'my_message3')
    HipChat.await_retries_for_test

    # Make we only tried 3 times (HipChat.MAX_RETRIES)
    assert_equal 3, HipChat.retries_for_test
    assert_in_delta BACKOFF + (2 * BACKOFF) + (4 * BACKOFF),
                    HipChat.total_backoff_for_test
  end
end
