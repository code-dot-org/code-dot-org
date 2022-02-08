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
end
