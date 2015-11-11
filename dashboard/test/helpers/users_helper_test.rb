require 'test_helper'

class UsersHelperTest < ActionView::TestCase
  include UsersHelper

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

end
