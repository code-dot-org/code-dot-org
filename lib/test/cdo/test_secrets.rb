require_relative '../test_helper'
require 'cdo/secrets'

class SecretsTest < Minitest::Test
  def setup
    @values = {}
    @client = Aws::SecretsManager::Client.new(
      stub_responses: {
        get_secret_value: ->(ctx) do
          id = ctx.params[:secret_id]
          return 'ResourceNotFoundException' unless (value = @values[id])
          {secret_string: value}
        end,
        create_secret: ->(ctx) do
          id = ctx.params[:name]
          return 'ResourceExistsException' if @values[id]
          @values[id] = ctx.params[:secret_string]
          {}
        end,
        update_secret: ->(ctx) do
          id = ctx.params[:secret_id]
          @values[id] = ctx.params[:secret_string]
          {}
        end
      }
    )
    @secrets = Cdo::Secrets.new(
      client: @client
    )
  end

  def api_requests
    @client.api_requests.count {|req| req[:operation_name] == :get_secret_value}
  end

  def test_get
    @values.merge!(
      'shared/cdo/test' => 'test456',
      'test' => 'test123',
      'json' => {my_key: 'my_value'}.to_json
    )
    assert_equal 'test123', @secrets['test']
    assert_equal 'test123', @secrets.get('test').value
    assert_equal 'test123', @secrets.test
    assert_nil @secrets.get('test2').value

    assert_equal 'test', @client.api_requests.detect {|req| req[:operation_name] == :get_secret_value}[:params][:secret_id]

    # Ensure API calls to GetSecretValue are cached.
    assert_equal 2, api_requests

    # Property-method lookup chain on JSON secret value.
    assert_equal 'my_value', @secrets.json.my_key
  end

  def test_required
    @secrets.required('missing_key')
    e = assert_raises(Cdo::Secrets::NOT_FOUND) do
      @secrets.required!
    end
    assert_match /Key: missing_key/, e.message
  end

  def test_create
    @secrets.put('test_create', 123)
    assert_equal '123', @secrets.get!('test_create')
  end

  def test_update
    @secrets.put('test_update', 123)
    @secrets.put('test_update', 456)
    assert_equal '456', @secrets.get!('test_update')
  end

  def test_inspect
    assert_equal 'Cdo::Secrets', @secrets.inspect
  end

  def test_lazy
    @values['key'] = 'val'
    lazy1 = @secrets.lazy('key', fetch: true)
    assert_equal 0, api_requests
    assert_equal 'val', lazy1
    assert_equal 1, api_requests

    assert_nil @secrets.lazy('no_key')
    assert_raises(Cdo::Secrets::NOT_FOUND) do
      @secrets.lazy('no_key', raise_not_found: true).to_s
    end
  end
end
