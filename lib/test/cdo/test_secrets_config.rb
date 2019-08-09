require_relative '../test_helper'
require 'cdo/secrets_config'

class SecretsConfigTest < Minitest::Test
  def test_load
    secrets_file = CDO.dir('config/secrets.yml.template')
    secrets = Cdo::SecretsConfig.load(secrets_file)
    assert_equal 'bar', secrets['staging/cdo/foo']
  end

  class CdoSecrets < Cdo::Config
    prepend Cdo::SecretsConfig
  end

  def load_configuration(yml_erb, config = CdoSecrets.new)
    file = Tempfile.new(%w(config .yml.erb))
    file.write yml_erb
    file.close
    config.load_configuration(file.path)
    config.freeze
    config
  end

  def test_secret_tag
    config = CdoSecrets.new
    client = Aws::SecretsManager::Client.new(
      stub_responses: {
        get_secret_value: ->(_) do
          {secret_string: 'bar!'}
        end
      }
    )
    config.cdo_secrets = Cdo::Secrets.new(client: client)
    load_configuration(<<YAML, config)
foo: foo!
bar: !Secret
YAML
    assert_equal 'foo!', config.foo
    assert_equal 'bar!', config.bar
  end

  def test_clear_secrets
    config = load_configuration <<YAML
foo: !Secret
<%=clear_secrets%>
YAML
    assert_nil config.foo
  end

  def test_clear_secrets_empty
    config = load_configuration <<YAML
foo: false
<%=clear_secrets%>
foo: true
YAML
    assert_equal true, config.foo
  end

  def test_json_secret
    config = CdoSecrets.new
    client = Aws::SecretsManager::Client.new(
      stub_responses: {
        get_secret_value: ->(_) do
          {secret_string: {bar: 'baz'}.to_json}
        end
      }
    )
    config.cdo_secrets = Cdo::Secrets.new(client: client)
    load_configuration(<<YAML, config)
foo: !Secret
YAML
    assert_equal({bar: 'baz'}, config.foo)
    assert_equal 'baz', config.foo.bar
  end
end
