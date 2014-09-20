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
end
