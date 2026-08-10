require 'test_helper'
require 'cdo/script_config'

class ScriptConfigTest < ActiveSupport::TestCase
  test 'allows public caching for high scale levels' do
    HttpCache::CACHED_UNITS_MAP.each do |script_name, _|
      assert ScriptConfig.allows_public_caching_for_script script_name
    end
  end

  test 'disallows public caching on unsupported levels' do
    refute ScriptConfig.allows_public_caching_for_script('unknown_course_zzz')
  end

  # UI tests need a cached unit which is not production curriculum. Without this
  # unit test, dropping the entry from UI_TEST_CACHED_UNITS_MAP fails only in
  # the UI test lane.
  test 'allows public caching for the UI-test cached unit' do
    assert ScriptConfig.allows_public_caching_for_script 'ui-test-oceans'
  end

  # The UI-test curriculum partition is seeded only in development and test, so
  # none of it may reach a production cache configuration: no CloudFront cache
  # behavior, and no hoc_scripts entry. See dashboard/test/ui/config/README.md.
  test 'excludes UI-test cached units outside development and test' do
    assert_empty HttpCache.cached_units_map(:production).keys &
      HttpCache::UI_TEST_CACHED_UNITS_MAP.keys
  end
end
