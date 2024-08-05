require 'test_helper'
require 'dynamic_config/dcdo'

class DCDOTest < ActiveSupport::TestCase
  setup do
    # DCDO needs to be created using a unique cache key, so that it doesn't conflict
    # with the "real" DCDO, which is cleared between tests in the test_helper.
    @dcdo = DCDOBase.new(EnvironmentAwareDynamicConfigHelper.create_datastore_cache(SecureRandom.hex))
  end

  teardown do
    # Since this is a separate instance of DCDOBase, we need to clear it here.
    @dcdo.clear
  end

  test 'basic set and get' do
    assert_nil @dcdo.get('key', nil)
    @dcdo.set('key', 'okay')
    assert_equal @dcdo.get('key', nil), 'okay'
  end

  test 'returns default if key is not stored' do
    assert_equal @dcdo.get('UNSET_key', 123), 123
  end

  test 'storing hashes' do
    to_store = {
      'b' => 'yo dude',
      'c' => [1, 2, 3]
    }
    key = 'random'
    @dcdo.set(key, to_store)
    assert_equal @dcdo.get(key, nil), to_store
  end

  test 'storing a non-jsonable object fails' do
    class RandomClass
    end

    assert_raises do
      @dcdo.set(key, RandomClass.new)
    end
  end

  test 'frontend_config should return a hash' do
    assert_instance_of(Hash, @dcdo.frontend_config)
  end
end
