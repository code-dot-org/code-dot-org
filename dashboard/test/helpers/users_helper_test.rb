require 'test_helper'
require 'cdo/shared_constants'

class UsersHelperTest < ActionView::TestCase
  include UsersHelper
  include SharedConstants

  def test_summarize_user_progress
    script = Script.twenty_hour_script
    user = create :user, total_lines: 42

    # Verify results for no completed levels.
    assert_equal(
      {
        linesOfCode: 42,
        linesOfCodeText: 'Total lines of code: 42',
        lockableAuthorized: false,
        levels: {},
        # second stage because first is unplugged
        current_stage: script.lessons[1].id,
        completed: false,
      },
      summarize_user_progress(script, user)
    )

    # Verify results for two completed levels for one script.
    ul1 = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, script: script, level: script.script_levels[1].level
    ul3 = create :user_level, user: user, best_result: 20, script: script, level: script.script_levels[3].level

    assert_equal(
      {
        linesOfCode: 42,
        linesOfCodeText: 'Total lines of code: 42',
        lockableAuthorized: false,
        levels: {
          ul1.level_id => {status: LEVEL_STATUS.perfect, result: ActivityConstants::BEST_PASS_RESULT},
          ul3.level_id => {status: LEVEL_STATUS.passed, result: 20}
        },
        current_stage: script.lessons[1].id,
        completed: false,
      },
      summarize_user_progress(script, user)
    )

    # Also test with level progress excluded.
    exclude_level_progress = true
    assert_equal(
      {
        linesOfCode: 42,
        lockableAuthorized: false,
        linesOfCodeText: 'Total lines of code: 42',
      },
      summarize_user_progress(script, user, exclude_level_progress)
    )

    assert_in_delta 1.83, percent_complete_total(script, user)
  end

  def test_summarize_user_progress_with_pages
    user = create :user, total_lines: 42
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    # Create some levels to be embedded in the LevelGroup.
    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'

    # Create a LevelGroup level from DSL.
    level_group_dsl = <<-DSL
      name 'LevelGroupLevel1'
      title 'Long assessment 1'

      page
      level 'level_free_response'
      level 'level_multi_unsubmitted'

      page
      level 'level_multi_correct'
      level 'level_multi_incorrect'
    DSL
    level = LevelGroup.create_from_level_builder({}, {name: 'LevelGroupLevel1', dsl_text: level_group_dsl})

    # Create a ScriptLevel joining this level to the script.
    script_level = create :script_level, script: script, levels: [level], assessment: true, lesson: lesson

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
    assert_equal(
      {
        linesOfCode: 42,
        linesOfCodeText: 'Total lines of code: 42',
        lockableAuthorized: false,
        levels: {
          ul.level_id => {
            status: LEVEL_STATUS.perfect,
            result: ActivityConstants::BEST_PASS_RESULT,
            pages_completed: [ActivityConstants::FREE_PLAY_RESULT, nil]
          },
          "#{ul.level_id}_0" => {result: ActivityConstants::FREE_PLAY_RESULT},
          "#{ul.level_id}_1" => {}
        },
        # second stage because first is unplugged
        current_stage: script_level.lesson.id,
        completed: false
      },
      summarize_user_progress(script, user)
    )
  end

  def test_summarize_user_progress_with_bubble_choice
    user = create :user, total_lines: 150
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    # Create BubbleChoice level with sublevels, script_level, and user_levels.
    sublevel1 = create :level, name: 'choice_1'
    sublevel2 = create :level, name: 'choice_2'
    level = create :bubble_choice_level, sublevels: [sublevel1, sublevel2]
    script_level = create :script_level, script: script, levels: [level], lesson: lesson
    create :user_level, user: user, level: sublevel1, script: script, best_result: ActivityConstants::BEST_PASS_RESULT
    create :user_level, user: user, level: sublevel2, script: script, best_result: 20

    expected_summary = {
      linesOfCode: 150,
      linesOfCodeText: 'Total lines of code: 150',
      lockableAuthorized: false,
      levels: {
        # BubbleChoice levels return status/result using the sublevel with the highest best_result.
        level.id => {
          status: LEVEL_STATUS.perfect,
          result: ActivityConstants::BEST_PASS_RESULT
        },
        sublevel1.id => {
          status: LEVEL_STATUS.perfect,
          result: ActivityConstants::BEST_PASS_RESULT
        },
        sublevel2.id => {
          status: LEVEL_STATUS.passed,
          result: 20
        }
      },
      current_stage: script_level.lesson.id,
      completed: false
    }
    assert_equal expected_summary, summarize_user_progress(script, user)
  end

  def test_summarize_user_progress_with_locked
    user = create :user, total_lines: 42
    script = create :script
    lesson_group = create :lesson_group, script: script

    # Create a LevelGroup level.
    level = create :level_group, :with_sublevels, name: 'LevelGroupLevel1'
    level.properties['title'] =  'Long assessment 1'
    level.properties['submittable'] = true
    level.save!

    stage = create :lesson, name: 'Stage1', script: script, lockable: true, lesson_group: lesson_group

    # Create a ScriptLevel joining this level to the script.
    create :script_level, script: script, levels: [level], assessment: true, lesson: stage

    # No user level exists, show locked progress
    assert UserLevel.find_by(user: user, level: level).nil?
    assert_equal(
      {level.id => {status: LEVEL_STATUS.locked}},
      summarize_user_progress(script, user)[:levels]
    )

    # Now "unlock" it by creating a non-submitted UserLevel
    user_level = create :user_level, user: user, best_result: nil, level: level, script: script, unlocked_at: Time.now, readonly_answers: false, submitted: false
    assert_equal({}, summarize_user_progress(script, user)[:levels], 'No level progress since we dont have a result')

    # put in in "view answers" mode
    user_level.delete
    user_level = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, unlocked_at: Time.now, readonly_answers: true, submitted: true
    assert_equal(
      {
        level.id => {status: LEVEL_STATUS.submitted, submitted: true, readonly_answers: true, result: ActivityConstants::BEST_PASS_RESULT, pages_completed: [nil, nil]},
        "#{level.id}_0" => {submitted: true, readonly_answers: true},
        "#{level.id}_1" => {submitted: true, readonly_answers: true}
      },
      summarize_user_progress(script, user)[:levels], 'level shows as locked again'
    )

    # now submit it (the student ui will display this as locked)
    user_level.delete
    user_level = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, unlocked_at: nil, readonly_answers: false, submitted: true
    assert_equal(
      {
        level.id => {
          status: "submitted",
          result: 100,
          submitted: true,
          locked: true,
          pages_completed: [nil, nil]
        },
        "#{level.id}_0" => {submitted: true},
        "#{level.id}_1" => {submitted: true}
      },
      summarize_user_progress(script, user)[:levels],
      'level shows as locked again'
    )

    # unlock it again
    user_level.delete
    level_source = create :level_source, data: "{}"
    user_level = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, unlocked_at: Time.now, readonly_answers: false, submitted: false, level_source: level_source
    assert_equal(
      {
        level.id => {status: LEVEL_STATUS.perfect, result: ActivityConstants::BEST_PASS_RESULT, pages_completed: [nil, nil]},
        "#{level.id}_0" => {},
        "#{level.id}_1" => {}
      },
      summarize_user_progress(script, user)[:levels],
      'level still shows as locked'
    )

    # now unlock it
    user_level.delete
    user_level = create :user_level, user: user, best_result: ActivityConstants::UNSUBMITTED_RESULT, level: level, script: script, unlocked_at: nil, readonly_answers: false, submitted: false
    assert_equal(
      {
        level.id => {status: LEVEL_STATUS.attempted, result: ActivityConstants::UNSUBMITTED_RESULT, pages_completed: [nil, nil]},
        "#{level.id}_0" => {},
        "#{level.id}_1" => {}
      },
      summarize_user_progress(script, user)[:levels],
      'level shows attempted now'
    )

    # appears submitted while viewing answers (appears in student ui as locked)
    user_level.delete
    create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, unlocked_at: 2.days.ago, readonly_answers: true, submitted: true
    assert_equal(
      {
        level.id => {
          status: "submitted",
          result: 100,
          submitted: true,
          readonly_answers: true,
          locked: true,
          pages_completed: [nil, nil]
        },
        "#{level.id}_0" => {submitted: true, readonly_answers: true},
        "#{level.id}_1" => {submitted: true, readonly_answers: true}
      },
      summarize_user_progress(script, user)[:levels],
      'level shows as submitted'
    )
  end

  def test_summarize_user_progress_non_lockable
    user = create :user, total_lines: 42
    script = create :script
    lesson_group = create :lesson_group, script: script

    # Create a LevelGroup level.
    level = create :level_group, :with_sublevels, name: 'LevelGroupLevel1'
    level.properties['title'] =  'Long assessment 1'
    level.properties['submittable'] = true
    level.save!

    # create a stage that is NOT lockable
    stage = create :lesson, name: 'Stage1', script: script, lockable: false, lesson_group: lesson_group

    # Create a ScriptLevel joining this level to the script.
    create :script_level, script: script, levels: [level], assessment: true, lesson: stage

    # No user level exists, no progress
    assert UserLevel.find_by(user: user, level: level).nil?
    assert_equal({}, summarize_user_progress(script, user)[:levels])

    # now create a non-submitted user level
    user_level = create :user_level, user: user, best_result: ActivityConstants::UNSUBMITTED_RESULT, level: level, script: script, unlocked_at: nil, readonly_answers: nil, submitted: false
    assert_equal(
      {
        level.id => {status: LEVEL_STATUS.attempted, result: ActivityConstants::UNSUBMITTED_RESULT, pages_completed: [nil, nil]},
        "#{level.id}_0" => {},
        "#{level.id}_1" => {}
      },
      summarize_user_progress(script, user)[:levels]
    )

    # now create a submitted user level
    user_level.delete
    create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, unlocked_at: nil, readonly_answers: nil, submitted: true
    assert_equal(
      {
        level.id => {status: LEVEL_STATUS.submitted, submitted: true, result: ActivityConstants::BEST_PASS_RESULT, pages_completed: [nil, nil]},
        "#{level.id}_0" => {submitted: true},
        "#{level.id}_1" => {submitted: true}
      },
      summarize_user_progress(script, user)[:levels]
    )
  end

  def test_level_with_best_progress_one_level
    assert_equal(101, level_with_best_progress([101], {}))
  end

  def test_level_with_best_progress_submitted
    level_progress = {
      101 => {
        status: LEVEL_STATUS.submitted,
        submitted: true,
        result: ActivityConstants::BEST_PASS_RESULT,
        pages_completed: [nil, nil]
      },
      "101_0" => {submitted: true},
      "101_1" => {submitted: true},
    }

    assert_equal(101, level_with_best_progress([101, 102], level_progress))
    assert_equal(101, level_with_best_progress([102, 101], level_progress))
  end

  def test_level_with_best_progress_pages
    level_progress = {
      101 => {
        status: LEVEL_STATUS.perfect,
        result: ActivityConstants::BEST_PASS_RESULT,
        pages_completed: [ActivityConstants::FREE_PLAY_RESULT, nil]
      },
      "101_0" => {result: ActivityConstants::FREE_PLAY_RESULT},
      "101_1" => {}
    }

    assert_equal(101, level_with_best_progress([101, 102], level_progress))
    assert_equal(101, level_with_best_progress([102, 101], level_progress))
  end

  def test_level_with_best_progress_one_attempt
    level_progress = {
      101 => {status: LEVEL_STATUS.passed, result: 20}
    }

    assert_equal(101, level_with_best_progress([101, 102], level_progress))
    assert_equal(101, level_with_best_progress([102, 101], level_progress))
  end

  def test_level_with_best_progress_multiple_attempts
    level_progress = {
      101 => {status: LEVEL_STATUS.perfect, result: ActivityConstants::BEST_PASS_RESULT},
      102 => {status: LEVEL_STATUS.passed, result: 20}
    }

    assert_equal(101, level_with_best_progress([101, 102], level_progress))
    assert_equal(101, level_with_best_progress([102, 101], level_progress))
  end
end
