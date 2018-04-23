require 'test_helper'

class Pd::WorkshopTest < ActiveSupport::TestCase
  freeze_time

  self.use_transactional_test_case = true
  setup_all do
    @organizer = create(:program_manager)
    @workshop = create(:pd_workshop, organizer: @organizer)

    @workshop_organizer = create(:workshop_organizer)
    @organizer_workshop = create(:pd_workshop, organizer: @workshop_organizer)
  end
  setup do
    @workshop.reload

    @organizer_workshop.reload
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'query by workshop organizer' do
    # create a workshop with a different organizer, which should not be returned below
    create(:pd_workshop)

    workshops = Pd::Workshop.organized_by @workshop_organizer
    assert_equal 1, workshops.length
    assert_equal workshops.first, @organizer_workshop
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

  test 'exclude_summer scope' do
    summer_workshop = create :pd_workshop, :local_summer_workshop
    teachercon = create :pd_workshop, :teachercon

    assert Pd::Workshop.exclude_summer.exclude? summer_workshop
    assert Pd::Workshop.exclude_summer.exclude? teachercon
    assert Pd::Workshop.exclude_summer.include? @workshop
  end

  test 'managed_by' do
    user = create :workshop_organizer
    user.permission = UserPermission::FACILITATOR
    regional_partner = create(:regional_partner_program_manager, program_manager: user).regional_partner

    expected_workshops = [
      create(:pd_workshop, facilitators: [user]),
      create(:pd_workshop, organizer: user),
      create(:pd_workshop, regional_partner: regional_partner),

      # combos
      create(:pd_workshop, num_facilitators: 1, organizer: user),
      create(:pd_workshop, facilitators: [user], organizer: user),
      create(:pd_workshop, regional_partner: regional_partner, facilitators: [user], organizer: user)
    ]

    # extra (not included)
    create :pd_workshop, num_facilitators: 1, regional_partner: create(:regional_partner)

    filtered = Pd::Workshop.managed_by(user)
    assert_equal 6, filtered.count
    assert_equal expected_workshops.map(&:id).sort, filtered.pluck(:id).sort

    assert_equal 4, filtered.organized_by(user).count
    assert_equal 3, filtered.facilitated_by(user).count
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
    workshops_not_started = [@workshop, @organizer_workshop]
    workshop_in_progress = create :pd_workshop, started_at: Time.now
    workshop_ended = create :pd_ended_workshop

    not_started = Pd::Workshop.in_state(Pd::Workshop::STATE_NOT_STARTED)
    assert_equal workshops_not_started.length, not_started.count
    assert_equal workshops_not_started, not_started

    in_progress = Pd::Workshop.in_state(Pd::Workshop::STATE_IN_PROGRESS)
    assert_equal 1, in_progress.count
    assert_equal workshop_in_progress.id, in_progress[0][:id]

    ended = Pd::Workshop.in_state(Pd::Workshop::STATE_ENDED)
    assert_equal 1, ended.count
    assert_equal workshop_ended.id, ended[0][:id]
  end

  test 'query by state with invalid state' do
    e = assert_raises RuntimeError do
      Pd::Workshop.in_state 'invalid'
    end
    assert_equal 'Unrecognized state: invalid', e.message

    assert_empty Pd::Workshop.in_state 'invalid', error_on_bad_state: false
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

    @workshop.start!
    assert_equal 'In Progress', @workshop.state
    assert @workshop.sessions.first.code.present?

    @workshop.end!
    assert_equal 'Ended', @workshop.state
    assert_equal 'Ended', @workshop.state
    refute @workshop.sessions.first.code.nil?
  end

  test 'start is idempotent' do
    @workshop.sessions << create(:pd_session)
    @workshop.start!
    started_at = @workshop.reload.started_at

    @workshop.start!
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
  test 'single session scheduled_start_in_days and scheduled_end_in_days' do
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

    start_expected = [workshop_in_10_days_early, workshop_in_10_days, workshop_in_10_days_late].pluck(:id)
    assert_equal start_expected, Pd::Workshop.scheduled_start_in_days(10).pluck(:id)

    end_expected = [workshop_in_10_days_early, workshop_in_10_days, workshop_in_10_days_late].pluck(:id)
    assert_equal end_expected, Pd::Workshop.scheduled_end_in_days(10).pluck(:id)
  end

  test 'multiple session scheduled_start_in_days and scheduled_end_in_days' do
    workshop_starting_on_day_10 = create :pd_workshop, sessions: [session_on_day(10), session_on_day(11), session_on_day(12)]
    workshop_ending_on_day_10 = create :pd_workshop, sessions: [session_on_day(8), session_on_day(9), session_on_day(10)]

    # Noise
    create :pd_workshop, sessions: [session_on_day(8), session_on_day(9)]
    create :pd_workshop, sessions: [session_on_day(5), session_on_day(10), session_on_day(15)]
    create :pd_workshop, sessions: [session_on_day(11), session_on_day(12)]

    start_expected = [workshop_starting_on_day_10].pluck(:id)
    assert_equal start_expected, Pd::Workshop.scheduled_start_in_days(10).pluck(:id)

    end_expected = [workshop_ending_on_day_10].pluck(:id)
    assert_equal end_expected, Pd::Workshop.scheduled_end_in_days(10).pluck(:id)
  end

  test 'should have ended' do
    workshop_recently_started = create :pd_workshop
    workshop_recently_started.started_at = Time.now
    workshop_recently_started.sessions << (build :pd_session, start: Time.zone.now - 13.hours, end: Time.zone.now - 12.hours)
    workshop_recently_started.save!

    workshop_should_have_ended = create :pd_workshop
    workshop_should_have_ended.started_at = Time.now
    workshop_should_have_ended.sessions << (build :pd_session, start: Time.zone.now - 51.hours, end: Time.zone.now - 50.hours)
    workshop_should_have_ended.save!

    workshop_already_ended = create :pd_workshop
    workshop_already_ended.started_at = Time.now
    workshop_already_ended.ended_at = Time.now - 1.hour
    workshop_already_ended.sessions << (build :pd_session, start: Time.zone.now - 51.hours, end: Time.zone.now - 50.hours)
    workshop_already_ended.save!

    assert_equal [workshop_should_have_ended.id], Pd::Workshop.should_have_ended.pluck(:id)
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

  test 'send_exit_surveys teachers with attendance get emails' do
    workshop = create :pd_ended_workshop
    create(:pd_workshop_participant, workshop: workshop, enrolled: true)
    create(:pd_workshop_participant, workshop: workshop, enrolled: true, attended: true)

    assert workshop.account_required_for_attendance?
    Pd::Enrollment.any_instance.expects(:send_exit_survey).times(1)

    workshop.send_exit_surveys
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
    workshop = create :pd_workshop, course: Pd::Workshop::COURSE_ADMIN, location_name: 'Code.org',
      sessions: [create(:pd_session, start: Date.new(2016, 9, 1))]

    # no subject
    assert_equal 'Admin workshop on 09/01/16 at Code.org', workshop.friendly_name

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
    assert_equal [workshop_before, workshop_pivot].pluck(:id).sort,
      Pd::Workshop.scheduled_start_on_or_before(pivot_date).pluck(:id).sort

    # on or after
    assert_equal [workshop_pivot, workshop_after].pluck(:id).sort,
      Pd::Workshop.scheduled_start_on_or_after(pivot_date).pluck(:id).sort

    # combined
    assert_equal [workshop_pivot.id],
      Pd::Workshop.scheduled_start_on_or_after(pivot_date).scheduled_start_on_or_before(pivot_date).pluck(:id)
  end

  test 'in_year' do
    # before
    create :pd_workshop, num_sessions: 1, sessions_from: Date.new(2016, 12, 31)

    workshops_this_year = [
      create(:pd_workshop, num_sessions: 1, sessions_from: Date.new(2017, 1, 1)),
      create(:pd_workshop, num_sessions: 1, sessions_from: Date.new(2017, 12, 31))
    ]

    # after
    create :pd_workshop, num_sessions: 1, sessions_from: Date.new(2018, 12, 31)

    assert_equal workshops_this_year.map(&:id), Pd::Workshop.in_year(2017).pluck(:id)
  end

  test 'future scope' do
    future_workshops = [
      # Today
      create(:pd_workshop, num_sessions: 1, sessions_from: Date.today),

      # Next week
      create(:pd_workshop, num_sessions: 1, sessions_from: Date.today + 1.week)
    ]

    # Excluded (not future) workshops:
    # Last week
    create :pd_workshop, num_sessions: 1, sessions_from: Date.today - 1.week
    # Today, but ended
    create :pd_ended_workshop, num_sessions: 1, sessions_from: Date.today
    # Next week, but ended
    create :pd_ended_workshop, num_sessions: 1, sessions_from: Date.today + 1.week

    assert_equal future_workshops, Pd::Workshop.future
  end

  test 'end date filters' do
    pivot_date = Date.today
    workshop_before = create :pd_workshop, ended_at: pivot_date - 1.week
    # End in the middle of the day. Since the filter is by date, this should be included in all the queries.
    workshop_pivot = create :pd_workshop, ended_at: pivot_date + 8.hours
    workshop_after = create :pd_workshop, ended_at: pivot_date + 1.week

    # on or before
    assert_equal [workshop_before, workshop_pivot].pluck(:id).sort,
      Pd::Workshop.end_on_or_before(pivot_date).pluck(:id).sort

    # on or after
    assert_equal [workshop_pivot, workshop_after].pluck(:id).sort,
      Pd::Workshop.end_on_or_after(pivot_date).pluck(:id).sort

    # combined
    assert_equal [workshop_pivot.id],
      Pd::Workshop.end_on_or_after(pivot_date).end_on_or_before(pivot_date).pluck(:id)
  end

  test 'order_by_start' do
    # 5 workshops in date order, each with 1-5 sessions (only the first matters)
    workshops = 5.times.map do |i|
      build :pd_workshop, num_sessions: rand(1..5), sessions_from: Date.today + i.days
    end
    # save out of order
    workshops.shuffle.each(&:save!)

    assert_equal workshops.pluck(:id), Pd::Workshop.order_by_scheduled_start.pluck(:id)
    assert_equal workshops.pluck(:id), Pd::Workshop.order_by_scheduled_start(desc: false).pluck(:id)
    assert_equal workshops.reverse.pluck(:id), Pd::Workshop.order_by_scheduled_start(desc: true).pluck(:id)
  end

  test 'order_by_enrollment_count' do
    # Deleted enrollment should not be counted
    pd_enrollment = create :pd_enrollment, workshop: @workshop
    pd_enrollment.destroy

    # Workshops with 0 (not counting deleted), 1 and 2 enrollments
    workshops = [
      @workshop,
      @organizer_workshop,
      build(:pd_workshop, num_enrollments: 1),
      build(:pd_workshop, num_enrollments: 2)
    ]
    # save out of order
    workshops.shuffle.each(&:save!)

    assert_equal [0, 0, 1, 2], Pd::Workshop.order_by_enrollment_count.map {|w| w.enrollments.count}
    assert_equal [0, 0, 1, 2], Pd::Workshop.order_by_enrollment_count(desc: false).map {|w| w.enrollments.count}
    assert_equal [2, 1, 0, 0], Pd::Workshop.order_by_enrollment_count(desc: true).map {|w| w.enrollments.count}
  end

  test 'order_by_enrollment_count with duplicates' do
    workshops = [
      @workshop,
      @organizer_workshop,
      build(:pd_workshop),
      build(:pd_workshop, num_enrollments: 1),
    ]
    # save out of order
    workshops.shuffle.each(&:save!)

    assert_equal [0, 0, 0, 1], Pd::Workshop.order_by_enrollment_count(desc: false).map {|w| w.enrollments.count}
    assert_equal [1, 0, 0, 0], Pd::Workshop.order_by_enrollment_count(desc: true).map {|w| w.enrollments.count}
  end

  test 'order_by_state' do
    @workshop.started_at = Time.now
    workshops = [
      build(:pd_ended_workshop), # Ended
      # build(:pd_workshop, started_at: Time.now), # In Progress
      @workshop, # Not Started
      @organizer_workshop # Not Started
    ]
    # save out of order
    workshops.shuffle.each(&:save!)

    assert_equal workshops.pluck(:id), Pd::Workshop.order_by_state.pluck(:id)
    assert_equal workshops.pluck(:id), Pd::Workshop.order_by_state(desc: false).pluck(:id)
    assert_equal workshops.reverse.pluck(:id), Pd::Workshop.order_by_state(desc: true).pluck(:id)
  end

  test 'min_attendance_days with no min_days constraint returns 1' do
    @workshop.expects(:time_constraint).with(:min_days).returns(nil)
    assert_equal 1, @workshop.min_attendance_days
  end

  test 'min_attendance_days with min_days constraint returns that constraint' do
    @workshop.expects(:time_constraint).with(:min_days).returns(100)
    assert_equal 100, @workshop.min_attendance_days
  end

  test 'effective_num_days with no max_days constraint returns the session count' do
    @workshop.sessions.expects(:count).returns(10)
    @workshop.expects(:time_constraint).with(:max_days).returns(nil)
    assert_equal 10, @workshop.effective_num_days
  end

  test 'effective_num_days with max_days constraint lower than the session count returns the constraint' do
    @workshop.sessions.expects(:count).returns(10)
    @workshop.expects(:time_constraint).with(:max_days).returns(5)
    assert_equal 5, @workshop.effective_num_days
  end

  test 'effective_num_days with max_days constraint greater than the session count returns the session count' do
    @workshop.sessions.expects(:count).returns(10)
    @workshop.expects(:time_constraint).with(:max_days).returns(50)
    assert_equal 10, @workshop.effective_num_days
  end

  test 'effective_num_hours with no max_hours constraint returns the total session hours' do
    @workshop.sessions.expects(:map).returns([5, 5, 5, 5]) # 20 hours over 4 sessions
    @workshop.expects(:time_constraint).with(:max_hours).returns(nil)
    assert_equal 20, @workshop.effective_num_hours
  end

  test 'effective_num_hours with max_hours constraint lower than the session hours returns the constraint' do
    @workshop.sessions.expects(:map).returns([5, 5, 5, 5]) # 20 hours over 4 sessions
    @workshop.expects(:time_constraint).with(:max_hours).returns(15)
    assert_equal 15, @workshop.effective_num_hours
  end

  test 'effective_num_hours with max_hours constraint greater than the session hours returns the session hours' do
    @workshop.sessions.expects(:map).returns([5, 5, 5, 5]) # 20 hours over 4 sessions
    @workshop.expects(:time_constraint).with(:max_hours).returns(50)
    assert_equal 20, @workshop.effective_num_hours
  end

  test 'time constraint lookup' do
    workshop_bad_course = build :pd_workshop, course: 'nonexistent'
    workshop_bad_subject = build :pd_workshop, course: Pd::Workshop::COURSE_CSP, subject: 'nonexistent'

    # Note, the Phase 2 subjects for ECS and CS_IN_A are identical: "Phase 2 in-person"
    workshop_ambiguous_subject_ecs = build :pd_workshop, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2
    workshop_ambiguous_subject_cs_in_a = build :pd_workshop, course: Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2

    assert_nil workshop_bad_course.time_constraint(:max_days)
    assert_nil workshop_bad_subject.time_constraint(:max_days)
    assert_equal 5, workshop_ambiguous_subject_ecs.time_constraint(:max_days)
    assert_equal 3, workshop_ambiguous_subject_cs_in_a.time_constraint(:max_days)
  end

  test 'teacherCon workshops are capped at 33.5 hours' do
    workshop_csd_teachercon = create :pd_workshop,
      course: Pd::Workshop::COURSE_CSD,
      subject: Pd::Workshop::SUBJECT_CSD_TEACHER_CON,
      num_sessions: 5,
      each_session_hours: 8

    workshop_csp_teachercon = create :pd_workshop,
      course: Pd::Workshop::COURSE_CSD,
      subject: Pd::Workshop::SUBJECT_CSP_TEACHER_CON,
      num_sessions: 5,
      each_session_hours: 8

    assert_equal 33.5, workshop_csd_teachercon.effective_num_hours
    assert_equal 33.5, workshop_csp_teachercon.effective_num_hours
  end

  test 'csp summer workshops are capped at 33.5 hours' do
    workshop_csp_summer = create :pd_workshop,
      course: Pd::Workshop::COURSE_CSP,
      subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP,
      num_sessions: 5,
      each_session_hours: 8

    assert_equal 33.5, workshop_csp_summer.effective_num_hours
  end

  test 'errors in teacher reminders in send_reminder_for_upcoming_in_days do not stop batch' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil).then.raises(RuntimeError, 'bad email').then.returns(nil).then.returns(nil).then.returns(nil).then.returns(nil)
    Pd::WorkshopMailer.expects(:teacher_enrollment_reminder).returns(mock_mail).times(3)
    Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).returns(mock_mail).times(2)
    Pd::WorkshopMailer.expects(:organizer_enrollment_reminder).returns(mock_mail)

    workshop = create :pd_workshop, facilitators: [create(:facilitator), create(:facilitator)]
    create_list :pd_enrollment, 3, workshop: workshop
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

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
    Pd::WorkshopMailer.expects(:teacher_enrollment_reminder).returns(mock_mail).times(3)
    Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).returns(mock_mail).times(2)

    Pd::WorkshopMailer.expects(:organizer_enrollment_reminder).returns(mock_mail)

    workshop = create :pd_workshop, facilitators: [create(:facilitator), create(:facilitator)]
    create_list :pd_enrollment, 3, workshop: workshop
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

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
    Pd::WorkshopMailer.expects(:teacher_enrollment_reminder).returns(mock_mail).times(3)
    Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).returns(mock_mail).times(2)
    Pd::WorkshopMailer.expects(:organizer_enrollment_reminder).returns(mock_mail)

    workshop = create :pd_workshop, facilitators: [create(:facilitator), create(:facilitator)]
    create_list :pd_enrollment, 3, workshop: workshop
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

    e = assert_raises RuntimeError do
      Pd::Workshop.send_reminder_for_upcoming_in_days(1)
    end
    assert e.message.include? 'Failed to send 1 day workshop reminders:'
    assert e.message.include? 'facilitator'
    assert e.message.include? 'bad email'
  end

  test 'facilitator reminders are skipped when the facilitator is also the organizer' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil)

    facilitator = create :facilitator
    organizer = create :workshop_organizer

    # The organizer is also a facilitator, and should not receive a facilitator reminder email.
    workshop = create :pd_workshop, organizer: organizer, facilitators: [organizer, facilitator]
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

    Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).with(facilitator, workshop).returns(mock_mail)
    Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).with(organizer, workshop).never
    Pd::WorkshopMailer.expects(:organizer_enrollment_reminder).with(workshop).returns(mock_mail)
    Pd::Workshop.send_reminder_for_upcoming_in_days(1)
  end

  test 'workshop starting date picks the day of the first session' do
    session = create :pd_session, start: Date.today + 15.days
    session2 = create :pd_session, start: Date.today + 20.days
    @workshop.sessions << session
    @workshop.sessions << session2
    assert_equal session.start, @workshop.workshop_starting_date
    assert_equal session2.start, @workshop.workshop_ending_date
  end

  test 'workshop date range string for single session workshop' do
    workshop = create :pd_workshop, num_sessions: 1
    assert_equal Date.today.strftime('%B %e, %Y'), workshop.workshop_date_range_string
  end

  test 'workshop date range string for multi session workshop' do
    workshop = create :pd_workshop, num_sessions: 2
    assert_equal "#{Date.today.strftime('%B %e, %Y')} - #{Date.tomorrow.strftime('%B %e, %Y')}", workshop.workshop_date_range_string
  end

  test 'workshop_dashboard_url' do
    expected_url = "http://#{CDO.dashboard_hostname}/pd/workshop_dashboard/workshops/#{@workshop.id}"
    assert_equal expected_url, @workshop.workshop_dashboard_url
  end

  test 'unattended_enrollments' do
    session = create :pd_session, workshop: @workshop
    @workshop.sessions << session

    # 2 enrollments with attendance
    2.times do
      enrollment = create :pd_enrollment, workshop: @workshop
      create :pd_attendance, session: session, enrollment: enrollment
    end

    # 2 enrollments without attendance
    enrollments = 2.times.map do
      create :pd_enrollment, workshop: @workshop
    end

    assert_equal enrollments.pluck(:id).sort, @workshop.unattended_enrollments.pluck(:id).sort
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'organizer_or_facilitator?' do
    facilitator = create :facilitator
    @organizer_workshop.facilitators << facilitator
    another_organizer = create :workshop_organizer
    another_facilitator = create :facilitator

    assert @organizer_workshop.organizer_or_facilitator?(@workshop_organizer)
    assert @organizer_workshop.organizer_or_facilitator?(facilitator)
    refute @organizer_workshop.organizer_or_facilitator?(another_organizer)
    refute @organizer_workshop.organizer_or_facilitator?(another_facilitator)
  end

  test 'organizer_or_facilitator? with program manager organizer' do
    facilitator = create :facilitator
    @workshop.facilitators << facilitator
    another_organizer = create :workshop_organizer
    another_facilitator = create :facilitator

    assert @workshop.organizer_or_facilitator?(@organizer)
    assert @workshop.organizer_or_facilitator?(facilitator)
    refute @workshop.organizer_or_facilitator?(another_organizer)
    refute @workshop.organizer_or_facilitator?(another_facilitator)
  end

  test 'process_location is called when location_address changes' do
    @workshop.expects(:process_location).once
    @workshop.update!(location_address: '1501 4th Ave, Seattle WA')

    # Changing another field does not process location
    @workshop.expects(:process_location).never
    @workshop.update!(location_name: 'Code.org')

    # Setting location_address to the same value does not process location
    @workshop.expects(:process_location).never
    @workshop.update!(location_address: '1501 4th Ave, Seattle WA')
  end

  test 'process_location' do
    mock_geocoder_result = [
      OpenStruct.new(
        latitude: 47.6101003,
        longitude: -122.33746,
        city: 'Seattle',
        state: 'WA',
        formatted_address: '1501 4th Ave, Seattle, WA 98101, USA'
      )
    ]
    expected_processed_location = '{"latitude":47.6101003,"longitude":-122.33746,"city":"Seattle","state":"WA","formatted_address":"1501 4th Ave, Seattle, WA 98101, USA"}'
    Honeybadger.expects(:notify).never

    # Normal lookup
    Geocoder.expects(:search).with('1501 4th Ave, Seattle WA').returns(mock_geocoder_result)
    @workshop.location_address = '1501 4th Ave, Seattle WA'
    @workshop.process_location
    assert_equal expected_processed_location, @workshop.processed_location

    # Nonexistent location clears processed_location
    Geocoder.expects(:search).with('nonexistent location').returns([])
    @workshop.location_address = 'nonexistent location'
    @workshop.process_location
    assert_nil @workshop.processed_location

    # Don't bother looking up blank addresses or TBA/TBDs
    ['', 'tba', 'TBA', 'tbd', 'N/A'].each do |address|
      Geocoder.expects(:search).never
      @workshop.location_address = address
      @workshop.process_location
      assert_nil @workshop.processed_location
    end

    # Retry on errors
    Geocoder.expects(:search).with('1501 4th Ave, Seattle WA').raises(SocketError).then.returns(mock_geocoder_result).twice
    @workshop.location_address = '1501 4th Ave, Seattle WA'
    @workshop.process_location
    assert_equal expected_processed_location, @workshop.processed_location

    # Repeated errors are logged to honeybadger
    Honeybadger.expects(:notify).once
    Geocoder.expects(:search).with('1501 4th Ave, Seattle WA').raises(SocketError).twice
    @workshop.location_address = '1501 4th Ave, Seattle WA'
    @workshop.process_location
    assert_nil @workshop.processed_location
  end

  test 'suppress_reminders?' do
    suppressed = [
      create(:pd_workshop, course: Pd::Workshop::COURSE_CSF, subject: Pd::Workshop::SUBJECT_CSF_FIT),
      create(:pd_workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_TEACHER_CON),
      create(:pd_workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_FIT),
      create(:pd_workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_TEACHER_CON),
      create(:pd_workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_FIT)
    ]

    refute @workshop.suppress_reminders?
    suppressed.each do |workshop|
      assert workshop.suppress_reminders?
    end
  end

  test 'ready_to_close?' do
    # no sessions, not ready
    refute @workshop.ready_to_close?

    # 3 sessions, no attendance: not ready
    workshop = create :pd_workshop, num_sessions: 3
    refute workshop.ready_to_close?

    # attendance in the first session only: not ready
    create :pd_attendance, session: workshop.sessions.first
    refute workshop.ready_to_close?

    # attendance in the last session: ready
    create :pd_attendance, session: workshop.sessions.last
    assert workshop.ready_to_close?
  end

  test 'pre_survey?' do
    csd_workshop = create :pd_workshop, course: Pd::Workshop::COURSE_CSD
    csp_workshop = create :pd_workshop, course: Pd::Workshop::COURSE_CSP
    other_workshop = create :pd_workshop, course: Pd::Workshop::COURSE_CSF

    assert csd_workshop.pre_survey?
    assert csp_workshop.pre_survey?
    refute other_workshop.pre_survey?
  end

  test 'pre_survey_units_and_lessons' do
    course = create :course, name: 'pd-workshop-pre-survey-test'
    next_position = 1
    add_unit = ->(unit_name, lesson_names) do
      create(:script).tap do |script|
        create :course_script, course: course, script: script, position: (next_position += 1)
        I18n.stubs(:t).with("data.script.name.#{script.name}.title").returns(unit_name)
        lesson_names.each {|lesson_name| create :stage, script: script, name: lesson_name}
      end
    end

    add_unit.call 'Unit 1', ['Unit 1 - Lesson 1', 'Unit 1 - Lesson 2']
    add_unit.call 'Unit 2', ['Unit 2 - Lesson 1', 'Unit 2 - Lesson 2']
    add_unit.call 'Unit 3', ['Unit 3 - Lesson 1']

    workshop = build :pd_workshop
    workshop.expects(:pre_survey?).returns(true)
    workshop.stubs(:pre_survey_course_name).returns('pd-workshop-pre-survey-test')

    expected = [
      ['Unit 1', ['Lesson 1: Unit 1 - Lesson 1', 'Lesson 2: Unit 1 - Lesson 2']],
      ['Unit 2', ['Lesson 1: Unit 2 - Lesson 1', 'Lesson 2: Unit 2 - Lesson 2']],
      ['Unit 3', ['Lesson 1: Unit 3 - Lesson 1']]
    ]
    assert_equal expected, workshop.pre_survey_units_and_lessons
  end

  test 'friendly date range same month' do
    workshop = build :pd_workshop, num_sessions: 5, sessions_from: Date.new(2017, 3, 10)
    assert_equal 'March 10-14, 2017', workshop.friendly_date_range
  end

  test 'friendly date range different months' do
    workshop = build :pd_workshop, num_sessions: 5, sessions_from: Date.new(2017, 3, 30)
    assert_equal 'March 30 - April 3, 2017', workshop.friendly_date_range
  end

  test 'date_and_location_name with processed location and sessions' do
    workshop = build :pd_workshop, num_sessions: 5, sessions_from: Date.new(2017, 3, 30),
      processed_location: {city: 'Seattle', state: 'WA'}.to_json

    assert_equal 'March 30 - April 3, 2017, Seattle WA', workshop.date_and_location_name
  end

  test 'date_and_location_name with processed location but no sessions' do
    workshop = build :pd_workshop, processed_location: {city: 'Seattle', state: 'WA'}.to_json

    assert_equal 'Dates TBA, Seattle WA', workshop.date_and_location_name
  end

  test 'date_and_location_name with no location but with sessions' do
    workshop = build :pd_workshop, num_sessions: 5, sessions_from: Date.new(2017, 3, 30),
      processed_location: nil

    assert_equal 'March 30 - April 3, 2017, Location TBA', workshop.date_and_location_name
  end

  test 'date_and_location_name with no location nor sessions' do
    workshop = create :pd_workshop, processed_location: nil

    assert_equal 'Dates TBA, Location TBA', workshop.date_and_location_name
  end

  test 'date_and_location_name for teachercon' do
    workshop = build :pd_workshop, :teachercon, num_sessions: 5, sessions_from: Date.new(2017, 3, 30),
      processed_location: {city: 'Seattle', state: 'WA'}.to_json

    assert_equal 'March 30 - April 3, 2017, Seattle WA TeacherCon', workshop.date_and_location_name
  end

  test 'friendly_location TBA' do
    workshop = build :pd_workshop, location_address: 'tba'
    assert_equal 'Location TBA', workshop.friendly_location
  end

  test 'friendly_location with a city and state' do
    workshop = build :pd_workshop, location_address: 'Seattle, WA',
      processed_location: {city: 'Seattle', state: 'WA'}.to_json
    assert_equal 'Seattle WA', workshop.friendly_location
  end

  test 'friendly_location with an unprocessable location address returns the address as entered' do
    workshop = build :pd_workshop, location_address: 'my custom unprocessable location', processed_location: nil
    assert_equal 'my custom unprocessable location', workshop.friendly_location
  end

  test 'friendly_location with no location returns tba' do
    workshop = build :pd_workshop, location_address: '', processed_location: nil
    assert_equal 'Location TBA', workshop.friendly_location
  end

  test 'workshops organized by a non program manager are not assigned regional partner' do
    workshop = create :pd_workshop
    assert_nil workshop.regional_partner
  end

  test 'workshops organized by a program manager are assigned the regional partner' do
    regional_partner = create :regional_partner
    program_manager = create :program_manager, regional_partner: regional_partner
    workshop = create :pd_workshop, organizer: program_manager

    assert_equal regional_partner, workshop.regional_partner
  end

  test 'csf funded workshops require a funding type' do
    workshop = build :pd_workshop, course: Pd::Workshop::COURSE_CSF,
      funded: true, funding_type: nil
    refute workshop.valid?

    workshop.funding_type = Pd::Workshop::FUNDING_TYPE_FACILITATOR
    assert workshop.valid?
  end

  test 'csf unfunded workshops do not accept a funding type' do
    workshop = build :pd_workshop, course: Pd::Workshop::COURSE_CSF,
      funded: false, funding_type: Pd::Workshop::FUNDING_TYPE_FACILITATOR
    refute workshop.valid?

    workshop.funding_type = nil
    assert workshop.valid?
  end

  test 'non-csf workshops do not accept a funding type' do
    [
      [{funded: true, funding_type: Pd::Workshop::FUNDING_TYPE_FACILITATOR}, false],
      [{funded: false, funding_type: Pd::Workshop::FUNDING_TYPE_FACILITATOR}, false],
      [{funded: true, funding_type: nil}, true],
      [{funded: false, funding_type: nil}, true]
    ].each do |params, expected_validity|
      workshop = build :pd_workshop, course: Pd::Workshop::COURSE_CSP, **params
      assert_equal(
        expected_validity,
        workshop.valid?,
        "Expected #{params} to be #{expected_validity ? 'valid' : 'invalid'}"
      )
    end
  end

  test 'funded_friendly_name' do
    [
      [
        {funded: false},
        'No'
      ],
      [
        {course: Pd::Workshop::COURSE_CSP, funded: true},
        'Yes'
      ],
      [
        {course: Pd::Workshop::COURSE_CSF, funded: true, funding_type: Pd::Workshop::FUNDING_TYPE_PARTNER},
        'Yes: partner'
      ],
      [
        {course: Pd::Workshop::COURSE_CSF, funded: true, funding_type: Pd::Workshop::FUNDING_TYPE_FACILITATOR},
        'Yes: facilitator'
      ]
    ].each do |params, expected|
      workshop = build :pd_workshop, **params
      assert_equal(
        expected,
        workshop.funding_summary,
        "Expected #{params} funded_friendly_name to be #{expected}"
      )
    end
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
