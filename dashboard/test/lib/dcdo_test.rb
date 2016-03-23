require 'test_helper'
require 'dynamic_config/dcdo'

class DCDOTest < ActiveSupport::TestCase
  class FakeListener
    attr_reader :changed

    def initialize
      @changed = false
    end

    def on_change
      @changed = true
    end
  end

  test 'basic set and get' do
    listener = FakeListener.new
    DCDO.add_change_listener(listener)
    assert !listener.changed
    DCDO.set('key', 'okay')
    assert_equal DCDO.get('key', nil), 'okay'
    assert listener.changed
  end

  test 'returns default if key is not stored' do
    assert_equal DCDO.get('UNSET_key', 123), 123
  end

  test 'storing hashes' do
    to_store = {
      'b' => 'yo dude',
      'c' => [1,2,3]
    }
    key = 'random'
    DCDO.set(key, to_store)
    assert_equal DCDO.get(key, nil), to_store
  end

  test 'storing a non-jsonable object fails' do
    class RandomClass
    end

    assert_raises do
      DCDO.set(key, RandomClass.new)
    end
  end
end
