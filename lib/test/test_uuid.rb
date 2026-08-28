require_relative 'test_helper'

require 'uuid'

class UUIDTest < Minitest::Test
  def test_generate_returns_valid_uuid_v4
    expected_uuid = 'expected_uuid'
    SecureRandom.expects(:uuid).returns(expected_uuid)
    assert_equal expected_uuid, UUID.generate
  end

  def test_valid_returns_true_for_valid_uuid_v4
    assert UUID.valid?(SecureRandom.uuid)
  end

  def test_valid_accepts_uppercase_uuid
    assert UUID.valid?(SecureRandom.uuid.upcase)
  end

  def test_valid_returns_false_for_invalid_uuid
    refute UUID.valid?('invalid')
  end

  def test_valid_returns_false_for_non_string
    refute UUID.valid?(nil)
    refute UUID.valid?(123)
  end

  def test_parse_returns_valid_uuid
    expected_uuid = SecureRandom.uuid
    assert_equal expected_uuid, UUID.parse(expected_uuid)
  end

  def test_parse_returns_nil_for_invalid_uuid
    assert_nil UUID.parse('invalid')
  end

  def test_parse_returns_nil_for_non_string
    assert_nil UUID.parse(nil)
  end
end
