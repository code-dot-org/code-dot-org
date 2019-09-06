require_relative '../test_helper'
require 'cdo/secrets_config'

class SecretsConfigTest < Minitest::Test
  class CdoSecrets < Cdo::Config
    prepend Cdo::SecretsConfig
  end

  attr_accessor :config

  def setup
    self.config = CdoSecrets.new
  end

  def test_load
    secrets_file = CDO.dir('config/secrets.yml.template')
    secrets = Cdo::SecretsConfig.load(secrets_file)
    assert_equal 'bar', secrets['staging/cdo/foo']
  end

  def load_configuration(yml_erb)
    file = Tempfile.new(%w(config .yml.erb))
    file.write yml_erb
    file.close
    config.load_configuration(file.path)
    config.freeze
  end

  def stub_secret(str)
    client = Aws::SecretsManager::Client.new(
      stub_responses: {
        get_secret_value: ->(_) do
          {secret_string: str}
        end
      }
    )
    config.cdo_secrets = Cdo::Secrets.new(client: client)
  end

  def test_secret_tag
    stub_secret 'bar!'
    load_configuration <<YAML
foo: foo!
bar: !Secret
YAML
    assert_equal 'foo!', config.foo
    assert_equal 'bar!', config.bar
  end

  def test_clear_secrets
    load_configuration <<YAML
foo: !Secret
<%=clear_secrets%>
YAML
    assert_nil config.foo
  end

  def test_clear_secrets_empty
    load_configuration <<YAML
foo: false
<%=clear_secrets%>
foo: true
YAML
    assert_equal true, config.foo
  end

  def test_erb_string_secret
    stub_secret 'FOO'
    load_configuration <<YAML
foo: !Secret
bar: <%=foo%>bar
YAML
    assert_equal 'FOObar', config.bar
  end

  def test_json_secret
    stub_secret({bar: 'baz'}.to_json)
    load_configuration <<YAML
foo: !Secret
YAML
    assert_equal({bar: 'baz'}, config.foo)
    assert_equal 'baz', config.foo.bar
  end
end
