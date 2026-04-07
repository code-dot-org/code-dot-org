require_relative '../test_helper'
require 'cdo/secrets'

class SecretsTest < Minitest::Test
  def setup
    @values = {}
    @client = Aws::SecretsManager::Client.new(
      stub_responses: {
        get_secret_value: lambda do |ctx|
          id = ctx.params[:secret_id]
          return 'ResourceNotFoundException' unless (value = @values[id])
          {secret_string: value}
        end,
        batch_get_secret_value: lambda do |ctx|
          ids = ctx.params[:secret_id_list] || []
          secret_values = []
          errors = []
          ids.each do |id|
            if (value = @values[id])
              secret_values << {name: id, secret_string: value}
            else
              errors << {
                secret_id: id,
                error_code: 'ResourceNotFoundException',
                message: "Secrets Manager can't find the specified secret."
              }
            end
          end
          {secret_values: secret_values, errors: errors}
        end,
        create_secret: lambda do |ctx|
          id = ctx.params[:name]
          return 'ResourceExistsException' if @values[id]
          @values[id] = ctx.params[:secret_string]
          {}
        end,
        update_secret: lambda do |ctx|
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

  def batch_api_requests
    @client.api_requests.select {|req| req[:operation_name] == :batch_get_secret_value}
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

    # Secret value that is JSON is returned as a Hash.
    assert_equal 'my_value', @secrets.json['my_key']
  end

  def test_required
    @secrets.required('missing_key')
    e = assert_raises(Cdo::Secrets::NOT_FOUND) do
      @secrets.required!
    end
    assert_match /Key: missing_key/, e.message
    # Missing keys should be surfaced via the batch API, not via N individual calls.
    assert_equal 0, api_requests
    assert_equal 1, batch_api_requests.count
  end

  def test_required_no_keys
    secrets = Cdo::Secrets.new
    secrets.expects(:client).never
    assert_equal({}, secrets.required!)
  end

  def test_required_batches_in_single_call
    @values.merge!(
      'alpha' => 'A',
      'beta'  => 'B',
      'gamma' => {"nested" => "value"}.to_json
    )
    @secrets.required('alpha', 'beta', 'gamma')

    result = @secrets.required!
    assert_equal 'A', result['alpha']
    assert_equal 'B', result['beta']
    assert_equal({'nested' => 'value'}, result['gamma'])

    # All three keys should be fetched in a single BatchGetSecretValue call,
    # and no individual GetSecretValue requests should be issued.
    assert_equal 0, api_requests
    assert_equal 1, batch_api_requests.count
    assert_equal %w(alpha beta gamma), batch_api_requests.first[:params][:secret_id_list]
  end

  def test_required_splits_batches_above_limit
    # 45 keys should be split into 3 batches (20, 20, 5).
    keys = Array.new(45) {|i| "key#{i}"}
    keys.each {|k| @values[k] = "val-#{k}"}
    @secrets.required(*keys)

    result = @secrets.required!
    assert_equal 45, result.size
    assert_equal 'val-key0',  result['key0']
    assert_equal 'val-key44', result['key44']

    batches = batch_api_requests
    assert_equal 3, batches.count
    assert_equal([20, 20, 5], batches.map {|req| req[:params][:secret_id_list].length})
    assert_equal 0, api_requests
  end

  def test_required_populates_cache_for_single_gets
    @values['cached_key'] = 'cached_value'
    @secrets.required('cached_key')
    @secrets.required!

    assert_equal 1, batch_api_requests.count

    # A subsequent single get should hit the in-memory cache populated by
    # BatchGetSecretValue and not issue any additional AWS requests.
    assert_equal 'cached_value', @secrets['cached_key']
    assert_equal 'cached_value', @secrets.get!('cached_key')
    assert_equal 0, api_requests
    assert_equal 1, batch_api_requests.count
  end

  def test_required_skips_batch_for_already_cached_keys
    @values['preloaded'] = 'preloaded_value'
    # Populate the cache via the single-key path first.
    assert_equal 'preloaded_value', @secrets.get!('preloaded')
    assert_equal 1, api_requests

    # required! with only already-cached keys should NOT issue a batch request.
    @secrets.required('preloaded')
    assert_equal({'preloaded' => 'preloaded_value'}, @secrets.required!)
    assert_equal 0, batch_api_requests.count
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
