require 'test_helper'

class ApplicationHelperTest < ActionView::TestCase

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
    assert_equal '//test.code.org/teacher-dashboard', CDO.code_org_url('teacher-dashboard')
    assert_equal '//test.code.org/teacher-dashboard', CDO.code_org_url('/teacher-dashboard')
    assert_equal '//test.code.org/teacher-dashboard', CDO.code_org_url('/teacher-dashboard')
  end

  test "is_k1? when current script returns true for is_k1?" do
    @script = Script.find_by_name('course1')
    assert is_k1?
  end

  test "!is_k1? by default" do
    @level = Maze.create(@maze_data)
    assert !is_k1?
  end

  test "windows phone 8.1 supported" do
    def request
      OpenStruct.new(headers: OpenStruct.new('User-Agent' => 'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ' \
      'ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 930) like iPhone OS 7_0_3 Mac OS X ' \
      'AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537'))
    end
    assert(!browser.cdo_unsupported?)
    assert(!browser.cdo_partially_supported?)
  end

  test "chrome 34 detected" do
    def request
      OpenStruct.new(headers: OpenStruct.new('User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) ' \
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36'))
    end
    assert(browser.chrome?)
    assert(browser.version.to_s.to_i == 34)
  end

  test 'certificate images for hoc-type scripts are all hoc certificates' do
    # old hoc, new hoc, frozen, playlab, and flappy are all the same certificate
    user = create :user
    hoc_2013 = Script.get_from_cache(Script::HOC_2013_NAME)
    assert_equal script_certificate_image_url(user, hoc_2013), script_certificate_image_url(user, Script.get_from_cache(Script::HOC_NAME))
    assert_equal script_certificate_image_url(user, hoc_2013), script_certificate_image_url(user, Script.get_from_cache(Script::FROZEN_NAME))
    assert_equal script_certificate_image_url(user, hoc_2013), script_certificate_image_url(user, Script.get_from_cache(Script::FLAPPY_NAME))
    assert_equal script_certificate_image_url(user, hoc_2013), script_certificate_image_url(user, Script.get_from_cache(Script::PLAYLAB_NAME))

     # but course1 is a different certificate
    assert_not_equal script_certificate_image_url(user, Script.get_from_cache(Script::HOC_2013_NAME)), script_certificate_image_url(user, Script.get_from_cache(Script::COURSE1_NAME))
  end

  test 'client state lines' do
    assert_equal 0, client_state.lines
    client_state.add_lines 10
    assert_equal 10, client_state.lines
    client_state.add_lines 1
    assert_equal 11, client_state.lines
  end

  test 'client state level progress' do
    assert client_state.level_progress_is_empty_for_test
    assert_equal 0, client_state.level_progress(10)
    client_state.set_level_progress(10, 20)
    assert_equal 20, client_state.level_progress(10)
    client_state.set_level_progress(11, 25)
    assert_equal 25, client_state.level_progress(11)
    assert_equal 20, client_state.level_progress(10)
  end

  # Make sure that we correctly access and back-migrate future
  # versions of the client state, as would happen if we roll back from a future
  # version.
  test 'client state migration' do
    session[:lines] = 37
    assert_equal 37, client_state.lines
    assert_equal '37', cookies[:lines]
    assert_nil session[:lines]

    session[:progress] = {1 => 100}
    assert_equal 100, client_state.level_progress(1)
    assert_equal '{"1":100}', cookies[:progress]
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
    assert_not client_state.videos_seen_for_test?
    assert_not client_state.video_seen? 'foo'

    client_state.add_video_seen 'foo'
    client_state.add_video_seen 'bar'
    assert client_state.video_seen? 'foo'
    assert client_state.video_seen? 'bar'
    assert_not client_state.video_seen? 'baz'

    client_state.add_video_seen 'foo'
    assert client_state.video_seen? 'foo'
  end

  test 'callout_seen' do
    assert_not client_state.callout_seen? 'callout'
    client_state.add_callout_seen 'callout'
    assert client_state.callout_seen? 'callout'
    assert_not client_state.callout_seen? 'callout2'
  end

  test 'client state with invalid cookie' do
    cookies[:progress] = '&*%$% mangled #$#$$'
    assert_equal 0, client_state.level_progress(10),
                 'Invalid cookie should show no progress'
    client_state.set_level_progress(10, 20)
    assert_equal 20, client_state.level_progress(10),
                 'Should be able to overwrite invalid cookie state'
  end

  private
  def assert_equal_unordered(array1, array2)
    Set.new(array1) == Set.new(array2)
  end
end
