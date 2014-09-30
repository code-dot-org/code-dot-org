require 'test_helper'

class ApplicationHelperTest < ActionView::TestCase
  setup do
    set_env :test
  end

  teardown do
    set_env :test
  end

  def set_env(env)
    CDO.rack_env = env
  end

  # Stub current_user
  def current_user
  end

  test "canonical_hostname in test" do
    assert_equal 'test.learn.code.org', canonical_hostname('learn.code.org')
    assert_equal 'test.code.org', canonical_hostname('code.org')
  end

  test "canonical_hostname in prod" do
    set_env :production
    assert_equal 'learn.code.org', canonical_hostname('learn.code.org')
    assert_equal 'code.org', canonical_hostname('code.org')
  end

  test "canonical_hostname in staging" do
    set_env :staging
    assert_equal 'staging.learn.code.org', canonical_hostname('learn.code.org')
    assert_equal 'staging.code.org', canonical_hostname('code.org')
  end

  test "canonical_hostname in development" do
    set_env :development
    assert_equal 'localhost.learn.code.org', canonical_hostname('learn.code.org')
    assert_equal 'localhost.code.org', canonical_hostname('code.org')
  end

  test "code_org_root_path in test" do
    assert_equal 'http://test.code.org', code_org_root_path
  end

  test "code_org_root_path in prod" do
    set_env :production
    assert_equal 'http://code.org', code_org_root_path
  end

  test "code_org_root_path in staging" do
    set_env :staging
    assert_equal 'http://staging.code.org', code_org_root_path
  end

  test "code_org_root_path in development" do
    set_env :development
    assert_equal 'http://localhost.code.org', code_org_root_path
  end

  test "is_k1? when current level has is_k1 property" do
    @level = Maze.create(@maze_data)
    @level.properties['is_k1'] = 'true'
    assert is_k1?
  end

  test "is_k1? when current script returns true for is_k1?" do
    @script = Script.create!(name: 'course1_test')
    @script.name = 'course1'
    assert is_k1?
  end

  test "!is_k1? by default" do
    @level = Maze.create(@maze_data)
    assert !is_k1?
  end

  test "playlab_freeplay_path for k1 levels" do
    def current_user
      OpenStruct.new(primary_script: OpenStruct.new('is_k1?'=>true))
    end
    assert_equal(script_stage_script_level_path('course1', 16, 6), playlab_freeplay_path)
  end

  test "artist_freeplay_path for non-k1 levels" do
    assert_equal(script_stage_script_level_path('artist', 1, 10), artist_freeplay_path)
  end
end
