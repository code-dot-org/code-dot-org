require_relative '../test_helper'
require 'cdo/secrets_config'

class SecretsConfigTest < Minitest::Test
  class CdoSecrets < Cdo::Config
    prepend Cdo::SecretsConfig
  end

  attr_accessor :config

  def setup
    self.config = CdoSecrets.new
    Cdo::SecretsConfig::StackSecret.stubs(:current_stack_name).returns('test')
  end

  def teardown
    Cdo::SecretsConfig::StackSecret.unstub(:current_stack_name)
  end

  def test_load
    secrets_file = CDO.dir('config/secrets.yml.template')
    secrets = Cdo::SecretsConfig.load(secrets_file)
    assert_equal '456DEF', secrets['staging/cdo/acme_api_key']
    complex_secret = secrets['development/cdo/wile_e_coyote_credentials']
    assert_equal 'dev@code.org', complex_secret["username"]
    assert_equal 'Q3rt^', complex_secret["password"]
  end

  def load_configuration(yml_erb)
    file = Tempfile.new(%w(config .yml.erb))
    file.write yml_erb
    file.close
    config.load_configuration(file.path)
    config.freeze_config
  end

  # Helper method which allows tests to easily mock a single secret being
  # returned by all invocations
  def stub_secret(str)
    client = Aws::SecretsManager::Client.new(
      stub_responses: {
        get_secret_value: lambda do |_|
          {secret_string: str}
        end
      }
    )
    config.cdo_secrets = Cdo::Secrets.new(client: client)
  end

  # Helper method which allows tests to pass a hash of (key,secret) pairs, so
  # that specific secrets can be returned on specific invocations. Stubs both
  # the single-key (+GetSecretValue+) and batch (+BatchGetSecretValue+) paths
  # so that tests exercising either code path see the same data.
  def stub_multiple_secrets(secret_strings)
    client = Aws::SecretsManager::Client.new(
      stub_responses: {
        get_secret_value: lambda do |context|
          secret_id = context.params[:secret_id]
          return 'ResourceNotFoundException' unless secret_strings.key?(secret_id)
          {secret_string: secret_strings[secret_id]}
        end,
        batch_get_secret_value: lambda do |context|
          ids = context.params[:secret_id_list] || []
          secret_values = []
          errors = []
          ids.each do |id|
            if secret_strings.key?(id)
              secret_values << {name: id, secret_string: secret_strings[id]}
            else
              errors << {
                secret_id: id,
                error_code: 'ResourceNotFoundException',
                message: "Secrets Manager can't find the specified secret."
              }
            end
          end
          {secret_values: secret_values, errors: errors}
        end
      }
    )
    config.cdo_secrets = Cdo::Secrets.new(client: client)
    client
  end

  def test_secret_tag
    stub_secret 'bar!'
    load_configuration <<~YAML
      foo: foo!
      bar: !Secret
    YAML
    assert_equal 'foo!', config.foo
    assert_equal 'bar!', config.bar
  end

  def test_stack_secret_tag
    test_secrets = {
      "/cdo/foo" => "default foo secret",
      "CfnStack/test/foo" => "stack-specific foo secret (not used)",
      "/cdo/bar" => "default bar secret (not used)",
      "CfnStack/test/bar" => "stack-specific bar secret"
    }
    stub_multiple_secrets(test_secrets)

    load_configuration <<~YAML
      foo: !Secret
      bar: !StackSecret
    YAML
    assert_equal 'default foo secret', config.foo
    assert_equal 'stack-specific bar secret', config.bar
  end

  def test_stack_secret_tag_falls_back_to_regular_secret
    stub_secret 'bar!'
    load_configuration <<~YAML
      foo: foo!
      bar: !StackSecret
    YAML
    assert_equal 'foo!', config.foo
    assert_equal 'bar!', config.bar
  end

  def test_clear_secrets
    load_configuration <<~YAML
      foo: !Secret
      <%=clear_secrets%>
    YAML
    assert_nil config.foo
  end

  def test_clear_secrets_empty
    load_configuration <<~YAML
      foo: false
      <%=clear_secrets%>
      foo: true
    YAML
    assert_equal true, config.foo
  end

  def test_erb_string_secret
    stub_secret 'FOO'
    load_configuration <<~YAML
      foo: !Secret
      bar: <%=foo%>bar
    YAML
    assert_equal 'FOObar', config.bar
  end

  def test_required_secrets_are_batched
    test_secrets = {
      "/cdo/foo" => "foo_value",
      "/cdo/bar" => "bar_value",
      "CfnStack/test/baz" => "baz_value"
    }
    client = stub_multiple_secrets(test_secrets)

    load_configuration <<~YAML
      foo: !Secret
      bar: !Secret
      baz: !StackSecret
    YAML

    # Simulate the startup path in dashboard/config.ru, which forces all
    # required secrets to resolve via BatchGetSecretValue before the
    # application boots.
    config.cdo_secrets.required!

    assert_equal 'foo_value', config.foo
    assert_equal 'bar_value', config.bar
    assert_equal 'baz_value', config.baz

    batch_requests = client.api_requests.select {|req| req[:operation_name] == :batch_get_secret_value}
    single_requests = client.api_requests.select {|req| req[:operation_name] == :get_secret_value}

    # All required secrets should be fetched via a single batched request...
    assert_equal 1, batch_requests.count
    assert_includes batch_requests.first[:params][:secret_id_list], '/cdo/foo'
    assert_includes batch_requests.first[:params][:secret_id_list], '/cdo/bar'
    # ...and config-level access to the resolved values should not trigger
    # any additional per-key GetSecretValue requests.
    assert_equal 0, single_requests.count
  end

  def test_json_secret
    stub_secret({bar: 'baz'}.to_json)
    load_configuration <<~YAML
      foo: !Secret
    YAML
    assert_equal({'bar' => 'baz'}, config.foo)
    assert_equal 'baz', config.foo['bar']
  end
end
