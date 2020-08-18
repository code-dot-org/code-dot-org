require 'test_helper'

class StageTest < ActiveSupport::TestCase
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
    create :user_level, user: @student, script: script, level: level2, unlocked_at: Time.now

    lockable_state = lesson.lockable_state [@student]

    assert_equal false, lockable_state[0][:locked], 'unlocked user_level should unlock old level'
    assert_equal level2.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level with user_level for active level" do
    script, level1, _, lesson, _ = create_swapped_lockable_lesson
    create :user_level, user: @student, script: script, level: level1, unlocked_at: Time.now

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
    assert_equal [level.id], summary[:levels].first[:ids]
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
        level_id: level.id,
        type: level.class.to_s,
        name: level.name,
        display_name: level.display_name
      }
    ]

    assert_equal expected_summary_of_levels, lesson.summary_for_lesson_plans[:levels]
  end

  test "last_progression_script_level" do
    lesson = create :lesson
    create :script_level, lesson: lesson
    last_script_level = create :script_level, lesson: lesson

    assert_equal last_script_level, lesson.last_progression_script_level
  end

  test "last_progression_script_level with a bonus level" do
    lesson = create :lesson
    last_script_level = create :script_level, lesson: lesson
    create :script_level, lesson: lesson, bonus: true

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

    assert_match /\/s\/bogus-script-\d+\/stage\/2\/puzzle\/1/, lesson1.next_level_path_for_lesson_extras(@student)
    assert_equal '/', lesson2.next_level_path_for_lesson_extras(@student)
  end

  test 'raise error if lesson with no levels' do
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

    raise = assert_raises do
      Lesson.add_lessons(script, lesson_group, raw_lessons, counters, nil, nil)
    end
    assert_equal 'Lessons must have at least one level in them.  Lesson: Lesson 1.', raise.message
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
        script_levels: [
          {levels: [{name: "Level1"}]},
          {levels: [{name: "Level2"}]}
        ]
      },
      {
        key: "L2",
        name: "Lesson 2",
        script_levels: [
          {levels: [{name: "Level3"}]}
        ]
      },
      {
        key: "L3",
        name: "Lesson 3",
        lockable: true,
        script_levels: [
          {levels: [{name: "Level3"}], assessment: true}
        ]
      }
    ]
    counters = LessonGroup::Counters.new(0, 0, 0, 0)

    lessons = Lesson.add_lessons(script, lesson_group, raw_lessons, counters, nil, nil)

    assert_equal ['L1', 'L2', 'L3'], lessons.map(&:key)
    assert_equal ['Lesson 1', 'Lesson 2', 'Lesson 3'], lessons.map(&:name)
    assert_equal [1, 2, 3], lessons.map(&:absolute_position)
    assert_equal [1, 2, 1], lessons.map(&:relative_position)
    assert_equal lesson_group, lessons[0].lesson_group
    assert_equal 2, lessons[0].script_levels.count
    assert_equal 1, lessons[1].script_levels.count
    assert_equal 1, lessons[2].script_levels.count
    assert_equal true, lessons[2].lockable
    assert_equal LessonGroup::Counters.new(1, 2, 3, 4), counters
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

  def create_swapped_lockable_lesson
    script = create :script
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    level2 = create :level_group, name: 'level2', title: 'title2', submittable: true
    lesson = create :lesson, name: 'lesson1', script: script, lockable: true
    script_level = create :script_level, script: script, levels: [level1, level2], assessment: true, lesson: lesson

    [script, level1, level2, lesson, script_level]
  end
end
