require 'test_helper'
require 'timecop'

class DeviseLockableTest < ActiveSupport::TestCase
  setup do
    Timecop.freeze
  end

  teardown do
    Timecop.return
  end

  test 'students do not get locked out' do
    student = create(:student)
    assert_nil student.failed_attempts
    refute student.access_locked?

    10.times do
      student.valid_for_authentication? {false}
      assert_nil student.reload.failed_attempts
      refute student.access_locked?
    end
  end

  test 'teachers do get locked out' do
    teacher = create(:teacher)
    assert_nil teacher.failed_attempts
    refute teacher.access_locked?

    # They don't get locked out after the first attempt.
    teacher.valid_for_authentication? {false}
    teacher.reload
    assert_equal 1, teacher.failed_attempts
    refute teacher.access_locked?

    # It will take more failed authentication attempts to do this in
    # production, but in the test environment we lock out users after
    # only two attempts.
    teacher.valid_for_authentication? {false}
    teacher.reload
    assert_equal 2, teacher.failed_attempts
    assert teacher.access_locked?
  end

  test 'locked-out accounts are automatically unlocked after an hour' do
    teacher = create(:teacher)
    teacher.lock_access!
    assert teacher.reload.access_locked?
    Timecop.travel(1.hour)
    refute teacher.reload.access_locked?
  end
end
