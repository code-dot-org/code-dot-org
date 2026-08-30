require_relative '../test_helper'

require 'cdo/uuid'

class CdoUUIDTest < Minitest::Test
  def test_generate_returns_valid_uuid_v4
    expected_uuid = 'expected_uuid'
    SecureRandom.expects(:uuid).returns(expected_uuid)
    assert_equal expected_uuid, Cdo::UUID.generate
  end

  def test_valid_returns_true_for_valid_uuid_v4
    assert Cdo::UUID.valid?(SecureRandom.uuid)
  end

  def test_valid_accepts_uppercase_uuid
    assert Cdo::UUID.valid?(SecureRandom.uuid.upcase)
  end

  def test_valid_returns_false_for_invalid_uuid
    refute Cdo::UUID.valid?('invalid')
  end

  def test_valid_returns_false_for_non_string
    refute Cdo::UUID.valid?(nil)
    refute Cdo::UUID.valid?(123)
  end

  def test_valid_value_returns_valid_uuid
    expected_uuid = SecureRandom.uuid
    assert_equal expected_uuid, Cdo::UUID.valid_value(expected_uuid)
  end

  def test_valid_value_returns_nil_for_invalid_uuid
    assert_nil Cdo::UUID.valid_value('invalid')
  end

  def test_valid_value_returns_nil_for_non_string
    assert_nil Cdo::UUID.valid_value(nil)
  end
end
