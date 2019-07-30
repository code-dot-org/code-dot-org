require_relative '../test_helper'
require 'cdo/secrets'

class SecretsTest < Minitest::Test
  def test_get_secret
    values = {
      'shared/cdo/test' => 'test456',
      'test' => 'test123',
      'json' => {my_key: 'my_value'}.to_json
    }
    client = Aws::SecretsManager::Client.new(
      stub_responses: {
        get_secret_value: ->(ctx) do
          id = ctx.params[:secret_id]
          raise Cdo::Secrets::NOT_FOUND.new(nil, '') unless (value = values[id])
          {secret_string: value}
        end
      }
    )
    secrets = Cdo::Secrets.new(
      client: client
    )
    assert_equal 'test123', secrets['test']
    assert_equal 'test123', secrets.get('test').value
    assert_equal 'test123', secrets.test
    assert_nil secrets.get('test2').value

    assert_equal 'test', client.api_requests.detect {|req| req[:operation_name] == :get_secret_value}[:params][:secret_id]

    # Ensure API calls to GetSecretValue are cached.
    assert_equal 2, client.api_requests.count {|req| req[:operation_name] == :get_secret_value}

    assert_equal 'test456', secrets.get('shared/cdo/test').value

    # Property-method lookup chain on JSON secret value.
    assert_equal 'my_value', secrets.json.my_key
    assert_equal 4, client.api_requests.count {|req| req[:operation_name] == :get_secret_value}

    secrets.required('missing_key')
    e = assert_raises(Cdo::Secrets::NOT_FOUND) do
      secrets.required!
    end
    assert_match /Key: missing_key/, e.message
  end
end
