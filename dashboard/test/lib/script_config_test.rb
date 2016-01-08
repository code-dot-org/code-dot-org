require 'test_helper'
require 'cdo/script_config'

class ScriptConfigTest < ActiveSupport::TestCase
  test 'allows public caching for high scale levels' do
    assert ScriptConfig.allows_public_caching_for_script('mc')
    assert ScriptConfig.allows_public_caching_for_script('starwars')
    assert ScriptConfig.allows_public_caching_for_script('starwarsblock')
    assert ScriptConfig.allows_public_caching_for_script('frozen')
    assert ScriptConfig.allows_public_caching_for_script('hourofcode')
  end

  test 'disallows public caching on unsupported levels' do
    refute ScriptConfig.allows_public_caching_for_script('course1')
    refute ScriptConfig.allows_public_caching_for_script('unknown_course_zzz')
  end
end
