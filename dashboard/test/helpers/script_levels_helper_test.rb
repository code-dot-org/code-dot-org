require 'test_helper'

class ScriptLevelsHelperTest < ActionView::TestCase

  include LocaleHelper
  include ApplicationHelper
  include LevelsHelper

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
end
