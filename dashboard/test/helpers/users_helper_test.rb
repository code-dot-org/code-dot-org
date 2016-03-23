require 'test_helper'

class UsersHelperTest < ActionView::TestCase
  include UsersHelper

  def test_summarize_user_progress_and_percent_complete
    script = Script.twenty_hour_script
    user = create :user, total_lines: 42

    # Verify results for no completed levels.
    assert_equal({
         linesOfCode: 42,
         linesOfCodeText: 'Total lines of code: 42',
         levels: {},
         trophies: {current: 0, of: 'of', max: 27},
    }, summarize_user_progress(script, user))

    assert_equal({
         linesOfCode: 42,
         linesOfCodeText: 'Total lines of code: 42',
         scripts: {},
     }, summarize_user_progress_for_all_scripts(user))

    # Verify results for two completed levels for one script.
    ul1 = create :user_level, user: user, best_result: 100, script: script, level: script.script_levels[1].level
    ul3 = create :user_level, user: user, best_result: 20, script: script, level: script.script_levels[3].level

    assert_equal({
      linesOfCode: 42,
      linesOfCodeText: 'Total lines of code: 42',
      levels: {
        ul1.level_id => {status: 'perfect', result: 100, submitted: false},
        ul3.level_id => {status: 'passed', result: 20, submitted: false}
      },
      trophies: {current: 0, of: 'of', max: 27}
    }, summarize_user_progress(script, user))

    # Also test with level progress excluded.
    exclude_level_progress = true
    assert_equal({
                     linesOfCode: 42,
                     linesOfCodeText: 'Total lines of code: 42',
                     trophies: {current: 0, of: 'of', max: 27}
                 }, summarize_user_progress(script, user, exclude_level_progress))

    assert_equal({
       linesOfCode: 42,
       linesOfCodeText: 'Total lines of code: 42',
       scripts: {
           script.name => {
               levels: {
                   ul1.level_id => {status: 'perfect', result: 100, submitted: false},
                   ul3.level_id => {status: 'passed', result: 20, submitted: false}
               },
               trophies: {current: 0, of: 'of', max: 27},
           }
       }
    }, summarize_user_progress_for_all_scripts(user))

    assert_equal [0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], percent_complete(script, user)
    assert_in_delta 0.0183, percent_complete_total(script, user)

    # Verify summarize_user_progress_for_all_scripts for multiple completed levels across multiple scripts.
    course1 = Script.course1_script
    ul1b = create :user_level, user: user, best_result: 10, script: course1, level: course1.script_levels[1].level

    assert_equal({
         linesOfCode: 42,
         linesOfCodeText: 'Total lines of code: 42',
         scripts: {
             script.name => {
                 levels: {
                     ul1.level_id => {status: 'perfect', result: 100, submitted: false},
                     ul3.level_id => {status: 'passed', result: 20, submitted: false}
                 },
                 trophies: {current: 0, of: 'of', max: 27}
             },
             course1.name => {
                 levels: {
                     ul1b.level_id => {status: 'attempted', result: 10, submitted: false},
                 }
             }

         }
     }, summarize_user_progress_for_all_scripts(user))
  end

end
