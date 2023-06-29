require 'test_helper'

class LessonTest < ActiveSupport::TestCase
  setup do
    @student = create :student
  end

  test "lockable_state with swapped level without user_level" do
    _, level1, _, lesson, _ = create_swapped_lockable_lesson

    lockable_state = lesson.lockable_state [@student]

    assert_equal true, lockable_state[0][:locked], 'lesson without userlevel should be locked'
    assert_equal level1.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level in reverse order without userlevel" do
    _, _, level2, lesson, script_level = create_swapped_lockable_lesson
    script_level.properties = {variants: {level1: {active: false}}}
    script_level.save!

    lockable_state = lesson.lockable_state [@student]

    assert_equal true, lockable_state[0][:locked], 'lesson without userlevel should be locked'
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

    assert_match (/extras$/), lesson.summarize[:lesson_extras_level_url]
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
    lesson = create :lesson, script: script, name: 'My Lesson'
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

  test 'summary of lesson plan with vocab, resources, objectives, programming expressions and standards' do
    student = create :student
    teacher = create :teacher

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group, name: 'My Lesson'
    lesson.objectives.push(create(:objective))
    lesson.objectives.push(create(:objective))
    lesson.vocabularies.push(create(:vocabulary))
    lesson.vocabularies.push(create(:vocabulary))
    lesson.resources.push(create(:resource))
    lesson.resources.push(create(:resource))
    lesson.standards.push(create(:standard))
    lesson.standards.push(create(:standard))
    lesson.opportunity_standards.push(create(:standard))
    lesson.opportunity_standards.push(create(:standard))
    lesson.programming_expressions.push(create(:programming_expression, syntax: 'xyz'))
    lesson.programming_expressions.push(create(:programming_expression, syntax: nil))

    # just make sure there are no errors
    lesson.summarize_for_lesson_edit
    lesson.summarize_for_lesson_show(student, false)
    lesson.summarize_for_lesson_show(teacher, false)
    lesson.summarize_for_rollup(student)
    lesson.summarize_for_rollup(teacher)
    lesson.summarize_for_student_lesson_plan
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

  # NOTE: The LessonExtras component changes the "next" button text depending
  # on the path for the next level. LessonExtras may need to be updated if
  # there are changes to what next_level_path_for_lesson_extras returns.
  test "next_level_path_for_lesson_extras" do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson1 = create :lesson, script: script, lesson_group: lesson_group
    create :script_level, script: script, lesson: lesson1
    create :script_level, script: script, lesson: lesson1
    lesson2 = create :lesson, script: script, lesson_group: lesson_group
    create :script_level, script: script, lesson: lesson2
    create :script_level, script: script, lesson: lesson2

    assert_match (/\/s\/bogus-script-\d+\/lessons\/2\/levels\/1/), lesson1.next_level_path_for_lesson_extras(@student)
    assert_equal '/', lesson2.next_level_path_for_lesson_extras(@student)
  end

  test "next_level_path_for_lesson_extras show unit overview" do
    script = create :script
    script.stubs(:show_unit_overview_between_lessons?).returns true
    lesson_group = create :lesson_group, script: script
    lesson1 = create :lesson, script: script, lesson_group: lesson_group
    create :script_level, script: script, lesson: lesson1
    create :script_level, script: script, lesson: lesson1
    lesson2 = create :lesson, script: script, lesson_group: lesson_group
    create :script_level, script: script, lesson: lesson2
    create :script_level, script: script, lesson: lesson2

    assert_equal "/s/#{script.name}", lesson1.next_level_path_for_lesson_extras(@student)
    assert_equal "/s/#{script.name}", lesson2.next_level_path_for_lesson_extras(@student)
  end

  test 'can summarize lesson with no levels' do
    unit = create :script
    lesson_group = create :lesson_group, script: unit
    create :lesson, lesson_group: lesson_group, key: 'Lesson1', name: 'Lesson 1'

    summary = unit.lessons.first.summarize
    assert_equal 'Lesson1', summary[:key]
  end

  test 'can summarize lesson with and without lesson plan in unmigrated unit' do
    script = create :script, name: 'test-script', is_migrated: false
    lesson_group = create :lesson_group, script: script
    lesson1 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: true
    lesson2 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: false

    lesson1_summary = lesson1.summarize
    lesson2_summary = lesson2.summarize
    assert_equal '//test.code.org/curriculum/test-script/1/Teacher', lesson1_summary[:lesson_plan_html_url]
    assert_nil lesson2_summary[:lesson_plan_html_url]
  end

  test 'can summarize lesson with code studio lesson plans in migrated script' do
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
    assert_nil lesson2_summary[:lesson_plan_html_url]
    assert_equal "/s/#{script.name}/lessons/#{lesson3.relative_position}", lesson3_summary[:lesson_plan_html_url]
    assert_nil lesson4_summary[:lesson_plan_html_url]
  end

  test 'can summarize lesson with legacy lesson plan link in migrated script' do
    script = create :script, name: 'test-script', is_migrated: true, use_legacy_lesson_plans: true
    lesson_group = create :lesson_group, script: script
    lesson1 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: true, lockable: true
    lesson2 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: false, lockable: true
    lesson3 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: true, lockable: false
    lesson4 = create :lesson, lesson_group: lesson_group, script: script, has_lesson_plan: false, lockable: false

    lesson1_summary = lesson1.summarize
    lesson2_summary = lesson2.summarize
    lesson3_summary = lesson3.summarize
    lesson4_summary = lesson4.summarize
    assert_equal '//test.code.org/curriculum/test-script/1/Teacher', lesson1_summary[:lesson_plan_html_url]
    assert_nil lesson2_summary[:lesson_plan_html_url]
    assert_equal '//test.code.org/curriculum/test-script/3/Teacher', lesson3_summary[:lesson_plan_html_url]
    assert_nil lesson4_summary[:lesson_plan_html_url]
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

  test 'lesson show summary retrieves translations' do
    lesson = create(
      :lesson,
      assessment_opportunities: 'example assessment opportunities',
      lesson_group: create(:lesson_group),
      overview: 'example overview',
      preparation: 'example preparation',
      purpose: 'example purpose'
    )

    lesson.expects(:get_localized_property).with(:name)
    lesson.expects(:get_localized_property).with(:overview)
    lesson.expects(:get_localized_property).with(:purpose)
    lesson.expects(:get_localized_property).with(:preparation)
    lesson.expects(:get_localized_property).with(:assessment_opportunities)

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
    script = create :script, :with_levels
    lesson = script.lessons.first
    lesson.script_levels.last.update!(bonus: true)
    lesson.reload

    levels_data = lesson.summarize_for_unit_edit[:levels]
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
      unitTitle: "script6",
      versionYear: nil,
      lockable: false,
      relativePosition: 1,
      id: lesson6.id,
      editUrl: "/lessons/#{lesson6.id}/edit"
    }
    assert_equal expected_summary, summaries[0]

    expected_summary = {
      unitTitle: "script0",
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
      unitTitle: "script4",
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
    script1.reload

    script2 = create :script, name: 'script2'
    create :unit_group_unit, unit_group: unit_group_a, script: script2, position: 2
    lesson2 = create :lesson, script: script2, key: 'foo'
    script2.reload

    script3 = create :script, name: 'script3'
    create :unit_group_unit, unit_group: unit_group_a, script: script3, position: 3
    create :lesson, script: script3, key: 'bar'
    script3.reload

    script0 = create :script, name: 'script0'
    create :unit_group_unit, unit_group: unit_group_a, script: script0, position: 4
    lesson0 = create :lesson, script: script0, key: 'foo'
    script0.reload

    unit_group_b = create :unit_group
    create :course_version, course_offering: course_offering, content_root: unit_group_b, key: '2999'

    script4 = create :script, name: 'script4'
    create :unit_group_unit, unit_group: unit_group_b, script: script4, position: 1
    lesson4 = create :lesson, script: script4, key: 'foo'
    script4.reload

    script5 = create :script, name: 'script5'
    create :unit_group_unit, unit_group: unit_group_b, script: script5, position: 2
    create :lesson, script: script5, key: 'bar'
    script5.reload

    other_course_offering = create :course_offering

    unit_group_c = create :unit_group
    create :course_version, course_offering: other_course_offering, content_root: unit_group_c, key: '3000'

    script6 = create :script, name: 'script6'
    create :unit_group_unit, unit_group: unit_group_c, script: script6, position: 1
    create :lesson, script: script6, key: 'foo'
    script6.reload

    unit_group_a.reload
    unit_group_b.reload
    unit_group_c.reload

    # measure the query count of the summarize method before checking the result
    # of related_lessons, so that the count is not artificially reduced by
    # anything being cached from the call to related_lessons.
    summaries = nil
    assert_queries(10) do
      summaries = lesson1.summarize_related_lessons
    end

    assert_equal [lesson4, lesson0, lesson2], lesson1.related_lessons

    assert_equal 3, summaries.count
    expected_summary = {
      unitTitle: "script4",
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

    lesson1.reload
    assert_queries(3) do
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
      "//test.code.org/curriculum/#{old_lesson.script.name}/1/Teacher.pdf",
      old_lesson.lesson_plan_pdf_url
    )

    script = create :script, is_migrated: true
    new_lesson = create :lesson, script: script, name: 'Some Verbose Lesson Name', has_lesson_plan: true
    assert_nil(new_lesson.lesson_plan_pdf_url)

    script.seeded_from = Time.now.to_s
    assert_equal(
      "https://lesson-plans.code.org/#{script.name}/#{Time.parse(script.seeded_from).to_s(:number)}/teacher-lesson-plans/Some-Verbose-Lesson-Name.pdf",
      new_lesson.lesson_plan_pdf_url
    )
  end

  test 'student_lesson_plan_pdf_url gets url for migrated script with student lesson plans' do
    script = create :script, is_migrated: true, include_student_lesson_plans: true
    new_lesson = create :lesson, script: script, name: 'Some Verbose Lesson Name', has_lesson_plan: true
    assert_nil(new_lesson.student_lesson_plan_pdf_url)

    script.seeded_from = Time.now.to_s
    assert_equal(
      "https://lesson-plans.code.org/#{script.name}/#{Time.parse(script.seeded_from).to_s(:number)}/student-lesson-plans/Some-Verbose-Lesson-Name-Student.pdf",
      new_lesson.student_lesson_plan_pdf_url
    )
  end

  test 'no student_lesson_plan_pdf_url for non-migrated scripts' do
    script = create :script, include_student_lesson_plans: true, is_migrated: false
    new_lesson = create :lesson, script: script, key: 'Some Verbose Lesson Name', has_lesson_plan: true
    assert_nil(new_lesson.student_lesson_plan_pdf_url)

    script.seeded_from = Time.now.to_s
    assert_nil(new_lesson.student_lesson_plan_pdf_url)
  end

  test 'start_url returns correct lockable lesson url' do
    new_script = create :script, include_student_lesson_plans: false, is_migrated: true
    new_lesson = create :lesson, script: new_script, key: 'Fancy Name', has_lesson_plan: false, lockable: true
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    create :script_level, script: new_script, levels: [level1], assessment: true, lesson: new_lesson

    assert_equal(
      new_lesson.start_url,
      CDO.studio_url("/s/#{new_script.name}/lockable/1/levels/1", CDO.default_scheme)
    )
  end

  test 'start_url returns correct lesson start url' do
    new_script = create :script, include_student_lesson_plans: true, is_migrated: true
    new_lesson = create :lesson, script: new_script, key: 'Fancy Name', has_lesson_plan: true
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    create :script_level, script: new_script, levels: [level1], assessment: false, lesson: new_lesson

    assert_equal(
      new_lesson.start_url,
      CDO.studio_url("/s/#{new_script.name}/lessons/1/levels/1", CDO.default_scheme)
    )
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
    unit_group.reload
    script.reload

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

  test 'should give URL for script level curriculum PDF in unmigrated unit' do
    script = create :script, is_migrated: false
    lesson = create(:lesson, script: script, absolute_position: 5, relative_position: 5)
    assert_includes(lesson.lesson_plan_html_url, "curriculum/#{lesson.script.name}/5/Teacher")
    assert_includes(lesson.lesson_plan_pdf_url, "curriculum/#{lesson.script.name}/5/Teacher.pdf")
  end

  test 'uncached lesson path helpers' do
    hoc_unit = create :script, name: 'dance'
    hoc_lesson_group = create :lesson_group, script: hoc_unit
    hoc_lesson = create :lesson, script: hoc_unit, lesson_group: hoc_lesson_group

    assert_equal "/lessons/#{hoc_lesson.id}", hoc_lesson.get_uncached_show_path
    assert_equal "/lessons/#{hoc_lesson.id}/edit", hoc_lesson.get_uncached_edit_path

    other_unit = create :script
    other_lesson_group = create :lesson_group, script: other_unit
    lesson_without_plan = create :lesson, script: other_unit, lesson_group: other_lesson_group, relative_position: 1, absolute_position: 1, has_lesson_plan: false
    lesson_with_plan = create :lesson, script: other_unit, lesson_group: other_lesson_group, relative_position: 1, absolute_position: 2, has_lesson_plan: true

    assert_equal "/s/#{other_unit.name}/lessons/1", lesson_with_plan.get_uncached_show_path
    assert_equal "/s/#{other_unit.name}/lessons/1/edit", lesson_with_plan.get_uncached_edit_path

    assert_equal "/lessons/#{lesson_without_plan.id}/edit", lesson_without_plan.get_uncached_edit_path
  end

  class LessonCopyTests < ActiveSupport::TestCase
    setup do
      Unit.any_instance.stubs(:write_script_json)
      Unit.stubs(:merge_and_write_i18n)

      @original_script = create :script, is_migrated: true
      @original_script.expects(:write_script_json).never
      course_offering = create :course_offering
      @original_course_version = create :course_version, course_offering: course_offering, content_root: @original_script, version_year: 2021
      @original_lesson_group = create :lesson_group, script: @original_script
      @original_lesson = create :lesson, lesson_group: @original_lesson_group, script: @original_script, has_lesson_plan: true

      @destination_script = create :script, is_migrated: true
      course_offering = create :course_offering
      @destination_course_version = create :course_version, course_offering: course_offering, content_root: @destination_script, version_year: 2021
      @destination_lesson_group = create :lesson_group, script: @destination_script

      @original_dlp_script = create :script, is_migrated: true, professional_learning_course: 'my-plc-course-for-dlp'
      @original_dlp_script.expects(:write_script_json).never
      @original_dlp_lesson_group = create :lesson_group, script: @original_dlp_script
      @original_dlp_lesson = create :lesson, lesson_group: @original_lesson_group, script: @original_dlp_script, has_lesson_plan: true

      @destination_dlp_script = create :script, is_migrated: true, professional_learning_course: 'my-plc-course-for-dlp-2'
      @destination_dlp_lesson_group = create :lesson_group, script: @destination_dlp_script
    end

    test "can clone lesson into another script" do
      lesson_activity = create :lesson_activity, lesson: @original_lesson
      activity_section = create :activity_section, lesson_activity: lesson_activity
      level1 = create :maze, name: 'level 1'
      level2 = create :maze, name: 'level 2'
      create :script_level, script: @original_script, lesson: @original_lesson, levels: [level1],
        activity_section: activity_section, activity_section_position: 1
      create :script_level, script: @original_script, lesson: @original_lesson, levels: [level2],
        activity_section: activity_section, activity_section_position: 2
      create :resource, name: 'resource1', course_version: @original_course_version, lessons: [@original_lesson]
      create :resource, name: 'resource2', course_version: @original_course_version, lessons: [@original_lesson]
      create :vocabulary, word: 'word one', course_version: @original_course_version, lessons: [@original_lesson]
      create :vocabulary, word: 'word two', course_version: @original_course_version, lessons: [@original_lesson]
      create :objective, lesson: @original_lesson, description: 'objective 1'
      create :objective, lesson: @original_lesson, description: 'objective 2'
      @original_lesson.standards = [create(:standard)]
      @original_lesson.opportunity_standards = [create(:standard)]
      @original_lesson.programming_expressions = [create(:programming_expression)]

      @destination_script.expects(:write_script_json).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      assert_equal @destination_script, copied_lesson.script
      assert_equal 2, copied_lesson.script_levels.length
      assert_equal [level1, level2], copied_lesson.script_levels.map(&:level)
      assert_equal 2, copied_lesson.resources.length
      assert_equal @original_lesson.resources.map {|r| r.attributes.slice('name', 'url', 'properties').to_a}, copied_lesson.resources.map {|r| r.attributes.slice('name', 'url', 'properties').to_a}
      assert_equal 2, copied_lesson.vocabularies.length
      assert_equal @original_lesson.vocabularies.map(&:word), copied_lesson.vocabularies.map(&:word)
      assert_equal 2, copied_lesson.objectives.length
      assert_equal @original_lesson.objectives.map(&:description), copied_lesson.objectives.map(&:description)
      assert_equal @original_lesson.standards, copied_lesson.standards
      assert_equal @original_lesson.opportunity_standards, copied_lesson.opportunity_standards
      assert_equal @original_lesson.programming_expressions, copied_lesson.programming_expressions
    end

    test "can not clone deeper learning lesson into a non deeper learning script" do
      raise = assert_raises do
        @original_dlp_lesson.copy_to_unit(@destination_script, nil)
      end
      assert_equal 'Deeper learning lesson must be copied to deeper learning courses.', raise.message
    end

    test "can clone deeper learning lesson into another deeper learning script" do
      lesson_activity = create :lesson_activity, lesson: @original_dlp_lesson
      activity_section = create :activity_section, lesson_activity: lesson_activity
      level1 = create :maze, name: 'level 1'
      level2 = create :maze, name: 'level 2'
      create :script_level, script: @original_dlp_script, lesson: @original_dlp_lesson, levels: [level1],
             activity_section: activity_section, activity_section_position: 1
      create :script_level, script: @original_dlp_script, lesson: @original_dlp_lesson, levels: [level2],
             activity_section: activity_section, activity_section_position: 2
      create :objective, lesson: @original_dlp_lesson, description: 'objective 1'
      create :objective, lesson: @original_dlp_lesson, description: 'objective 2'
      @original_dlp_lesson.standards = [create(:standard)]
      @original_dlp_lesson.opportunity_standards = [create(:standard)]
      @original_dlp_lesson.programming_expressions = [create(:programming_expression)]

      @destination_dlp_script.expects(:write_script_json).once
      copied_lesson = @original_dlp_lesson.copy_to_unit(@destination_dlp_script, nil)
      assert_equal @destination_dlp_script, copied_lesson.script
      assert_equal 2, copied_lesson.script_levels.length
      assert_equal [level1, level2], copied_lesson.script_levels.map(&:level)
      assert_equal 2, copied_lesson.objectives.length
      assert_equal @original_dlp_lesson.objectives.map(&:description), copied_lesson.objectives.map(&:description)
      assert_equal @original_dlp_lesson.standards, copied_lesson.standards
      assert_equal @original_dlp_lesson.opportunity_standards, copied_lesson.opportunity_standards
      assert_equal @original_dlp_lesson.programming_expressions, copied_lesson.programming_expressions
    end

    test "resource markdown is updated in activity sections when cloning lesson" do
      resource_in_lesson = create :resource, key: 'original_key', name: 'resource1', course_version: @original_course_version, lessons: [@original_lesson]
      resource_not_in_lesson = create :resource, name: 'resource2', course_version: @original_course_version, lessons: []

      lesson_activity = create :lesson_activity, lesson: @original_lesson
      create :activity_section, lesson_activity: lesson_activity, description: "Resource 1: [r #{Services::GloballyUniqueIdentifiers.build_resource_key(resource_in_lesson)}]. Resource 2: [r #{Services::GloballyUniqueIdentifiers.build_resource_key(resource_not_in_lesson)}]."
      create :activity_section, lesson_activity: lesson_activity, tips: [{markdown: "Resource 1: [r #{Services::GloballyUniqueIdentifiers.build_resource_key(resource_in_lesson)}]"}, {markdown: "description without resource"}]

      @destination_script.expects(:write_script_json).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      assert_equal @destination_script, copied_lesson.script
      assert_equal 1, copied_lesson.resources.length
      assert_equal @original_lesson.resources.map {|r| r.attributes.slice('name', 'url', 'properties').to_a}, copied_lesson.resources.map {|r| r.attributes.slice('name', 'url', 'properties').to_a}

      copied_resource1 = @destination_course_version.resources.find_by_name('resource1')
      refute_nil copied_resource1
      copied_resource2 = @destination_course_version.resources.find_by_name('resource2')
      refute_nil copied_resource2
      assert_equal @destination_script.lessons.last.lesson_activities.last.activity_sections.first.description, "Resource 1: [r #{Services::GloballyUniqueIdentifiers.build_resource_key(copied_resource1)}]. Resource 2: [r #{Services::GloballyUniqueIdentifiers.build_resource_key(copied_resource2)}]."
      assert_equal 2, @destination_script.lessons.last.lesson_activities.last.activity_sections.last.tips.length
      assert_equal ["Resource 1: [r #{Services::GloballyUniqueIdentifiers.build_resource_key(copied_resource1)}]", "description without resource"], @destination_script.lessons.last.lesson_activities.last.activity_sections.last.tips.map {|t| t['markdown']}
    end

    test "preparation resource markdown is updated when cloning lesson" do
      resource_in_lesson = create :resource, key: 'original_key', name: 'resource1', course_version: @original_course_version, lessons: [@original_lesson]
      resource_not_in_lesson = create :resource, name: 'resource2', course_version: @original_course_version, lessons: []

      @original_lesson.preparation = "Resource 1: [r #{Services::GloballyUniqueIdentifiers.build_resource_key(resource_in_lesson)}]. Resource 2: [r #{Services::GloballyUniqueIdentifiers.build_resource_key(resource_not_in_lesson)}]."
      @original_lesson.save!

      @destination_script.expects(:write_script_json).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      assert_equal @destination_script, copied_lesson.script
      assert_equal 1, copied_lesson.resources.length
      assert_equal @original_lesson.resources.map {|r| r.attributes.slice('name', 'url', 'properties').to_a}, copied_lesson.resources.map {|r| r.attributes.slice('name', 'url', 'properties').to_a}

      copied_resource1 = @destination_course_version.resources.find_by_name('resource1')
      refute_nil copied_resource1
      copied_resource2 = @destination_course_version.resources.find_by_name('resource2')
      refute_nil copied_resource2
      assert_equal @destination_script.lessons.last.preparation, "Resource 1: [r #{Services::GloballyUniqueIdentifiers.build_resource_key(copied_resource1)}]. Resource 2: [r #{Services::GloballyUniqueIdentifiers.build_resource_key(copied_resource2)}]."
    end

    test "vocabulary markdown is updated in activity sections when cloning lesson" do
      vocabulary_in_lesson = create :vocabulary, key: 'original_key', word: 'vocabulary one', course_version: @original_course_version, lessons: [@original_lesson]
      vocabulary_not_in_lesson = create :vocabulary, word: 'vocabulary two', course_version: @original_course_version, lessons: []

      lesson_activity = create :lesson_activity, lesson: @original_lesson
      create :activity_section, lesson_activity: lesson_activity, description: "Vocab 1: [v #{Services::GloballyUniqueIdentifiers.build_vocab_key(vocabulary_in_lesson)}]. Vocab 2: [v #{Services::GloballyUniqueIdentifiers.build_vocab_key(vocabulary_not_in_lesson)}]."

      @destination_script.expects(:write_script_json).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      assert_equal @destination_script, copied_lesson.script
      assert_equal 1, copied_lesson.vocabularies.length

      copied_vocabulary1 = @destination_course_version.vocabularies.find_by_word('vocabulary one')
      refute_nil copied_vocabulary1
      copied_vocabulary2 = @destination_course_version.vocabularies.find_by_word('vocabulary two')
      refute_nil copied_vocabulary2
      assert_equal @destination_script.lessons.last.lesson_activities.last.activity_sections.last.description, "Vocab 1: [v #{Services::GloballyUniqueIdentifiers.build_vocab_key(copied_vocabulary1)}]. Vocab 2: [v #{Services::GloballyUniqueIdentifiers.build_vocab_key(copied_vocabulary2)}]."
    end

    test "student overview vocab markdown is updated when cloning lesson" do
      vocabulary_in_lesson = create :vocabulary, key: 'original_key', word: 'vocabulary one', course_version: @original_course_version, lessons: [@original_lesson]
      vocabulary_not_in_lesson = create :vocabulary, word: 'vocabulary two', course_version: @original_course_version, lessons: []

      @original_lesson.student_overview = "Vocab 1: [v #{Services::GloballyUniqueIdentifiers.build_vocab_key(vocabulary_in_lesson)}]. Vocab 2: [v #{Services::GloballyUniqueIdentifiers.build_vocab_key(vocabulary_not_in_lesson)}]."
      @original_lesson.save!

      @destination_script.expects(:write_script_json).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      assert_equal @destination_script, copied_lesson.script
      assert_equal 1, copied_lesson.vocabularies.length

      copied_vocabulary1 = @destination_course_version.vocabularies.find_by_word('vocabulary one')
      refute_nil copied_vocabulary1
      copied_vocabulary2 = @destination_course_version.vocabularies.find_by_word('vocabulary two')
      refute_nil copied_vocabulary2
      assert_equal @destination_script.lessons.last.student_overview, "Vocab 1: [v #{Services::GloballyUniqueIdentifiers.build_vocab_key(copied_vocabulary1)}]. Vocab 2: [v #{Services::GloballyUniqueIdentifiers.build_vocab_key(copied_vocabulary2)}]."
    end

    test "variants are removed when cloning lesson into another script" do
      lesson_activity = create :lesson_activity, lesson: @original_lesson
      activity_section = create :activity_section, lesson_activity: lesson_activity
      level1 = create :maze, name: 'level 1'
      level2 = create :maze, name: 'level 2'
      sl = create :script_level, script: @original_script, lesson: @original_lesson, levels: [level1],
        activity_section: activity_section, activity_section_position: 1
      sl.add_variant(level2)

      @destination_script.expects(:write_script_json).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      assert_equal 1, copied_lesson.script_levels.length
      assert_equal level2, copied_lesson.script_levels[0].oldest_active_level
    end

    test "levels are cloned when new_level_suffix is passed in" do
      lesson_activity = create :lesson_activity, lesson: @original_lesson
      activity_section = create :activity_section, lesson_activity: lesson_activity, progression_name: 'progression'
      level1 = create :maze, name: 'level 1'
      create :script_level, script: @original_script, lesson: @original_lesson, levels: [level1],
        activity_section: activity_section, activity_section_position: 1

      @destination_script.expects(:write_script_json).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script, '_2000')
      assert_equal 1, copied_lesson.script_levels.length
      refute_equal level1, copied_lesson.script_levels[0].oldest_active_level
      assert_equal 'progression', copied_lesson.script_levels[0].progression
    end

    test "can clone lesson with duplicated resources and vocab into another script" do
      create :resource, name: 'resource1', course_version: @original_course_version, lessons: [@original_lesson]
      create :vocabulary, word: 'word one', course_version: @original_course_version, lessons: [@original_lesson]

      @destination_script.expects(:write_script_json).once
      destination_resource = create :resource, name: 'resource1', course_version: @destination_course_version
      destination_vocab = create :vocabulary, word: 'word one', course_version: @destination_course_version
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      assert_equal @destination_script, copied_lesson.script
      assert_equal [destination_resource], copied_lesson.resources
      assert_equal [destination_vocab], copied_lesson.vocabularies
    end

    test "dots are stripped from cloned lesson key" do
      @destination_script.expects(:write_script_json).once
      @original_lesson.update!(name: 'Problem.Lesson.')
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      assert_equal 'ProblemLesson', copied_lesson.key
    end

    test "can clone lesson another script in the same course version" do
      unit_group = create :unit_group
      course_version = create :course_version, content_root: unit_group

      original_script = create :script, is_migrated: true
      create :unit_group_unit, unit_group: unit_group, script: original_script, position: 1
      original_script.reload
      unit_group.reload

      original_script.expects(:write_script_json).never
      original_lesson_group = create :lesson_group, script: original_script
      original_lesson = create :lesson, lesson_group: original_lesson_group, script: original_script, has_lesson_plan: true
      original_resource = create :resource, name: 'resource1', course_version: course_version, lessons: [original_lesson]
      original_vocab = create :vocabulary, word: 'word one', course_version: course_version, lessons: [original_lesson]

      destination_script = create :script, is_migrated: true
      create :unit_group_unit, unit_group: unit_group, script: destination_script, position: 2
      destination_script.reload
      unit_group.reload
      create :lesson_group, script: destination_script

      destination_script.expects(:write_script_json).once
      course_version_resource_count = course_version.resources.count
      course_version_vocab_count = course_version.vocabularies.count
      copied_lesson = original_lesson.copy_to_unit(destination_script)
      course_version.reload

      assert_equal destination_script, copied_lesson.script
      assert_equal [original_resource], copied_lesson.resources
      assert_equal [original_vocab], copied_lesson.vocabularies
      assert_equal course_version.resources.count, course_version_resource_count
      assert_equal course_version.vocabularies.count, course_version_vocab_count
    end

    test "can clone lesson without course version to a script with a course version" do
      original_script = create :script, is_migrated: true, is_course: true
      original_script.reload

      original_script.expects(:write_script_json).never
      original_lesson_group = create :lesson_group, script: original_script
      original_lesson = create :lesson, lesson_group: original_lesson_group, script: original_script, has_lesson_plan: true

      destination_script = create :script, is_migrated: true, is_course: true
      create :course_version, content_root: destination_script
      create :lesson_group, script: destination_script

      destination_script.expects(:write_script_json).once
      copied_lesson = original_lesson.copy_to_unit(destination_script)

      assert_equal destination_script, copied_lesson.script
    end

    test "can clone lesson into another script with lessons" do
      lesson_activity = create :lesson_activity, lesson: @original_lesson
      activity_section = create :activity_section, lesson_activity: lesson_activity
      level1 = create :maze, name: 'level 1'
      create :script_level, script: @original_script, lesson: @original_lesson, levels: [level1],
        activity_section: activity_section, activity_section_position: 1

      existing_lesson = create :lesson, script: @destination_script, lesson_group: @destination_lesson_group, has_lesson_plan: true
      existing_lesson_activity = create :lesson_activity, lesson: existing_lesson
      existing_activity_section = create :activity_section, lesson_activity: existing_lesson_activity
      level2 = create :maze, name: 'level 2'
      create :script_level, script: @destination_script, lesson: existing_lesson, levels: [level2],
        activity_section: existing_activity_section, activity_section_position: 1

      @destination_script.expects(:write_script_json).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      @destination_script.reload

      # Test that the script levels were correctly added to the script
      assert_equal @destination_script, copied_lesson.script
      assert_equal @destination_lesson_group, copied_lesson.lesson_group
      assert_equal 2, @destination_script.script_levels.length
      assert_equal [level2, level1], @destination_script.script_levels.map(&:level)
      assert_equal [1, 2], @destination_script.script_levels.map(&:chapter)

      # Test that the script levels were correctly copied with the lesson/activity section
      assert_equal 1, copied_lesson.script_levels.length
      assert_equal [level1], copied_lesson.script_levels.map(&:level)
      assert_equal 1, copied_lesson.lesson_activities[0].activity_sections[0].script_levels.length
      assert_equal [level1], copied_lesson.lesson_activities[0].activity_sections[0].script_levels.map(&:level)
      assert_equal 1, copied_lesson.script_levels[0].position
      assert_equal 1, copied_lesson.script_levels[0].activity_section_position

      assert_equal 2, copied_lesson.absolute_position
      assert_equal 2, copied_lesson.relative_position
    end

    test "can clone lesson and set absolute/relative position on non-lockable lesson with lesson plan" do
      create :lesson, script: @destination_script, lesson_group: @destination_lesson_group, has_lesson_plan: true, absolute_position: 1, relative_position: 1
      create :lesson, script: @destination_script, lesson_group: @destination_lesson_group, has_lesson_plan: true, absolute_position: 2, relative_position: 2
      create :lesson, script: @destination_script, lesson_group: @destination_lesson_group, has_lesson_plan: false, lockable: true, absolute_position: 3, relative_position: 1

      @destination_script.expects(:write_script_json).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      @destination_script.reload
      assert_equal @destination_script, copied_lesson.script
      assert_equal 4, copied_lesson.absolute_position
      assert_equal 3, copied_lesson.relative_position
    end

    test "can clone lesson and set absolute/relative position on non-lockable lesson without lesson plan" do
      @original_lesson.has_lesson_plan = false
      @original_lesson.save!

      create :lesson, script: @destination_script, lesson_group: @destination_lesson_group, has_lesson_plan: true, absolute_position: 1, relative_position: 1
      create :lesson, script: @destination_script, lesson_group: @destination_lesson_group, has_lesson_plan: true, absolute_position: 2, relative_position: 2
      create :lesson, script: @destination_script, lesson_group: @destination_lesson_group, has_lesson_plan: false, lockable: true, absolute_position: 3, relative_position: 1

      @destination_script.expects(:write_script_json).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      @destination_script.reload
      assert_equal @destination_script, copied_lesson.script
      assert_equal 4, copied_lesson.absolute_position
      assert_equal 3, copied_lesson.relative_position
    end

    test "can clone lesson and set absolute/relative position on lockable lesson without lesson plan" do
      @original_lesson.has_lesson_plan = false
      @original_lesson.lockable = true
      @original_lesson.save!

      create :lesson, script: @destination_script, lesson_group: @destination_lesson_group, has_lesson_plan: true, absolute_position: 1, relative_position: 1
      create :lesson, script: @destination_script, lesson_group: @destination_lesson_group, has_lesson_plan: true, absolute_position: 2, relative_position: 2
      create :lesson, script: @destination_script, lesson_group: @destination_lesson_group, has_lesson_plan: false, lockable: true, absolute_position: 3, relative_position: 1

      @destination_script.expects(:write_script_json).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      @destination_script.reload
      assert_equal @destination_script, copied_lesson.script
      assert_equal 4, copied_lesson.absolute_position
      assert_equal 2, copied_lesson.relative_position
    end

    test 'unit cannot have two lessons with the same key' do
      unit = create :script, :with_lessons, name: 'unit-name'
      e = assert_raises do
        unit.lessons.last.update!(key: unit.lessons.first.key)
      end
      assert_includes e.message, "lesson with key \"#{unit.lessons.first.key}\" is already taken within unit \"unit-name\""
    end

    test 'cannot clone lesson when lesson name is already taken' do
      create :lesson, lesson_group: @destination_lesson_group, key: 'conflicting-key'
      @destination_script.reload
      # cloning uses the original lesson name as the new lesson key
      @original_lesson.update!(name: 'conflicting-key')
      e = assert_raises do
        @original_lesson.copy_to_unit(@destination_script)
      end
      assert_includes e.message, "lesson with key \"conflicting-key\" is already taken within unit \"#{@destination_script.name}\""
    end

    test "creates lesson group if script has none" do
      @destination_script.lesson_groups = []

      @destination_script.expects(:write_script_json).once
      Unit.expects(:merge_and_write_i18n).once
      copied_lesson = @original_lesson.copy_to_unit(@destination_script)
      assert_equal 1, @destination_script.lesson_groups.count
      assert_equal 1, @destination_script.lessons.count
      assert_equal @destination_script.lesson_groups.first, copied_lesson.lesson_group
    end

    test "render_property localizes and processes" do
      lesson = create(:lesson)
      lesson.expects(:get_localized_property)
      Services::MarkdownPreprocessor.expects(:process)
      lesson.render_property(:overview)
    end

    test "get_localized_property can retrieve translations" do
      lesson = create(:lesson, overview: "This is the english overview")
      test_locale = :'te-ST'
      custom_i18n = {
        "data" => {
          "lessons" => {
            "#{lesson.script.name}/#{lesson.key}" => {
              "overview" => "This is the translated overview"
            }
          }
        }
      }
      I18n.backend.store_translations(test_locale, custom_i18n)

      assert_equal("This is the english overview", lesson.get_localized_property(:overview))
      I18n.locale = test_locale
      assert_equal("This is the translated overview", lesson.get_localized_property(:overview))
      I18n.locale = I18n.default_locale
    end
  end
end
