require 'test_helper'

class LevelsHelperTest < ActionView::TestCase
  include Devise::TestHelpers
  include LocaleHelper

  def sign_in(user)
    # override the default sign_in helper because we don't actually have a request or anything here
    self.stubs(:current_user).returns user
  end

  setup do
    @level = create(:maze, level_num: 'custom')

    def request
      OpenStruct.new(
        env: {},
        headers: OpenStruct.new('User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36')
      )
    end

    self.stubs(:current_user).returns nil
  end

  test "blockly_options refuses to generate options for non-blockly levels" do
    @level = create(:match)
    assert_raises(ArgumentError) do
      blockly_options
    end
  end

  test "should parse maze level with non string array" do
    @level.properties["maze"] = [[0, 0], [2, 3]]
    options = blockly_options
    assert options[:level]["map"].is_a?(Array), "Maze is not an array"

    @level.properties["maze"] = @level.properties["maze"].to_s
    options = blockly_options
    assert options[:level]["map"].is_a?(Array), "Maze is not an array"
  end

  test "non-custom level displays localized instruction after locale switch" do
    default_locale = 'en-us'
    new_locale = 'es-es'
    @level.instructions = nil
    @level.user_id = nil
    @level.level_num = '2_2'

    I18n.locale = default_locale
    options = blockly_options
    assert_equal I18n.t('data.level.instructions.maze_2_2', locale: default_locale), options[:level]['instructions']

    I18n.locale = new_locale
    options = blockly_options
    assert_equal I18n.t('data.level.instructions.maze_2_2', locale: new_locale), options[:level]['instructions']
    I18n.locale = default_locale
  end

  test "custom level displays english instruction" do
    default_locale = 'en-us'
    @level.name = 'frozen line'

    I18n.locale = default_locale
    options = blockly_options
    assert_equal @level.instructions, options[:level]['instructions']
  end

  test "custom level displays localized instruction if exists" do
    default_locale = 'en-us'
    new_locale = 'es-es'

    I18n.locale = new_locale
    @level.name = 'frozen line'
    options = blockly_options
    assert_equal I18n.t("data.instructions.#{@level.name}_instruction", locale: new_locale), options[:level]['instructions']

    @level.name = 'this_level_doesnt_exist'
    options = blockly_options
    assert_equal @level.instructions, options[:level]['instructions']
    I18n.locale = default_locale
  end

  test "get video choices" do
    choices_cached = video_key_choices
    assert_equal(choices_cached.count, Video.count)
    Video.all.each{|video| assert_includes(choices_cached, video.key)}
  end

  test "blockly options converts 'impressive' => 'false' to 'impressive => false'" do
    @level = create :artist
    @stage = create :stage
    @script_level = create :script_level, level: @level, stage: @stage
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

  test 'app_options returns camelCased view option on Blockly level' do
    @level.start_blocks = '<test/>'
    options = app_options
    assert_equal '<test/>', options[:level]['startBlocks']
  end

  test "embedded-freeplay level doesn't remove header and footer" do
    @level.embed = true
    app_options
    assert_equal nil, view_options[:no_header]
    assert_equal nil, view_options[:no_footer]
  end

  test 'Blockly#blockly_options not modified by levels helper' do
    level = create(:level, :blockly, :with_autoplay_video)
    blockly_options = level.blockly_options

    @level = level
    app_options

    assert_equal blockly_options, level.blockly_options
  end

  test 'app_options sets a channel' do
    user = create :user
    sign_in user

    set_channel
    channel = @view_options[:channel]
    # Request it again, should get the same channel
    set_channel
    assert_equal channel, @view_options[:channel]

    # Request it for a different level, should get a different channel
    @level = create :level, :blockly
    set_channel
    assert_not_equal channel, @view_options[:channel]
  end

  test 'applab levels should have channels' do
    user = create :user
    sign_in user

    @level = create :applab

    set_channel

    assert_not_nil app_options['channel']
  end

  test 'applab levels should not load channel when viewing student solution of a student without a channel' do
    # two different users
    @user = create :user
    sign_in create(:user)

    @level = create :applab

    # channel does not exist
    set_channel
    assert_nil app_options['channel']
  end

  test 'applab levels should load channel when viewing student solution of a student with a channel' do
    # two different users
    @user = create :user
    sign_in create(:user)

    @level = create :applab

    # channel exists
    ChannelToken.create!(level: @level, user: @user, channel: 'whatever')
    set_channel
    assert_equal 'whatever', app_options['channel']
  end

  def stub_country(code)
    req = request
    req.location = OpenStruct.new country_code: code
    self.stubs(:request).returns(req)
  end

  test 'send to phone enabled for US' do
    stub_country 'US'
    assert app_options[:sendToPhone]
  end

  test 'send to phone disabled for non-US' do
    stub_country 'RU'
    refute app_options[:sendToPhone]
  end

  test 'send_to_phone_url provided when send to phone enabled' do
    stub_country 'US'
    assert_equal 'http://test.host/sms/send', app_options[:send_to_phone_url]
  end

  test 'submittable level is submittable for student with teacher' do
    @level = create(:applab, submittable: true)

    user = create(:follower).student_user
    sign_in user

    app_options = self.app_options # ha

    assert_equal true, app_options[:level]['submittable']
  end

  test 'submittable level is not submittable for student without teacher' do
    @level = create(:applab, submittable: true)

    user = create :student
    sign_in user

    app_options = self.app_options # ha
    assert_equal false, app_options[:level]['submittable']
  end

  test 'submittable level is not submittable for non-logged in user' do
    @level = create(:applab, submittable: true)

    app_options = self.app_options # ha
    assert_equal false, app_options[:level]['submittable']
  end

  test 'submittable multi level is submittable for student with teacher' do
    @level = create(:multi, submittable: true)

    user = create(:follower).student_user
    sign_in user

    app_options = self.app_options # ha ha

    assert_equal true, app_options[:level]['submittable']
  end

  test 'submittable multi level is not submittable for student without teacher' do
    @level = create(:multi, submittable: true)

    user = create :student
    sign_in user

    app_options = self.app_options # ha ha
    assert_equal false, app_options[:level]['submittable']
  end

  test 'submittable multi level is not submittable for non-logged in user' do
    @level = create(:multi, submittable: true)

    app_options = self.app_options # ha ha
    assert_equal false, app_options[:level]['submittable']
  end

end
