require 'test_helper'

class Policies::StandaloneProjectsTest < ActiveSupport::TestCase
  VALID_CONFIG = {'applab' => {'name' => 'New App Lab Project', 'login_required' => true}}.freeze

  test 'validate! accepts a well-formed entry' do
    Policies::StandaloneProjects.validate!(VALID_CONFIG)
  end

  test 'validate! names the file and key when an entry body is outdented' do
    # `applab:` followed by `name: ...` at column 0 parses as a nil entry plus a top-level `name` key.
    error = assert_invalid({'applab' => nil, 'name' => 'New App Lab Project'})
    assert_includes error.message, 'standalone_projects.yml: project type "applab":'
    assert_includes error.message, 'check indentation'
  end

  test 'validate! rejects an outdented flag' do
    error = assert_invalid(VALID_CONFIG.merge('i18n' => true))
    assert_includes error.message, 'project type "i18n":'
  end

  test 'validate! rejects unknown keys' do
    error = assert_invalid('applab' => VALID_CONFIG['applab'].merge('logn_required' => true))
    assert_includes error.message, 'unknown keys ["logn_required"]'
  end

  test 'validate! rejects a name YAML read as a boolean' do
    error = assert_invalid('applab' => {'name' => true})
    assert_includes error.message, 'name must be a string, got true'
  end

  test 'validate! rejects a missing name' do
    error = assert_invalid('applab' => {'i18n' => true})
    assert_includes error.message, 'needs a name'
  end

  test 'validate! rejects a flag that is not a boolean' do
    error = assert_invalid('applab' => VALID_CONFIG['applab'].merge('i18n' => 'true'))
    assert_includes error.message, 'i18n must be true or false, got "true"'
  end

  test 'validate! rejects a key that is not a URL segment' do
    assert_invalid('app-lab' => VALID_CONFIG['applab'])
  end

  test 'validate! rejects an empty file' do
    assert_invalid(nil)
  end

  test 'project_level_name? matches configured names only' do
    assert Policies::StandaloneProjects.project_level_name?('New App Lab Project')
    refute Policies::StandaloneProjects.project_level_name?('New App Lab Project ')
    refute Policies::StandaloneProjects.project_level_name?('UI Test App Lab Project')
  end

  private def assert_invalid(config)
    assert_raises(Policies::StandaloneProjects::InvalidConfig) do
      Policies::StandaloneProjects.validate!(config)
    end
  end
end
