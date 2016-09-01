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
         lockableAuthorized: false,
         levels: {}
    }, summarize_user_progress(script, user))

    assert_equal({
         linesOfCode: 42,
         linesOfCodeText: 'Total lines of code: 42',
         lockableAuthorized: false,
         scripts: {},
     }, summarize_user_progress_for_all_scripts(user))

    # Verify results for two completed levels for one script.
    ul1 = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, script: script, level: script.script_levels[1].level
    ul3 = create :user_level, user: user, best_result: 20, script: script, level: script.script_levels[3].level

    assert_equal({
      linesOfCode: 42,
      linesOfCodeText: 'Total lines of code: 42',
      lockableAuthorized: false,
      levels: {
        ul1.level_id => {status: 'perfect', result: ActivityConstants::BEST_PASS_RESULT},
        ul3.level_id => {status: 'passed', result: 20}
      }
    }, summarize_user_progress(script, user))

    # Also test with level progress excluded.
    exclude_level_progress = true
    assert_equal({
     linesOfCode: 42,
     lockableAuthorized: false,
     linesOfCodeText: 'Total lines of code: 42'
   }, summarize_user_progress(script, user, exclude_level_progress))

    assert_equal({
     linesOfCode: 42,
     linesOfCodeText: 'Total lines of code: 42',
     lockableAuthorized: false,
     scripts: {
       script.name => {
         levels: {
           ul1.level_id => {status: 'perfect', result: ActivityConstants::BEST_PASS_RESULT},
           ul3.level_id => {status: 'passed', result: 20}
         }
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
       lockableAuthorized: false,
       scripts: {
         script.name => {
           levels: {
             ul1.level_id => {status: 'perfect', result: ActivityConstants::BEST_PASS_RESULT},
             ul3.level_id => {status: 'passed', result: 20}
           }
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

    # The Activity record will point at a LevelSource with JSON data in which
    # page one has all valid answers and page two has no valid answers.
    level_source = create :level_source,
      data: "{\"#{sub_level1.id}\":{\"valid\":true},\"#{sub_level2.id}\":{\"valid\":true},\"#{sub_level3.id}\":{\"valid\":false},\"#{sub_level4.id}\":{\"valid\":false}}"

    # Create a UserLevel joining this level to the user.
    ul = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, level_source: level_source

    # And now create the Activity record.
    create :activity, level_id: level.id,
      user_id: user.id,
      level_source_id: level_source.id,
      test_result: Activity::BEST_PASS_RESULT

    # Validate.
    assert_equal({
      linesOfCode: 42,
      linesOfCodeText: 'Total lines of code: 42',
      lockableAuthorized: false,
      levels: {
        ul.level_id => {
          status: 'perfect',
          result: ActivityConstants::BEST_PASS_RESULT,
          pages_completed: [ActivityConstants::FREE_PLAY_RESULT, nil]},
        "#{ul.level_id}_0" => {result: ActivityConstants::FREE_PLAY_RESULT},
        "#{ul.level_id}_1" => {}
      }
    }, summarize_user_progress(script, user))
  end

  def test_summarize_user_progress_with_locked
    user = create :user, total_lines: 42
    script = create :script

    # Create a LevelGroup level.
    level = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level.properties['title'] =  'Long assessment 1'
    level.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}]
    level.properties['submittable'] = true
    level.save!

    stage = create :stage, name: 'Stage1', script: script, lockable: true

    # Create a ScriptLevel joining this level to the script.
    create :script_level, script: script, levels: [level], assessment: true, stage: stage

    # No user level exists, show locked progress
    assert UserLevel.find_by(user: user, level: level).nil?
    assert_equal({
      level.id => { status: 'locked' }
    }, summarize_user_progress(script, user)[:levels])

    # Now "unlock" it by creating a non-submitted UserLevel
    user_level = create :user_level, user: user, best_result: nil, level: level, script: script, unlocked_at: Time.now, readonly_answers: false, submitted: false
    assert_equal({}, summarize_user_progress(script, user)[:levels], 'No level progress since we dont have a result')

    # put in in "view answers" mode
    user_level.delete
    user_level = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, unlocked_at: Time.now, readonly_answers: true, submitted: true
    assert_equal({
      level.id => { status: 'submitted', submitted: true, readonly_answers: true, result: ActivityConstants::BEST_PASS_RESULT, pages_completed: [nil, nil] },
      "#{level.id}_0" => { submitted: true, readonly_answers: true },
      "#{level.id}_1" => { submitted: true, readonly_answers: true }
    }, summarize_user_progress(script, user)[:levels], 'level shows as locked again')

    # now lock it by submitting it (even though we don't have a level source attached)
    user_level.delete
    user_level = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, unlocked_at: nil, readonly_answers: false, submitted: true
    assert_equal({
      level.id => { status: 'locked' }
    }, summarize_user_progress(script, user)[:levels], 'level shows as locked again')

    # unlock it again
    user_level.delete
    level_source = create :level_source, data: "{}"
    user_level = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, unlocked_at: Time.now, readonly_answers: false, submitted: false, level_source: level_source
    assert_equal({
      level.id => { status: 'perfect', result: ActivityConstants::BEST_PASS_RESULT, pages_completed: [nil, nil] },
      "#{level.id}_0" => {},
      "#{level.id}_1" => {}
    }, summarize_user_progress(script, user)[:levels], 'level still shows as locked')

    # now unlock it with a submission
    user_level.delete
    user_level = create :user_level, user: user, best_result: ActivityConstants::UNSUBMITTED_RESULT, level: level, script: script, unlocked_at: nil, readonly_answers: false, submitted: false
    assert_equal({
      level.id => { status: 'attempted', result: ActivityConstants::UNSUBMITTED_RESULT, pages_completed: [nil, nil] },
      "#{level.id}_0" => {},
      "#{level.id}_1" => {}
    }, summarize_user_progress(script, user)[:levels], 'level shows attempted now')

    # auto-locked while viewing answers
    user_level.delete
    create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, unlocked_at: 2.days.ago, readonly_answers: true, submitted: true
    assert_equal({
      level.id => { status: 'locked' }
    }, summarize_user_progress(script, user)[:levels], 'level shows as locked')
  end

  def test_summarize_user_progress_non_lockable
    user = create :user, total_lines: 42
    script = create :script

    # Create a LevelGroup level.
    level = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level.properties['title'] =  'Long assessment 1'
    level.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}]
    level.properties['submittable'] = true
    level.save!

    # create a stage that is NOT lockable
    stage = create :stage, name: 'Stage1', script: script, lockable: false

    # Create a ScriptLevel joining this level to the script.
    create :script_level, script: script, levels: [level], assessment: true, stage: stage

    # No user level exists, no progress
    assert UserLevel.find_by(user: user, level: level).nil?
    puts summarize_user_progress(script, user)[:levels]
    assert_equal({}, summarize_user_progress(script, user)[:levels])

    # now create a non-submitted user level
    user_level = create :user_level, user: user, best_result: ActivityConstants::UNSUBMITTED_RESULT, level: level, script: script, unlocked_at: nil, readonly_answers: nil, submitted: false
    assert_equal({
      level.id => { status: 'attempted', result: ActivityConstants::UNSUBMITTED_RESULT, pages_completed: [nil, nil] },
      "#{level.id}_0" => {},
      "#{level.id}_1" => {}
    }, summarize_user_progress(script, user)[:levels])

    # now create a submitted user level
    user_level.delete
    create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, unlocked_at: nil, readonly_answers: nil, submitted: true
    assert_equal({
      level.id => { status: 'submitted', submitted: true, result: ActivityConstants::BEST_PASS_RESULT, pages_completed: [nil, nil] },
      "#{level.id}_0" => { submitted: true },
      "#{level.id}_1" => { submitted: true}
    }, summarize_user_progress(script, user)[:levels])
  end
end
