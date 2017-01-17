require 'test_helper'

class Pd::WorkshopTest < ActiveSupport::TestCase
  freeze_time

  setup do
    @organizer = create(:workshop_organizer)
    @workshop = create(:pd_workshop, organizer: @organizer)
  end

  test 'query by organizer' do
    # create a workshop with a different organizer, which should not be returned below
    create(:pd_workshop)

    workshops = Pd::Workshop.organized_by @organizer
    assert_equal 1, workshops.length
    assert_equal workshops.first, @workshop
  end

  test 'query by facilitator' do
    facilitator = create(:facilitator)
    @workshop.facilitators << facilitator
    @workshop.save!

    # create a workshop with a different facilitator, which should not be returned below
    create(:pd_workshop, facilitators: [create(:facilitator)])

    workshops = Pd::Workshop.facilitated_by facilitator
    assert_equal 1, workshops.length
    assert_equal workshops.first, @workshop
  end

  test 'query by enrolled teacher' do
    # Teachers enroll in a workshop as a whole
    teacher = create :teacher
    create :pd_enrollment, workshop: @workshop, full_name: teacher.name, email: teacher.email

    # create a workshop with a different teacher enrollment, which should not be returned below
    other_workshop = create(:pd_workshop)
    create :pd_enrollment, workshop: other_workshop

    workshops = Pd::Workshop.enrolled_in_by teacher
    assert_equal 1, workshops.length
    assert_equal workshops.first, @workshop
  end

  test 'query by attended teacher' do
    # Teachers attend individual sessions in the workshop
    teacher = create :teacher
    session = create :pd_session
    @workshop.sessions << session
    create :pd_attendance, session: session, teacher: teacher

    # create a workshop attended by a different teacher, which should not be returned below
    other_workshop = create(:pd_workshop)
    other_session = create(:pd_session)
    other_workshop.sessions << other_session
    create :pd_attendance, session: other_session

    workshops = Pd::Workshop.attended_by teacher
    assert_equal 1, workshops.length
    assert_equal workshops.first, @workshop
  end

  test 'query by state' do
    workshop_not_started = @workshop
    workshop_in_progress = create :pd_workshop
    workshop_in_progress.started_at = Time.now
    workshop_in_progress.save!

    workshop_ended = create :pd_workshop
    workshop_ended.started_at = Time.now
    workshop_ended.ended_at = Time.now + 1.hour
    workshop_ended.save!

    not_started = Pd::Workshop.in_state(Pd::Workshop::STATE_NOT_STARTED)
    assert_equal 1, not_started.count
    assert_equal workshop_not_started.id, not_started[0][:id]

    in_progress = Pd::Workshop.in_state(Pd::Workshop::STATE_IN_PROGRESS)
    assert_equal 1, in_progress.count
    assert_equal workshop_in_progress.id, in_progress[0][:id]

    ended = Pd::Workshop.in_state(Pd::Workshop::STATE_ENDED)
    assert_equal 1, ended.count
    assert_equal workshop_ended.id, ended[0][:id]
  end

  test 'wont start without a session' do
    assert_equal 0, @workshop.sessions.length
    e = assert_raises Exception do
      @workshop.start!
    end
    assert_equal 'Workshop must have at least one session to start.', e.message
  end

  test 'start end' do
    @workshop.sessions << create(:pd_session)
    assert_equal 'Not Started', @workshop.state

    returned_section = @workshop.start!
    assert returned_section
    @workshop.reload
    assert_equal 'In Progress', @workshop.state
    assert @workshop.section
    assert_equal returned_section, @workshop.section
    assert @workshop.section.workshop_section?
    assert_equal @workshop.section_type, @workshop.section.section_type

    @workshop.end!
    @workshop.reload
    assert_equal 'Ended', @workshop.state
  end

  test 'start is idempotent' do
    @workshop.sessions << create(:pd_session)
    returned_section = @workshop.start!
    assert returned_section
    started_at = @workshop.reload.started_at

    returned_section_2 = @workshop.start!
    assert returned_section_2
    assert_equal returned_section, returned_section_2
    assert_equal started_at, @workshop.reload.started_at
  end

  test 'end is idempotent' do
    @workshop.sessions << create(:pd_session)
    @workshop.start!
    @workshop.end!
    ended_at = @workshop.reload.ended_at
    @workshop.end!
    assert_equal ended_at, @workshop.reload.ended_at
  end

  test 'sessions must start on separate days' do
    @workshop.sessions << create(:pd_session)
    @workshop.sessions << create(:pd_session)

    refute @workshop.valid?
    assert_equal 1, @workshop.errors.count
    assert_equal 'Sessions must start on separate days.', @workshop.errors.full_messages.first
  end

  test 'sessions must start and end on the same day' do
    session = build :pd_session, start: Time.zone.now, end: Time.zone.now + 1.day
    @workshop.sessions << session

    refute @workshop.valid?
    assert_equal 1, @workshop.errors.count
    assert_equal 'Sessions end must occur on the same day as the start.', @workshop.errors.full_messages.first
  end

  test 'sessions must start before they end' do
    session = build :pd_session, start: Time.zone.now, end: Time.zone.now - 2.hours
    @workshop.sessions << session

    refute @workshop.valid?
    assert_equal 1, @workshop.errors.count
    assert_equal 'Sessions end must occur after the start.', @workshop.errors.full_messages.first
  end

  # Email queries
  test 'single session start_in_days and end_in_days' do
    workshop_in_10_days_early = create :pd_workshop, sessions: [session_on_day_early(10)]
    workshop_in_10_days = create :pd_workshop, sessions: [session_on_day(10)]
    workshop_in_10_days_late = create :pd_workshop, sessions: [session_on_day_late(10)]

    # Noise
    create :pd_workshop, sessions: [session_on_day_early(9)]
    create :pd_workshop, sessions: [session_on_day(9)]
    create :pd_workshop, sessions: [session_on_day_late(9)]
    create :pd_workshop, sessions: [session_on_day_early(11)]
    create :pd_workshop, sessions: [session_on_day(11)]
    create :pd_workshop, sessions: [session_on_day_late(11)]

    start_expected = [workshop_in_10_days_early, workshop_in_10_days, workshop_in_10_days_late].map(&:id)
    assert_equal start_expected, Pd::Workshop.start_in_days(10).all.map(&:id)

    end_expected = [workshop_in_10_days_early, workshop_in_10_days, workshop_in_10_days_late].map(&:id)
    assert_equal end_expected, Pd::Workshop.end_in_days(10).all.map(&:id)
  end

  test 'multiple session start_in_days and end_in_days' do
    workshop_starting_on_day_10 = create :pd_workshop, sessions: [session_on_day(10), session_on_day(11), session_on_day(12)]
    workshop_ending_on_day_10 = create :pd_workshop, sessions: [session_on_day(8), session_on_day(9), session_on_day(10)]

    # Noise
    create :pd_workshop, sessions: [session_on_day(8), session_on_day(9)]
    create :pd_workshop, sessions: [session_on_day(5), session_on_day(10), session_on_day(15)]
    create :pd_workshop, sessions: [session_on_day(11), session_on_day(12)]

    start_expected = [workshop_starting_on_day_10].map(&:id)
    assert_equal start_expected, Pd::Workshop.start_in_days(10).all.map(&:id)

    end_expected = [workshop_ending_on_day_10].map(&:id)
    assert_equal end_expected, Pd::Workshop.end_in_days(10).all.map(&:id)
  end

  test 'process_ended_workshop_async' do
    workshop = create :pd_ended_workshop
    Pd::Workshop.expects(:find).with(workshop.id).returns(workshop)
    workshop.expects(:send_exit_surveys)

    Pd::Workshop.process_ended_workshop_async workshop.id
  end

  test 'process_ended_workshop_async for non-closed workshop raises error' do
    workshop = create :pd_workshop

    e = assert_raises RuntimeError do
      Pd::Workshop.process_ended_workshop_async workshop.id
    end
    assert e.message.include? 'Unexpected workshop state'
  end

  test 'account_required_for_attendance?' do
    normal_workshop = create :pd_ended_workshop
    counselor_workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_COUNSELOR
    admin_workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_ADMIN

    assert normal_workshop.account_required_for_attendance?
    refute counselor_workshop.account_required_for_attendance?
    refute admin_workshop.account_required_for_attendance?
  end

  test 'send_exit_surveys enrolled-only teacher does not get mail' do
    workshop = create :pd_ended_workshop

    create :pd_workshop_participant, workshop: workshop, enrolled: true
    Pd::Enrollment.any_instance.expects(:send_exit_survey).never

    workshop.send_exit_surveys
  end

  test 'send_exit_surveys with attendance but no account gets email for counselor admin' do
    workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_COUNSELOR, num_sessions: 1

    enrollment = create :pd_enrollment, workshop: workshop
    create :pd_attendance_no_account, session: workshop.sessions.first, enrollment: enrollment

    refute workshop.account_required_for_attendance?
    Pd::Enrollment.any_instance.expects(:send_exit_survey)
    workshop.send_exit_surveys
  end

  test 'send_exit_surveys teachers in the section get emails' do
    workshop = create :pd_ended_workshop
    create(:pd_workshop_participant, workshop: workshop, enrolled: true, in_section: true)
    create(:pd_workshop_participant, workshop: workshop, enrolled: true, in_section: true, attended: true)

    assert workshop.account_required_for_attendance?
    Pd::Enrollment.any_instance.expects(:send_exit_survey).times(2)

    workshop.send_exit_surveys
  end

  test 'find_by_section_code' do
    section = create :section
    assert_nil Pd::Workshop.find_by_section_code(section.code)

    workshop = create :pd_workshop, section: section
    assert_equal workshop, Pd::Workshop.find_by_section_code(section.code)
    assert_nil Pd::Workshop.find_by_section_code('nonsense code')
  end

  test 'soft delete' do
    session = create :pd_session, workshop: @workshop
    enrollment = create :pd_enrollment, workshop: @workshop
    @workshop.reload.destroy!

    assert @workshop.reload.deleted?
    refute Pd::Workshop.exists? @workshop.attributes
    assert Pd::Workshop.with_deleted.exists? @workshop.attributes

    # Make sure dependent sessions and enrollments are also soft-deleted.
    assert session.reload.deleted?
    refute Pd::Session.exists? session.attributes
    assert Pd::Session.with_deleted.exists? session.attributes

    assert enrollment.reload.deleted?
    refute Pd::Enrollment.exists? enrollment.attributes
    assert Pd::Enrollment.with_deleted.exists? enrollment.attributes
  end

  test 'friendly name' do
    workshop = create :pd_workshop, course: Pd::Workshop::COURSE_CSF, location_name: 'Code.org',
      sessions: [create(:pd_session, start: Date.new(2016, 9, 1))]

    # no subject
    assert_equal 'CS Fundamentals workshop on 09/01/16 at Code.org', workshop.friendly_name

    # with subject
    workshop.update!(course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_5)
    assert_equal 'Exploring Computer Science Unit 5 - Data workshop on 09/01/16 at Code.org', workshop.friendly_name

    # truncated at 255 chars
    workshop.update!(location_name: "blah" * 60)
    assert workshop.friendly_name.start_with? 'Exploring Computer Science Unit 5 - Data workshop on 09/01/16 at blahblahblah'
    assert workshop.friendly_name.length == 255
  end

  test 'start date filters' do
    pivot_date = Date.today
    workshop_before = create :pd_workshop, sessions: [create(:pd_session, start: pivot_date - 1.week)]
    # Start in the middle of the day. Since the filter is by date, this should be included in all the queries.
    workshop_pivot = create :pd_workshop, sessions: [create(:pd_session, start: pivot_date + 8.hours)]
    workshop_after = create :pd_workshop, sessions: [create(:pd_session, start: pivot_date + 1.week)]

    # on or before
    assert_equal [workshop_before, workshop_pivot].map(&:id).sort,
      Pd::Workshop.start_on_or_before(pivot_date).pluck(:id).sort

    # on or after
    assert_equal [workshop_pivot, workshop_after].map(&:id).sort,
      Pd::Workshop.start_on_or_after(pivot_date).pluck(:id).sort

    # combined
    assert_equal [workshop_pivot.id],
      Pd::Workshop.start_on_or_after(pivot_date).start_on_or_before(pivot_date).pluck(:id)
  end

  test 'end date filters' do
    pivot_date = Date.today
    workshop_before = create :pd_workshop, ended_at: pivot_date - 1.week
    # End in the middle of the day. Since the filter is by date, this should be included in all the queries.
    workshop_pivot = create :pd_workshop, ended_at: pivot_date + 8.hours
    workshop_after = create :pd_workshop, ended_at: pivot_date + 1.week

    # on or before
    assert_equal [workshop_before, workshop_pivot].map(&:id).sort,
      Pd::Workshop.end_on_or_before(pivot_date).pluck(:id).sort

    # on or after
    assert_equal [workshop_pivot, workshop_after].map(&:id).sort,
      Pd::Workshop.end_on_or_after(pivot_date).pluck(:id).sort

    # combined
    assert_equal [workshop_pivot.id],
      Pd::Workshop.end_on_or_after(pivot_date).end_on_or_before(pivot_date).pluck(:id)
  end

  test 'time constraints' do
    # TIME_CONSTRAINTS_BY_SUBJECT: SUBJECT_ECS_PHASE_4 => {min_days: 2, max_days: 3, max_hours: 18}
    workshop_2_3_18 = create :pd_workshop,
      course: Pd::Workshop::COURSE_ECS,
      subject: Pd::Workshop::SUBJECT_ECS_PHASE_4,
      num_sessions: 2
    assert_equal 2, workshop_2_3_18.min_attendance_days
    assert_equal 2, workshop_2_3_18.effective_num_days
    assert_equal 12, workshop_2_3_18.effective_num_hours

    # Add 2 more sessions for a total of 4. It should cap at 3 days / 18 hours
    workshop_2_3_18.sessions << [create(:pd_session), create(:pd_session)]
    assert_equal 3, workshop_2_3_18.effective_num_days
    assert_equal 18, workshop_2_3_18.effective_num_hours

    # No entry: min 1, max unlimited
    workshop_no_constraint = create :pd_workshop, course: Pd::Workshop::COURSE_ADMIN, num_sessions: 2
    assert_equal 1, workshop_no_constraint.min_attendance_days
    assert_equal 2, workshop_no_constraint.effective_num_days
    assert_equal 12, workshop_no_constraint.effective_num_hours
  end

  test 'plp' do
    assert_nil @workshop.professional_learning_partner

    # Now create a plp associated with the organizer
    plp = create :professional_learning_partner, contact: @organizer

    assert @workshop.professional_learning_partner
    assert_equal plp, @workshop.professional_learning_partner
  end

  test 'errors in teacher reminders in send_reminder_for_upcoming_in_days do not stop batch' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil).then.raises(RuntimeError, 'bad email').then.returns(nil).then.returns(nil).then.returns(nil).then.returns(nil)
    3.times do
      Pd::WorkshopMailer.expects(:teacher_enrollment_reminder).returns(mock_mail)
    end
    2.times do
      Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).returns(mock_mail)
    end
    Pd::WorkshopMailer.expects(:organizer_enrollment_reminder).returns(mock_mail)

    workshop = create :pd_workshop, facilitators: [create(:facilitator), create(:facilitator)]
    3.times{create :pd_enrollment, workshop: workshop}
    Pd::Workshop.expects(:start_in_days).returns([workshop])

    e = assert_raises RuntimeError do
      Pd::Workshop.send_reminder_for_upcoming_in_days(1)
    end
    assert e.message.include? 'Failed to send 1 day workshop reminders:'
    assert e.message.include? 'teacher enrollment'
    assert e.message.include? 'bad email'
  end

  test 'errors in organizer reminders in send_reminder_for_upcoming_in_days do not stop batch' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil).then.returns(nil).then.returns(nil).then.returns(nil).then.returns(nil).then.raises(RuntimeError, 'bad email')
    3.times do
      Pd::WorkshopMailer.expects(:teacher_enrollment_reminder).returns(mock_mail)
    end
    2.times do
      Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).returns(mock_mail)
    end

    Pd::WorkshopMailer.expects(:organizer_enrollment_reminder).returns(mock_mail)

    workshop = create :pd_workshop, facilitators: [create(:facilitator), create(:facilitator)]
    3.times{create :pd_enrollment, workshop: workshop}
    Pd::Workshop.expects(:start_in_days).returns([workshop])

    e = assert_raises RuntimeError do
      Pd::Workshop.send_reminder_for_upcoming_in_days(1)
    end
    assert e.message.include? 'Failed to send 1 day workshop reminders:'
    assert e.message.include? 'organizer workshop'
    assert e.message.include? 'bad email'
  end

  test 'errors in facilitator reminders in send_reminder_for_upcoming_in_days do not stop batch' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil).then.returns(nil).then.returns(nil).then.returns(nil).then.raises(RuntimeError, 'bad email').then.returns(nil)
    3.times do
      Pd::WorkshopMailer.expects(:teacher_enrollment_reminder).returns(mock_mail)
    end
    2.times do
      Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).returns(mock_mail)
    end

    Pd::WorkshopMailer.expects(:organizer_enrollment_reminder).returns(mock_mail)

    workshop = create :pd_workshop, facilitators: [create(:facilitator), create(:facilitator)]
    3.times{create :pd_enrollment, workshop: workshop}
    Pd::Workshop.expects(:start_in_days).returns([workshop])

    e = assert_raises RuntimeError do
      Pd::Workshop.send_reminder_for_upcoming_in_days(1)
    end
    assert e.message.include? 'Failed to send 1 day workshop reminders:'
    assert e.message.include? 'facilitator'
    assert e.message.include? 'bad email'
  end

  private

  def session_on_day(day_offset)
    # 9am-5pm
    session_on(day_offset, 9.hours, 17.hours)
  end

  def session_on_day_late(day_offset)
    # Ending at 11:59pm
    session_on(day_offset, 12.hours, 23.hours + 59.minutes)
  end

  def session_on_day_early(day_offset)
    # Starting at midnight
    session_on(day_offset, 0, 9.hours)
  end

  def session_on(day_offset, start_offset, end_offset)
    day = today + day_offset.days
    create :pd_session, start: day + start_offset, end: day + end_offset
  end

  def today
    Date.today.in_time_zone
  end
end
