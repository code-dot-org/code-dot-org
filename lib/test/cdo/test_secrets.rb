require_relative '../test_helper'
require 'cdo/secrets'

class SecretsTest < Minitest::Test
  def setup
    @values = {}
    @client = Aws::SecretsManager::Client.new(
      stub_responses: {
        batch_get_secret_value: lambda do |ctx|
          ids = ctx.params[:secret_id_list]
          return 'ValidationException' if ids.any?(&:empty?)
          found, missing = ids.partition {|id| @values[id]}
          {
            secret_values: found.map {|id| {name: id, secret_string: @values[id]}},
            errors: missing.map {|id| {secret_id: id, error_code: 'ResourceNotFoundException'}}
          }
        end,
        get_secret_value: lambda do |ctx|
          id = ctx.params[:secret_id]
          return 'ResourceNotFoundException' unless (value = @values[id])
          {secret_string: value}
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

  # Secret IDs sent by each request of the given operation.
  def requested_ids(operation_name = :batch_get_secret_value)
    @client.api_requests.
      select {|req| req[:operation_name] == operation_name}.
      map {|req| req[:params][:secret_id_list] || req[:params][:secret_id]}
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

    assert_equal [['test'], ['test2']], requested_ids
    # A key missing from a batch is retried alone, which raises (or not) as before batching.
    assert_equal ['test2'], requested_ids(:get_secret_value)

    # Secret value that is JSON is returned as a Hash.
    assert_equal 'my_value', @secrets.json['my_key']
  end

  def test_get_multi_batches
    keys = (1..45).map {|i| "key#{i}"}
    keys.each {|key| @values[key] = "#{key} value"}
    assert_equal keys.to_h {|key| [key, "#{key} value"]}, @secrets.get_multi(*keys).value!

    assert_equal [20, 20, 5], requested_ids.map(&:size).sort.reverse
    assert_empty requested_ids(:get_secret_value)

    # Fetched values are cached.
    @secrets.get_multi(*keys).value!
    assert_equal 3, requested_ids.size
  end

  def test_get_required_fetches_all_required
    @values.merge!('a' => '1', 'b' => '2', 'c' => '3')
    @secrets.required('a', 'b', 'c')
    assert_equal '2', @secrets.get!('b')
    assert_equal [%w(b a c)], requested_ids

    assert_equal '1', @secrets.get!('a')
    assert_equal '3', @secrets.get!('c')
    assert_equal 1, requested_ids.size
  end

  def test_batch_failure_falls_back_to_get_secret_value
    @client.stub_responses(:batch_get_secret_value, 'AccessDeniedException')
    @values['a'] = '1'
    @values['b'] = '2'
    assert_equal({'a' => '1', 'b' => '2'}, @secrets.get_multi('a', 'b').value!)
    assert_equal %w(a b), requested_ids(:get_secret_value).sort
  end

  def test_batch_networking_error_falls_back_to_get_secret_value
    @client.stub_responses(:batch_get_secret_value, Seahorse::Client::NetworkingError.new(Errno::ECONNRESET.new))
    @values['a'] = '1'
    assert_equal '1', @secrets.get!('a')
    assert_equal %w(a), requested_ids(:get_secret_value)
  end

  def test_empty_key_is_not_batched
    @values['a'] = '1'
    @secrets.required('a', '')
    assert_equal '1', @secrets.get!('a')
    assert_equal [%w(a)], requested_ids
    assert_raises(Cdo::Secrets::NOT_FOUND) {@secrets.get!('')}
    assert_equal [''], requested_ids(:get_secret_value)
  end

  def test_required
    @secrets.required('missing_key')
    e = assert_raises(Cdo::Secrets::NOT_FOUND) do
      @secrets.required!
    end
    assert_match /Key: missing_key/, e.message
  end

  def test_required_no_keys
    secrets = Cdo::Secrets.new
    secrets.expects(:client).never
    assert_equal({}, secrets.required!)
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
    lazy1 = @secrets.lazy('key')
    assert_empty requested_ids
    assert_equal 'val', lazy1
    assert_equal 1, requested_ids.size

    @values['key2'] = 'val2'
    lazy2 = @secrets.lazy('key2', fetch: true)
    assert_equal 'val2', lazy2
    assert_equal [['key2']], requested_ids.drop(1)

    assert_nil @secrets.lazy('no_key')
    assert_raises(Cdo::Secrets::NOT_FOUND) do
      @secrets.lazy('no_key', raise_not_found: true).to_s
    end
  end
end
