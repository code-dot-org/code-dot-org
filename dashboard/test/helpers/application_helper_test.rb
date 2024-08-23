require 'test_helper'
require 'cdo/shared_constants'

class ApplicationHelperTest < ActionView::TestCase
  include SharedConstants

  # Stub current_user
  def current_user
  end

  test "canonical_hostname in test" do
    assert_equal 'test-studio.code.org', CDO.canonical_hostname('studio.code.org')
  end

  test "canonical_hostname in prod" do
    set_env :production
    assert_equal 'studio.code.org', CDO.canonical_hostname('studio.code.org')
  end

  test "canonical_hostname in staging" do
    set_env :staging
    assert_equal 'staging-studio.code.org', CDO.canonical_hostname('studio.code.org')
  end

  test "canonical_hostname in CI" do
    set_env :test
    CDO.stubs(:ci_webserver?).returns(true)
    assert_equal 'localhost', CDO.canonical_hostname('studio.code.org')
  end

  test "canonical_hostname in development" do
    set_env :development
    assert_equal 'localhost', CDO.canonical_hostname('studio.code.org')
  end

  test "windows phone 8.1 supported" do
    def request
      OpenStruct.new(
        headers: OpenStruct.new(
          'User-Agent' => 'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ' \
            'ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 930) like iPhone OS 7_0_3 Mac OS X ' \
            'AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537'
        )
      )
    end
    refute(browser.cdo_unsupported?)
  end

  test "chrome 34 detected" do
    def request
      OpenStruct.new(
        headers: OpenStruct.new(
          'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) ' \
            'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36'
        )
      )
    end
    assert(browser.chrome?)
    assert(browser.version.to_s.to_i == 34)
  end

  test 'client state level progress' do
    script = create :script, name: 'zzz'
    sl1 = create :script_level, script: script
    sl2 = create :script_level, script: script

    assert client_state.level_progress_is_empty_for_test
    assert_equal 0, client_state.level_progress(sl1)
    client_state.set_level_progress(sl1, 20)
    assert_equal 20, client_state.level_progress(sl1)
    client_state.set_level_progress(sl2, 25)
    assert_equal 25, client_state.level_progress(sl2)
    assert_equal 20, client_state.level_progress(sl1)
  end

  # Make sure that we correctly access and back-migrate future
  # versions of the client state, as would happen if we roll back from a future
  # version.
  test 'client state migration' do
    script = create :script, name: 'progress-test'
    sl = create(:script_level, script: script)
    data = {'progress-test' => {sl.level_id => 100}}
    session[:progress] = data
    assert_equal 100, client_state.level_progress(sl)
    assert_equal data.to_json, cookies[:progress]
    assert_nil session[:progress]
  end

  test 'client state scripts' do
    assert_equal [], client_state.scripts

    client_state.add_script 1
    assert_equal [1], client_state.scripts

    client_state.add_script 2
    assert_equal_unordered [1, 2], client_state.scripts

    client_state.add_script 1  # Duplicate should be ignored
    assert_equal 2, client_state.scripts.length
    assert_equal_unordered [1, 2], client_state.scripts

    client_state.add_script 5
    assert_equal_unordered [1, 2, 5], client_state.scripts
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

  test 'client state with invalid cookie' do
    sl = create :script_level
    cookies[:progress] = '&*%$% mangled #$#$$'
    assert_equal 0, client_state.level_progress(sl),
      'Invalid cookie should show no progress'
    client_state.set_level_progress(sl, 20)
    assert_equal 20, client_state.level_progress(sl),
      'Should be able to overwrite invalid cookie state'
  end

  test 'meta_image_url for level' do
    assert_equal '/sharing_drawing.png', meta_image_url(level: create(:artist))
    assert_equal '/studio_sharing_drawing.png', meta_image_url(level: create(:playlab))
    assert_equal '/bounce_sharing_drawing.png', meta_image_url(level: create(:bounce))
    level = create :level, game: Game.find_by_app('Flappy')
    level_source = create(:level_source, level: level)
    assert_equal '/flappy_sharing_drawing.png', meta_image_url(level_source: level_source)
  end

  test 'meta_image_url for level_source without image' do
    assert_equal '/sharing_drawing.png', meta_image_url(level_source: create(:level_source, level: create(:artist)))
    assert_equal '/studio_sharing_drawing.png', meta_image_url(level_source: create(:level_source, level: create(:playlab)))
    assert_equal '/bounce_sharing_drawing.png', meta_image_url(level_source: create(:level_source, level: create(:bounce)))
    level = create :level, game: Game.find_by_app('Flappy')
    level_source = create(:level_source, level: level)
    assert_equal '/flappy_sharing_drawing.png', meta_image_url(level_source: level_source)
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
    assert_equal 'http://code.org/images/logo.png', meta_image_url(level_source: create(:level_source_image).level_source)
  end

  test 'best_activity_css_class returns "not started" for no activity' do
    user_level = create :user_level, best_result: 0
    assert_equal LEVEL_STATUS.not_tried,  best_activity_css_class([user_level])
  end

  test 'best_activity_css_class returns "not started" for multiple user_levels with no activity' do
    user_level1 = create :user_level, best_result: 0
    user_level2 = create :user_level, best_result: 0
    assert_equal LEVEL_STATUS.not_tried,  best_activity_css_class([user_level1, user_level2])
  end

  test 'best_activity_css_class returns "attempted" for one attempted' do
    user_level1 = create :user_level, best_result: 1
    user_level2 = create :user_level, best_result: 0
    assert_equal LEVEL_STATUS.attempted,  best_activity_css_class([user_level1, user_level2])
  end

  test 'best_activity_css_class returns "passed" for one passed' do
    user_level1 = create :user_level
    user_level2 = create :user_level, best_result: 20
    assert_equal LEVEL_STATUS.passed,  best_activity_css_class([user_level1, user_level2])
  end

  test 'best_activity_css_class returns "perfect" for one passed and one perfect' do
    user_level1 = create :user_level, best_result: 100
    user_level2 = create :user_level, best_result: 20
    assert_equal LEVEL_STATUS.perfect,  best_activity_css_class([user_level1, user_level2])
  end

  test 'best_activity_css_class returns "attempted" for one unsubmitted' do
    user_level1 = create :user_level, best_result: 0
    user_level2 = create :user_level, best_result: -50
    assert_equal LEVEL_STATUS.attempted,  best_activity_css_class([user_level1, user_level2])
  end

  private def assert_equal_unordered(array1, array2)
    Set.new(array1) == Set.new(array2)
  end
end
