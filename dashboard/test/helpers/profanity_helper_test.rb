require 'test_helper'

class ProfanityHelperTest < ActionView::TestCase
  test 'throttled_find_profanities: yields profanities if cached' do
    CDO.shared_cache.expects(:exist?).returns(true)
    expected_profanities = ['bad']
    CDO.shared_cache.expects(:read).once.returns(expected_profanities)
    Cdo::Throttle.expects(:throttle).never
    ProfanityFilter.expects(:find_potential_profanities).never

    actual_profanities = nil
    ProfanityHelper.throttled_find_profanities('bad words', 'en-US', 'a1b2c3', 1, 1) {|profanities| actual_profanities = profanities}
    assert_equal expected_profanities, actual_profanities
  end

  test 'throttled_find_profanities: does not yield if request is throttled' do
    CDO.shared_cache.expects(:read).never
    Cdo::Throttle.expects(:throttle).once.returns(true)
    ProfanityFilter.expects(:find_potential_profanities).never

    ProfanityHelper.throttled_find_profanities('throttled!', 'en-US', 'a1b2c3', 1, 1) {raise 'Error: Block unexpectedly executed.'}
  end

  test 'throttled_find_profanities: caches and yields profanities not cached or throttled' do
    CDO.shared_cache.expects(:read).never
    Cdo::Throttle.expects(:throttle).once.with("profanity/a1b2c3", 1, 1).returns(false)
    expected_profanities = ['bad']
    ProfanityFilter.expects(:find_potential_profanities).once.returns(expected_profanities)

    actual_profanities = nil
    ProfanityHelper.throttled_find_profanities('bad words', 'en-US', 'a1b2c3', 1, 1) {|profanities| actual_profanities = profanities}
    assert_equal expected_profanities, actual_profanities
  end

  test 'throttled_find_profanities: yields nil if text is empty' do
    CDO.shared_cache.expects(:read).never

    actual_profanities = -1
    ProfanityHelper.throttled_find_profanities('', 'en-US', 'a1b2c3', 1, 1) {|profanities| actual_profanities = profanities}
    assert_nil actual_profanities
  end
end
