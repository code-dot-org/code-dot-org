require_relative '../test_helper'
require 'cdo'
require 'open3'

class CdoEnvVarsTest < Minitest::Test
  def test_env_vars_are_parsed_as_yaml
    with_env('CDO_build_apps' => 'true', 'CDO_NETSIM_REDIS_GROUPS' => "- master: redis://example:6379\n") do
      config = CDO.send(:env_vars_to_configuration)
      assert_equal true, config['build_apps']
      assert_equal [{'master' => 'redis://example:6379'}], config['netsim_redis_groups']
    end
  end

  def test_env_vars_ignore_double_underscore_keys
    with_env('CDO_build_apps' => 'true', 'CDO__SKIP_IT' => 'whatever') do
      config = CDO.send(:env_vars_to_configuration)
      assert_equal true, config['build_apps']
      refute_includes config.keys, '_skip_it'
    end
  end

  def test_unknown_env_var_requires_permit_flag
    refute cdo_boots?(
      'CDO_UNKNOWN_PROPERTY' => 'whatever'
    )
    assert cdo_boots?(
      'CDO_UNKNOWN_PROPERTY' => 'whatever',
      'PERMIT_UNKNOWN_PROPERTIES_IN_CDO' => '1',
    )
  end

  private def with_env(overrides, &block)
    Object.stub_const(:ENV, ENV.to_h.merge(overrides, 'RACK_ENV' => 'test', 'UNIT_TEST' => '1'), &block)
  end

  private def cdo_boots?(env)
    _, _, status = Open3.capture3(
      env,
      'bundle', 'exec', 'ruby', '-Ilib', '-e',
      'require_relative "deployment"',
      chdir: deploy_dir
    )
    status.success?
  end
end
