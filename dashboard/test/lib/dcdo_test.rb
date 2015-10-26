require 'test_helper'
require 'dynamic_config/dcdo'


class DCDOTest < ActiveSupport::TestCase
  test 'returns default if key is not stored' do
    assert_equal DCDO.get('key', 123), 123
  end

  test 'returns stored value' do
    to_store = {
      b: 'yo dude',
      c: [1,2,3]
    }
    key = 'random'
    DCDO.set(key, to_store)
    assert_equal DCDO.get(key, nil), to_store
  end

  test 'returns default if fetching fails' do
    $dcdo_cache.stubs(:get).throws(StandardError)

    key = 'okay'
    value = 'whatev'
    DCDO.set(key, 12345)
    assert_equal DCDO.get(key, value), value
  end
end
