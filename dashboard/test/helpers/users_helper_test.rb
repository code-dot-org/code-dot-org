require 'test_helper'

class UsersHelperTest < ActionView::TestCase
  include UsersHelper

  def test_summarize_user_progress_and_percent_complete
    script = Script.twenty_hour_script
    user = create :user, total_lines: 42
    ul1 = create :user_level, user: user, best_result: 100, script: script, level: script.script_levels[1].level
    ul3 = create :user_level, user: user, best_result: 20, script: script, level: script.script_levels[3].level

    assert_equal({
      linesOfCode: 42,
      linesOfCodeText: 'Total lines of code: 42',
      levels: {
        ul1.level_id => {status: 'perfect', result: 100},
        ul3.level_id => {status: 'passed', result: 20}
      },
      trophies: {current: 0, of: 'of', max: 27}
    }, summarize_user_progress(script, user))

    assert_equal [0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], percent_complete(script, user)
    assert_in_delta 0.0183, percent_complete_total(script, user)
  end

end
