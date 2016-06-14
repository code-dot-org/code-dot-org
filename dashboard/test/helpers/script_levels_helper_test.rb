require 'test_helper'

class ScriptLevelsHelperTest < ActionView::TestCase

  include LocaleHelper
  include ApplicationHelper
  include LevelsHelper

  setup do
    @teacher = create(:teacher)
    @student = create(:student)
    script = Script.find_by_name(Script::COURSE4_NAME)
    @section = create(:section, user: @teacher, script: script)
    create(:follower, section: @section, student_user: @student)
  end

  test 'tracking_pixel_url' do
    # hoc
    assert_equal '//test.code.org/api/hour/begin_codeorg.png', tracking_pixel_url(Script.get_from_cache(Script::HOC_2013_NAME))

    assert_equal '//test.code.org/api/hour/begin_frozen.png', tracking_pixel_url(Script.get_from_cache(Script::FROZEN_NAME))
    assert_equal '//test.code.org/api/hour/begin_course4.png', tracking_pixel_url(Script.get_from_cache(Script::COURSE4_NAME))
    assert_equal '//test.code.org/api/hour/begin_artist.png', tracking_pixel_url(Script.get_from_cache(Script::ARTIST_NAME))
    assert_equal '//test.code.org/api/hour/begin_infinity.png', tracking_pixel_url(Script.get_from_cache(Script::INFINITY_NAME))
  end

  test 'hoc_finish_url' do
    # hoc
    assert_equal '//test.code.org/api/hour/finish', Script.get_from_cache(Script::HOC_2013_NAME).hoc_finish_url

    assert_equal '//test.code.org/api/hour/finish/frozen', Script.get_from_cache(Script::FROZEN_NAME).hoc_finish_url
    assert_equal '//test.code.org/api/hour/finish/course4', Script.get_from_cache(Script::COURSE4_NAME).hoc_finish_url
    assert_equal '//test.code.org/api/hour/finish/starwars', Script.get_from_cache(Script::STARWARS_NAME).hoc_finish_url
    assert_equal '//test.code.org/api/hour/finish/infinity', Script.get_from_cache(Script::INFINITY_NAME).hoc_finish_url
    assert_equal '//test.code.org/api/hour/finish/artist', Script.get_from_cache(Script::ARTIST_NAME).hoc_finish_url
  end

  test 'script name instead of stage name in header for HOC' do
    self.stubs(:current_user).returns(nil)
    script_level = Script.find_by_name(Script::HOC_NAME).get_script_level_by_chapter 1
    assert_equal 'Classic Maze', script_level.stage.summarize[:title]
  end

  test 'show stage name in header for multi-stage script' do
    self.stubs(:current_user).returns(nil)
    script = Script.find_by_name(Script::COURSE4_NAME)
    script_level = script.get_script_level_by_stage_and_position 3, 1
    assert_equal 'Stage 3: ' + I18n.t("data.script.name.#{script.name}.#{script_level.stage.name}"), script_level.stage.summarize[:title]
  end

  test 'show stage position in header for default script' do
    self.stubs(:current_user).returns(nil)
    script_level = Script.twenty_hour_script.script_levels.fifth
    assert_equal 'Stage 2: The Maze', script_level.stage.summarize[:title]
  end

  test 'get End-of-Stage experience when enabled' do
    self.stubs(:current_user).returns(@student)
    script = @section.script
    script_level = script.get_script_level_by_stage_and_position 2, 9
    assert script_level.end_of_stage?, 'bad script_level selected for test'
    @section.stage_extras = true
    @section.save
    response = {}

    script_level_solved_response(response, script_level)
    assert_equal true, response[:end_of_stage_experience]
  end

  test 'do not get End-of-Stage experience when disabled' do
    self.stubs(:current_user).returns(@student)
    script = @section.script
    script_level = script.get_script_level_by_stage_and_position 2, 9
    assert script_level.end_of_stage?, 'bad script_level selected for test'
    @section.stage_extras = false
    @section.save
    response = {}

    script_level_solved_response(response, script_level)
    assert_equal false, response[:end_of_stage_experience]
  end

  test 'get End-of-Stage experience only for end of stage' do
    self.stubs(:current_user).returns(@student)
    script = @section.script
    script_level = script.get_script_level_by_stage_and_position 2, 8
    assert_equal false, script_level.end_of_stage?, 'bad script_level selected for test'
    @section.stage_extras = true
    @section.save
    response = {}

    script_level_solved_response(response, script_level)
    assert_nil response[:end_of_stage_experience]
  end

  test 'get End-of-Stage experience only for student of teacher' do
    script = @section.script
    script_level = script.get_script_level_by_stage_and_position 2, 9
    assert script_level.end_of_stage?, 'bad script_level selected for test'
    @section.stage_extras = true
    @section.save
    response = {}

    self.stubs(:current_user).returns(@student)
    script_level_solved_response(response, script_level)
    assert response[:end_of_stage_experience]

    teacherless_student = create(:student)
    self.stubs(:current_user).returns(teacherless_student)
    script_level_solved_response(response, script_level)
    assert_nil response[:end_of_stage_experience]

    self.stubs(:current_user).returns(@teacher)
    script_level_solved_response(response, script_level)
    assert_nil response[:end_of_stage_experience]

    self.stubs(:current_user).returns(nil)
    script_level_solved_response(response, script_level)
    assert_nil response[:end_of_stage_experience]
  end
end
