require 'test_helper'

class LevelsHelperTest < ActionView::TestCase
  include LocaleHelper

  setup do
    @maze_data = {:game_id=>25, :user_id => 1, :name=>"__bob4", :level_num=>"custom", :skin=>"birds", :instructions=>"sdfdfs"}
    @level = Maze.create(@maze_data)
  end

  test "should parse maze level with non string array" do
    @level.properties["maze"] = [[0, 0], [2, 3]]
    options = blockly_options
    assert (options[:level]["map"].is_a? Array), "Maze is not an array"

    @level.properties["maze"] = @level.properties["maze"].to_s
    options = blockly_options
    assert (options[:level]["map"].is_a? Array), "Maze is not an array"
  end

  test "change default level localization after locale switch" do
    DEFAULT_LOCALE = 'en-us'
    NEW_LOCALE = 'de-de'
    @level.instructions = nil
    @level.level_num = '2_2'
    I18n.locale = DEFAULT_LOCALE
    options = blockly_options
    assert_equal I18n.t('data.level.instructions.maze_2_2', locale: DEFAULT_LOCALE), options[:level]['instructions']

    I18n.locale = NEW_LOCALE
    options = blockly_options
    assert_equal I18n.t('data.level.instructions.maze_2_2', locale: NEW_LOCALE), options[:level]['instructions']
    I18n.locale = DEFAULT_LOCALE
  end

  test "display custom level instructions instead of localized string" do
    @level.instructions = 'custom instructions'
    @level.level_num = '2_2'
    options = blockly_options
    assert_equal 'custom instructions', options[:level]['instructions']
  end

  test "leave non-coercible strings alone" do
    assert_equal "test", blockly_value('test')
  end

  test "force integer strings to integers" do
    assert_equal 5, blockly_value('5')
    assert_equal -5, blockly_value('-5')
    assert_equal 0, blockly_value('0')
  end

  test "force float strings to floats" do
    assert_equal 5.00001, blockly_value('5.00001')
    assert_equal -5.00001, blockly_value('-5.00001')
  end

  test "force boolean strings to boolean" do
    assert_equal false, blockly_value('false')
    assert_equal true, blockly_value('true')
  end

  test "get video choices" do
    choices_cached = video_key_choices
    assert_equal(choices_cached.count, Video.count)
    Video.all.each{|video| assert_includes(choices_cached, video.key)}
  end

  test "blockly options converts 'impressive' => 'false' to 'impressive => false'" do
    @level = create :artist
    @script_level = create :script_level, level: @level
    @level.impressive = "false"
    @level.free_play = "false"

    options = blockly_options

    assert_equal false, options[:level]['impressive']
    assert_equal false, options[:level]['freePlay']
  end

  test "custom callouts" do
    @level.level_num = 'custom'
    @level.callout_json = '[{"localization_key": "run", "element_id": "#runButton"}]'

    callouts = select_and_remember_callouts
    assert_equal 1, callouts.count
    assert_equal '#runButton', callouts[0]['element_id']
    assert_equal 'Hit "Run" to try your program', callouts[0]['localized_text']

    callouts = select_and_remember_callouts
    assert_equal 0, callouts.count
  end

  test "should select only callouts for current script level" do
    script = create(:script)
    @level = create(:level, :blockly, user_id: nil)
    stage = create(:stage, script: script)
    @script_level = create(:script_level, script: script, level: @level, stage: stage)

    callout1 = create(:callout, script_level: @script_level)
    callout2 = create(:callout, script_level: @script_level)
    irrelevant_callout = create(:callout)

    callouts = select_and_remember_callouts

    assert callouts.any? { |callout| callout['id'] == callout1.id }
    assert callouts.any? { |callout| callout['id'] == callout2.id }
    assert callouts.none? { |callout| callout['id'] == irrelevant_callout.id }
  end

  test "should localize callouts" do
    script = create(:script)
    @level = create(:level, :blockly, user_id: nil)
    stage = create(:stage, script: script)
    @script_level = create(:script_level, script: script, level: @level, stage: stage)

    create(:callout, script_level: @script_level, localization_key: 'run')

    callouts = select_and_remember_callouts

    assert callouts.any?{ |c| c['localized_text'] == 'Hit "Run" to try your program'}
  end
end
