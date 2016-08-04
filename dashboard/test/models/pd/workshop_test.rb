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
    create :pd_enrollment, workshop: @workshop, name: teacher.name, email: teacher.email

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

  test 'start stop' do
    @workshop.sessions << create(:pd_session)
    assert_equal 'Not Started', @workshop.state

    @workshop.start!
    @workshop.reload
    assert_equal 'In Progress', @workshop.state
    assert @workshop.section
    assert_equal Section::TYPE_PD_WORKSHOP, @workshop.section.section_type

    @workshop.end!
    @workshop.reload
    assert_equal 'Ended', @workshop.state
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

  test 'send_exit_surveys enrolled-only teacher does not get mail' do
    workshop = create :pd_ended_workshop

    create :pd_workshop_participant, workshop: workshop, enrolled: true
    Pd::WorkshopMailer.expects(:exit_survey).never

    workshop.send_exit_surveys
  end

  test 'send_exit_surveys teachers in the section get emails' do
    workshop = create :pd_ended_workshop

    teachers = [
      create(:pd_workshop_participant, workshop: workshop, enrolled: true, in_section: true),
      create(:pd_workshop_participant, workshop: workshop, enrolled: true, in_section: true, attended: true),
      create(:pd_workshop_participant, workshop: workshop, enrolled: false, in_section: true),
      create(:pd_workshop_participant, workshop: workshop, enrolled: false, in_section: true, attended: true)
    ]

    mock_mail = stub(deliver_now: nil)
    teachers.each do |teacher|
      Pd::WorkshopMailer.expects(:exit_survey).with(
        workshop, teacher, instance_of(Pd::Enrollment)
      ).returns(mock_mail)
    end
    workshop.send_exit_surveys
  end

  test 'send_exit_surveys turns accidental students accounts into teacher accounts' do
    workshop = create :pd_ended_workshop

    accidental_student_email = 'i-should-be-a-teacher@example.net'
    accidental_student_attendee = create :student, email: accidental_student_email
    create :pd_enrollment, workshop: workshop,
      name: accidental_student_attendee.name, email: accidental_student_email
    workshop.section.add_student accidental_student_attendee
    create :pd_attendance, session: workshop.sessions.first, teacher: accidental_student_attendee

    assert_empty accidental_student_attendee.email
    mock_mail = stub(deliver_now: nil)
    Pd::WorkshopMailer.expects(:exit_survey).with(
      workshop, accidental_student_attendee, instance_of(Pd::Enrollment)
    ).returns(mock_mail)

    workshop.send_exit_surveys

    accidental_student_attendee.reload
    refute_empty accidental_student_attendee.email
    assert accidental_student_attendee.teacher?
    assert_equal accidental_student_email, accidental_student_attendee.email
  end

  test 'find_by_section_code' do
    section = create :section
    assert_nil Pd::Workshop.find_by_section_code(section.code)

    workshop = create :pd_workshop, section: section
    assert_equal workshop, Pd::Workshop.find_by_section_code(section.code)
    assert_nil Pd::Workshop.find_by_section_code('nonsense code')
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
