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
        ul1.level_id => {status: 'perfect', result: 100},
        ul3.level_id => {status: 'passed', result: 20}
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
                   ul1.level_id => {status: 'perfect', result: 100},
                   ul3.level_id => {status: 'passed', result: 20}
               },
               trophies: {current: 0, of: 'of', max: 27},
           }
       }
    }, summarize_user_progress_for_all_scripts(user))

    assert_equal [0.0, 0.1] + Array.new(18, 0.0), percent_complete(script, user)
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
                     ul1.level_id => {status: 'perfect', result: 100},
                     ul3.level_id => {status: 'passed', result: 20}
                 },
                 trophies: {current: 0, of: 'of', max: 27}
             },
             course1.name => {
                 levels: {
                     ul1b.level_id => {status: 'attempted', result: 10},
                 }
             }

         }
     }, summarize_user_progress_for_all_scripts(user))
  end

  def test_summarize_user_progress_with_pages
    user = create :user, total_lines: 42
    script = create :script

    # Create some levels to be embedded in the LevelGroup.
    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'

    # Create a LevelGroup level.
    level = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level.properties['title'] =  'Long assessment 1'
    level.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}]
    level.save!

    # Create a ScriptLevel joining this level to the script.
    create :script_level, script: script, levels: [level], assessment: true

    # Create a UserLevel joining this level to the user.
    ul = create :user_level, user: user, best_result: 100, level: level, script: script

    # The Activity record will point at a LevelSource with JSON data in which
    # page one has all valid answers and page two has no valid answers.
    level_source = create :level_source,
      data: "{\"#{sub_level1.id}\":{\"valid\":true},\"#{sub_level2.id}\":{\"valid\":true},\"#{sub_level3.id}\":{\"valid\":false},\"#{sub_level4.id}\":{\"valid\":false}}"

    # And now create the Activity record.
    create :activity, level_id: level.id,
      user_id: user.id,
      level_source_id: level_source.id,
      test_result: Activity::BEST_PASS_RESULT

    # Validate.
    assert_equal({
      linesOfCode: 42,
      linesOfCodeText: 'Total lines of code: 42',
      levels: {
        ul.level_id => {
          status: 'perfect',
          result: 100,
          pages_completed: [ActivityConstants::FREE_PLAY_RESULT, nil]},
        "#{ul.level_id}_0" => {result: ActivityConstants::FREE_PLAY_RESULT},
        "#{ul.level_id}_1" => {}
      }
    }, summarize_user_progress(script, user))
  end

end
