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
    assert_equal '2016-03-01', session.formatted_date
  end

  test 'formatted_date_with_start_and_end_times' do
    session = create(
      :pd_session,
      start: DateTime.new(2016, 3, 1, 9).in_time_zone,
      end: DateTime.new(2016, 3, 1, 17).in_time_zone
    )

    assert_equal '2016-03-01, 9:00am-5:00pm', session.formatted_date_with_start_and_end_times
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

  test 'assign unique 4 character codes' do
    sessions = 10.times.map do
      create :pd_session, :with_assigned_code
    end

    codes = sessions.pluck(:code)
    assert codes.all? {|code| code.present? && code.length == 4}
    assert_equal 10, codes.uniq.size
  end

  test 'find by code' do
    session = create :pd_session, :with_assigned_code

    found_session = Pd::Session.find_by_code session.code
    assert_equal session, found_session

    session.tap(&:remove_code)
    assert_nil session.code
    assert_nil Pd::Session.find_by_code nil
  end

  test 'open for attendance' do
    workshop_started = create :workshop, :in_progress
    workshop_not_started = create :workshop
    workshop_ended = create :workshop, :ended

    session_open = create :pd_session, :with_assigned_code, workshop: workshop_started
    assert session_open.open_for_attendance?

    session_no_code = create :pd_session, workshop: workshop_started
    refute session_no_code.open_for_attendance?

    session_not_started = create :pd_session, workshop: workshop_not_started
    refute session_not_started.open_for_attendance?
    assert_nil workshop_not_started.started_at
    assert session_not_started.too_soon_for_attendance?
    refute session_not_started.too_late_for_attendance?

    session_future = create :pd_session, workshop: workshop_started, start: Time.now + 1.day
    refute session_future.open_for_attendance?
    assert session_future.too_soon_for_attendance?
    refute session_future.too_late_for_attendance?

    session_past = create :pd_session, workshop: workshop_started, start: Time.now - 1.day, end: Time.now - 23.hours
    refute session_past.open_for_attendance?
    refute session_past.too_soon_for_attendance?
    assert session_past.too_late_for_attendance?

    session_ended = create :pd_session, :with_assigned_code, workshop: workshop_ended
    assert session_ended.open_for_attendance?
    refute session_ended.too_soon_for_attendance?
    refute session_ended.too_late_for_attendance?
  end

  test 'workshop with first session in three days does not show links and is not open for attendance' do
    workshop = create :workshop, :in_progress, :with_codes_assigned, sessions_from: Time.now + 3.days

    refute workshop.sessions[0].open_for_attendance?
    refute workshop.sessions[0].show_link?
    assert workshop.sessions[0].too_soon_for_attendance?
    refute workshop.sessions[0].too_late_for_attendance?
  end

  test 'three day workshop with first session tomorrow shows two links but is not open for attendance' do
    workshop = create :workshop, :in_progress, :with_codes_assigned, num_sessions: 3, sessions_from: Time.now + 1.day - 1.minute

    refute workshop.sessions[0].open_for_attendance?
    assert workshop.sessions[0].show_link?
    refute workshop.sessions[1].open_for_attendance?
    assert workshop.sessions[1].show_link?
    refute workshop.sessions[2].open_for_attendance?
    refute workshop.sessions[2].show_link?
  end

  test 'three day workshop started on second day shows two links and has one session open for attendance' do
    workshop = create :workshop, :in_progress, :with_codes_assigned, num_sessions: 3, sessions_from: Time.now - 1.day - 1.minute

    refute workshop.sessions[0].open_for_attendance?
    refute workshop.sessions[0].show_link?
    assert workshop.sessions[1].open_for_attendance?
    assert workshop.sessions[1].show_link?
    refute workshop.sessions[2].open_for_attendance?
    assert workshop.sessions[2].show_link?
  end
end
