require 'test_helper'
require 'dynamic_config/dcdo'
require 'timeout'

class DCDOTest < ActiveSupport::TestCase
  setup do
    DCDO.unstub(:get)
  end

  test 'basic set and get' do
    key = SecureRandom.hex
    assert_nil DCDO.get(key, nil)
    DCDO.set(key, 'okay')

    result = nil
    Timeout.timeout(10) do
      loop do
        result = DCDO.get(key, nil)
        if result.present?
          break
        else
          sleep 1
        end
      end
    end

    assert_equal result, 'okay'
  end

  test 'returns default if key is not stored' do
    assert_equal DCDO.get('UNSET_key', 123), 123
  end

  test 'storing hashes' do
    to_store = {
      'b' => 'yo dude',
      'c' => [1, 2, 3]
    }
    key = SecureRandom.hex
    DCDO.set(key, to_store)

    result = nil
    Timeout.timeout(10) do
      loop do
        result = DCDO.get(key, nil)
        if result.present?
          break
        else
          sleep 1
        end
      end
    end

    assert_equal result, to_store
  end

  test 'storing a non-jsonable object fails' do
    class RandomClass
    end

    assert_raises do
      DCDO.set(key, RandomClass.new)
    end
  end

  test 'frontend_config should return a hash' do
    assert_instance_of(Hash, DCDO.frontend_config)
  end
end
