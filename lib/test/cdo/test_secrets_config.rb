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

    file = Tempfile.new(%w(config .yml))
    file.write <<YAML
foo: foo!
bar: !Secret
YAML
    file.close
    config.load_configuration(file)
    config.freeze

    assert_equal 'foo!', config.foo
    assert_equal 'bar!', config.bar
  end
end
