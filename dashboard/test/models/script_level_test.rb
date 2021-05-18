require 'test_helper'
require 'cdo/shared_constants'

class ScriptLevelTest < ActiveSupport::TestCase
  include Rails.application.routes.url_helpers
  include SharedConstants

  self.use_transactional_test_case = true

  setup_all do
    @script_level = create(:script_level)
    @script_level2 = create(:script_level)
    @lesson = create(:lesson)
    @lesson2 = create(:lesson)
  end

  test "setup should work" do
    assert_not_nil @script_level.script
    assert_not_nil @script_level.level
  end

  test "should destroy when all related levels are destroyed" do
    @script_level = create(:script_level)
    @script_level.levels << create(:level)
    @script_level.levels[1].destroy
    assert ScriptLevel.exists?(@script_level.id)
    @script_level.levels[0].destroy
    assert_not ScriptLevel.exists?(@script_level.id)
  end

  test "destroying should not destroy related level" do
    @script_level = create(:script_level)
    level = @script_level.level
    @script_level.destroy

    assert Level.exists?(level.id)
  end

  test 'counts puzzle position and total in lesson' do
    # default script
    sl = Script.twenty_hour_script.script_levels[1]
    assert_equal 1, sl.position
    assert_equal 20, sl.lesson_total

    # new script
    sl = create_script_level_with_ancestors
    sl2 = create(:script_level, lesson: sl.lesson, script: sl.script)

    assert_equal 1, sl.position
    assert_equal 2, sl.lesson_total

    assert_equal 2, sl2.position
    assert_equal 2, sl2.lesson_total
  end

  test 'summarize with default route' do
    sl = create_script_level_with_ancestors
    sl2 = create(:script_level, lesson: sl.lesson, script: sl.script)

    summary = sl.summarize
    assert_match Regexp.new("^#{root_url.chomp('/')}/s/bogus-script-[0-9]+/lessons/1/levels/1$"), summary[:url]
    assert_equal false, summary[:previous]
    assert_equal 1, summary[:position]
    assert_equal LEVEL_KIND.puzzle, summary[:kind]
    assert_equal 1, summary[:title]

    summary = sl2.summarize
    assert_match Regexp.new("^#{root_url.chomp('/')}/s/bogus-script-[0-9]+/lessons/1/levels/2$"), summary[:url]
    assert_equal false, summary[:next]
    assert_equal 2, summary[:position]
    assert_equal LEVEL_KIND.puzzle, summary[:kind]
    assert_equal 2, summary[:title]
  end

  test 'summarize with custom route' do
    summary = Script.hoc_2014_script.script_levels.first.summarize
    assert_equal "#{root_url.chomp('/')}/hoc/1", summary[:url]  # Make sure we use the canonical /hoc/1 URL.
    assert_equal false, summary[:previous]
    assert_equal 1, summary[:position]
    assert_equal LEVEL_KIND.puzzle, summary[:kind]
    assert_equal 1, summary[:title]
  end

  test 'named level summarize' do
    sl = create_script_level_with_ancestors({named_level: true})

    summary = sl.summarize
    assert_equal sl.level.name, summary[:name]

    sl.level.display_name = 'Test Display Name Override'
    summary = sl.summarize
    assert_equal 'Test Display Name Override', summary[:name]
  end

  test 'level with progression summarize' do
    sl = create(:script_level)
    sl.update(progression: 'progression 1')

    summary = sl.summarize
    assert_equal sl.progression, summary[:progression]
    assert_equal sl.progression, summary[:progression_display_name]

    with_locale('es-MX') do
      custom_i18n = {
        "data" => {
          "progressions" => {
            sl.progression => 'progresión 1'
          }
        }
      }
      I18n.backend.store_translations 'es-MX', custom_i18n

      summary = sl.summarize
      assert_equal sl.progression, summary[:progression]
      assert_equal 'progresión 1', summary[:progression_display_name]
    end
  end

  test 'teacher panel summarize' do
    sl = create_script_level_with_ancestors

    student = create :student
    create(:user_level, user: student, level: sl.level)

    summary = sl.summarize_for_teacher_panel(student)
    assert_equal sl.assessment, summary[:assessment]
    assert_equal sl.position, summary[:levelNumber]
    assert_equal LEVEL_STATUS.not_tried, summary[:status]
    assert_equal false, summary[:passed]
    assert_equal student.id, summary[:user_id]
  end

  test 'teacher panel summarize with progress on this level in another script' do
    student = create :student
    sl = create_script_level_with_ancestors
    sl_other = create_script_level_with_ancestors({levels: sl.levels})

    User.track_level_progress(
      user_id: student.id,
      level_id: sl_other.levels[0].id,
      script_id: sl_other.script.id,
      new_result: ActivityConstants::BEST_PASS_RESULT,
      submitted: true,
      level_source_id: nil
    )

    summary = sl.summarize_for_teacher_panel(student)
    assert_equal sl.assessment, summary[:assessment]
    assert_equal sl.position, summary[:levelNumber]
    assert_equal LEVEL_STATUS.not_tried, summary[:status]
    assert_equal false, summary[:passed]
    assert_equal student.id, summary[:user_id]
  end

  test 'teacher panel summarize for BubbleChoice level' do
    student = create :student
    sublevel1 = create :level, name: 'choice_1'
    sublevel2 = create :level, name: 'choice_2'
    bubble_choice = create :bubble_choice_level, sublevels: [sublevel1, sublevel2]
    script_level = create_script_level_with_ancestors({levels: [bubble_choice]})

    expected_summary = {
      id: bubble_choice.id.to_s,
      contained: false,
      submitLevel: false,
      paired: nil,
      driver: nil,
      navigator: nil,
      isConceptLevel: false,
      user_id: student.id,
      passed: false,
      status: LEVEL_STATUS.not_tried,
      levelNumber: script_level.position,
      assessment: nil,
      bonus: nil
    }

    # With no progress
    summary = script_level.summarize_for_teacher_panel(student)
    assert_equal expected_summary, summary

    # With progress on a BubbleChoice sublevel
    ul = create :user_level, user: student, level: sublevel1, best_result: 100, script_id: script_level.script.id
    expected_summary[:paired] = false
    expected_summary[:passed] = true
    expected_summary[:status] = LEVEL_STATUS.perfect
    expected_summary.merge!(ul.attributes)
    summary = script_level.summarize_for_teacher_panel(student)
    assert_equal expected_summary, summary
  end

  test 'teacher panel summarize for contained level' do
    student = create :student
    contained_level_1 = create :level, name: 'contained level 1', type: 'FreeResponse'
    level_1 = create :level, name: 'level 1'
    level_1.contained_level_names = [contained_level_1.name]
    sl2 = create_script_level_with_ancestors({levels: [level_1]})

    summary2 = sl2.summarize_for_teacher_panel(student)
    assert_equal sl2.assessment, summary2[:assessment]
    assert_equal sl2.position, summary2[:levelNumber]
    assert_equal LEVEL_STATUS.not_tried, summary2[:status]
    assert_equal false, summary2[:passed]
    assert_equal student.id, summary2[:user_id]
    assert_equal true, summary2[:contained]
  end

  test 'teacher panel summarize for paired level' do
    student = create :student
    student2 = create :student

    sl = create_script_level_with_ancestors
    driver_ul = create(
      :user_level,
      user: student,
      level: sl.level,
      script: sl.script,
      best_result: 100
    )
    navigator_ul = create(
      :user_level,
      user: student2,
      level: sl.level,
      script: sl.script,
      best_result: 100
    )
    create :paired_user_level, driver_user_level: driver_ul, navigator_user_level: navigator_ul

    summary1 = sl.summarize_for_teacher_panel(student)
    summary2 = sl.summarize_for_teacher_panel(student2)
    assert_equal true, summary1[:paired]
    assert_equal true, summary2[:paired]
    assert_equal student.name, summary2[:driver]
    assert_equal student2.name, summary1[:navigator]
  end

  test 'teacher panel summarize for lesson extra' do
    student = create :student
    script_level = create_script_level_with_ancestors({bonus: true})

    summary = ScriptLevel.summarize_as_bonus_for_teacher_panel(script_level.script, [script_level.id], student)
    assert_equal true, summary[:bonus]
    assert_equal LEVEL_STATUS.not_tried, summary[:status]
    assert_equal false, summary[:passed]
    assert_equal student.id, summary[:user_id]
  end

  test 'calling next_level when next level is unplugged skips the level for script without lessons' do
    last_20h_maze_1_level = ScriptLevel.joins(:levels).find_by(levels: {level_num: '2_19'}, script_id: 1)
    first_20h_artist_1_level = ScriptLevel.joins(:levels).find_by(levels: {level_num: '1_1'}, script_id: 1)

    assert_equal first_20h_artist_1_level, last_20h_maze_1_level.next_progression_level
  end

  test 'calling next_level when next level is not unplugged does not skip the level for script without lessons' do
    first_20h_artist_1_level = ScriptLevel.joins(:levels).find_by(levels: {level_num: '1_1'}, script_id: 1)
    second_20h_artist_1_level = ScriptLevel.joins(:levels).find_by(levels: {level_num: '1_2'}, script_id: 1)

    assert_equal second_20h_artist_1_level, first_20h_artist_1_level.next_progression_level
  end

  test 'calling next_level when next level is unplugged skips the level' do
    script = create(:script, name: 's1')
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, absolute_position: 1, lesson_group: lesson_group)
    script_level_first = create(:script_level, script: script, lesson: lesson, position: 1)
    create(:script_level, levels: [create(:unplugged)], script: script, lesson: lesson, position: 2)
    script_level_after = create(:script_level, script: script, lesson: lesson, position: 3)

    assert_equal script_level_after, script_level_first.next_progression_level
  end

  test 'calling next_level when next level is unplugged skips the entire unplugged lesson' do
    script = create(:script, name: 's1')
    lesson_group = create(:lesson_group, script: script)
    first_lesson = create(:lesson, script: script, absolute_position: 1, lesson_group: lesson_group)
    script_level_first = create(:script_level, script: script, lesson: first_lesson, position: 1, chapter: 1)

    unplugged_lesson = create(:lesson, script: script, absolute_position: 2, lesson_group: lesson_group)
    create(:script_level, levels: [create(:unplugged)], script: script, lesson: unplugged_lesson, position: 1, chapter: 2)
    create(:script_level, levels: [create(:match)], script: script, lesson: unplugged_lesson, position: 2, chapter: 3)
    create(:script_level, levels: [create(:match)], script: script, lesson: unplugged_lesson, position: 3, chapter: 4)

    plugged_lesson = create(:lesson, script: script, absolute_position: 3, lesson_group: lesson_group)
    script_level_after = create(:script_level, script: script, lesson: plugged_lesson, position: 1, chapter: 5)

    # make sure everything is in the order we want it to be
    script.reload
    assert_equal [first_lesson, unplugged_lesson, plugged_lesson], script.lessons
    assert_equal script_level_first, script.script_levels.first
    assert_equal script_level_after, script.script_levels.last

    assert_equal script_level_after, script_level_first.next_progression_level
  end

  test 'calling next_level on an unplugged level works' do
    script = create(:script, name: 's1')
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, absolute_position: 1, lesson_group: lesson_group)
    script_level_unplugged = create(:script_level, levels: [create(:unplugged)], script: script, lesson: lesson, position: 1, chapter: 1)
    script_level_after = create(:script_level, script: script, lesson: lesson, position: 2, chapter: 2)

    assert_equal script_level_after, script_level_unplugged.next_level
  end

  test 'calling next_progression_level when next level is spelling_bee skips the level in non-english' do
    script = create(:script, name: 's1')
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, absolute_position: 1, lesson_group: lesson_group)
    first = create(:script_level, script: script, lesson: lesson, position: 1)
    second = create(:script_level, levels: [create(:level, :spelling_bee)], script: script, lesson: lesson, position: 2)
    third = create(:script_level, script: script, lesson: lesson, position: 3)

    I18n.locale = 'non-default-locale'
    assert_equal third, first.next_progression_level

    I18n.locale = I18n.default_locale
    assert_equal second, first.next_progression_level
  end

  test 'calling next_level on an spelling_bee level works in any locale' do
    script = create(:script, name: 's1')
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, absolute_position: 1, lesson_group: lesson_group)
    first = create(:script_level, levels: [create(:level, :spelling_bee)], script: script, lesson: lesson, position: 1, chapter: 1)
    second = create(:script_level, levels: [create(:level, :spelling_bee)], script: script, lesson: lesson, position: 2, chapter: 2)

    I18n.locale = 'non-default-locale'
    assert_equal second, first.next_level

    I18n.locale = I18n.default_locale
    assert_equal second, first.next_level
  end

  test 'calling next_progression_level when next level is spelling_bee skips the entire spelling_bee lesson in non-english' do
    script = create(:script, name: 's1')
    lesson_group = create(:lesson_group, script: script)
    first_lesson = create(:lesson, script: script, absolute_position: 1, lesson_group: lesson_group)
    script_level_first = create(:script_level, script: script, lesson: first_lesson, position: 1, chapter: 1)

    spelling_bee_lesson = create(:lesson, script: script, absolute_position: 2, lesson_group: lesson_group)
    spelling_bee_first = create(:script_level, levels: [create(:level, :spelling_bee)], script: script, lesson: spelling_bee_lesson, position: 1, chapter: 2)
    create(:script_level, levels: [create(:match)], script: script, lesson: spelling_bee_lesson, position: 2, chapter: 3)
    create(:script_level, levels: [create(:match)], script: script, lesson: spelling_bee_lesson, position: 3, chapter: 4)

    non_spelling_bee_lesson = create(:lesson, script: script, absolute_position: 3, lesson_group: lesson_group)
    non_spelling_bee_first = create(:script_level, script: script, lesson: non_spelling_bee_lesson, position: 1, chapter: 5)

    # make sure everything is in the order we want it to be
    script.reload
    assert_equal [first_lesson, spelling_bee_lesson, non_spelling_bee_lesson], script.lessons
    assert_equal script_level_first, script.script_levels.first
    assert_equal non_spelling_bee_first, script.script_levels.last

    I18n.locale = 'non-default-locale'
    assert_equal non_spelling_bee_first, script_level_first.next_progression_level

    I18n.locale = I18n.default_locale
    assert_equal spelling_bee_first, script_level_first.next_progression_level
  end

  test 'calling next_progression_level when next level is hidden skips to next unhidden level' do
    script = create(:script, name: 's1')
    lesson_group = create(:lesson_group, script: script)
    lesson1 = create(:lesson, script: script, absolute_position: 1, lesson_group: lesson_group)
    lesson2 = create(:lesson, script: script, absolute_position: 2, lesson_group: lesson_group)
    lesson3 = create(:lesson, script: script, absolute_position: 3, lesson_group: lesson_group)

    script_level_current = create(:script_level, script: script, lesson: lesson1, position: 1, chapter: 1)
    script_level_hidden1 = create(:script_level, script: script, lesson: lesson2, position: 1, chapter: 2)
    script_level_hidden2 = create(:script_level, script: script, lesson: lesson2, position: 2, chapter: 3)
    script_level_unhidden = create(:script_level, script: script, lesson: lesson3, position: 1, chapter: 4)

    student = create :student
    student.stubs(:script_level_hidden?).with(script_level_current).returns(false)
    student.stubs(:script_level_hidden?).with(script_level_hidden1).returns(true)
    student.stubs(:script_level_hidden?).with(script_level_hidden2).returns(true)
    student.stubs(:script_level_hidden?).with(script_level_unhidden).returns(false)

    assert_equal script_level_unhidden, script_level_current.next_progression_level(student)
  end

  test 'calling next_progression_level when next level is locked skips to next unlocked level' do
    script = create(:script, name: 's1')
    lesson_group = create(:lesson_group, script: script)
    lesson1 = create(:lesson, script: script, absolute_position: 1, lesson_group: lesson_group)
    lesson2 = create(:lesson, script: script, absolute_position: 2, lockable: true, lesson_group: lesson_group)
    lesson3 = create(:lesson, script: script, absolute_position: 3, lesson_group: lesson_group)

    script_level_current = create(:script_level, script: script, lesson: lesson1, position: 1, chapter: 1)
    create(:script_level, script: script, lesson: lesson2, position: 1, chapter: 2)
    create(:script_level, script: script, lesson: lesson2, position: 2, chapter: 3)
    script_level_unlocked = create(:script_level, script: script, lesson: lesson3, position: 1, chapter: 4)

    student = create :student

    assert_equal script_level_unlocked, script_level_current.next_progression_level(student)
  end

  test 'next_level_or_redirect_path_for_user does not skip over next unplugged level from unplugged level' do
    script = create(:script, name: 's1')
    lesson_group = create(:lesson_group, script: script)

    levels = [
      create(:level, game: Game.find_by_app(Game::UNPLUG)),
      create(:level, game: Game.find_by_app(Game::UNPLUG)),
      create(:level)
    ]

    script_levels = levels.map.with_index(1) do |level, pos|
      lesson = create(:lesson, script: script, absolute_position: pos, lesson_group: lesson_group)
      create(:script_level, script: script, lesson: lesson, position: pos, chapter: pos, levels: [level])
    end

    student = create :student

    assert_equal script_levels[1].path, script_levels[0].next_level_or_redirect_path_for_user(student)
  end

  test 'next_level_or_redirect_path_for_user does not skip over next bee level from bee level' do
    script = create(:script, name: 's1')
    lesson_group = create(:lesson_group, script: script)

    levels = [
      create(:level, :spelling_bee),
      create(:level, :spelling_bee),
      create(:level)
    ]

    script_levels = levels.map.with_index(1) do |level, pos|
      lesson = create(:lesson, script: script, absolute_position: pos, lesson_group: lesson_group)
      create(:script_level, script: script, lesson: lesson, position: pos, chapter: pos, levels: [level])
    end

    student = create :student
    I18n.locale = 'non-default-locale'
    assert_equal script_levels[1].path, script_levels[0].next_level_or_redirect_path_for_user(student)
  end

  test 'next_level_or_redirect_path_for_user does skip over hidden levels from unplugged level' do
    script = create(:script, name: 's1')
    lesson_group = create(:lesson_group, script: script)
    levels = [
      create(:level, game: Game.find_by_app(Game::UNPLUG)),
      create(:level),
      create(:level),
      create(:level)
    ]

    script_levels = levels.map.with_index(1) do |level, pos|
      lesson = create(:lesson, script: script, absolute_position: pos, lesson_group: lesson_group)
      create(:script_level, script: script, lesson: lesson, position: pos, chapter: pos, levels: [level])
    end

    student = create :student
    student.stubs(:script_level_hidden?).with(script_levels[0]).returns(false)
    student.stubs(:script_level_hidden?).with(script_levels[1]).returns(true)
    student.stubs(:script_level_hidden?).with(script_levels[2]).returns(true)
    student.stubs(:script_level_hidden?).with(script_levels[3]).returns(false)

    # unplugged level, followed by hidden level. we should skip over hidden level
    assert_equal script_levels[3].path, script_levels[0].next_level_or_redirect_path_for_user(student)
  end

  test 'next_level_or_redirect_path_for_user returns to lesson extras for bonus levels' do
    script_level = create_script_level_with_ancestors({bonus: true})
    assert_equal "/s/#{script_level.script.name}/lessons/1/extras", script_level.next_level_or_redirect_path_for_user(nil)
  end

  test 'next_level_or_redirect_path_for_user returns to bubble choice activity page for BubbleChoice levels' do
    script_level = create_script_level_with_ancestors({levels: [create(:bubble_choice_level)]})
    assert_equal "/s/#{script_level.script.name}/lessons/1/levels/1", script_level.next_level_or_redirect_path_for_user(nil)
  end

  test 'end of stage' do
    script = Script.find_by_name('course1')

    assert script.lessons[0].script_levels.last.end_of_lesson?
    assert script.lessons[1].script_levels.last.end_of_lesson?
    assert script.lessons[2].script_levels.last.end_of_lesson?
    assert script.lessons[3].script_levels.last.end_of_lesson?
    refute script.lessons[3].script_levels.first.end_of_lesson?
    refute script.lessons[3].script_levels[1].end_of_lesson?
  end

  test 'cached_find' do
    script_level = ScriptLevel.cache_find(Script.twenty_hour_script.script_levels[0].id)
    assert_equal(Script.twenty_hour_script.script_levels[0], script_level)

    script_level2 = ScriptLevel.cache_find(Script.course1_script.script_levels.last.id)
    assert_equal(Script.course1_script.script_levels.last, script_level2)

    # Make sure that we can also locate a newly created level.
    script_level3 = create(:script_level)
    assert_equal(script_level3, ScriptLevel.cache_find(script_level3.id))
  end

  test 'has another level answers appropriately for professional learning courses' do
    create_fake_plc_data

    assert @script_level1.has_another_level_to_go_to?
    assert_not @script_level2.has_another_level_to_go_to?
  end

  test 'redirects appropriately for professional learning courses' do
    create_fake_plc_data

    assert_equal script_preview_assignments_path(@plc_script), @evaluation_script_level.next_level_or_redirect_path_for_user(@user)
    @unit_assignment.destroy
    assert_equal script_lesson_script_level_path(@plc_script, @lesson, @script_level2.position), @evaluation_script_level.next_level_or_redirect_path_for_user(@user)

    assert_equal script_lesson_script_level_path(@plc_script, @lesson, @evaluation_script_level.position), @script_level1.next_level_or_redirect_path_for_user(@user)
    assert_equal script_path(@plc_script), @script_level2.next_level_or_redirect_path_for_user(@user)
  end

  test 'redirects back to correct lesson extras from bonus level' do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson1 = create :lesson, lesson_group: lesson_group, script: script
    lesson2 = create :lesson, lesson_group: lesson_group, script: script
    script_level = create :script_level, lesson: lesson1, script: script, bonus: true

    assert_equal script_lesson_extras_path(script.name, lesson2.absolute_position),
      script_level.next_level_or_redirect_path_for_user(@user, lesson2)
  end

  test 'can view my last attempt for regular levelgroup' do
    level = create :level_group, name: 'LevelGroupLevel', type: 'LevelGroup'
    level.properties['title'] = 'Survey'
    level.save!

    script_level = create_script_level_with_ancestors({levels: [level], assessment: true})

    student = create :student

    refute script_level.should_hide_survey(student, nil)
  end

  test 'can view other user last attempt for regular levelgroup' do
    level = create :level_group, name: 'LevelGroupLevel', type: 'LevelGroup'
    level.properties['title'] = 'Survey'
    level.save!

    script_level = create_script_level_with_ancestors({levels: [level], assessment: true})

    teacher = create :teacher
    student = create :student

    refute script_level.should_hide_survey(teacher, student)
  end

  test 'student can view last attempt for anonymous levelgroup' do
    level = create :level_group, name: 'LevelGroupLevel', type: 'LevelGroup'
    level.properties['title'] = 'Survey'
    level.properties['anonymous'] = 'true'
    level.save!

    script_level = create_script_level_with_ancestors({levels: [level], assessment: true})

    student = create :student

    refute script_level.should_hide_survey(student, nil)
  end

  test 'teacher can view last attempt for anonymous levelgroup' do
    level = create :level_group, name: 'LevelGroupLevel', type: 'LevelGroup'
    level.properties['title'] = 'Survey'
    level.properties['anonymous'] = 'true'
    level.save!

    script_level = create_script_level_with_ancestors({levels: [level], assessment: true})

    teacher = create :teacher

    refute script_level.should_hide_survey(teacher, nil)
  end

  test 'anonymous can view last attempt for anonymous levelgroup' do
    level = create :level_group, name: 'LevelGroupLevel', type: 'LevelGroup'
    level.properties['title'] = 'Survey'
    level.properties['anonymous'] = 'true'
    level.save!

    script_level = create_script_level_with_ancestors({levels: [level], assessment: true})

    refute script_level.should_hide_survey(nil, nil)
  end

  test 'can not view other user last attempt for anonymous levelgroup' do
    level = create :level_group, name: 'LevelGroupLevel', type: 'LevelGroup'
    level.properties['title'] = 'Survey'
    level.properties['anonymous'] = 'true'
    level.save!

    script_level = create_script_level_with_ancestors({levels: [level], assessment: true})

    student = create :student
    teacher = create :teacher

    assert script_level.should_hide_survey(teacher, student)
  end

  test 'anonymous levels must be assessments' do
    level = create :level_group, name: 'LevelGroupLevel', type: 'LevelGroup'
    level.properties['title'] = 'Survey'
    level.properties['anonymous'] = 'true'
    level.save!

    script_level = create_script_level_with_ancestors({levels: [level], assessment: true})

    assert_raises do
      script_level.assessment = false
      script_level.save!
    end
  end

  test 'bonus levels do not appear in the normal progression' do
    script_level = create_script_level_with_ancestors({bonus: true})
    assert_empty script_level.lesson.summarize[:levels]
  end

  test 'hidden_for_section returns true if lesson is hidden' do
    script_level = create_script_level_with_ancestors
    section = create :section

    create :section_hidden_lesson, lesson: script_level.lesson, section: section

    assert_equal true, script_level.hidden_for_section?(section.id)
  end

  test 'hidden_for_section returns true if script is hidden' do
    script_level = create_script_level_with_ancestors
    section = create :section

    create :section_hidden_script, script: script_level.script, section: section

    assert_equal true, script_level.hidden_for_section?(section.id)
  end

  test 'hidden_for_section returns false if no hidden lesson/script' do
    script_level = create_script_level_with_ancestors
    section = create :section

    assert_equal false, script_level.hidden_for_section?(section.id)
  end

  def create_script_level_with_ancestors(script_level_attributes = nil)
    script_level_attributes ||= {}
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    create :script_level, script: script, lesson: lesson, **script_level_attributes
  end

  test 'seeding_key without existing level_keys' do
    script_level = create_script_level_with_ancestors
    script_level.reload # reload to clear out any already loaded association data, to verify query counts later
    script = script_level.script
    seed_context = create_seed_context(script)
    # With no existing level_keys property on the script_level, we need additional data from the SeedContext
    seed_context.levels = script.levels.to_a
    seed_context.levels_script_levels = script.levels_script_levels.to_a

    seeding_key = nil
    # Important to minimize queries in seeding_key, since it's called for each ScriptLevel during seeding.
    # Right now, for blockly levels, we need to make 1 to get the game name. This could be avoided with a little more work.
    assert_queries(1) {seeding_key = script_level.seeding_key(seed_context)}

    expected = {
      "script_level.level_keys" => [script_level.levels.first.key],
      "lesson.key" => script_level.lesson.key,
      "lesson_group.key" => script_level.lesson.lesson_group.key,
      "script.name" => script.name
    }

    assert_equal expected, seeding_key
  end

  test 'seeding_key with existing level_keys' do
    script_level = create_script_level_with_ancestors
    script_level.update!(level_keys: [script_level.levels.first.name])
    script_level.reload # reload to clear out any already loaded association data, to verify query counts later
    seed_context = create_seed_context(script_level.script)

    seeding_key = nil
    # Important to minimize queries in seeding_key, since it's called for each ScriptLevel during seeding.
    assert_queries(0) {seeding_key = script_level.seeding_key(seed_context)}

    assert_equal [script_level.levels.first.name], seeding_key['script_level.level_keys']
  end

  test 'seeding_key with use_existing_level_keys false' do
    script_level = create_script_level_with_ancestors
    script_level.update!(level_keys: ['wrong-level-key']) # This value should be ignored in this case
    script_level.reload # reload to clear out any already loaded association data, to verify query counts later
    script = script_level.script
    seed_context = create_seed_context(script)
    # Since we are not using existing level_keys property on the script_level, we need additional data from the SeedContext
    seed_context.levels = script.levels.to_a
    seed_context.levels_script_levels = script.levels_script_levels.to_a

    seeding_key = nil
    # Important to minimize queries in seeding_key, since it's called for each ScriptLevel during seeding.
    # Right now, for blockly levels, we need to make 1 to get the game name. This could be avoided with a little more work.
    assert_queries(1) {seeding_key = script_level.seeding_key(seed_context, false)}

    assert_equal [script_level.levels.first.key], seeding_key['script_level.level_keys']
  end

  test 'LevelsScriptLevel seeding_key' do
    script_level = create_script_level_with_ancestors
    script_level.update!(level_keys: [script_level.levels.first.key])
    script_level.reload # reload to clear out any already loaded association data, to verify query counts later
    script = script_level.script
    seed_context = create_seed_context(script)
    seed_context.script_levels = script.script_levels.to_a
    seed_context.levels = script.levels.to_a
    lsl = script_level.levels_script_levels.first

    seeding_key = nil
    # Important to minimize queries in seeding_key, since it's called for each ScriptLevel during seeding.
    # Right now, for blockly levels, we need to make 1 to get the game name. This could be avoided with a little more work.
    assert_queries(1) {seeding_key = lsl.seeding_key(seed_context)}

    expected = {
      "level.key" => lsl.level.key,
      "script_level.level_keys" => [lsl.level.key],
      "lesson.key" => script_level.lesson.key,
      "lesson_group.key" => script_level.lesson.lesson_group.key,
      "script.name" => script.name
    }

    assert_equal expected, seeding_key
  end

  def create_seed_context(script)
    Services::ScriptSeed::SeedContext.new(
      script: script,
      lesson_groups: script.lesson_groups.to_a,
      lessons: script.lessons.to_a,
      lesson_activities: [],
      activity_sections: []
    )
  end

  class ValidProgressionLevelTests < ActiveSupport::TestCase
    setup do
      @student = create :student
      @teacher = create :teacher
      @levelbuilder = create :levelbuilder

      Timecop.freeze(Time.new(2020, 3, 27, 0, 0, 0, "-07:00"))

      level = create :maze, name: 'visible after level', level_num: 'custom'
      script_with_visible_after_lessons = create :script
      lesson_group = create :lesson_group, script: script_with_visible_after_lessons

      lesson_future_visible_after = create :lesson, name: 'lesson future', script: script_with_visible_after_lessons, lesson_group: lesson_group, visible_after: '2020-04-01 08:00:00 -0700'
      @script_level_future_visible_after = create :script_level, levels: [level], lesson: lesson_future_visible_after, script: script_with_visible_after_lessons

      lesson_past_visible_after = create :lesson, name: 'lesson past', script: script_with_visible_after_lessons, lesson_group: lesson_group, visible_after: '2020-03-01 08:00:00 -0700'
      @script_level_past_visible_after = create :script_level, levels: [level], lesson: lesson_past_visible_after, script: script_with_visible_after_lessons

      lesson_no_visible_after = create :lesson, name: 'lesson no', script: script_with_visible_after_lessons,  lesson_group: lesson_group
      @script_level_no_visible_after = create :script_level, levels: [level], lesson: lesson_no_visible_after, script: script_with_visible_after_lessons
    end

    teardown do
      Timecop.return
    end

    test 'valid_progression_level returns true for levelbuilder' do
      assert @script_level_future_visible_after.valid_progression_level?(@levelbuilder)
      assert @script_level_past_visible_after.valid_progression_level?(@levelbuilder)
      assert @script_level_no_visible_after.valid_progression_level?(@levelbuilder)
    end

    test 'valid_progression_level returns true for script level in lesson with past visible after date' do
      assert @script_level_past_visible_after.valid_progression_level?(@teacher)
      assert @script_level_past_visible_after.valid_progression_level?(@student)
      assert @script_level_past_visible_after.valid_progression_level?(nil)
    end

    test 'valid_progression_level returns true for script level in lesson with no visible after date' do
      assert @script_level_past_visible_after.valid_progression_level?(@teacher)
      assert @script_level_past_visible_after.valid_progression_level?(@student)
      assert @script_level_past_visible_after.valid_progression_level?(nil)
    end

    test 'valid_progression_level returns false for script level in lesson with future visible after date' do
      refute @script_level_future_visible_after.valid_progression_level?(@teacher)
      refute @script_level_future_visible_after.valid_progression_level?(@student)
      refute @script_level_future_visible_after.valid_progression_level?(nil)
    end
  end

  test 'validates activity section lesson' do
    lesson = create :lesson
    lesson_activity = create :lesson_activity, lesson: lesson
    activity_section = create :activity_section, lesson_activity: lesson_activity
    other_lesson = create :lesson

    # can create script level with no activity section
    script_level = create :script_level, lesson: lesson
    assert_nil script_level.activity_section

    # can create script level with matching lessons
    script_level = create :script_level, lesson: lesson, activity_section: activity_section, activity_section_position: 1
    assert_equal lesson, script_level.activity_section.lesson

    # cannot create script level with mismatched lessons
    error = assert_raises ActiveRecord::RecordInvalid do
      create :script_level, lesson: other_lesson, activity_section: activity_section, activity_section_position: 1
    end
    assert_equal 'Validation failed: Script level activity_section.lesson does not match lesson', error.message
  end

  test 'adds variant to custom level in migrated script' do
    Rails.application.config.stubs(:levelbuilder_mode).returns false

    script = create :script, is_migrated: true
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    level1 = create :level, level_num: 'custom'
    level2 = create :level, level_num: 'custom'
    script_level = create :script_level, script: script, lesson: lesson, levels: [level1]
    assert_equal level1, script_level.oldest_active_level
    assert script_level.active?(level1)

    script_level.add_variant level2
    script_level.reload
    assert_equal [level1, level2], script_level.levels
    assert_equal [level1.key, level2.key], script_level.level_keys
    assert_equal level2, script_level.oldest_active_level
    assert script_level.active?(level2)
    refute script_level.active?(level1)

    level3 = create :level
    e = assert_raises do
      script_level.add_variant level3
    end
    assert_includes e.message, "expected 1 existing level"
  end

  # variants do not appear to work for non-custom levels
  test 'cannot add variant to non custom level' do
    Rails.application.config.stubs(:levelbuilder_mode).returns false

    script = create :script, is_migrated: true
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    level1 = create :level
    level2 = create :level
    script_level = create :script_level, script: script, lesson: lesson, levels: [level1]
    assert_equal level1, script_level.oldest_active_level
    assert script_level.active?(level1)

    e = assert_raises do
      script_level.add_variant level2
    end
    assert_equal "cannot add variant to non-custom level", e.message
  end

  test 'cannot add variant to legacy script' do
    Rails.application.config.stubs(:levelbuilder_mode).returns false

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    level1 = create :level, level_num: 'custom'
    level2 = create :level, level_num: 'custom'
    script_level = create :script_level, script: script, lesson: lesson, levels: [level1]
    assert_equal level1, script_level.oldest_active_level

    e = assert_raises do
      script_level.add_variant level2
    end
    assert_equal "can only be used on migrated scripts", e.message
  end

  private

  def create_fake_plc_data
    @plc_course_unit = create(:plc_course_unit)
    @plc_script = @plc_course_unit.script
    @plc_script.update(professional_learning_course: 'My course name')
    @lesson_group = create(:lesson_group, script: @plc_script)
    @lesson = create(:lesson, script: @plc_script, lesson_group: @lesson_group)
    @level1 = create(:maze)
    create(:evaluation_multi, name: 'Evaluation Multi')
    evaluation_level_dsl = <<~DSL
      name 'Evaluation Quiz'
      title 'Evaluation Quiz'
      page
      level 'Evaluation Multi'
    DSL
    @evaluation_level = LevelGroup.create_from_level_builder({}, {name: 'Evaluation Quiz', dsl_text: evaluation_level_dsl})
    @level2 = create(:maze)
    @script_level1 = create(:script_level, script: @plc_script, lesson: @lesson, position: 1, levels: [@level1], chapter: 1)
    @evaluation_script_level = create(:script_level, script: @plc_script, lesson: @lesson, position: 2, levels: [@evaluation_level], chapter: 2)
    @script_level2 = create(:script_level, script: @plc_script, lesson: @lesson, position: 3, levels: [@level2], chapter: 3)
    @user = create :teacher
    user_course_enrollment = create(:plc_user_course_enrollment, plc_course: @plc_course_unit.plc_course, user: @user)
    @unit_assignment = create(:plc_enrollment_unit_assignment, plc_user_course_enrollment: user_course_enrollment, plc_course_unit: @plc_course_unit, user: @user)
  end
end
