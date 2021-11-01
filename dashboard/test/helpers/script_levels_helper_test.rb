require 'test_helper'

class ScriptLevelsHelperTest < ActionView::TestCase
  include LocaleHelper
  include ApplicationHelper
  include LevelsHelper

  setup do
    @teacher = create(:teacher)
    @student = create(:student)
    script = create(:script, lesson_extras_available: true)
    create(:section, user: @teacher, script: script)
    @section = create(:section, user: @teacher, script: script)
    create(:follower, section: @section, student_user: @student)

    # give our test script a more-complex internal hierarchy than the one
    # provided by the factory, so we can test a variety of script_level and
    # lesson relative positions.
    script.lesson_groups << create(:lesson_group) do |lesson_group|
      create_list(:lesson, 3, lesson_group: lesson_group) do |lesson|
        create_list(:script_level, 3, lesson: lesson, script: script)
      end
    end
  end

  test 'tracking_pixel_url' do
    # hoc
    assert_equal '//test.code.org/api/hour/begin_codeorg.png', tracking_pixel_url(Script.get_from_cache(Script::HOC_2013_NAME))

    assert_equal '//test.code.org/api/hour/begin_frozen.png', tracking_pixel_url(Script.get_from_cache(Script::FROZEN_NAME))
    assert_equal '//test.code.org/api/hour/begin_course4.png', tracking_pixel_url(Script.get_from_cache(Script::COURSE4_NAME))
    assert_equal '//test.code.org/api/hour/begin_artist.png', tracking_pixel_url(Script.get_from_cache(Script::ARTIST_NAME))
  end

  test 'hoc_finish_url' do
    # hoc
    assert_equal '//test.code.org/api/hour/finish', Script.get_from_cache(Script::HOC_2013_NAME).hoc_finish_url

    assert_equal '//test.code.org/api/hour/finish/frozen', Script.get_from_cache(Script::FROZEN_NAME).hoc_finish_url
    assert_equal '//test.code.org/api/hour/finish/course4', Script.get_from_cache(Script::COURSE4_NAME).hoc_finish_url
    assert_equal '//test.code.org/api/hour/finish/starwars', Script.get_from_cache(Script::STARWARS_NAME).hoc_finish_url
    assert_equal '//test.code.org/api/hour/finish/artist', Script.get_from_cache(Script::ARTIST_NAME).hoc_finish_url
  end

  test 'script name instead of lesson name in header for HOC' do
    stubs(:current_user).returns(nil)
    script_level = Script.find_by_name(Script::HOC_NAME).get_script_level_by_chapter 1
    assert_equal 'Classic Maze', script_level.lesson.summarize[:title]
  end

  test 'show lesson name in header for multi-lesson script' do
    stubs(:current_user).returns(nil)
    script = Script.find_by_name(Script::COURSE4_NAME)
    script_level = script.get_script_level_by_relative_position_and_puzzle_position 3, 1, false
    assert_equal 'Lesson 3: ' + I18n.t("data.script.name.#{script.name}.lessons.#{script_level.lesson.key}.name"), script_level.lesson.summarize[:title]
  end

  test 'show lesson position in header for default script' do
    stubs(:current_user).returns(nil)
    script_level = Script.twenty_hour_unit.script_levels.fifth
    assert_equal 'Lesson 2: The Maze', script_level.lesson.summarize[:title]
  end

  test 'get End-of-Lesson experience when enabled' do
    stubs(:current_user).returns(@student)
    script = @section.script
    script_level = script.lessons.first.last_progression_script_level
    @section.lesson_extras = true
    @section.save
    response = {}

    script_level_solved_response(response, script_level)
    assert response[:redirect].end_with?('extras')
  end

  test 'do not get End-of-Lesson experience when disabled' do
    stubs(:current_user).returns(@student)
    script = @section.script
    script_level = script.lessons.first.last_progression_script_level
    @section.lesson_extras = false
    @section.save
    response = {}

    script_level_solved_response(response, script_level)
    refute response[:redirect].end_with?('extras')
  end

  test 'get End-of-Lesson experience only for last script_level of lesson' do
    stubs(:current_user).returns(@student)
    script = @section.script
    script_level = script.lessons.first.script_levels.first
    @section.lesson_extras = true
    @section.save
    response = {}

    script_level_solved_response(response, script_level)
    refute response[:redirect].end_with?('extras')
  end

  test 'do not get End-of-Lesson experience for last script_level' do
    stubs(:current_user).returns(@student)
    script = @section.script
    script_level = script.script_levels.last
    @section.lesson_extras = true
    @section.save
    response = {}

    script_level_solved_response(response, script_level)
    refute response[:redirect].end_with?('extras')
  end

  test 'get End-of-Lesson experience only for student of teacher' do
    script = @section.script
    script_level = script.lessons.first.last_progression_script_level
    @section.lesson_extras = true
    @section.save
    response = {}

    stubs(:current_user).returns(@student)
    script_level_solved_response(response, script_level)
    assert response[:redirect].end_with?('extras')
    response = {}

    teacherless_student = create(:student)
    stubs(:current_user).returns(teacherless_student)
    script_level_solved_response(response, script_level)
    refute response[:redirect].end_with?('extras')
    response = {}

    stubs(:current_user).returns(@teacher)
    script_level_solved_response(response, script_level)
    assert response[:redirect].end_with?('extras')
    response = {}

    stubs(:current_user).returns(nil)
    script_level_solved_response(response, script_level)
    refute response[:redirect].end_with?('extras')
    response = {}

    @section.lesson_extras = false
    @section.save
    stubs(:current_user).returns(@teacher)
    script_level_solved_response(response, script_level)
    refute response[:redirect].end_with?('extras')
  end
end
