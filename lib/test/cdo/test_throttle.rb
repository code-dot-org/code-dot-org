require_relative '../test_helper'
require 'cdo/throttle'
require 'timecop'

class ThrottleTest < Minitest::Test
  def teardown
    CDO.shared_cache.delete_matched(Cdo::Throttle::CACHE_PREFIX)
  end

  def test_throttle_with_limit_1
    Timecop.freeze
    refute Cdo::Throttle.throttle("my_key", 1, 2) # 1/1 reqs per 2s - not throttled
    Timecop.travel(Time.now.utc + 1)
    assert Cdo::Throttle.throttle("my_key", 1, 2) # 2/1 reqs per 2s - throttled
    Timecop.travel(Time.now.utc + Cdo::Throttle.throttle_time - 1)
    assert Cdo::Throttle.throttle("my_key", 1, 2) # still throttled
    Timecop.travel(Time.now.utc + Cdo::Throttle.throttle_time)
    refute Cdo::Throttle.throttle("my_key", 1, 2) # 1/1 reqs per 2s after waiting - not throttled anymore
    Timecop.travel(Time.now.utc + 1)
    assert Cdo::Throttle.throttle("my_key", 1, 2) # 2/1 reqs per 2s - throttled again
  end

  def test_throttle_with_limit_greater_than_1
    Timecop.freeze
    refute Cdo::Throttle.throttle("my_key", 2, 2) # 1/2 reqs per 2s - not throttled
    Timecop.travel(Time.now.utc + 1)
    refute Cdo::Throttle.throttle("my_key", 2, 2) # 2/2 reqs per 2s - not throttled
    Timecop.travel(Time.now.utc + 0.5)
    assert Cdo::Throttle.throttle("my_key", 2, 2) # 3/2 reqs per 2s - throttled
    Timecop.travel(Time.now.utc + Cdo::Throttle.throttle_time)
    refute Cdo::Throttle.throttle("my_key", 2, 2) # 1/2 reqs per 2s after waiting - not throttled anymore
    Timecop.travel(Time.now.utc + 1)
    refute Cdo::Throttle.throttle("my_key", 2, 2) # 2/2 reqs per 2s - not throttled
    Timecop.travel(Time.now.utc + 0.5)
    assert Cdo::Throttle.throttle("my_key", 2, 2) # 3/2 reqs per 2s - throttled again
  end
end
