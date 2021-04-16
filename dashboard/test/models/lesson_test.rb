require 'test_helper'

class LessonTest < ActiveSupport::TestCase
  setup do
    @student = create :student
  end
  test "lockable_state with swapped level without user_level" do
    _, level1, _, lesson, _ = create_swapped_lockable_lesson

    lockable_state = lesson.lockable_state [@student]

    assert_equal true, lockable_state[0][:locked], 'stage without userlevel should be locked'
    assert_equal level1.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level in reverse order without userlevel" do
    _, _, level2, lesson, script_level = create_swapped_lockable_lesson
    script_level.properties = {variants: {level1: {active: false}}}
    script_level.save!

    lockable_state = lesson.lockable_state [@student]

    assert_equal true, lockable_state[0][:locked], 'stage without userlevel should be locked'
    assert_equal level2.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level with user_level for inactive level" do
    script, _, level2, lesson, _ = create_swapped_lockable_lesson
    create :user_level, user: @student, script: script, level: level2, locked: false

    lockable_state = lesson.lockable_state [@student]

    assert_equal false, lockable_state[0][:locked], 'unlocked user_level should unlock old level'
    assert_equal level2.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level with user_level for active level" do
    script, level1, _, lesson, _ = create_swapped_lockable_lesson
    create :user_level, user: @student, script: script, level: level1, locked: false

    lockable_state = lesson.lockable_state [@student]

    assert_equal false, lockable_state[0][:locked], 'unlocked user_level should unlock new level'
    assert_equal level1.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "summary for single page long assessment" do
    script = create :script
    create :text_match, name: 'level_free_response', type: 'TextMatch'
    create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    level_group_dsl = <<~DSL
      name 'level1'
      title 'title1'
      submittable 'true'

      page
      level 'level_free_response'
      level 'level_multi_unsubmitted'
    DSL
    level1 = LevelGroup.create_from_level_builder({}, {name: 'LevelGroupLevel1', dsl_text: level_group_dsl})
    lesson = create :lesson, name: 'lesson1', script: script, lockable: true
    create :script_level, script: script, levels: [level1], assessment: true, lesson: lesson

    # Ensure that a single page long assessment has a uid that ends with "_0".
    assert_equal lesson.summarize[:levels].first[:uid], "#{lesson.summarize[:levels].first[:ids].first}_0"
  end

  test "summary for lesson with extras" do
    script = create :script, lesson_extras_available: true
    level = create :level
    lesson = create :lesson, script: script
    create :script_level, script: script, lesson: lesson, levels: [level]

    assert_match /extras$/, lesson.summarize[:lesson_extras_level_url]
  end

  test "summary for lesson with extras where include_bonus_levels is true" do
    script = create :script
    level = create :level
    lesson = create :lesson, script: script
    create :script_level, lesson: lesson, levels: [level], bonus: true

    summary = lesson.summarize(true)
    assert_equal 1, summary[:levels].length
    assert_equal [level.id.to_s], summary[:levels].first[:ids]
  end

  test "summary of levels for lesson plan" do
    script = create :script
    level = create :level
    lesson = create :lesson, script: script, name: 'My Stage'
    script_level = create :script_level, script: script, lesson: lesson, levels: [level]

    expected_summary_of_levels = [
      {
        id: script_level.id,
        position: script_level.position,
        named_level: script_level.named_level?,
        bonus_level: !!script_level.bonus,
        assessment: script_level.assessment,
        progression: script_level.progression,
        path: script_level.path,
        level_id: level.id.to_s,
        type: level.class.to_s,
        name: level.name,
        display_name: level.display_name
      }
    ]

    assert_equal expected_summary_of_levels, lesson.summary_for_lesson_plans[:levels]
  end

  test "last_progression_script_level" do
    lesson = create :lesson
    create :script_level, lesson: lesson, chapter: 1
    last_script_level = create :script_level, lesson: lesson, chapter: 2

    assert_equal last_script_level, lesson.last_progression_script_level
  end

  test "last_progression_script_level with a bonus level" do
    lesson = create :lesson
    last_script_level = create :script_level, lesson: lesson, chapter: 1
    create :script_level, lesson: lesson, chapter: 2, bonus: true

    assert_equal last_script_level, lesson.last_progression_script_level
  end

  test "next_level_path_for_stage_extras" do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson1 = create :lesson, script: script, lesson_group: lesson_group
    create :script_level, script: script, lesson: lesson1
    create :script_level, script: script, lesson: lesson1
    lesson2 = create :lesson, script: script, lesson_group: lesson_group
    create :script_level, script: script, lesson: lesson2
    create :script_level, script: script, lesson: lesson2

    assert_match /\/s\/bogus-script-\d+\/lessons\/2\/levels\/1/, lesson1.next_level_path_for_lesson_extras(@student)
    assert_equal '/', lesson2.next_level_path_for_lesson_extras(@student)
  end

  test 'can summarize lesson with no levels' do
    script = create :script
    lesson_group = create :lesson_group, script: script

    raw_lessons = [
      {
        key: "Lesson1",
        name: "Lesson 1",
        script_levels: []
      }
    ]

    counters = LessonGroup::Counters.new(0, 0, 0, 0)

    lessons = Lesson.add_lessons(script, lesson_group, raw_lessons, counters, nil, nil)
    summary = lessons.first.summarize
    assert_equal 'Lesson1', summary[:key]
  end

  test 'can summarize lesson with and without lesson plan' do
    script = create :script, name: 'test-script'
    lesson_group = create :lesson_group, script: script
    lesson1 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: true
    lesson2 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: false

    lesson1_summary = lesson1.summarize
    lesson2_summary = lesson2.summarize
    assert_equal '//test.code.org/curriculum/test-script/1/Teacher', lesson1_summary[:lesson_plan_html_url]
    assert_equal nil, lesson2_summary[:lesson_plan_html_url]
  end

  test 'can summarize lesson with new lesson plan link in migrated script' do
    script = create :script, name: 'test-script', is_migrated: true
    lesson_group = create :lesson_group, script: script
    lesson1 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: true, lockable: true
    lesson2 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: false, lockable: true
    lesson3 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: true, lockable: false
    lesson4 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: false, lockable: false

    lesson1_summary = lesson1.summarize
    lesson2_summary = lesson2.summarize
    lesson3_summary = lesson3.summarize
    lesson4_summary = lesson4.summarize
    assert_equal "/s/#{script.name}/lessons/#{lesson1.relative_position}", lesson1_summary[:lesson_plan_html_url]
    assert_equal nil, lesson2_summary[:lesson_plan_html_url]
    assert_equal "/s/#{script.name}/lessons/#{lesson3.relative_position}", lesson3_summary[:lesson_plan_html_url]
    assert_equal nil, lesson4_summary[:lesson_plan_html_url]
  end

  test 'can summarize lesson for lesson plan' do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create(
      :lesson,
      lesson_group: lesson_group,
      script: script,
      name: 'Lesson 1',
      key: 'lesson-1',
      relative_position: 1,
      absolute_position: 1,
      properties: {
        overview: 'lesson overview',
        purpose: 'learning',
        preparation: 'do things'
      }
    )

    summary = lesson.summarize_for_lesson_show(@student, false)
    assert_equal 'lesson-1', summary[:key]
    assert_equal 'lesson overview', summary[:overview]
    assert_equal 'learning', summary[:purpose]
    assert_equal 'do things', summary[:preparation]
    assert_equal script.summarize_for_lesson_show, summary[:unit]
  end

  test 'can summarize lesson for student lesson plan' do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create(
      :lesson,
      lesson_group: lesson_group,
      script: script,
      name: 'Lesson 1',
      key: 'lesson-1',
      relative_position: 1,
      absolute_position: 1,
      properties: {
        student_overview: 'lesson overview',
        purpose: 'learning',
        preparation: 'do things'
      }
    )

    summary = lesson.summarize_for_student_lesson_plan
    assert_equal 'lesson-1', summary[:key]
    assert_equal 'lesson overview', summary[:overview]
    assert_equal script.summarize_for_lesson_show(true), summary[:unit]
  end

  test 'summarize lesson for student lesson plan does not include teacher announcements' do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create(
      :lesson,
      lesson_group: lesson_group,
      script: script,
      name: 'Lesson 1',
      key: 'lesson-1',
      relative_position: 1,
      absolute_position: 1,
      properties: {
        student_overview: 'lesson overview',
        purpose: 'learning',
        preparation: 'do things',
        announcements: [
          {
            notice: 'Notice - Teacher',
            details: 'Teachers are the best',
            link: '/foo/bar/teacher',
            type: 'information',
            visibility: 'Teacher-only'
          },
          {
            notice: 'Notice - Student',
            details: 'Students are the best',
            link: '/foo/bar/student',
            type: 'information',
            visibility: 'Student-only'
          },
          {
            notice: 'Notice - Student and Teacher',
            details: 'Students and teachers are the best',
            link: '/foo/bar/all',
            type: 'information',
            visibility: 'Teacher and student'
          },
        ]
      }
    )

    summary = lesson.summarize_for_student_lesson_plan
    assert_equal 'lesson-1', summary[:key]
    assert_equal 'lesson overview', summary[:overview]
    assert_equal 2, summary[:announcements].length
    assert_equal script.summarize_for_lesson_show(true), summary[:unit]
  end

  test 'lesson_plan_has_verified_resources is true for lesson with verified resources ' do
    lesson = create :lesson

    create :resource, name: 'teacher resource', audience: 'Teacher', lessons: [lesson]
    create :resource, name: 'verified teacher resource', audience: 'Verified Teacher', lessons: [lesson]
    create :resource, name: 'student resource', audience: 'Student', lessons: [lesson]
    create :resource, name: 'all resource', audience: 'All', lessons: [lesson]

    assert lesson.lesson_plan_has_verified_resources
  end

  test 'lesson_plan_has_verified_resources is false for lesson without verified resources ' do
    lesson = create :lesson

    create :resource, name: 'teacher resource', audience: 'Teacher', lessons: [lesson]
    create :resource, name: 'student resource', audience: 'Student', lessons: [lesson]
    create :resource, name: 'all resource', audience: 'All', lessons: [lesson]

    refute lesson.lesson_plan_has_verified_resources
  end

  test 'summarize lesson for student lesson plan combines student and for all resources' do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create(
      :lesson,
      lesson_group: lesson_group,
      script: script,
      name: 'Lesson 1',
      key: 'lesson-1',
      relative_position: 1,
      absolute_position: 1,
      properties: {
        student_overview: 'lesson overview',
        purpose: 'learning',
        preparation: 'do things'
      }
    )
    create :resource, name: 'teacher resource', audience: 'Teacher', lessons: [lesson]
    create :resource, name: 'verified teacher resource', audience: 'Verified Teacher', lessons: [lesson]
    create :resource, name: 'student resource', audience: 'Student', lessons: [lesson]
    create :resource, name: 'all resource', audience: 'All', lessons: [lesson]

    summary = lesson.summarize_for_student_lesson_plan
    assert_equal 'lesson-1', summary[:key]
    assert_equal 'lesson overview', summary[:overview]
    assert_equal 2, summary[:resources].length
    assert_equal script.summarize_for_lesson_show(true), summary[:unit]
  end

  test 'lesson edit summary does not preprocess markdown' do
    lesson = create :lesson, lesson_group: create(:lesson_group)
    Services::MarkdownPreprocessor.expects(:process!).never
    lesson.summarize_for_lesson_edit
  end

  test 'lesson show summary preprocesses markdown' do
    lesson = create(
      :lesson,
      assessment_opportunities: 'example assessment opportunities',
      lesson_group: create(:lesson_group),
      overview: 'example overview',
      preparation: 'example preparation',
      purpose: 'example purpose'
    )

    Services::MarkdownPreprocessor.expects(:process).
      with(lesson.overview)
    Services::MarkdownPreprocessor.expects(:process).
      with(lesson.purpose)
    Services::MarkdownPreprocessor.expects(:process).
      with(lesson.preparation)
    Services::MarkdownPreprocessor.expects(:process).
      with(lesson.assessment_opportunities)

    lesson.summarize_for_lesson_show(create(:user), false)
  end

  test 'can summarize lesson for lesson plan dropdown' do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script, name: 'Lesson 1', key: 'lesson-1', relative_position: 1, absolute_position: 1

    summary = lesson.summarize_for_lesson_dropdown
    assert_equal 'lesson-1', summary[:key]
    assert_equal "/s/#{script.name}/lessons/#{lesson.relative_position}", summary[:link]
    assert_equal 1, summary[:position]
  end

  test 'can summarize lesson for student lesson plan dropdown' do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script, name: 'Lesson 1', key: 'lesson-1', relative_position: 1, absolute_position: 1

    summary = lesson.summarize_for_lesson_dropdown(true)
    assert_equal 'lesson-1', summary[:key]
    assert_equal "/s/#{script.name}/lessons/#{lesson.relative_position}/student", summary[:link]
    assert_equal 1, summary[:position]
  end

  test 'summarize for script edit includes bonus levels' do
    script = create :script, is_migrated: true
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script, name: 'Lesson 1', key: 'lesson-1', relative_position: 1, absolute_position: 1
    activity = create :lesson_activity, lesson: lesson
    section = create :activity_section, lesson_activity: activity
    level1 = create :level
    level2 = create :level
    create :script_level, script: script, lesson: lesson, activity_section: section, activity_section_position: 1, levels: [level1]
    create :script_level, script: script, lesson: lesson, activity_section: section, activity_section_position: 2, levels: [level2], bonus: true

    levels_data = lesson.summarize_for_script_edit[:levels]
    assert_equal 2, levels_data.length
    refute levels_data.first[:bonus]
    assert levels_data.last[:bonus]
  end

  test 'summarize uses unplugged property' do
    script = create :script, is_migrated: true
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script, name: 'Lesson 1', key: 'lesson-1', relative_position: 1, absolute_position: 1, unplugged: true

    levels_data = lesson.summarize
    assert levels_data[:unplugged]
  end

  test 'summarize_for_calendar adds durations of all activities' do
    script = create :script, is_migrated: false
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script, name: 'Lesson 1', key: 'lesson-1', relative_position: 1, absolute_position: 1, unplugged: true
    activity1 = create :lesson_activity, lesson: lesson, duration: 20
    section1 = create :activity_section, lesson_activity: activity1
    level1 = create :level
    create :script_level, script: script, lesson: lesson, activity_section: section1, activity_section_position: 1, levels: [level1]
    activity2 = create :lesson_activity, lesson: lesson, duration: 10
    section2 = create :activity_section, lesson_activity: activity2
    level2 = create :level
    create :script_level, script: script, lesson: lesson, activity_section: section2, activity_section_position: 2, levels: [level2]
    activity3 = create :lesson_activity, lesson: lesson, duration: nil
    section3 = create :activity_section, lesson_activity: activity3
    level3 = create :level
    create :script_level, script: script, lesson: lesson, activity_section: section3, activity_section_position: 3, levels: [level3]

    levels_data = lesson.summarize_for_calendar
    assert_equal 30, levels_data[:duration]
  end

  test 'raises error when creating invalid lockable lessons' do
    script = create :script
    lesson_group = create :lesson_group, script: script
    create :level, name: 'Level1'
    create :level, name: 'LockableAssessment1'

    raw_lessons = [
      {
        key: "Lesson1",
        name: "Lesson 1",
        lockable: true,
        script_levels: [
          {levels: [{name: "LockableAssessment1"}], assessment: true},
          {levels: [{name: "Level1"}]}
        ]
      }
    ]
    counters = LessonGroup::Counters.new(0, 0, 0, 0)

    raise = assert_raises do
      Lesson.add_lessons(script, lesson_group, raw_lessons, counters, nil, nil)
    end
    assert_equal 'Expect lockable lessons to have an assessment as their last level. Lesson: Lesson 1', raise.message
  end

  test 'creates lessons correctly' do
    script = create :script
    lesson_group = create :lesson_group, script: script
    create :level, name: 'Level1'
    create :level, name: 'Level2'
    create :level, name: 'Level3'
    create :level, name: 'Level4'

    raw_lessons = [
      {
        key: "L1",
        name: "Lesson 1",
        has_lesson_plan: true,
        script_levels: [
          {levels: [{name: "Level1"}]},
          {levels: [{name: "Level2"}]}
        ]
      },
      {
        key: "L2",
        name: "Lesson 2",
        has_lesson_plan: false,
        script_levels: [
          {levels: [{name: "Level3"}]}
        ]
      },
      {
        key: "L3",
        name: "Lesson 3",
        lockable: true,
        has_lesson_plan: false,
        script_levels: [
          {levels: [{name: "Level3"}], assessment: true}
        ]
      },
      {
        key: "L4",
        name: "Lesson 4",
        lockable: true,
        has_lesson_plan: true,
        script_levels: [
          {levels: [{name: "Level4"}], assessment: true}
        ]
      }
    ]
    counters = LessonGroup::Counters.new(0, 0, 0, 0)

    lessons = Lesson.add_lessons(script, lesson_group, raw_lessons, counters, nil, nil)

    assert_equal ['L1', 'L2', 'L3', 'L4'], lessons.map(&:key)
    assert_equal ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4'], lessons.map(&:name)
    assert_equal [1, 2, 3, 4], lessons.map(&:absolute_position)
    assert_equal [1, 2, 1, 3], lessons.map(&:relative_position)
    assert_equal lesson_group, lessons[0].lesson_group
    assert_equal 2, lessons[0].script_levels.count
    assert_equal 1, lessons[1].script_levels.count
    assert_equal 1, lessons[2].script_levels.count
    assert_equal true, lessons[2].lockable
    assert_equal true, lessons[3].lockable
    assert_equal true, lessons[3].has_lesson_plan
    assert_equal LessonGroup::Counters.new(3, 1, 4, 5), counters
  end

  test 'i18n_hash has correct value' do
    script = create :script, name: 'dummy-script'
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script, key: 'dummy-key', name: 'Dummy Name'
    lesson.student_overview = 'student overview'
    lesson.overview = 'teacher overview'

    expected_i18n = {
      'dummy-script' => {
        'lessons' => {
          'dummy-key' => {
            'name' => 'Dummy Name',
            'description_student' => 'student overview',
            'description_teacher' => 'teacher overview'
          }
        }
      }
    }
    assert_equal expected_i18n, lesson.i18n_hash
  end

  test 'seeding_key' do
    lesson_group = create :lesson_group
    script = lesson_group.script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    seed_context = Services::ScriptSeed::SeedContext.new(script: script, lesson_groups: script.lesson_groups.to_a)
    lesson.reload # clear out any already loaded association data, for verification of query counts

    # seeding_key should not make queries
    assert_queries(0) do
      expected = {
        'script.name' => script.name,
        'lesson_group.key' => lesson_group.key,
        'lesson.key' => lesson.key
      }
      assert_equal expected, lesson.seeding_key(seed_context)
    end
  end

  class StagePublishedTests < ActiveSupport::TestCase
    setup do
      @student = create :student
      @teacher = create :teacher
      @levelbuilder = create :levelbuilder

      Timecop.freeze(Time.new(2020, 3, 27, 0, 0, 0, "-07:00"))

      @script_with_visible_after_lessons = create :script
      @lesson_future_visible_after = create :lesson, name: 'lesson 1', script: @script_with_visible_after_lessons, visible_after: '2020-04-01 08:00:00 -0700'
      @lesson_past_visible_after = create :lesson, name: 'lesson 2', script: @script_with_visible_after_lessons, visible_after: '2020-03-01 08:00:00 -0700'
      @lesson_no_visible_after = create :lesson, name: 'lesson 3', script: @script_with_visible_after_lessons
    end

    teardown do
      Timecop.return
    end

    test "published? returns true if levelbuilder" do
      assert @lesson_future_visible_after.published?(@levelbuilder)
      assert @lesson_past_visible_after.published?(@levelbuilder)
      assert @lesson_no_visible_after.published?(@levelbuilder)
    end

    test "published? returns true if lesson does not have visible_after date" do
      assert @lesson_no_visible_after.published?(@teacher)
      assert @lesson_no_visible_after.published?(@student)
      assert @lesson_no_visible_after.published?(nil)
    end

    test "published? returns true if lesson visible_after date is in past" do
      assert @lesson_past_visible_after.published?(@teacher)
      assert @lesson_past_visible_after.published?(@student)
      assert @lesson_past_visible_after.published?(nil)
    end

    test "published? returns false if lesson visible_after date is in future" do
      refute @lesson_future_visible_after.published?(@teacher)
      refute @lesson_future_visible_after.published?(@student)
      refute @lesson_future_visible_after.published?(nil)
    end
  end

  test 'find related lessons within CSF curriculum umbrella' do
    course_offering = create :course_offering

    # lesson to find related lessons for
    script1 = create :script, name: 'script1', curriculum_umbrella: 'CSF', version_year: '2999'
    create :course_version, course_offering: course_offering, content_root: script1, key: '2999'
    lesson1 = create :lesson, script: script1, key: 'foo'

    script2 = create :script, name: 'script2', curriculum_umbrella: 'CSF', version_year: '3000'
    create :course_version, course_offering: course_offering, content_root: script2, key: '3000'
    lesson2 = create :lesson, script: script2, key: 'foo'

    # lesson with different key is excluded
    course_offering3 = create :course_offering
    script3 = create :script, name: 'script3', curriculum_umbrella: 'CSF', version_year: '2999'
    create :course_version, course_offering: course_offering3, content_root: script3, key: '2999'
    create :lesson, script: script3, key: 'bar'

    # lesson in different curriculum umbrella is excluded
    course_offering4 = create :course_offering
    script4 = create :script, name: 'script4', curriculum_umbrella: 'other', version_year: '2999'
    create :course_version, course_offering: course_offering4, content_root: script4, key: '2999'
    create :lesson, script: script4, key: 'foo'

    course_offering5 = create :course_offering
    script5 = create :script, name: 'script5', curriculum_umbrella: 'CSF', version_year: '2999'
    create :course_version, course_offering: course_offering5, content_root: script5, key: '2999'
    lesson5 = create :lesson, script: script5, key: 'foo'

    # lesson without course version / version year must still work properly
    script6 = create :script, name: 'script6', curriculum_umbrella: 'CSF'
    lesson6 = create :lesson, script: script6, key: 'foo'

    course_offering0 = create :course_offering
    script0 = create :script, name: 'script0', curriculum_umbrella: 'CSF', version_year: '2999'
    create :course_version, course_offering: course_offering0, content_root: script0, key: '2999'
    lesson0 = create :lesson, script: script0, key: 'foo'

    # measure the query count of the summarize method before checking the result
    # of related_lessons, so that the count is not artificially reduced by
    # anything being cached from the call to related_lessons.
    summaries = nil
    assert_queries(2) do
      summaries = lesson1.summarize_related_lessons
    end

    assert_queries(1) do
      assert_equal [lesson6, lesson0, lesson5, lesson2], lesson1.related_lessons
    end

    assert_equal 4, summaries.count
    expected_summary = {
      scriptTitle: "script6",
      versionYear: nil,
      lockable: false,
      relativePosition: 1,
      id: lesson6.id,
      editUrl: "/lessons/#{lesson6.id}/edit"
    }
    assert_equal expected_summary, summaries[0]

    expected_summary = {
      scriptTitle: "script0",
      versionYear: "2999",
      lockable: false,
      relativePosition: 1,
      id: lesson0.id,
      editUrl: "/lessons/#{lesson0.id}/edit"
    }
    assert_equal expected_summary, summaries[1]

    assert_equal '2999', summaries[2][:versionYear]
    assert_equal '3000', summaries[3][:versionYear]
  end

  test 'find related lessons within a course offering without unit groups' do
    course_offering = create :course_offering

    script1 = create :script, name: 'script1', is_course: true
    create :course_version, course_offering: course_offering, content_root: script1, key: '3000'
    lesson1 = create :lesson, script: script1, key: 'foo'

    script2 = create :script, name: 'script2', is_course: true
    create :course_version, course_offering: course_offering, content_root: script2, key: '3001'
    lesson2 = create :lesson, script: script2, key: 'foo'

    script3 = create :script, name: 'script3', is_course: true
    create :course_version, course_offering: course_offering, content_root: script3, key: '3002'
    create :lesson, script: script3, key: 'bar'

    script4 = create :script, name: 'script4', is_course: true
    create :course_version, course_offering: course_offering, content_root: script4, key: '2999'
    lesson4 = create :lesson, script: script4, key: 'foo'

    other_course_offering = create :course_offering

    script5 = create :script, name: 'script5', is_course: true
    create :course_version, course_offering: other_course_offering, content_root: script5, key: '3000'
    create :lesson, script: script5, key: 'foo'

    # measure the query count of the summarize method before checking the result
    # of related_lessons, so that the count is not artificially reduced by
    # anything being cached from the call to related_lessons.
    summaries = nil
    assert_queries(8) do
      summaries = lesson1.summarize_related_lessons
    end

    assert_equal [lesson4, lesson2], lesson1.related_lessons

    assert_equal 2, summaries.count
    expected_summary = {
      scriptTitle: "script4",
      versionYear: "2999",
      lockable: false,
      relativePosition: 1,
      id: lesson4.id,
      editUrl: "/lessons/#{lesson4.id}/edit"
    }
    assert_equal expected_summary, summaries.first
  end

  test 'find related lessons within a course offering with unit groups' do
    course_offering = create :course_offering

    unit_group_a = create :unit_group
    create :course_version, course_offering: course_offering, content_root: unit_group_a, key: '3000'

    script1 = create :script, name: 'script1'
    create :unit_group_unit, unit_group: unit_group_a, script: script1, position: 1
    lesson1 = create :lesson, script: script1, key: 'foo'

    script2 = create :script, name: 'script2'
    create :unit_group_unit, unit_group: unit_group_a, script: script2, position: 2
    lesson2 = create :lesson, script: script2, key: 'foo'

    script3 = create :script, name: 'script3'
    create :unit_group_unit, unit_group: unit_group_a, script: script3, position: 3
    create :lesson, script: script3, key: 'bar'

    script0 = create :script, name: 'script0'
    create :unit_group_unit, unit_group: unit_group_a, script: script0, position: 4
    lesson0 = create :lesson, script: script0, key: 'foo'

    unit_group_b = create :unit_group
    create :course_version, course_offering: course_offering, content_root: unit_group_b, key: '2999'

    script4 = create :script, name: 'script4'
    create :unit_group_unit, unit_group: unit_group_b, script: script4, position: 1
    lesson4 = create :lesson, script: script4, key: 'foo'

    script5 = create :script, name: 'script5'
    create :unit_group_unit, unit_group: unit_group_b, script: script5, position: 2
    create :lesson, script: script5, key: 'bar'

    other_course_offering = create :course_offering

    unit_group_c = create :unit_group
    create :course_version, course_offering: other_course_offering, content_root: unit_group_c, key: '3000'

    script6 = create :script, name: 'script6'
    create :unit_group_unit, unit_group: unit_group_c, script: script6, position: 1
    create :lesson, script: script6, key: 'foo'

    # measure the query count of the summarize method before checking the result
    # of related_lessons, so that the count is not artificially reduced by
    # anything being cached from the call to related_lessons.
    summaries = nil
    assert_queries(11) do
      summaries = lesson1.summarize_related_lessons
    end

    assert_equal [lesson4, lesson0, lesson2], lesson1.related_lessons

    assert_equal 3, summaries.count
    expected_summary = {
      scriptTitle: "script4",
      versionYear: "2999",
      lockable: false,
      relativePosition: 1,
      id: lesson4.id,
      editUrl: "/lessons/#{lesson4.id}/edit"
    }
    assert_equal expected_summary, summaries.first
  end

  test 'no related lessons without course offering' do
    script1 = create :script
    lesson1 = create :lesson, script: script1, key: 'foo'

    script2 = create :script
    create :lesson, script: script2, key: 'foo'

    assert_queries(2) do
      assert_equal [], lesson1.related_lessons
    end
  end

  test 'verified teacher resources are only return if user is verified' do
    lesson = create :lesson
    create :resource, name: 'teacher resource', audience: 'Teacher', lessons: [lesson]
    create :resource, name: 'verified teacher resource', audience: 'Verified Teacher', lessons: [lesson]
    assert_equal 2, lesson.resources_for_lesson_plan(true)['Teacher'].count
    assert_equal 1, lesson.resources_for_lesson_plan(false)['Teacher'].count
  end

  test 'lesson_plan_pdf_url supports new lesson plan PDFs' do
    old_lesson = create :lesson
    assert_equal(
      old_lesson.lesson_plan_pdf_url,
      "//test.code.org/curriculum/#{old_lesson.script.name}/1/Teacher.pdf"
    )

    script = create :script, is_migrated: true
    new_lesson = create :lesson, script: script, key: 'Some Verbose Lesson Name', has_lesson_plan: true
    assert_nil(new_lesson.lesson_plan_pdf_url)

    script.seeded_from = Time.now.to_s
    assert_equal(
      new_lesson.lesson_plan_pdf_url,
      "https://lesson-plans.code.org/#{script.name}/#{Time.parse(script.seeded_from).to_s(:number)}/teacher-lesson-plans/Some Verbose Lesson Name.pdf"
    )
  end

  test 'student_lesson_plan_pdf_url gets url for migrated script with student lesson plans' do
    script = create :script, is_migrated: true, include_student_lesson_plans: true
    new_lesson = create :lesson, script: script, key: 'Some Verbose Lesson Name', has_lesson_plan: true
    assert_nil(new_lesson.student_lesson_plan_pdf_url)

    script.seeded_from = Time.now.to_s
    assert_equal(
      new_lesson.student_lesson_plan_pdf_url,
      "https://lesson-plans.code.org/#{script.name}/#{Time.parse(script.seeded_from).to_s(:number)}/student-lesson-plans/Some Verbose Lesson Name.pdf"
    )
  end

  test 'no student_lesson_plan_pdf_url for non-migrated scripts' do
    script = create :script, include_student_lesson_plans: true
    new_lesson = create :lesson, script: script, key: 'Some Verbose Lesson Name', has_lesson_plan: true
    assert_nil(new_lesson.student_lesson_plan_pdf_url)

    script.seeded_from = Time.now.to_s
    assert_nil(new_lesson.student_lesson_plan_pdf_url)
  end

  test 'opportunity standards do not count as regular standards' do
    lesson = create :lesson
    standard = create :standard
    lesson.opportunity_standards << standard
    assert_equal 0, lesson.standards.length
    assert_equal 1, lesson.opportunity_standards.length
  end

  test 'destroying lesson destroys opportunity_standards join model' do
    lesson = create :lesson
    standard = create :standard
    LessonsOpportunityStandard.destroy_all
    lesson.opportunity_standards << standard
    assert_equal 1, LessonsOpportunityStandard.count
    lesson.destroy
    assert_equal 0, LessonsOpportunityStandard.count
  end

  def create_swapped_lockable_lesson
    script = create :script
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    level2 = create :level_group, name: 'level2', title: 'title2', submittable: true
    lesson = create :lesson, name: 'lesson1', script: script, lockable: true
    script_level = create :script_level, script: script, levels: [level1, level2], assessment: true, lesson: lesson

    [script, level1, level2, lesson, script_level]
  end

  test 'course_version_standards_url returns nil without course version' do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    refute script.get_course_version
    refute lesson.course_version_standards_url
  end

  test 'course_version_standards_url in unit group returns courses path' do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script

    # family name and version year must be set in order for a unit group to have
    # a course offering and course version.
    unit_group = create :unit_group, family_name: 'my-family', version_year: '1999'
    create :unit_group_unit, script: script, unit_group: unit_group, position: 1

    # adds course offering and course version
    CourseOffering.add_course_offering(unit_group)
    assert script.get_course_version
    assert_equal unit_group, script.get_course_version.content_root

    expected_url = "/courses/#{unit_group.name}/standards"
    assert_equal expected_url, lesson.course_version_standards_url
  end

  test 'course_version_standards_url in standalone script returns script path' do
    script = create :script, is_course: true, family_name: 'my-family', version_year: '1999'
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script

    CourseOffering.add_course_offering(script)
    assert script.get_course_version
    assert_equal script, script.get_course_version.content_root

    expected_url = "/s/#{script.name}/standards"
    assert_equal expected_url, lesson.course_version_standards_url
  end
end
