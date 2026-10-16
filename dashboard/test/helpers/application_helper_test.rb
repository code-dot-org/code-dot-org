require 'test_helper'
require 'cdo/shared_constants'

class ApplicationHelperTest < ActionView::TestCase
  include SharedConstants

  # Stub current_user
  def current_user
  end

  test "canonical_hostname in test" do
    assert_equal 'test-studio.code.org', CDO.canonical_hostname('studio.code.org')
    assert_equal 'test.code.org', CDO.canonical_hostname('code.org')
  end

  test "canonical_hostname in prod" do
    set_env :production
    assert_equal 'studio.code.org', CDO.canonical_hostname('studio.code.org')
    assert_equal 'code.org', CDO.canonical_hostname('code.org')
  end

  test "canonical_hostname in staging" do
    set_env :staging
    assert_equal 'staging-studio.code.org', CDO.canonical_hostname('studio.code.org')
    assert_equal 'staging.code.org', CDO.canonical_hostname('code.org')
  end

  test "canonical_hostname in CI" do
    set_env :test
    CDO.stubs(:ci_webserver?).returns(true)
    assert_equal 'localhost-studio.code.org', CDO.canonical_hostname('studio.code.org')
    assert_equal 'localhost.code.org', CDO.canonical_hostname('code.org')
  end

  test "canonical_hostname in development" do
    set_env :development
    assert_equal 'localhost-studio.code.org', CDO.canonical_hostname('studio.code.org')
    assert_equal 'localhost.code.org', CDO.canonical_hostname('code.org')
  end

  test "code_org_root_path in test" do
    assert_equal '//test.code.org', code_org_root_path
  end

  test "code_org_root_path in prod" do
    set_env :production
    assert_equal '//code.org', code_org_root_path
  end

  test "code_org_root_path in staging" do
    set_env :staging
    assert_equal '//staging.code.org', code_org_root_path
  end

  test "code_org_root_path in development" do
    set_env :development
    assert_equal "//localhost.code.org:#{CDO.pegasus_port}", code_org_root_path
  end

  test "code_org_url" do
    assert_equal '//test.code.org/about/team', CDO.code_org_url('/about/team')
    assert_equal '//test.code.org/about/team', CDO.code_org_url('about/team')
  end

  test "windows phone 8.1 supported" do
    stubs(:request).returns(
      OpenStruct.new(
        headers: OpenStruct.new(
          'User-Agent' => 'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ' \
            'ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 930) like iPhone OS 7_0_3 Mac OS X ' \
            'AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537'
        )
      )
    )
    refute(browser.cdo_unsupported?)
  end

  test "chrome 34 detected" do
    stubs(:request).returns(
      OpenStruct.new(
        headers: OpenStruct.new(
          'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) ' \
            'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36'
        )
      )
    )
    assert(browser.chrome?)
    assert(browser.version.to_s.to_i == 34)
  end

  test 'client state level progress' do
    anon_user_id = request.anon_user_id

    script = create(:script, :in_single_unit_course, name: 'zzz')
    sl1 = create(:script_level, script: script)
    sl2 = create(:script_level, script: script)

    assert_equal 0, client_state.level_progress(script_id: script.id, level_id: sl1.level_id)
    create(:anonymous_level_progress, anon_user_id:, script:, level: sl1.level, best_result: 20)
    assert_equal 20, client_state.level_progress(script_id: script.id, level_id: sl1.level_id)
    create(:anonymous_level_progress, anon_user_id:, script:, level: sl2.level, best_result: 25)
    assert_equal 25, client_state.level_progress(script_id: script.id, level_id: sl2.level_id)
    assert_equal 20, client_state.level_progress(script_id: script.id, level_id: sl1.level_id)
  end

  test 'client state scripts' do
    anon_user_id = request.anon_user_id
    script1, script2, script5 = create_list(:script, 3)

    assert_equal [], client_state.scripts

    create(:anonymous_level_progress, anon_user_id:, script: script1)
    assert_equal [script1.id], client_state.scripts

    create(:anonymous_level_progress, anon_user_id:, script: script2)
    assert_equal_unordered [script1.id, script2.id], client_state.scripts

    create(:anonymous_level_progress, anon_user_id:, script: script1) # Duplicate should be ignored
    assert_equal 2, client_state.scripts.length
    assert_equal_unordered [script1.id, script2.id], client_state.scripts

    create(:anonymous_level_progress, anon_user_id:, script: script5)
    assert_equal_unordered [script1.id, script2.id, script5.id], client_state.scripts
  end

  test 'client state reads progress without creating anonymous user ID' do
    script_level = create(:script_level)

    assert_equal 0, client_state.level_progress(script_id: script_level.script_id, level_id: script_level.level_id)
    assert_equal [], client_state.scripts
    assert_nil request.existing_anon_user_id
  end

  test 'video_seen' do
    refute client_state.videos_seen_for_test?
    refute client_state.video_seen? 'foo'

    client_state.add_video_seen 'foo'
    client_state.add_video_seen 'bar'
    assert client_state.video_seen? 'foo'
    assert client_state.video_seen? 'bar'
    refute client_state.video_seen? 'baz'

    client_state.add_video_seen 'foo'
    assert client_state.video_seen? 'foo'
  end

  test 'callout_seen' do
    refute client_state.callout_seen? 'callout'
    client_state.add_callout_seen 'callout'
    assert client_state.callout_seen? 'callout'
    refute client_state.callout_seen? 'callout2'
  end

  test 'callout_seen only has a truncated list' do
    refute client_state.callout_seen? 'callout'
    client_state.add_callout_seen 'callout'
    25.times do |i|
      client_state.add_callout_seen "callout_#{i}"
    end
    assert client_state.callout_seen? 'callout_24'
    refute client_state.callout_seen? 'callout'
  end

  test 'callout_seen maintains most recently used order' do
    refute client_state.callout_seen? 'callout'
    client_state.add_callout_seen 'callout'
    assert client_state.callout_seen? 'callout'
    10.times do |i|
      client_state.add_callout_seen "callout_#{i}"
    end
    assert client_state.callout_seen? 'callout'
    client_state.add_callout_seen 'callout'
    10.times do |i|
      client_state.add_callout_seen "callout_#{i + 10}"
    end
    assert client_state.callout_seen? 'callout'
    client_state.add_callout_seen 'callout'
    10.times do |i|
      client_state.add_callout_seen "callout_#{i + 10}"
    end
    assert client_state.callout_seen? 'callout'
  end

  test 'meta_image_url for level' do
    assert_equal 'http://test.host/sharing_drawing.png', meta_image_url(level: create(:artist))
    assert_equal 'http://test.host/studio_sharing_drawing.png', meta_image_url(level: create(:playlab))
    assert_equal 'http://test.host/bounce_sharing_drawing.png', meta_image_url(level: create(:bounce))
    level = create(:level, game: Game.find_by_app('Flappy'))
    level_source = create(:level_source, level: level)
    assert_equal 'http://test.host/flappy_sharing_drawing.png', meta_image_url(level_source: level_source)
  end

  test 'meta_image_url for level_source without image' do
    assert_equal 'http://test.host/sharing_drawing.png', meta_image_url(level_source: create(:level_source, level: create(:artist)))
    assert_equal 'http://test.host/studio_sharing_drawing.png', meta_image_url(level_source: create(:level_source, level: create(:playlab)))
    assert_equal 'http://test.host/bounce_sharing_drawing.png', meta_image_url(level_source: create(:level_source, level: create(:bounce)))
    level = create(:level, game: Game.find_by_app('Flappy'))
    level_source = create(:level_source, level: level)
    assert_equal 'http://test.host/flappy_sharing_drawing.png', meta_image_url(level_source: level_source)
  end

  test 'meta_image_url for level_source with image' do
    CDO.stubs(:disable_s3_image_uploads).returns false

    assert_match(/cloudfront.net.*png/, meta_image_url(level_source: create(:level_source_image).level_source))

    artist_level_source = create(:level_source, level: create(:artist))
    create(:level_source_image, level_source: artist_level_source)
    assert_match(/cloudfront.net.*framed.*png/, meta_image_url(level_source: artist_level_source.reload))
  end

  test 'meta_image_url for level_source with image with s3 disabled' do
    CDO.stubs(:disable_s3_image_uploads).returns true
    assert_equal CDO.studio_url('/blockly/media/logo.png'), meta_image_url(level_source: create(:level_source_image).level_source)
  end

  test 'best_activity_css_class returns "not started" for no activity' do
    user_level = create(:user_level, best_result: 0)
    assert_equal LEVEL_STATUS.not_tried,  best_activity_css_class([user_level])
  end

  test 'best_activity_css_class returns "not started" for multiple user_levels with no activity' do
    user_level1 = create(:user_level, best_result: 0)
    user_level2 = create(:user_level, best_result: 0)
    assert_equal LEVEL_STATUS.not_tried,  best_activity_css_class([user_level1, user_level2])
  end

  test 'best_activity_css_class returns "attempted" for one attempted' do
    user_level1 = create(:user_level, best_result: 1)
    user_level2 = create(:user_level, best_result: 0)
    assert_equal LEVEL_STATUS.attempted,  best_activity_css_class([user_level1, user_level2])
  end

  test 'best_activity_css_class returns "passed" for one passed' do
    user_level1 = create(:user_level)
    user_level2 = create(:user_level, best_result: 20)
    assert_equal LEVEL_STATUS.passed,  best_activity_css_class([user_level1, user_level2])
  end

  test 'best_activity_css_class returns "perfect" for one passed and one perfect' do
    user_level1 = create(:user_level, best_result: 100)
    user_level2 = create(:user_level, best_result: 20)
    assert_equal LEVEL_STATUS.perfect,  best_activity_css_class([user_level1, user_level2])
  end

  test 'best_activity_css_class returns "attempted" for one unsubmitted' do
    user_level1 = create(:user_level, best_result: 0)
    user_level2 = create(:user_level, best_result: -50)
    assert_equal LEVEL_STATUS.attempted,  best_activity_css_class([user_level1, user_level2])
  end

  test 'school year returns correctly on July 1' do
    Timecop.travel Time.local(2024, 7, 1, 12, 0, 0) do
      assert_equal '2024-25', school_year
    end
  end

  test 'school year returns correctly in the fall' do
    Timecop.travel Time.local(2024, 10, 14, 12, 0, 0) do
      assert_equal '2024-25', school_year
    end
  end

  test 'school year returns correctly in the spring' do
    Timecop.travel Time.local(2025, 3, 7, 12, 0, 0) do
      assert_equal '2024-25', school_year
    end
  end

  private def assert_equal_unordered(array1, array2)
    Set.new(array1) == Set.new(array2)
  end
end
