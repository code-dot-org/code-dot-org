require 'test_helper'

class UsersHelperTest < ActionView::TestCase
  include UsersHelper

  def test_summarize_user_progress_and_percent_complete
    script = Script.twenty_hour_script
    sl1 = script.script_levels[1]
    client_state.set_level_progress sl1, 100
    sl3 = script.script_levels[3]
    client_state.set_level_progress sl3, 20
    client_state.add_lines 42

    assert_equal({
                     :linesOfCode => 42,
                     :linesOfCodeText => 'Total lines of code: 42',
                     :levels => {sl1.level_id => {:status=>'perfect'},
                                 sl3.level_id => {:status=>'passed'}}},
                 summarize_user_progress(script, nil))

    assert_equal [0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
                 percent_complete(script, nil)
    assert_in_delta 0.0183, percent_complete_total(script, nil)
  end

end
