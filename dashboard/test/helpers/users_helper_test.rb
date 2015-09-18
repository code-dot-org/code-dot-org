require 'test_helper'
require 'users_helper'

class UsersHelperTest < ActionView::TestCase
  include UsersHelper

  setup do
    session_reset_for_test
  end

  def test_session_lines
    assert_equal 0, session_lines
    session_add_lines 10
    assert_equal 10, session_lines
    session_add_lines 1
    assert_equal 11, session_lines
  end

  def test_session_lines_migration
    # Verify that session[:lines] is correctly migrated in cookies[:lines]
    session[:lines] = 37
    assert_equal 37, session_lines
    assert_nil session[:lines]
    assert_equal '37', cookies[:lines]
  end

  def test_session_level_progress
    assert session_levels_progress_is_empty_for_test
    assert_equal 0, session_level_progress(10)
    session_set_level_progress(10, 20)
    assert_equal 20, session_level_progress(10)
    session_set_level_progress(11, 25)
    assert_equal 25, session_level_progress(11)
    assert_equal 20, session_level_progress(10)
  end

  def test_session_level_progress_migration
    # Verify that session[:lines] is correctly migrated in cookies[:lines]
    session[:progress] = {1 => 100}
    assert_equal 100, session_level_progress(1)
    assert_nil session[:progress]
    assert_equal JSON.generate({'1' => 100}), cookies[:progress]
  end

  def test_summarize_user_progress_and_percent_complete
    script = Script.twenty_hour_script
    level1 = script.script_levels[1].level
    session_set_level_progress level1.id, 100
    level3 = script.script_levels[3].level
    session_set_level_progress level3.id, 20
    session_add_lines 42

    assert_equal({
      :linesOfCode => 42,
      :linesOfCodeText => 'Total lines of code: 42',
      :levels => {level1.id => {:status=>'perfect'},
                  level3.id => {:status=>'passed'}}},
      summarize_user_progress(script, nil))

    assert_equal [0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
                 percent_complete(script, nil)
    assert_in_delta 0.0183, percent_complete_total(script, nil)
  end

  def test_session_scripts
    assert_equal [], session_scripts

    session_add_script 1
    assert_equal [1], session_scripts

    session_add_script 2
    assert_equal_unordered [1, 2], session_scripts

    session_add_script 1  # Duplicate should be ignored
    assert_equal 2, session_scripts.length
    assert_equal_unordered [1, 2], session_scripts

    session_add_script 5
    assert_equal_unordered [1, 2, 5], session_scripts
  end

  def test_videos_seen
    assert_not session_videos_seen_for_test?
    assert_not session_video_seen? 'foo'

    session_add_video_seen 'foo'
    session_add_video_seen 'bar'
    assert session_video_seen? 'foo'
    assert session_video_seen? 'bar'
    assert_not session_video_seen? 'baz'

    session_add_video_seen 'foo'
    assert session_video_seen? 'foo'
  end

  def test_callouts_seen
    assert_not session_callout_seen? 'callout'
    session_add_callout_seen 'callout'
    assert session_callout_seen? 'callout'
    assert_not session_callout_seen? 'callout2'
  end

  private
  def assert_equal_unordered(array1, array2)
    Set.new(array1) == Set.new(array2)
  end
end
