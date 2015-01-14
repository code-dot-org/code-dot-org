require 'test_helper'

class ScriptLevelsHelperTest < ActionView::TestCase

  include StagesHelper
  include LocaleHelper
  include ApplicationHelper
  include LevelsHelper

  test 'tracking_pixel_url' do
    # hoc
    assert_equal '//test.code.org/api/hour/begin_codeorg.png', tracking_pixel_url(Script.find(Script::HOC_ID))

    assert_equal '//test.code.org/api/hour/begin_frozen.png', tracking_pixel_url(Script.find_by_name('frozen'))
    assert_equal '//test.code.org/api/hour/begin_course4.png', tracking_pixel_url(Script.find_by_name('course4'))
  end

  test 'hoc_finish_url' do
    # hoc
    assert_equal '//test.code.org/api/hour/finish', hoc_finish_url(Script.find(Script::HOC_ID))

    assert_equal '//test.code.org/api/hour/finish/frozen', hoc_finish_url(Script.find_by_name('frozen'))
    assert_equal '//test.code.org/api/hour/finish/course4', hoc_finish_url(Script.find_by_name('course4'))
  end

  test 'script name instead of stage name in header for HOC' do
    self.stubs(:current_user).returns(nil)
    @script = Script.find_by_name(Script::HOC_NAME)
    @script_level = @script.get_script_level_by_chapter 1
    @stage = @script_level.stage
    @game = @script_level.level.game
    assert_equal 'Hour of Code', header_progress[:title]
  end

  test 'show stage name in header for multi-stage script' do
    self.stubs(:current_user).returns(nil)
    @script = Script.find_by_name(Script::COURSE4_NAME)
    @script_level = @script.get_script_level_by_stage_and_position 3, 1
    @stage = @script_level.stage
    @game = @script_level.level.game
    assert_equal 'Stage 3: ' + I18n.t("data.script.name.#{@script.name}.#{@stage.name}"), header_progress[:title]
  end

  test 'show stage position in header for default script' do
    self.stubs(:current_user).returns(nil)
    @script = Script.find(Script::TWENTY_HOUR_ID)
    @script_level = @script.script_levels.fifth
    @stage = @script_level.stage
    @game = @script_level.level.game
    assert_equal "Stage 2: <span class='game-title'>The Maze</span>", header_progress[:title]
  end

end
