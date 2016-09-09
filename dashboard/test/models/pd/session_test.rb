require 'test_helper'

class Pd::SessionTest < ActiveSupport::TestCase
  freeze_time

  test 'validation success' do
    session = build :pd_session
    assert session.valid?
  end

  test 'starts_and_ends_on_the_same_day validation error' do
    session = build :pd_session, start: Time.now, end: Time.now + 1.day
    refute session.valid?
    assert_equal 1, session.errors.messages.count
    assert_equal 'End must occur on the same day as the start.', session.errors.full_messages[0]
  end

  test 'starts_before_ends validation error' do
    session = build :pd_session, start: Time.now + 4.hours, end: Time.now
    refute session.valid?
    assert_equal 1, session.errors.messages.count
    assert_equal 'End must occur after the start.', session.errors.full_messages[0]
  end

  test 'formatted_date' do
    session = build :pd_session, start: DateTime.new(2016, 3, 1, 9).in_time_zone
    assert_equal '03/01/2016', session.formatted_date
  end

  test 'formatted_date_with_start_and_end_times' do
    session = create(:pd_session, start: DateTime.new(2016, 3, 1, 9).in_time_zone,
      end: DateTime.new(2016, 3, 1, 17).in_time_zone)

    assert_equal '03/01/2016, 9:00am-5:00pm', session.formatted_date_with_start_and_end_times
  end

  test 'soft delete' do
    session = create :pd_session
    attendance = create :pd_attendance, session: session
    session.reload.destroy!

    assert session.reload.deleted?
    refute Pd::Session.exists? session.attributes
    assert Pd::Session.with_deleted.exists? session.attributes

    # Make sure dependent attendances are also soft-deleted.
    assert attendance.reload.deleted?
    refute Pd::Attendance.exists? attendance.attributes
    assert Pd::Attendance.with_deleted.exists? attendance.attributes
  end
end
