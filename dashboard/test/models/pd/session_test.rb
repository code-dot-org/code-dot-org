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
      create(:pd_session).tap(&:assign_code)
    end

    codes = sessions.pluck(:code)
    assert codes.all? {|code| code.present? && code.length == 4}
    assert_equal 10, codes.uniq.size
  end

  test 'find by code' do
    session = create(:pd_session).tap(&:assign_code)

    found_session = Pd::Session.find_by_code session.code
    assert_equal session, found_session

    session.tap(&:remove_code)
    assert_nil session.code
    assert_nil Pd::Session.find_by_code nil
  end

  test 'open for attendance' do
    workshop_started = create :pd_workshop, started_at: Time.now - 1.hour
    workshop_not_started = create :pd_workshop
    workshop_ended = create :pd_ended_workshop

    session_open = create(:pd_session, workshop: workshop_started).tap(&:assign_code)
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

    session_ended = create(:pd_session, workshop: workshop_ended).tap(&:assign_code)
    assert session_ended.open_for_attendance?
    refute session_ended.too_soon_for_attendance?
    refute session_ended.too_late_for_attendance?
  end

  test 'attendance link for one day workshop' do
    #current day is Saturday
    #workshop started Friday
    workshop_a = create :pd_workshop, started_at: Time.now - 1.day
    #session starts on Monday
    session_a = create(:pd_session, workshop: workshop_a, start: Time.now + 2.days - 1.minute).tap(&:assign_code)
    refute session_a.open_for_attendance?
    assert session_a.show_link?

    #current day is Friday
    #workshop started Friday
    workshop_a1 = create :pd_workshop, started_at: Time.now
    #session starts on Monday
    session_a1 = create :pd_session, workshop: workshop_a1, start: Time.now + 3.days
    refute session_a1.open_for_attendance?
    refute session_a1.show_link?
    assert session_a1.too_soon_for_attendance?
    refute session_a1.too_late_for_attendance?
  end

  test 'attendance link see immediately' do
    #current day is Saturday
    #workshop started Saturday
    workshop_b = create :pd_workshop, started_at: Time.now
    #session starts on Monday
    session_b = create(:pd_session, workshop: workshop_b, start: Time.now + 2.days - 1.minute).tap(&:assign_code)
    refute session_b.open_for_attendance?
    assert session_b.show_link?
  end

  test 'attendance links for three day workshop' do
    #current day is Saturday
    #workshop started Saturday
    workshop_c = create :pd_workshop, started_at: Time.now
    #session 1 starts on Monday, 2 on Tuesday, 3 on Wednesday
    session_c1a = create(:pd_session, workshop: workshop_c, start: Time.now + 2.days - 1.minute).tap(&:assign_code)
    session_c2b = create(:pd_session, workshop: workshop_c, start: Time.now + 3.days - 1.minute).tap(&:assign_code)
    session_c3c = create(:pd_session, workshop: workshop_c, start: Time.now + 4.days - 1.minute).tap(&:assign_code)
    refute session_c1a.open_for_attendance?
    assert session_c1a.show_link?
    refute session_c2b.open_for_attendance?
    refute session_c2b.show_link?
    refute session_c3c.open_for_attendance?
    refute session_c3c.show_link?

    #current day is Sunday
    #workshop started on Saturday
    workshop_c1 = create :pd_workshop, started_at: Time.now - 1.day
    #session 1 starts on Monday, 2 on Tuesday, 3 on Wednesday
    session_c1d = create(:pd_session, workshop: workshop_c1, start: Time.now + 1.day - 1.minute).tap(&:assign_code)
    session_c2e = create(:pd_session, workshop: workshop_c1, start: Time.now + 2.days - 1.minute).tap(&:assign_code)
    session_c3f = create(:pd_session, workshop: workshop_c1, start: Time.now + 3.days - 1.minute).tap(&:assign_code)
    refute session_c1d.open_for_attendance?
    assert session_c1d.show_link?
    refute session_c2e.open_for_attendance?
    assert session_c2e.show_link?
    refute session_c3f.open_for_attendance?
    refute session_c3f.show_link?

    #current day is Monday
    #workshop created on Saturday
    workshop_c2 = create :pd_workshop, started_at: Time.now - 2.days
    #session 1 starts on Monday, 2 on Tuesday, 3 on Wednesday
    session_c1g = create(:pd_session, workshop: workshop_c2, start: Time.now - 1.minute).tap(&:assign_code)
    session_c2h = create(:pd_session, workshop: workshop_c2, start: Time.now + 1.day - 1.minute).tap(&:assign_code)
    session_c3i = create(:pd_session, workshop: workshop_c2, start: Time.now + 2.days - 1.minute).tap(&:assign_code)
    assert session_c1g.open_for_attendance?
    assert session_c1g.show_link?
    refute session_c2h.open_for_attendance?
    assert session_c2h.show_link?
    refute session_c3i.open_for_attendance?
    assert session_c3i.show_link?

    #current day is Tuesday
    #workshop created on Saturday
    workshop_c3 = create :pd_workshop, started_at: Time.now - 3.days
    #session 1 starts on Monday, 2 on Tuesday, 3 on Wednesday
    session_c1j = create(:pd_session, workshop: workshop_c3, start: Time.now - 1.day - 1.minute).tap(&:assign_code)
    session_c2k = create(:pd_session, workshop: workshop_c3, start: Time.now - 1.minute).tap(&:assign_code)
    session_c3l = create(:pd_session, workshop: workshop_c3, start: Time.now + 1.day - 1.minute).tap(&:assign_code)
    refute session_c1j.open_for_attendance?
    refute session_c1j.show_link?
    assert session_c2k.open_for_attendance?
    assert session_c2k.show_link?
    refute session_c3l.open_for_attendance?
    assert session_c3l.show_link?
  end

  test 'attendance link for late start three day workshop' do
    #current day is Tuesday
    #workshop started Tuesday
    workshop_d = create :pd_workshop, started_at: Time.now
    #session 1 starts on Monday, 2 on Tuesday, 3 on Wednesday
    session_d1 = create(:pd_session, workshop: workshop_d, start: Time.now - 1.day - 1.minute).tap(&:assign_code)
    session_d2 = create(:pd_session, workshop: workshop_d, start: Time.now - 1.minute).tap(&:assign_code)
    session_d3 = create(:pd_session, workshop: workshop_d, start: Time.now + 1.day - 1.minute).tap(&:assign_code)
    refute session_d1.open_for_attendance?
    refute session_d1.show_link?
    assert session_d2.open_for_attendance?
    assert session_d2.show_link?
    refute session_d3.open_for_attendance?
    assert session_d3.show_link?
  end
end
