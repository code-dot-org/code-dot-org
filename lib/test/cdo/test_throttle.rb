require_relative '../test_helper'
require 'cdo/throttle'
require 'timecop'

class ThrottleTest < Minitest::Test
  def setup
    Timecop.freeze
    @start_time = Time.now.utc
    @throttle_id = 'my_key'
    @cache_key = Cdo::Throttle.cache_key(@throttle_id)
  end

  def teardown
    Timecop.return
    CDO.shared_cache.delete_matched(Cdo::Throttle::CACHE_PREFIX)
  end

  def test_throttle_with_limit_1
    refute Cdo::Throttle.throttle(@throttle_id, 1, 2) # 1/1 reqs per 2s - not throttled
    refute Cdo::Throttle.throttled?(@throttle_id)
    Timecop.travel(Time.now.utc + 1)
    assert Cdo::Throttle.throttle(@throttle_id, 1, 2) # 2/1 reqs per 2s - throttled
    assert Cdo::Throttle.throttled?(@throttle_id)
    Timecop.travel(Time.now.utc + Cdo::Throttle.throttle_time - 1)
    assert Cdo::Throttle.throttle(@throttle_id, 1, 2) # still throttled
    Timecop.travel(Time.now.utc + Cdo::Throttle.throttle_time)
    refute Cdo::Throttle.throttle(@throttle_id, 1, 2) # 1/1 reqs per 2s after waiting - not throttled anymore
    Timecop.travel(Time.now.utc + 1)
    assert Cdo::Throttle.throttle(@throttle_id, 1, 2) # 2/1 reqs per 2s - throttled again
  end

  def test_throttle_with_limit_greater_than_1
    refute Cdo::Throttle.throttle(@throttle_id, 2, 2) # 1/2 reqs per 2s - not throttled
    refute Cdo::Throttle.throttled?(@throttle_id)
    Timecop.travel(Time.now.utc + 1)
    refute Cdo::Throttle.throttle(@throttle_id, 2, 2) # 2/2 reqs per 2s - not throttled
    Timecop.travel(Time.now.utc + 0.5)
    assert Cdo::Throttle.throttle(@throttle_id, 2, 2) # 3/2 reqs per 2s - throttled
    assert Cdo::Throttle.throttled?(@throttle_id)
    Timecop.travel(Time.now.utc + Cdo::Throttle.throttle_time)
    refute Cdo::Throttle.throttle(@throttle_id, 2, 2) # 1/2 reqs per 2s after waiting - not throttled anymore
    Timecop.travel(Time.now.utc + 1)
    refute Cdo::Throttle.throttle(@throttle_id, 2, 2) # 2/2 reqs per 2s - not throttled
    Timecop.travel(Time.now.utc + 0.5)
    assert Cdo::Throttle.throttle(@throttle_id, 2, 2) # 3/2 reqs per 2s - throttled again
  end

  def test_throttle_single_request_with_count_metric
    refute Cdo::Throttle.throttle(@throttle_id, 1, 1, throttle_for: 1, count: 1) # 1/1 count per 1s - not throttled
    refute Cdo::Throttle.throttled?(@throttle_id)
    Timecop.travel(Time.now.utc + 1)
    assert Cdo::Throttle.throttle(@throttle_id, 1, 1, throttle_for: 1, count: 2) # 2/1 count per 1s - throttled
    assert Cdo::Throttle.throttled?(@throttle_id)
  end

  def test_throttle_multiple_requests_with_count_metric
    refute Cdo::Throttle.throttle(@throttle_id, 4, 2, throttle_for: 1, count: 2) # 2/4 count per 2s - not throttled
    refute Cdo::Throttle.throttled?(@throttle_id)
    Timecop.travel(Time.now.utc + 1)
    assert Cdo::Throttle.throttle(@throttle_id, 4, 2, throttle_for: 1, count: 3) # 5/4 count per 2s - throttled
    assert Cdo::Throttle.throttled?(@throttle_id)
    Timecop.travel(Time.now.utc + Cdo::Throttle.throttle_time)
    refute Cdo::Throttle.throttle(@throttle_id, 4, 2, throttle_for: 1, count: 2) # 2/4 count per 2s after waiting - not throttled anymore
    Timecop.travel(Time.now.utc + 1)
    refute Cdo::Throttle.throttle(@throttle_id, 4, 2, throttle_for: 1, count: 2) # 4/4 count per 2s - not throttled
  end

  def test_throttle_expiration
    period = 2.days
    throttle_time = 3.days

    Cdo::Throttle.throttle(@throttle_id, 1, period, throttle_for: throttle_time)
    assert CDO.shared_cache.read(@cache_key)

    # Throttle data will be preserved for a little while,
    Timecop.travel(@start_time + 1)
    assert CDO.shared_cache.read(@cache_key)
    Timecop.travel(@start_time + period + throttle_time - 1)
    assert CDO.shared_cache.read(@cache_key)

    # but will expire eventually.
    Timecop.travel(@start_time + period + throttle_time)
    refute CDO.shared_cache.read(@cache_key)
  end

  def test_throttle_minimum_expiration
    period = 2.hours
    throttle_time = 3.hours

    Cdo::Throttle.throttle(@throttle_id, 1, period, throttle_for: throttle_time)
    assert CDO.shared_cache.read(@cache_key)

    # Throttle data will be preserved for a minimum period of time, even if
    # it's longer than strictly necessary,
    Timecop.travel(@start_time + period + throttle_time)
    assert CDO.shared_cache.read(@cache_key)
    Timecop.travel(@start_time + period + throttle_time + 1)
    assert CDO.shared_cache.read(@cache_key)

    # but will still expire eventually.
    Timecop.travel(@start_time + Cdo::Throttle::MINIMUM_EXPIRATION)
    refute CDO.shared_cache.read(@cache_key)
  end
end
