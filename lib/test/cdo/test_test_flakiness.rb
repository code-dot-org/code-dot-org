require_relative '../test_helper'
require 'cdo/test_flakiness'

class TestFlakinessTest < Minitest::Test
  def test_from_timestamp
    File.stubs(:exist?).returns(true)
    File.stubs(:read).returns("{\"timestamp\":123}")
    assert_equal 123, TestFlakiness.from_timestamp
    CDO.cache.clear
  end

  def test_from_timestamp_nonexistent_file
    File.stubs(:exist?).returns(false)
    assert_nil TestFlakiness.from_timestamp
    CDO.cache.clear
  end

  def test_from_timestamp_invalid_timestamp
    File.stubs(:exist?).returns(true)
    File.stubs(:read).returns("{\"timestamp\":\"hello\"}")
    assert_nil TestFlakiness.from_timestamp
    CDO.cache.clear
  end
end
