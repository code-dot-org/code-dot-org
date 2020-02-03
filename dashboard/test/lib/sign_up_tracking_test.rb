require 'test_helper'

class SignUpTrackingTest < ActiveSupport::TestCase
  UUID = 1234

  test 'begin_sign_up_tracking sets UID and expiration if split_test is false' do
    Timecop.freeze
    SecureRandom.expects(:uuid).returns(UUID)
    session = {}

    SignUpTracking.begin_sign_up_tracking(session, split_test: false)

    expected_session = {
      sign_up_uid: UUID.to_s,
      sign_up_tracking_expiration: 1.day.from_now
    }
    assert_equal session, expected_session
  end

  test 'begin_sign_up_tracking sets UID, expiration, and study group if split_test is true' do
    Timecop.freeze
    SecureRandom.expects(:uuid).returns(UUID)
    SignUpTracking.expects(:split_test_percentage).returns(100)
    session = {}

    SignUpTracking.begin_sign_up_tracking(session, split_test: true)

    expected_session = {
      sign_up_uid: UUID.to_s,
      sign_up_tracking_expiration: 1.day.from_now,
      sign_up_study_group: SignUpTracking::NEW_SIGN_UP_GROUP
    }
    assert_equal session, expected_session
  end

  test 'begin_sign_up_tracking does not overwrite UID, expiration, and study group if expiration is in the future' do
    Timecop.freeze
    SecureRandom.expects(:uuid).never
    Random.expects(:rand).never
    SignUpTracking.expects(:split_test_percentage).never
    session = {
      sign_up_uid: '4321',
      sign_up_tracking_expiration: 2.days.from_now,
      sign_up_study_group: 'my-new-study-group'
    }

    SignUpTracking.begin_sign_up_tracking(session, split_test: true)

    expected_session = {
      sign_up_uid: '4321',
      sign_up_tracking_expiration: 2.days.from_now,
      sign_up_study_group: 'my-new-study-group'
    }
    assert_equal session, expected_session
  end
end
