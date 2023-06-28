require_relative '../test_helper'
require 'cdo/cpa'

class CPATest < Minitest::Test
  def test_cpa_experience_no_config
    assert_nil cpa_experience(nil, nil)
  end

  def test_cpa_experience_with_override
    result = cpa_experience(nil, CPA_ALL_USER_LOCKOUT)
    assert_equal CPA_ALL_USER_LOCKOUT, result
  end

  def test_cpa_experience_with_invalid_schedule
    result = cpa_experience({}, nil)
    assert_nil result
  end

  def test_cpa_experience_before_new_user_lockout
    current_time = DateTime.parse('2023-01-01T00:00:00Z')
    schedule = {
      CPA_NEW_USER_LOCKOUT => '2023-01-02T00:00:00Z',
      CPA_ALL_USER_LOCKOUT => '2023-01-03T00:00:00Z'
    }
    result = cpa_experience(schedule, nil, current_time)
    assert_nil result
  end

  def test_cpa_experience_after_new_user_lockout
    current_time = DateTime.parse('2023-01-02T00:00:01Z')
    schedule = {
      CPA_NEW_USER_LOCKOUT => '2023-01-02T00:00:00Z',
      CPA_ALL_USER_LOCKOUT => '2023-01-03T00:00:00Z'
    }
    result = cpa_experience(schedule, nil, current_time)
    assert_equal CPA_NEW_USER_LOCKOUT, result
  end

  def test_cpa_experience_after_all_user_lockout
    current_time = DateTime.parse('2023-01-03T00:00:01Z')
    schedule = {
      CPA_NEW_USER_LOCKOUT => '2023-01-02T00:00:00Z',
      CPA_ALL_USER_LOCKOUT => '2023-01-03T00:00:00Z'
    }
    result = cpa_experience(schedule, nil, current_time)
    assert_equal CPA_ALL_USER_LOCKOUT, result
  end
end
