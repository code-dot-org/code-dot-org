require 'test_helper'

class ScriptLevelsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  include LevelsHelper # test the levels helper stuff here because it has to do w/ routes...
  include ScriptLevelsHelper

  setup do
    @admin = create(:admin)
    sign_in(@admin)

    @script = Script.find(Script::TWENTY_HOUR_ID)
    @script_level = @script.script_levels.fifth

    @custom_script = create(:script, :name => 'laurel')
    @custom_stage_1 = create(:stage, script: @custom_script, name: 'Laurel Stage 1', position: 1)
    @custom_stage_2 = create(:stage, script: @custom_script, name: 'Laurel Stage 2', position: 2)
    @custom_s1_l1 = create(:script_level, script: @custom_script,
                           stage: @custom_stage_1, :position => 1)
    @custom_s2_l1 = create(:script_level, script: @custom_script,
                           stage: @custom_stage_2, :position => 1)
    @custom_s2_l2 = create(:script_level, script: @custom_script,
                           stage: @custom_stage_2, :position => 2)
  end

  test "should show script level for twenty hour" do
    @controller.expects :slog

    get :show, script_id: Script::TWENTY_HOUR_ID, id: @script_level.id
    assert_response :success

    assert_equal @script_level, assigns(:script_level)
  end

  test 'should show video in twenty hour script level' do
    get :show, script_id: Script::TWENTY_HOUR_ID, id: @script_level.id
    assert_response :success
    assert_not_empty assigns(:level).related_videos
  end

  test 'should not show concept video for non-legacy script level' do
    non_legacy_script_level = create(:script_level, :with_stage)
    concept_with_video = Concept.find_by_name('sequence')
    non_legacy_script_level.level.concepts = [concept_with_video]

    get :show, script_id: non_legacy_script_level.script.to_param, stage_id: "1", id: "1"

    assert_response :success
    assert_empty assigns(:level).related_videos
  end

  test 'should show specified video for script level with video' do
    non_legacy_script_level = create(:script_level, :with_stage, :with_autoplay_video)
    assert_empty(non_legacy_script_level.level.concepts)
    get :show, script_id: non_legacy_script_level.script.to_param, stage_id: '1', id: '1'
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_not_nil assigns(:autoplay_video_info)
  end

  test 'should not have autoplay video when noautoplay param is set' do
    level_with_autoplay_video = create(:script_level, :with_stage, :with_autoplay_video)
    get :show, script_id: level_with_autoplay_video.script.to_param, stage_id: '1', id: '1', noautoplay: 'true'
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_nil assigns(:autoplay_video_info)
  end

  test 'should track video play even if noautoplay param is set' do
    # This behavior is relied on by UI tests that navigate to the next level after completion,
    # because the ?noautoplay=true parameter does not propagate to the next level.
    # The video would get autoplayed on the next level if not tracked as seen
    script = create(:script)
    stage = create(:stage, script: script, name: 'Testing Stage 1', position: 1)
    level_with_autoplay_video = create(:script_level, :with_autoplay_video, script: script, stage: stage, :position => 1)
    assert_nil session[:videos_seen]
    get :show, script_id: level_with_autoplay_video.script.to_param, stage_id: stage.position, id: '1', noautoplay: 'true'
    assert_nil assigns(:autoplay_video_info)
    assert_not_empty session[:videos_seen]
    get :show, script_id: level_with_autoplay_video.script.to_param, stage_id: stage.position, id: '1'
    assert_nil assigns(:autoplay_video_info)
  end

  test "shouldn't show autoplay video when already seen" do
    non_legacy_script_level = create(:script_level, :with_stage, :with_autoplay_video)
    seen = Set.new
    seen.add(non_legacy_script_level.level.video_key)
    session[:videos_seen] = seen
    get :show, script_id: non_legacy_script_level.script.to_param, stage_id: '1', id: '1'
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_nil assigns(:autoplay_video_info)
  end

  test 'non-legacy script level with concepts should have related but not autoplay video' do
    non_legacy_script_level = create(:script_level, :with_stage)
    non_legacy_script_level.level.concepts = [create(:concept, :with_video)]
    get :show, script_id: non_legacy_script_level.script.to_param, stage_id: '1', id: '1'
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_nil assigns(:autoplay_video_info)
  end

  test "show redirects to canonical url for 20 hour" do
    sl = ScriptLevel.find_by script_id: Script::TWENTY_HOUR_ID, chapter: 3
    get :show, script_id: sl.script_id, chapter: sl.chapter

    assert_redirected_to "/s/1/level/#{sl.id}"
  end

  test "script level id based routing for 20 hour script" do
    # 'normal' script level routing
    sl = ScriptLevel.find_by(script_id: Script::TWENTY_HOUR_ID, chapter: 3)
    assert_routing({method: "get", path: "/s/1/level/#{sl.id}"},
                   {controller: "script_levels", action: "show", script_id: Script::TWENTY_HOUR_ID.to_s, id: sl.id.to_s})
    assert_equal "/s/1/level/#{sl.id}", build_script_level_path(sl)
  end

  test "chapter based routing" do
    assert_routing({method: "get", path: '/hoc/reset'},
                   {controller: "script_levels", action: "show", script_id: Script::HOC_ID, reset: true})

    hoc_level = ScriptLevel.find_by(script_id: Script::HOC_ID, chapter: 1)
    assert_routing({method: "get", path: '/hoc/1'},
                   {controller: "script_levels", action: "show", script_id: Script::HOC_ID, chapter: "1"})
    assert_equal '/hoc/1', build_script_level_path(hoc_level)

    builder_level = ScriptLevel.find_by(script_id: Script::BUILDER_ID, chapter: 1)
    assert_routing({method: "get", path: '/builder/1'},
                   {controller: "script_levels", action: "show", script_id: Script::BUILDER_ID, chapter: "1"})
    assert_equal '/builder/1', build_script_level_path(builder_level)

    # we don't actually use this
    assert_routing({method: "get", path: '/k8intro/5'},
                   {controller: "script_levels", action: "show", script_id: Script::TWENTY_HOUR_ID, chapter: "5"})

    flappy_level = ScriptLevel.find_by(script_id: Script::FLAPPY_ID, chapter: 5)
    assert_routing({method: "get", path: '/flappy/5'},
                   {controller: "script_levels", action: "show", script_id: Script::FLAPPY_ID, chapter: "5"})
    assert_equal "/flappy/5", build_script_level_path(flappy_level)

    jigsaw_level = ScriptLevel.find_by(script_id: Script::JIGSAW_ID, chapter: 3)
    assert_routing({method: "get", path: '/jigsaw/3'},
                   {controller: "script_levels", action: "show", script_id: Script::JIGSAW_ID, chapter: "3"})
    assert_equal "/jigsaw/3", build_script_level_path(jigsaw_level)
  end

  test "test step script routing" do
    script = Script.find_by_name 'step'
    step_level = ScriptLevel.find_by script_id: script.id, chapter: 3
    assert_routing({method: "get", path: '/s/step/puzzle/3'},
                   {controller: "script_levels", action: "show", script_id: 'step', chapter: "3"})
    assert_equal "/s/step/puzzle/3", build_script_level_path(step_level)
  end


  test "routing for custom scripts with stage" do
    assert_routing({method: "get", path: "/s/laurel/stage/1/puzzle/1"},
                   {controller: "script_levels", action: "show", script_id: 'laurel', stage_id: "1", id: "1"})
    assert_equal "/s/laurel/stage/1/puzzle/1", build_script_level_path(@custom_s1_l1)

    assert_routing({method: "get", path: "/s/laurel/stage/2/puzzle/1"},
                   {controller: "script_levels", action: "show", script_id: 'laurel', stage_id: "2", id: "1"})
    assert_equal "/s/laurel/stage/2/puzzle/1", build_script_level_path(@custom_s2_l1)

    assert_routing({method: "get", path: "/s/laurel/stage/2/puzzle/2"},
                   {controller: "script_levels", action: "show", script_id: 'laurel', stage_id: "2", id: "2"})
    assert_equal "/s/laurel/stage/2/puzzle/2", build_script_level_path(@custom_s2_l2)
  end

  test "next routing for custom scripts" do
    assert_routing({method: "get", path: "/s/laurel/puzzle/next"},
                   {controller: "script_levels", action: "show", script_id: 'laurel', chapter: "next"})
    assert_equal "/s/laurel/puzzle/next", script_puzzle_path(@custom_script, 'next')
  end

  test "show next redirects to next level for custom scripts" do
    get :show, script_id: 'laurel', chapter: 'next'
    assert_redirected_to "/s/laurel/stage/#{@custom_s1_l1.stage.position}/puzzle/#{@custom_s1_l1.position}"
  end

  test "show next redirects to first non-unplugged level for custom scripts" do
    custom_script = create(:script, :name => 'coolscript')
    unplugged_stage = create(:stage, script: custom_script, name: 'unplugged stage', position: 1)
    create(:script_level, level: create(:unplugged), script: custom_script, stage: unplugged_stage, position: 1)
    plugged_stage = create(:stage, script: custom_script, name: 'plugged stage', position: 2)
    create(:script_level, script: custom_script, stage: plugged_stage, position: 1)

    get :show, script_id: 'coolscript', chapter: 'next'
    assert_redirected_to "/s/coolscript/stage/2/puzzle/1"
  end

  test "show next when logged in redirects to first non-unplugged non-finished level" do
    custom_script = create(:script, :name => 'coolscript')
    custom_stage_1 = create(:stage, script: custom_script, name: 'neat stage', position: 1)
    first_level = create(:script_level, script: custom_script, stage: custom_stage_1, :position => 1)
    UserLevel.create(user: @admin, level: first_level.level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    second_level = create(:script_level, script: custom_script, stage: custom_stage_1, :position => 2)
    UserLevel.create(user: @admin, level: second_level.level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    create(:script_level, level: create(:unplugged), script: custom_script, stage: custom_stage_1, :position => 3)
    last_level = create(:script_level, script: custom_script, stage: custom_stage_1, :position => 4)

    get :show, script_id: 'coolscript', chapter: 'next'
    assert_redirected_to "/s/coolscript/stage/#{last_level.stage.position}/puzzle/#{last_level.position}"
  end

  test "show next skips entire unplugged stage" do
    custom_script = create(:script, :name => 'coolscript')
    unplugged_stage = create(:stage, script: custom_script, name: 'unplugged stage', position: 1)
    create(:script_level, level: create(:unplugged), script: custom_script, stage: unplugged_stage, position: 1)
    create(:script_level, script: custom_script, stage: unplugged_stage, position: 2)
    create(:script_level, script: custom_script, stage: unplugged_stage, position: 3)
    plugged_stage = create(:stage, script: custom_script, name: 'plugged stage', position: 2)
    create(:script_level, script: custom_script, stage: plugged_stage, position: 1)

    get :show, script_id: 'coolscript', chapter: 'next'
    assert_redirected_to "/s/coolscript/stage/2/puzzle/1"
  end

  test "show next when only unplugged level goes back to home" do
    custom_script = create(:script, :name => 'coolscript')
    custom_stage_1 = create(:stage, script: custom_script, name: 'neat stage', position: 1)
    create(:script_level, level: create(:unplugged), script: custom_script, stage: custom_stage_1, :position => 1)

    assert_raises RuntimeError do
      get :show, script_id: 'coolscript', chapter: 'next'
    end
  end

  test "show redirects to canonical url for hoc" do
    hoc_level = Script.find(Script::HOC_ID).script_levels.second
    get :show, script_id: Script::HOC_ID, id: hoc_level.id

    assert_response 301 # moved permanently
    assert_redirected_to '/hoc/2'
  end

  test "should show special script level by chapter" do
    @controller.expects :slog

    # this works for 'special' scripts like flappy, hoc
    expected_script_level = ScriptLevel.where(script_id: Script::FLAPPY_ID, chapter: 5).first

    get :show, script_id: Script::FLAPPY_ID, chapter: '5'
    assert_response :success

    assert_equal expected_script_level, assigns(:script_level)
  end

  test "show redirects to canonical url for special scripts" do
    flappy_level = Script.find(Script::FLAPPY_ID).script_levels.second
    get :show, script_id: Script::FLAPPY_ID, id: flappy_level.id

    assert_response 301 # moved permanently
    assert_redirected_to '/flappy/2'
  end

  test "should show script level by stage and puzzle position" do
    @controller.expects :slog

    # this works for custom scripts

    get :show, script_id: @custom_script, stage_id: 2, id: 1

    assert_response :success

    assert_equal @custom_s2_l1, assigns(:script_level)
  end

  test 'should show new style unplugged level with PDF link' do
    @controller.expects(:slog).never

    sign_out(@admin)

    stage = create :stage, script: Script.find_by_name('course1')
    level = create :unplugged, name: 'NewUnplugged', type: 'Unplugged'
    @script_level = create(:script_level, stage: stage, script: stage.script, level: level)

    get :show, script_id: @script_level.script, stage_id: stage.position, id: @script_level.position

    assert_response :success

    assert_select 'div.unplugged > h2', 'Test title'
    assert_select 'div.unplugged > p', 'Test description'
    assert_select '.pdf-button', 2

    unplugged_curriculum_path_start = "curriculum/#{stage.script.name}/#{stage.position}"
    assert_select '.pdf-button' do
      assert_select "[href=?]", /.*#{unplugged_curriculum_path_start}.*/
    end

    assert_equal @script_level, assigns(:script_level)
  end

  test "show redirects to canonical url for custom scripts" do
    get :show, script_id: @custom_script.id, id: @custom_s2_l1

    assert_response 301 # moved permanently
    assert_redirected_to '/s/laurel/stage/2/puzzle/1'
  end

  test "show with the reset param should reset session when not logged in" do
    sign_out(@admin)
    session[:progress] = {5 => 10}

    get :show, script_id: Script::HOC_ID, reset: true

    assert_redirected_to hoc_chapter_path(chapter: 1)

    assert !session[:progress]
    assert !session['warden.user.user.key']
  end

  test "show with the reset param should not reset session when logged in" do
    sign_in(create(:user))
    get :show, script_id: Script::HOC_ID, reset: true

    assert_redirected_to hoc_chapter_path(chapter: 1)

    # still logged in
    assert session['warden.user.user.key'].first.first
  end

  test "should select only callouts for current script level" do
    @controller.expects :slog

    callout1 = create(:callout, script_level: @script_level)
    callout2 = create(:callout, script_level: @script_level)
    irrelevant_callout = create(:callout)

    get :show, script_id: @script.id, id: @script_level.id

    assert(assigns(:callouts_to_show).include?(callout1))
    assert(assigns(:callouts_to_show).include?(callout2))
    assert(!assigns(:callouts_to_show).include?(irrelevant_callout))
  end

  test "should localize callouts" do
    @controller.expects :slog

    create(:callout, script_level: @script_level, localization_key: 'run')
    get :show, script_id: @script.id, id: @script_level.id
    assert assigns(:callouts).find{|c| c['localized_text'] == 'Hit "Run" to try your program'}
  end

  test "should render blockly partial for blockly levels" do
    @controller.expects :slog

    script = create(:script)
    level = create(:level, :blockly)
    stage = create(:stage, script: script)
    script_level = create(:script_level, script: script, level: level, stage: stage)

    get :show, script_id: script.name, stage_id: stage, id: script_level.position

    assert_equal script_level, assigns(:script_level)

    assert_template partial: '_blockly'
  end

  test "with callout defined should define callout JS" do
    @controller.expects :slog

    create(:callout, script_level: @script_level)
    get :show, script_id: @script.id, id: @script_level.id
    assert(@response.body.include?('Drag a \"move\" block and snap it below the other block'))
  end

  test "should carry over previous blocks" do
    blocks = "<hey>"
    level = Level.where(level_num: "3_8").first
    script_level = ScriptLevel.where(level_id: level.id).first
    level_source = LevelSource.find_identical_or_create(level, blocks)
    Activity.create!(user: @admin, level: level, lines: "1", attempt: "1", test_result: "100", time: "1000", level_source: level_source)
    next_script_level = ScriptLevel.where(level: Level.where(level_num: "3_9").first).first
    get :show, script_id: script_level.script.id, id: next_script_level.id
    assert_equal blocks, assigns["start_blocks"]
  end

  test 'should render title for puzzle in default script' do
    get :show, script_id: @script.id, id: @script_level.id
    assert_equal 'Code.org - The Maze #4',
      Nokogiri::HTML(@response.body).css('title').text.strip
  end

  test 'should render title for puzzle in custom script' do
    get :show, script_id: @custom_script.name, stage_id: @custom_s2_l1.stage, id: @custom_s2_l1.position
    assert_equal 'Code.org - custom-script-laurel: laurel-stage-2 #1',
      Nokogiri::HTML(@response.body).css('title').text.strip
  end

  test 'show stage name in header for custom multi-stage script' do
    get :show, script_id: @custom_script, stage_id: 2, id: 1
    assert_template partial: '_header'
    # js-encoded referenceArea causes assert_select to output warnings, so we need to use Nokogiri instead
    assert_equal "Stage 2:\n#{I18n.t("data.script.name.#{@custom_script.name}.#{@custom_stage_2.name}")},\nPuzzle",
      css('body div.header_level div.header_text').text.strip
  end

  test 'show stage position in header for default script' do
    get :show, script_id: @script, id: @script_level.id
    assert_template partial: '_header'
    assert_equal "Stage 2:\n\nPuzzle",
      css('body div.header_level div.header_text')[0].text.strip
  end

  test 'show Puzzle in header for HOC' do
    get :show, script_id: Script.find(Script::HOC_ID).id, chapter: 1
    assert_template partial: '_header'
    assert_equal 'Puzzle',
      css('body div.header_level div.header_text')[0].text.strip
  end

  test 'end of HoC for player goes to first unfinished chapter in 20 hour' do
    Script.find(Script::HOC_ID).script_levels.each do |script_level|
      UserLevel.create(user: @admin, level: script_level.level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    end

    last_hoc_level = Script.find(Script::HOC_ID).script_levels.last
    unplugged_levels_skipped_starting_20_hour = 3
    get :show, twenty_hour_path_params
    expected_20_hour_chapter = last_hoc_level.chapter + 1 + unplugged_levels_skipped_starting_20_hour
    assert_redirected_to "/s/#{Script::TWENTY_HOUR_ID}/level/#{expected_20_hour_chapter}"
  end

  test 'end of HoC for a user gets twenty hour next URL' do
    self.stubs(:current_user).returns(@admin)
    post_script = script_completion_redirect(Script.find(Script::HOC_ID))
    assert_equal twenty_hour_next_url, post_script
  end

  test 'post script redirect is HOC endpoint' do
    self.stubs(:current_user).returns(nil)
    assert_equal(hoc_finish_url, script_completion_redirect(Script.find(Script::HOC_ID)))
  end

  test 'end of HoC for logged in user works' do
    sign_in(create(:user))
    get :show, {script_id: Script::HOC_ID, chapter: '20'}
    assert_response :success
  end

  test 'end of HoC for anonymous visitor works' do
    sign_out(@admin)
    get :show, {script_id: Script::HOC_ID, chapter: '20'}
    assert_response :success
  end

  test 'end of HoC has wrapup video in response' do
    sign_out(@admin)
    get :show, {script_id: Script::HOC_ID, chapter: '20'}
    assert(@response.body.include?('hoc_wrapup'))
  end

  test 'end of HoC for signed-in users has no wrapup video, does have stage change info' do
    get :show, {script_id: Script::HOC_ID, chapter: '20'}
    assert(!@response.body.include?('hoc_wrapup'))
    assert(@response.body.include?('/s/1/level/show?chapter=next'))
  end

  test 'next for non signed in user' do
    sign_out @admin
    get :show, script_id: Script::HOC_ID, chapter: 'next'

    assert_response :redirect
    assert_redirected_to '/hoc/1'
  end
end
