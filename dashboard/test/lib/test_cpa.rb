require_relative '../test_helper'
require 'cpa'

class CPATest < Minitest::Test
  def setup
    @request = mock
    @request.stubs(:params).with(any_parameters).returns({})
    @request.stubs(:cookies).with(any_parameters).returns({})
  end

  def stub_dcdo(schedule, cpa_experience)
    DCDO.stubs(:get).with('cpa_schedule', nil).returns(schedule)
    DCDO.stubs(:get).with('cpa_experience', nil).returns(cpa_experience)
  end

  def test_cpa_experience_no_config
    stub_dcdo(nil, nil)
    assert_nil Cpa.cpa_experience(@request)
  end

  def test_cpa_experience_with_override
    stub_dcdo(nil, Cpa::ALL_USER_LOCKOUT)
    result = Cpa.cpa_experience(@request)
    assert_equal Cpa::ALL_USER_LOCKOUT, result
  end

  def test_cpa_experience_with_invalid_schedule
    stub_dcdo({}, nil)
    result = Cpa.cpa_experience(@request)
    assert_nil result
  end

  def test_cpa_experience_before_new_user_lockout
    current_time = DateTime.parse('2023-01-01T00:00:00Z')
    schedule = {
      Cpa::NEW_USER_LOCKOUT => '2023-01-02T00:00:00Z',
      Cpa::ALL_USER_LOCKOUT => '2023-01-03T00:00:00Z'
    }
    stub_dcdo(schedule, nil)
    result = Cpa.cpa_experience(@request, current_time: current_time)
    assert_nil result
  end

  def test_cpa_experience_after_new_user_lockout
    current_time = DateTime.parse('2023-01-02T00:00:01Z')
    schedule = {
      Cpa::NEW_USER_LOCKOUT => '2023-01-02T00:00:00Z',
      Cpa::ALL_USER_LOCKOUT => '2023-01-03T00:00:00Z'
    }
    stub_dcdo(schedule, nil)
    result = Cpa.cpa_experience(@request, current_time: current_time)
    assert_equal Cpa::NEW_USER_LOCKOUT, result
  end

  def test_cpa_experience_after_all_user_lockout
    current_time = DateTime.parse('2023-01-03T00:00:01Z')
    schedule = {
      Cpa::NEW_USER_LOCKOUT => '2023-01-02T00:00:00Z',
      Cpa::ALL_USER_LOCKOUT => '2023-01-03T00:00:00Z'
    }
    stub_dcdo(schedule, nil)
    result = Cpa.cpa_experience(@request, current_time: current_time)
    assert_equal Cpa::ALL_USER_LOCKOUT, result
  end
end
