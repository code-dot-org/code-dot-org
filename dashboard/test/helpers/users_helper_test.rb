require 'test_helper'
require 'users_helper'

class UsersHelperTest < ActionView::TestCase
  include UsersHelper

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


  def test_client_state_down_migration
    # Verify that cookies[:lines] is correctly down-migrated back to session[:lines].
    cookies.permanent[:lines] = '37'
    session[:lines] = nil

    assert_equal 37, client_state.lines
    assert_equal 37, session[:lines]
    assert_nil cookies[:lines]

    # Verify that cookies[:progress] is correctly down-migrated to session[:progress]
    cookies.permanent[:progress] = {'1' => 100, '2' => 50}.to_json
    session[:progress] = nil
    puts client_state.level_progress(1)
    puts "test_client_state_level_progress_down_migration: #{session[:progress]}"

    assert_equal 100, client_state.level_progress(1)
    assert_equal({1 => 100, 2 => 50}, session[:progress])
    assert_equal 50, client_state.level_progress(2)
    assert_nil cookies[:progress]
  end

  def test_summarize_user_progress_and_percent_complete
    script = Script.twenty_hour_script
    level1 = script.script_levels[1].level
    client_state.set_level_progress level1.id, 100
    level3 = script.script_levels[3].level
    client_state.set_level_progress level3.id, 20
    client_state.add_lines 42

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
