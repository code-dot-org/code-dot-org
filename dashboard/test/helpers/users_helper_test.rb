require 'test_helper'
require 'cdo/shared_constants'

class UsersHelperTest < ActionView::TestCase
  include UsersHelper
  include SharedConstants

  class CountryCodeTest < ActionView::TestCase
    setup do
      @country_code = 'US'
      @request = ActionDispatch::Request.new({'HTTP_CLOUDFRONT_VIEWER_COUNTRY' => @country_code.downcase})
    end

    test 'returns country code of student' do
      student_country_code = 'UA'

      student = build(:student, country_code: student_country_code)

      assert_equal student_country_code, country_code(student, @request)
    end

    test 'returns nil if country code of student is not set' do
      student = build(:student, country_code: nil)

      assert_nil country_code(student, @request)
    end

    test 'returns country code of teacher' do
      teacher_country_code = 'UA'

      teacher = build(:teacher, country_code: teacher_country_code)

      assert_equal teacher_country_code, country_code(teacher, @request)
    end

    test 'returns request country code when teacher country_code is not set' do
      teacher = build(:teacher, country_code: '')

      assert_equal @country_code, country_code(teacher, @request)
    end
  end

  def test_summarize_user_progress
    script = create(:script, :with_levels, levels_count: 3)
    user = create :user

    # Verify results for no completed levels.
    assert_equal(
      {
        lockableAuthorized: false,
        isInstructor: false,
        progress: {},
        current_lesson: script.lessons.first.id,
        completed: false,
      },
      summarize_user_progress(script, user)
    )

    # Verify results for two completed levels for one script.
    ul1 = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, script: script, level: script.script_levels[1].level
    ul3 = create :user_level, user: user, best_result: 20, script: script, level: script.script_levels[2].level

    assert_equal(
      {
        lockableAuthorized: false,
        isInstructor: false,
        progress: {
          ul1.level_id => {status: LEVEL_STATUS.perfect, result: ActivityConstants::BEST_PASS_RESULT},
          ul3.level_id => {status: LEVEL_STATUS.passed, result: 20}
        },
        current_lesson: ul3.level.script_levels.first.lesson.id,
        completed: false,
      },
      summarize_user_progress(script, user)
    )

    # Also test with level progress excluded.
    exclude_level_progress = true
    assert_equal(
      {
        lockableAuthorized: false,
        isInstructor: false,
      },
      summarize_user_progress(script, user, exclude_level_progress)
    )

    assert_in_delta 66.67, percent_complete_total(script, user)
  end

  def test_summarize_user_progress_with_pages
    user = create :user
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
        lockableAuthorized: false,
        isInstructor: false,
        progress: {
          ul.level_id => {
            status: LEVEL_STATUS.perfect,
            result: ActivityConstants::BEST_PASS_RESULT,
            pages_completed: [ActivityConstants::FREE_PLAY_RESULT, nil]
          }
        },
        # second lesson because first is unplugged
        current_lesson: script_level.lesson.id,
        completed: false
      },
      summarize_user_progress(script, user)
    )
  end

  def test_summarize_user_progress_with_bubble_choice
    user = create :user
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
      lockableAuthorized: false,
      isInstructor: false,
      progress: {
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
      current_lesson: script_level.lesson.id,
      completed: false
    }
    assert_equal expected_summary, summarize_user_progress(script, user)
  end

  def test_summarize_user_progress_with_locked
    user = create :user
    script = create :script
    lesson_group = create :lesson_group, script: script

    # Create a LevelGroup level.
    level = create :level_group, :with_sublevels, name: 'LevelGroupLevel1'
    level.properties['title'] =  'Long assessment 1'
    level.properties['submittable'] = true
    level.save!

    lesson = create :lesson, name: 'Lesson1', script: script, lockable: true, lesson_group: lesson_group

    # Create a ScriptLevel joining this level to the script.
    create :script_level, script: script, levels: [level], assessment: true, lesson: lesson

    # No user level exists, show locked progress
    assert UserLevel.find_by(user: user, level: level).nil?
    assert_equal(
      {level.id => {locked: true}},
      summarize_user_progress(script, user)[:progress]
    )

    # Now "unlock" it by creating a non-submitted UserLevel
    user_level = create :user_level, user: user, best_result: nil, level: level, script: script, locked: false, readonly_answers: false, submitted: false
    assert_equal({level.id => {status: "not_tried"}}, summarize_user_progress(script, user)[:progress], 'not_tried status since we dont have a result')

    # put in in "view answers" mode
    user_level.really_destroy!
    user_level = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, locked: false, readonly_answers: true, submitted: true
    assert_equal(
      {
        level.id => {status: LEVEL_STATUS.submitted, result: ActivityConstants::BEST_PASS_RESULT, pages_completed: [nil, nil]},
      },
      summarize_user_progress(script, user)[:progress], 'level shows as locked again'
    )

    # now submit it
    user_level.really_destroy!
    user_level = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, locked: true, readonly_answers: false, submitted: true
    assert_equal(
      {
        level.id => {
          status: "submitted",
          result: 100,
          locked: true,
          pages_completed: [nil, nil]
        }
      },
      summarize_user_progress(script, user)[:progress],
      'level shows as locked again'
    )

    # unlock it again
    user_level.really_destroy!
    level_source = create :level_source, data: "{}"
    user_level = create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, locked: false, readonly_answers: false, submitted: false, level_source: level_source
    assert_equal(
      {
        level.id => {status: LEVEL_STATUS.perfect, result: ActivityConstants::BEST_PASS_RESULT, pages_completed: [nil, nil]},
      },
      summarize_user_progress(script, user)[:progress],
      'level still shows as locked'
    )

    # now lock it
    user_level.really_destroy!
    user_level = create :user_level, user: user, best_result: ActivityConstants::UNSUBMITTED_RESULT, level: level, script: script, locked: true, readonly_answers: false, submitted: false
    assert_equal(
      {
        level.id => {status: LEVEL_STATUS.attempted, result: ActivityConstants::UNSUBMITTED_RESULT, locked: true, pages_completed: [nil, nil]},
      },
      summarize_user_progress(script, user)[:progress],
      'level shows attempted now'
    )

    # appears submitted while viewing answers
    user_level.really_destroy!
    create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, readonly_answers: true, submitted: true
    assert_equal(
      {
        level.id => {
          status: "submitted",
          result: 100,
          locked: true,
          pages_completed: [nil, nil]
        }
      },
      summarize_user_progress(script, user)[:progress],
      'level shows as submitted'
    )
  end

  def test_summarize_user_progress_non_lockable
    user = create :user
    script = create :script
    lesson_group = create :lesson_group, script: script

    # Create a LevelGroup level.
    level = create :level_group, :with_sublevels, name: 'LevelGroupLevel1'
    level.properties['title'] =  'Long assessment 1'
    level.properties['submittable'] = true
    level.save!

    # create a lesson that is NOT lockable
    lesson = create :lesson, name: 'Lesson1', script: script, lockable: false, lesson_group: lesson_group

    # Create a ScriptLevel joining this level to the script.
    create :script_level, script: script, levels: [level], assessment: true, lesson: lesson

    # No user level exists, no progress
    assert UserLevel.find_by(user: user, level: level).nil?
    assert_equal({}, summarize_user_progress(script, user)[:progress])

    # now create a non-submitted user level
    user_level = create :user_level, user: user, best_result: ActivityConstants::UNSUBMITTED_RESULT, level: level, script: script, locked: true, readonly_answers: nil, submitted: false
    assert_equal(
      {
        level.id => {status: LEVEL_STATUS.attempted, result: ActivityConstants::UNSUBMITTED_RESULT, pages_completed: [nil, nil]}
      },
      summarize_user_progress(script, user)[:progress]
    )

    # now create a submitted user level
    user_level.really_destroy!
    create :user_level, user: user, best_result: ActivityConstants::BEST_PASS_RESULT, level: level, script: script, locked: true, readonly_answers: nil, submitted: true
    assert_equal(
      {
        level.id => {status: LEVEL_STATUS.submitted, result: ActivityConstants::BEST_PASS_RESULT, pages_completed: [nil, nil]},
      },
      summarize_user_progress(script, user)[:progress]
    )
  end

  def test_script_progress_for_users
    user_1 = create :user
    user_2 = create :user
    user_3 = create :user

    teacher = create :teacher
    section = create :section, teacher: teacher
    section.students << user_1 # we query for feedback where student is currently in section
    section.students << user_2
    section.students << user_3

    # set up progress
    script = create :script

    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    # Create BubbleChoice level with sublevels, script_level, and user_levels.
    sublevel1 = create :level, name: 'choice_1'
    sublevel1_contained_level = create :free_response, name: "choice_1 contained"
    sublevel1.contained_level_names = [sublevel1_contained_level.name]
    sublevel1.save!

    sublevel2 = create :level, name: 'choice_2'
    level = create :bubble_choice_level, sublevels: [sublevel1, sublevel2]
    create :script_level, script: script, levels: [level], lesson: lesson

    # for user_1
    sublevel1_user_level = create :user_level, user: user_1, level: sublevel1_contained_level, script: script, best_result: ActivityConstants::BEST_PASS_RESULT, time_spent: 180
    sublevel2_user_level = create :user_level, user: user_1, level: sublevel2, script: script, best_result: 20, time_spent: 300

    sublevel1_last_progress = UserLevel.find(sublevel1_user_level.id).updated_at.to_i
    sublevel2_last_progress = UserLevel.find(sublevel2_user_level.id).updated_at.to_i

    # for user_2
    sublevel1_user_level_2 = create :user_level, user: user_2, level: sublevel1_contained_level, script: script, best_result: ActivityConstants::BEST_PASS_RESULT, time_spent: 180
    sublevel2_user_level_2 = create :user_level, user: user_2, level: sublevel2, script: script, best_result: 20, time_spent: 300
    create :teacher_feedback, student: user_2, teacher: teacher, level: sublevel2, script: script, review_state: TeacherFeedback::REVIEW_STATES.keepWorking
    create :teacher_feedback, student: user_3, teacher: teacher, level: sublevel1, script: script, review_state: TeacherFeedback::REVIEW_STATES.keepWorking
    create :teacher_feedback, student: user_3, teacher: teacher, level: sublevel2, script: script, comment: 'Better get working on this one!'

    sublevel1_last_progress_2 = UserLevel.find(sublevel1_user_level_2.id).updated_at.to_i
    sublevel2_last_progress_2 = UserLevel.find(sublevel2_user_level_2.id).updated_at.to_i

    expected_progress = [
      {
        user_1.id => {
          sublevel1.id => {
            status: LEVEL_STATUS.perfect,
            result: ActivityConstants::BEST_PASS_RESULT,
            last_progress_at: sublevel1_last_progress,
            time_spent: 180
          },
          sublevel2.id => {
            status: LEVEL_STATUS.passed,
            result: 20,
            last_progress_at: sublevel2_last_progress,
            time_spent: 300
          },
          level.id => {
            status: LEVEL_STATUS.perfect,
            result: ActivityConstants::BEST_PASS_RESULT,
            last_progress_at: sublevel1_last_progress,
            time_spent: 480 # sum of time spent on sublevels
          }
        },
        user_2.id => {
          sublevel1.id => {
            status: LEVEL_STATUS.perfect,
            result: ActivityConstants::BEST_PASS_RESULT,
            last_progress_at: sublevel1_last_progress_2,
            time_spent: 180
          },
          sublevel2.id => {
            status: LEVEL_STATUS.passed,
            result: 20,
            last_progress_at: sublevel2_last_progress_2,
            time_spent: 300,
            teacher_feedback_review_state: TeacherFeedback::REVIEW_STATES.keepWorking
          },
          level.id => {
            status: LEVEL_STATUS.passed,
            result: 20,
            last_progress_at: sublevel2_last_progress_2,
            time_spent: 480, # sum of time spent on sublevels
            teacher_feedback_review_state: TeacherFeedback::REVIEW_STATES.keepWorking
          }
        },
        user_3.id => {
          sublevel1.id => {
            status: LEVEL_STATUS.not_tried,
            teacher_feedback_new: true,
            teacher_feedback_review_state: TeacherFeedback::REVIEW_STATES.keepWorking
          },
          sublevel2.id => {
            status: LEVEL_STATUS.not_tried,
            teacher_feedback_commented: true,
            teacher_feedback_new: true
          },
          level.id => {
            status: LEVEL_STATUS.not_tried,
            teacher_feedback_review_state: TeacherFeedback::REVIEW_STATES.keepWorking,
            teacher_feedback_new: true
          }
        }
      },
      {
        user_1.id => sublevel1_last_progress,
        user_2.id => sublevel2_last_progress_2,
        user_3.id => nil
      }
    ]

    assert_equal expected_progress, script_progress_for_users(
      [user_1, user_2, user_3], script
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

  def test_move_sections_and_destroy_source_user
    teacher = create :teacher
    coteacher = create :teacher
    section = create :section, user: teacher
    create :section_instructor, section: section, instructor: coteacher
    section2 = create :section, user: coteacher
    section_instructor2 = create :section_instructor, section: section2, instructor: teacher
    destination_teacher = create :teacher

    move_sections_and_destroy_source_user(source_user: teacher, destination_user: destination_teacher, takeover_type: 'type', provider: 'provider')

    section.reload
    section_instructor2.reload

    assert_equal 2, destination_teacher.sections_instructed.count
    assert_equal 0, teacher.sections_instructed.count
    assert_equal 2, coteacher.sections_instructed.count
    assert_equal destination_teacher.id, section.user.id
    assert_equal destination_teacher.id, section_instructor2.instructor.id
  end

  describe '.account_linking_lock_reason' do
    let(:user) {build_stubbed(:user)}

    let(:user_cap_compliant?) {true}

    before do
      Policies::ChildAccount.stubs(:compliant?).with(user).returns(user_cap_compliant?)
    end

    it 'returns nil' do
      _(account_linking_lock_reason(user)).must_be_nil
    end

    context 'when user is not compliant with CAP' do
      let(:user_cap_compliant?) {false}

      it 'returns lock reason message' do
        _(account_linking_lock_reason(user)).must_equal 'Uh oh! You must obtain parental permission before creating a linked account.'
      end
    end
  end
end
