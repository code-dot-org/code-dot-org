require 'test_helper'

class ApplicationHelperTest < ActionView::TestCase
  include ApplicationHelper

  setup do
    client_state.reset
  end

  def test_client_state_lines
    assert_equal 0, client_state.lines
    client_state.add_lines 10
    assert_equal 10, client_state.lines
    client_state.add_lines 1
    assert_equal 11, client_state.lines
  end

  def test_client_state_level_progress
    assert client_state.levels_progress_is_empty_for_test
    assert_equal 0, client_state.level_progress(10)
    client_state.set_level_progress(10, 20)
    assert_equal 20, client_state.level_progress(10)
    client_state.set_level_progress(11, 25)
    assert_equal 25, client_state.level_progress(11)
    assert_equal 20, client_state.level_progress(10)
  end


  # Make sure that we correctly access and back-migrate future
  # versions of the client state, as would happen if we roll back from a future
  # version.
  def test_client_state_migration
    client_state.add_lines 37
    client_state.set_level_progress 1, 100

    # Verify that the session state before migration is as expected
    assert_equal 37, session[:lines]
    assert_equal({1 => 100}, session[:progress])

    # Verify the expected state after the (future) migration
    client_state.send(:migrate_cookies_for_test)
    assert_equal '37', cookies[:lines]
    assert_nil session[:lines]
    assert_equal('{"1":100}', cookies[:progress])

    # Call the accessors. Make sure that we get the expected values and
    # that state is migrated back to the session cookie.
    assert_equal 37, client_state.lines
    assert_equal 37, session[:lines]
    assert_nil cookies[:lines]

    assert_equal 100, client_state.level_progress(1)
    assert_equal({1 => 100}, session[:progress])
    assert_nil cookies[:progress]
  end

  def test_client_state_scripts
    assert_equal [], client_state.scripts

    client_state.add_script 1
    assert_equal [1], client_state.scripts

    client_state.add_script 2
    assert_equal_unordered [1, 2], client_state.scripts

    client_state.add_script 1  # Duplicate should be ignored
    assert_equal 2, client_state.scripts.length
    assert_equal_unordered [1, 2], client_state.scripts

    client_state.add_script 5
    assert_equal_unordered [1, 2, 5], client_state.scripts
  end

  def test_videos_seen
    assert_not client_state.videos_seen_for_test?
    assert_not client_state.video_seen? 'foo'

    client_state.add_video_seen 'foo'
    client_state.add_video_seen 'bar'
    assert client_state.video_seen? 'foo'
    assert client_state.video_seen? 'bar'
    assert_not client_state.video_seen? 'baz'

    client_state.add_video_seen 'foo'
    assert client_state.video_seen? 'foo'
  end

  def test_callouts_seen
    assert_not client_state.callout_seen? 'callout'
    client_state.add_callout_seen 'callout'
    assert client_state.callout_seen? 'callout'
    assert_not client_state.callout_seen? 'callout2'
  end

  private
  def assert_equal_unordered(array1, array2)
    Set.new(array1) == Set.new(array2)
  end
end
