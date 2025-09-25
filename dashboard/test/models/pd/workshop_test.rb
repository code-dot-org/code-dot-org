require 'test_helper'
require 'cdo/delete_accounts_helper'

class Pd::WorkshopTest < ActiveSupport::TestCase
  include Pd::WorkshopConstants
  include ActionMailer::TestHelper

  freeze_time

  self.use_transactional_test_case = true
  setup_all do
    @organizer = create(:program_manager)
    @workshop = create(:workshop, organizer: @organizer)

    @workshop_organizer = create(:workshop_organizer)
    @organizer_workshop = create(:workshop, organizer: @workshop_organizer)

    @regional_partner = create(:regional_partner)
  end
  setup do
    @workshop.reload

    @organizer_workshop.reload
  end

  test 'query by workshop organizer' do
    # create a workshop with a different organizer, which should not be returned below
    create(:workshop)

    workshops = Pd::Workshop.organized_by @workshop_organizer
    assert_equal 1, workshops.length
    assert_equal workshops.first, @organizer_workshop
  end

  test 'query by organizer' do
    # create a workshop with a different organizer, which should not be returned below
    create(:workshop)

    workshops = Pd::Workshop.organized_by @organizer
    assert_equal 1, workshops.length
    assert_equal workshops.first, @workshop
  end

  test 'query by facilitator' do
    facilitator = create(:facilitator)
    @workshop.facilitators << facilitator
    @workshop.save!

    # create a workshop with a different facilitator, which should not be returned below
    create(:workshop, facilitators: [create(:facilitator)])

    workshops = Pd::Workshop.facilitated_by facilitator
    assert_equal 1, workshops.length
    assert_equal workshops.first, @workshop
  end

  test 'query by enrolled teacher' do
    # Teachers enroll in a workshop as a whole
    teacher = create(:teacher)
    create(:pd_enrollment, workshop: @workshop, full_name: teacher.name, email: teacher.email)

    # create a workshop with a different teacher enrollment, which should not be returned below
    other_workshop = create(:workshop)
    create(:pd_enrollment, workshop: other_workshop)

    workshops = Pd::Workshop.enrolled_in_by teacher
    assert_equal 1, workshops.length
    assert_equal @workshop, workshops.first
  end

  test 'enrolled_in_by scope variations' do
    teacher = create(:teacher)
    enrollment = create(:pd_enrollment, workshop: @workshop, full_name: teacher.name, email: 'nomatch@ex.net')
    assert_empty Pd::Workshop.enrolled_in_by(teacher)

    # Email match only
    enrollment.update!(email: teacher.email)
    assert_equal [@workshop], Pd::Workshop.enrolled_in_by(teacher)

    # UserId only
    enrollment.update!(email: 'nomatch@ex.net', user: teacher)
    assert_equal [@workshop], Pd::Workshop.enrolled_in_by(teacher)

    # Both email and user id. Should still find workshop exactly once
    enrollment.update!(email: teacher.email, user: teacher)
    assert_equal [@workshop], Pd::Workshop.enrolled_in_by(teacher)

    # Alternate email match only
    create(:pd_teacher_application, user: teacher, status: 'accepted')
    enrollment.update!(email: teacher.alternate_email, user: nil)
    assert_equal [@workshop], Pd::Workshop.enrolled_in_by(teacher)
  end

  test 'exclude_summer scope' do
    summer_workshop = create(:summer_workshop)
    teachercon = build(:workshop, :teachercon)
    # workshop subject is deprecated so validation must be skipped
    teachercon.save(validate: false)

    assert Pd::Workshop.exclude_summer.exclude? summer_workshop
    assert Pd::Workshop.exclude_summer.exclude? teachercon
    assert_includes(Pd::Workshop.exclude_summer, @workshop)
  end

  test 'managed_by' do
    user = create(:workshop_organizer)
    user.permission = UserPermission::FACILITATOR
    regional_partner = create(:regional_partner_program_manager, program_manager: user).regional_partner

    expected_workshops = [
      create(:workshop, facilitators: [user]),
      create(:workshop, organizer: user),
      create(:workshop, regional_partner: regional_partner),

      # combos
      create(:workshop, num_facilitators: 1, organizer: user),
      create(:workshop, facilitators: [user], organizer: user),
      create(:workshop, regional_partner: regional_partner, facilitators: [user], organizer: user)
    ]

    # extra (not included)
    create(:workshop, num_facilitators: 1, regional_partner: create(:regional_partner))

    filtered = Pd::Workshop.managed_by(user)
    assert_equal 6, filtered.count
    assert_equal expected_workshops.map(&:id).sort, filtered.pluck(:id).sort

    assert_equal 4, filtered.organized_by(user).count
    assert_equal 3, filtered.facilitated_by(user).count
  end

  test 'query by attended teacher' do
    # Teachers attend individual sessions in the workshop
    teacher = create(:teacher)
    session = create(:pd_session)
    @workshop.sessions << session
    create(:pd_attendance, session: session, teacher: teacher)

    # create a workshop attended by a different teacher, which should not be returned below
    other_workshop = create(:workshop)
    other_session = create(:pd_session)
    other_workshop.sessions << other_session
    create(:pd_attendance, session: other_session)

    workshops = Pd::Workshop.attended_by teacher
    assert_equal 1, workshops.length
    assert_equal workshops.first, @workshop
  end

  test 'query by state' do
    workshops_not_started = [@workshop, @organizer_workshop]
    workshop_in_progress = create(:workshop, :in_progress)
    workshop_ended = create(:workshop, :ended)

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
    workshop = create(:workshop, num_sessions: 0)
    assert_equal 0, workshop.sessions.length
    e = assert_raises Exception do
      workshop.start!
    end
    assert_equal 'Workshop must have at least one session to start.', e.message
  end

  test 'start end' do
    workshop = create(:workshop)
    assert_equal 'Not Started', workshop.state

    workshop.start!
    assert_equal 'In Progress', workshop.state
    assert workshop.sessions.first.code.present?

    workshop.end!
    assert_equal 'Ended', workshop.state
    assert_equal 'Ended', workshop.state
    refute_nil workshop.sessions.first.code
  end

  test 'start is idempotent' do
    workshop = create(:workshop)
    workshop.start!
    started_at = workshop.reload.started_at

    workshop.start!
    assert_equal started_at, workshop.reload.started_at
  end

  test 'end is idempotent' do
    workshop = create(:workshop)
    workshop.start!
    workshop.end!
    ended_at = workshop.reload.ended_at
    workshop.end!
    assert_equal ended_at, workshop.reload.ended_at
  end

  test 'sessions must start on separate days' do
    workshop = create(:pd_workshop, num_sessions: 0)
    workshop.sessions << create(:pd_session)
    workshop.sessions << create(:pd_session)

    refute workshop.valid?
    assert_equal 1, workshop.errors.count
    assert_equal 'Sessions must start on separate days', workshop.errors.full_messages.first
  end

  test 'sessions must start and end on the same day' do
    workshop = create(:workshop, num_sessions: 0)
    session = build(:pd_session, start: Time.zone.now, end: 1.day.from_now)
    workshop.sessions << session

    refute workshop.valid?
    assert_equal 1, workshop.errors.count
    assert_equal 'Sessions end must occur on the same day as the start', workshop.errors.full_messages.first
  end

  test 'sessions must start before they end' do
    workshop = create(:workshop, num_sessions: 0)
    session = build(:pd_session, start: Time.zone.now, end: 2.hours.ago)
    workshop.sessions << session

    refute workshop.valid?
    assert_equal 1, workshop.errors.count
    assert_equal 'Sessions end must occur after the start', workshop.errors.full_messages.first
  end

  # Email queries
  test 'single session scheduled_start_in_days and scheduled_end_in_days' do
    workshop_in_10_days_early = create(:workshop, sessions: [session_on_day_early(10)])
    workshop_in_10_days = create(:workshop, sessions: [session_on_day(10)])
    workshop_in_10_days_late = create(:workshop, sessions: [session_on_day_late(10)])

    # Noise
    create(:workshop, sessions: [session_on_day_early(9)])
    create(:workshop, sessions: [session_on_day(9)])
    create(:workshop, sessions: [session_on_day_late(9)])
    create(:workshop, sessions: [session_on_day_early(11)])
    create(:workshop, sessions: [session_on_day(11)])
    create(:workshop, sessions: [session_on_day_late(11)])

    start_expected = [workshop_in_10_days_early, workshop_in_10_days, workshop_in_10_days_late].pluck(:id)
    assert_equal start_expected, Pd::Workshop.scheduled_start_in_days(10).pluck(:id)

    end_expected = [workshop_in_10_days_early, workshop_in_10_days, workshop_in_10_days_late].pluck(:id)
    assert_equal end_expected, Pd::Workshop.scheduled_end_in_days(10).pluck(:id)
  end

  test 'multiple session scheduled_start_in_days and scheduled_end_in_days' do
    workshop_starting_on_day_10 = create(:workshop, sessions: [session_on_day(10), session_on_day(11), session_on_day(12)])
    workshop_ending_on_day_10 = create(:workshop, sessions: [session_on_day(8), session_on_day(9), session_on_day(10)])

    # Noise
    create(:workshop, sessions: [session_on_day(8), session_on_day(9)])
    create(:workshop, sessions: [session_on_day(5), session_on_day(10), session_on_day(15)])
    create(:workshop, sessions: [session_on_day(11), session_on_day(12)])

    start_expected = [workshop_starting_on_day_10].pluck(:id)
    assert_equal start_expected, Pd::Workshop.scheduled_start_in_days(10).pluck(:id)

    end_expected = [workshop_ending_on_day_10].pluck(:id)
    assert_equal end_expected, Pd::Workshop.scheduled_end_in_days(10).pluck(:id)
  end

  test 'should have ended' do
    workshop_recently_started = create(:workshop, num_sessions: 0)
    workshop_recently_started.started_at = Time.now
    workshop_recently_started.sessions << (build(:pd_session, start: 13.hours.ago, end: 12.hours.ago))
    workshop_recently_started.save!

    workshop_should_have_ended = create(:workshop, num_sessions: 0)
    workshop_should_have_ended.started_at = Time.now
    workshop_should_have_ended.sessions << (build(:pd_session, start: 51.hours.ago, end: 50.hours.ago))
    workshop_should_have_ended.save!

    workshop_already_ended = create(:workshop, num_sessions: 0)
    workshop_already_ended.started_at = Time.now
    workshop_already_ended.ended_at = Time.now - 1.hour
    workshop_already_ended.sessions << (build(:pd_session, start: 51.hours.ago, end: 50.hours.ago))
    workshop_already_ended.save!

    assert_equal [workshop_should_have_ended.id], Pd::Workshop.should_have_ended.pluck(:id)
  end

  test 'end workshop sends exit surveys' do
    workshop = create(:workshop, num_facilitators: 1)
    workshop.start!

    Pd::Workshop.any_instance.expects(:send_exit_surveys)
    Pd::WorkshopMailjetMailer.expects(:send_facilitator_post_workshop_survey)

    workshop.end!

    # This is normally called by a cron job on production-daemon, but in this test
    # we call it synchronously.
    Pd::Workshop.process_ends
  end

  test 'end workshop sends exit surveys to facilitators for Build Your Own workshops' do
    byo_workshop = create(:byo_workshop,
      :ended,
      num_facilitators: 1
)
    byo_workshop.start!

    Pd::Workshop.any_instance.expects(:send_exit_surveys)
    Pd::WorkshopMailjetMailer.expects(:send_facilitator_post_workshop_survey).times(1)

    byo_workshop.end!

    # This is normally called by a cron job on production-daemon, but in this test
    # we call it synchronously.
    Pd::Workshop.process_ends
  end

  test 'end workshop second time attempts sending exit surveys but they do not send again' do
    workshop = create(:workshop)
    workshop.start!

    workshop.end!
    workshop.update!(ended_at: nil)

    workshop.start!

    workshop.end!

    Pd::Workshop.any_instance.expects(:send_exit_surveys)
    Pd::Enrollment.any_instance.expects(:send_exit_survey).never

    # This is normally called by a cron job on production-daemon, but in this test
    # we call it synchronously.
    Pd::Workshop.process_ends
  end

  # counselor_workshop and admin_workshop have been archived so it no longer passes validation
  # create a regular workshop and update_columns without validating to test function
  test 'account_required_for_attendance' do
    normal_workshop = create(:workshop, :ended)
    counselor_workshop = create(:workshop, :ended)
    counselor_workshop.update_columns(course: Pd::Workshop::COURSE_COUNSELOR, subject: nil)
    admin_workshop = create(:workshop, :ended)
    admin_workshop.update_columns(course: Pd::Workshop::COURSE_ADMIN, subject: nil)
    admin_counselor_workshop = create(:admin_counselor_workshop, :ended)

    assert normal_workshop.account_required_for_attendance?
    refute counselor_workshop.account_required_for_attendance?
    refute admin_workshop.account_required_for_attendance?
    refute admin_counselor_workshop.account_required_for_attendance?
  end

  test 'send_exit_surveys enrolled-only teacher does not get mail' do
    workshop = create(:workshop, :ended)

    create(:pd_workshop_participant, workshop: workshop, enrolled: true)
    Pd::WorkshopMailjetMailer.expects(:send_teacher_post_workshop_survey).never

    workshop.send_exit_surveys
  end

  test 'send_exit_surveys teachers with attendance get emails' do
    workshop = create(:workshop, :ended)
    create(:pd_workshop_participant, workshop: workshop, enrolled: true)
    create(:pd_workshop_participant, workshop: workshop, enrolled: true, attended: true)

    assert workshop.account_required_for_attendance?
    Pd::WorkshopMailjetMailer.expects(:send_teacher_post_workshop_survey).times(1)

    workshop.send_exit_surveys
  end

  test 'send_exit_surveys sends no survey if already sent' do
    workshop = create(:workshop, :ended)
    create(:pd_workshop_participant, workshop: workshop, enrolled: true, attended: true)
    workshop.enrollments.first.update!(survey_sent_at: Time.zone.today)

    Pd::WorkshopMailjetMailer.expects(:send_teacher_post_workshop_survey).never

    workshop.send_exit_surveys
  end

  test 'send_exit_surveys sends to alternate email as well if available for summer workshops' do
    teacher = create(:teacher)
    application = create(:pd_teacher_application, :csp, user: teacher, status: 'accepted')
    summer_workshop = create(:csp_summer_workshop, :ended, num_sessions: 1)
    enrollment = create(:pd_enrollment, application_id: application.id, user: teacher, workshop: summer_workshop)
    create(:pd_attendance, session: summer_workshop.sessions.first, teacher: teacher, enrollment: enrollment)

    Pd::WorkshopMailjetMailer.expects(:send_teacher_post_workshop_survey).times(2)

    summer_workshop.send_exit_surveys
  end

  # an issue with this test failing is fixed by prepending TZ=UTC to the test command
  test 'soft delete' do
    workshop = create(:pd_workshop, num_sessions: 0)
    session = create(:pd_session, workshop: workshop)
    enrollment = create(:pd_enrollment, workshop: workshop)
    workshop.reload.destroy!

    assert workshop.reload.deleted?
    refute Pd::Workshop.exists? id: workshop.id
    assert Pd::Workshop.with_deleted.exists? id: workshop.id

    # Make sure dependent sessions and enrollments are also soft-deleted.
    assert session.reload.deleted?
    refute Pd::Session.exists? session.attributes
    assert Pd::Session.with_deleted.exists? session.attributes

    assert enrollment.reload.deleted?
    refute Pd::Enrollment.exists? enrollment.id
    assert Pd::Enrollment.with_deleted.exists? enrollment.id
  end

  test 'friendly name' do
    workshop = create(:byo_workshop,
      name: "Test Workshop",
      num_facilitators: 1,
      sessions: [create(:pd_session, start: Date.new(2016, 9, 1), location_name: 'Code.org', location_address: 'Seattle, WA', session_format: 'in_person')]
)

    # with name ending in 'Workshop'
    assert_equal 'Test Workshop on 09/01/16 at Code.org in Seattle, WA', workshop.friendly_name

    # with name not ending in 'Workshop' (appends ' workshop' to the name)
    workshop.update!(name: 'New Name')
    assert_equal 'New Name workshop on 09/01/16 at Code.org in Seattle, WA', workshop.friendly_name

    # with course that doesn't require a name, and no subject
    workshop.update_columns(course: Pd::Workshop::COURSE_ADMIN, name: '')
    assert_equal 'Admin workshop on 09/01/16 at Code.org in Seattle, WA', workshop.friendly_name

    # with subject
    workshop.update_columns(course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_5)
    assert_equal 'Exploring Computer Science Unit 5 - Data workshop on 09/01/16 at Code.org in Seattle, WA', workshop.friendly_name

    # truncated at 255 chars
    workshop.sessions.first.update!(location_name: "blah" * 60)
    assert workshop.friendly_name.start_with? 'Exploring Computer Science Unit 5 - Data workshop on 09/01/16 at blahblahblah'
    assert workshop.friendly_name.length == 255
  end

  test 'start date filters' do
    pivot_date = Time.zone.today
    workshop_before = create(:workshop, sessions: [create(:pd_session, start: pivot_date - 1.week)])
    # Start in the middle of the day. Since the filter is by date, this should be included in all the queries.
    workshop_pivot = create(:workshop, sessions: [create(:pd_session, start: pivot_date + 8.hours)])
    workshop_after = create(:workshop, sessions: [create(:pd_session, start: pivot_date + 1.week)])

    ids = [workshop_before, workshop_pivot, workshop_after].pluck(:id)

    # on or before
    assert_equal [workshop_before, workshop_pivot].pluck(:id).sort,
      Pd::Workshop.where(id: ids).scheduled_start_on_or_before(pivot_date).pluck(:id).sort

    # on or after
    assert_equal [workshop_pivot, workshop_after].pluck(:id).sort,
      Pd::Workshop.where(id: ids).scheduled_start_on_or_after(pivot_date).pluck(:id).sort

    # combined
    assert_equal [workshop_pivot.id],
      Pd::Workshop.
        where(id: ids).
        scheduled_start_on_or_after(pivot_date).
        scheduled_start_on_or_before(pivot_date).
        pluck(:id)
  end

  test 'in_year' do
    # before
    create(:workshop, sessions_from: Date.new(2016, 12, 31))

    workshops_this_year = [
      create(:workshop, sessions_from: Date.new(2017, 1, 1)),
      create(:workshop, sessions_from: Date.new(2017, 12, 31))
    ]

    # after
    create(:workshop, sessions_from: Date.new(2018, 12, 31))

    assert_equal workshops_this_year.map(&:id), Pd::Workshop.in_year(2017).pluck(:id)
  end

  test 'future scope' do
    # Today
    a = create(:workshop, sessions_from: Time.zone.today)
    # Next week
    b = create(:workshop, sessions_from: Time.zone.today + 1.week)
    future_workshops = [a, b]

    # Excluded (not future) workshops:
    # Last week
    c = create(:workshop, sessions_from: Time.zone.today - 1.week)
    # Today, but ended
    d = create(:workshop, :ended, sessions_from: Time.zone.today)
    # Next week, but ended
    e = create(:workshop, :ended, sessions_from: Time.zone.today + 1.week)

    workshop_ids = [a, b, c, d, e].map(&:id)
    assert_equal future_workshops, Pd::Workshop.where(id: workshop_ids).future
  end

  test 'end date filters' do
    pivot_date = Time.zone.today
    workshop_before = create(:workshop, ended_at: pivot_date - 1.week)
    # End in the middle of the day. Since the filter is by date, this should be included in all the queries.
    workshop_pivot = create(:workshop, ended_at: pivot_date + 8.hours)
    workshop_after = create(:workshop, ended_at: pivot_date + 1.week)

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
    workshops = Array.new(5) do |i|
      build(:workshop, num_sessions: rand(1..5), sessions_from: Time.zone.today + i.days)
    end
    # save out of order
    workshops.shuffle.each(&:save!)

    ids = workshops.pluck(:id)

    assert_equal workshops.pluck(:id), Pd::Workshop.where(id: ids).order_by_scheduled_start.pluck(:id)
    assert_equal workshops.pluck(:id), Pd::Workshop.where(id: ids).order_by_scheduled_start(desc: false).pluck(:id)
    assert_equal workshops.reverse.pluck(:id), Pd::Workshop.where(id: ids).order_by_scheduled_start(desc: true).pluck(:id)
  end

  test 'order_by_enrollment_count' do
    # Deleted enrollment should not be counted
    pd_enrollment = create(:pd_enrollment, workshop: @workshop)
    pd_enrollment.destroy

    # Workshops with 0 (not counting deleted), 1 and 2 enrollments
    workshops = [
      @workshop,
      @organizer_workshop,
      build(:workshop, num_enrollments: 1),
      build(:workshop, num_enrollments: 2)
    ]
    # save out of order
    workshops.shuffle.each(&:save!)

    assert_equal([0, 0, 1, 2], Pd::Workshop.order_by_enrollment_count.map {|w| w.enrollments.count})
    assert_equal([0, 0, 1, 2], Pd::Workshop.order_by_enrollment_count(desc: false).map {|w| w.enrollments.count})
    assert_equal([2, 1, 0, 0], Pd::Workshop.order_by_enrollment_count(desc: true).map {|w| w.enrollments.count})
  end

  test 'order_by_enrollment_count with duplicates' do
    workshops = [
      @workshop,
      @organizer_workshop,
      build(:workshop),
      build(:workshop, num_enrollments: 1),
    ]
    # save out of order
    workshops.shuffle.each(&:save!)

    assert_equal([0, 0, 0, 1], Pd::Workshop.order_by_enrollment_count(desc: false).map {|w| w.enrollments.count})
    assert_equal([1, 0, 0, 0], Pd::Workshop.order_by_enrollment_count(desc: true).map {|w| w.enrollments.count})
  end

  test 'order_by_state' do
    workshops = [
      build(:workshop, :ended), # Ended
      build(:workshop, :in_progress), # In Progress
      build(:workshop) # Not Started
    ]
    # save out of order
    workshops.shuffle.each(&:save!)

    ids = workshops.pluck(:id)
    assert_equal ids, Pd::Workshop.where(id: ids).order_by_state.pluck(:id)
    assert_equal ids, Pd::Workshop.where(id: ids).order_by_state(desc: false).pluck(:id)
    assert_equal ids.reverse, Pd::Workshop.where(id: ids).order_by_state(desc: true).pluck(:id)
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
    workshop_bad_course = build(:workshop, course: 'nonexistent')
    workshop_bad_subject = build(:workshop, course: Pd::Workshop::COURSE_CSP, subject: 'nonexistent')

    # Note, the Phase 2 subjects for ECS and CS_IN_A are identical: "Phase 2 in-person"
    workshop_ambiguous_subject_ecs = build(:workshop, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2)
    workshop_ambiguous_subject_cs_in_a = build(:workshop, course: Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2)

    assert_nil workshop_bad_course.time_constraint(:max_days)
    assert_nil workshop_bad_subject.time_constraint(:max_days)
    assert_equal 5, workshop_ambiguous_subject_ecs.time_constraint(:max_days)
    assert_equal 3, workshop_ambiguous_subject_cs_in_a.time_constraint(:max_days)
  end

  test 'teacherCon workshops are capped at 33.5 hours' do
    workshop_csd_teachercon = build(:workshop,
      course: Pd::Workshop::COURSE_CSD,
      subject: Pd::Workshop::SUBJECT_CSD_TEACHER_CON,
      num_sessions: 5,
      each_session_hours: 8
)
    # workshop subject is deprecated so validation must be skipped
    workshop_csd_teachercon.save(validate: false)

    workshop_csp_teachercon = build(:workshop,
      course: Pd::Workshop::COURSE_CSD,
      subject: Pd::Workshop::SUBJECT_CSP_TEACHER_CON,
      num_sessions: 5,
      each_session_hours: 8
)
    # workshop subject is deprecated so validation must be skipped
    workshop_csp_teachercon.save(validate: false)

    assert_equal 33.5, workshop_csd_teachercon.effective_num_hours
    assert_equal 33.5, workshop_csp_teachercon.effective_num_hours
  end

  test 'csp summer workshops are capped at 33.5 hours' do
    workshop = create(:csp_summer_workshop, num_sessions: 5, each_session_hours: 8)
    assert_equal 33.5, workshop.effective_num_hours
  end

  test 'CSF 101 workshops are capped at 7 hours' do
    workshop = build(:csf_intro_workshop, each_session_hours: 8)
    assert_equal 7, workshop.effective_num_hours
  end

  test 'CSF 201 workshops are capped at 6 hours' do
    workshop_csf_201 = build(:csf_deep_dive_workshop, each_session_hours: 7)
    assert_equal 6, workshop_csf_201.effective_num_hours
  end

  test 'does not send teacher_enrollment_reminder if suppress_reminders? is true' do
    Pd::WorkshopMailjetMailer.expects(:send_teacher_workshop_reminder).never

    workshop = create(:workshop, suppress_email: true)
    create(:pd_enrollment, workshop: workshop)
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

    Pd::Workshop.send_reminder_for_upcoming_in_days(1)
  end

  test 'sends teacher_enrollment_reminder email to both the users email and alternate email if available and for a summer workshop' do
    teacher = create(:teacher)
    workshop = create(:summer_workshop, course: Pd::SharedWorkshopConstants::COURSE_CSD)
    application = create(:pd_teacher_application, course: 'csd', application_year: workshop.school_year, user: teacher, status: 'accepted')
    create(:pd_enrollment, application_id: application.id, user: teacher, workshop: workshop)

    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])
    Pd::WorkshopMailjetMailer.expects(:send_teacher_workshop_reminder).times(2)

    Pd::Workshop.send_reminder_for_upcoming_in_days(10)
  end

  test 'errors in teacher reminders in send_reminder_for_upcoming_in_days do not stop batch' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil).then.raises(RuntimeError, 'bad email').then.returns(nil).then.returns(nil).then.returns(nil).then.returns(nil)
    Pd::WorkshopMailjetMailer.stubs(:send_teacher_workshop_reminder).raises(RuntimeError, 'teacher workshop bad email')
    Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).returns(mock_mail).times(2)
    Pd::WorkshopMailer.expects(:organizer_enrollment_reminder).returns(mock_mail)

    user1 = create(:teacher)
    user2 = create(:teacher)
    user3 = create(:teacher)
    workshop = create(:workshop, facilitators: [create(:facilitator), create(:facilitator)])
    create(:pd_enrollment, workshop: workshop, user: user1)
    create(:pd_enrollment, workshop: workshop, user: user2)
    create(:pd_enrollment, workshop: workshop, user: user3)
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

    e = assert_raises RuntimeError do
      Pd::Workshop.send_reminder_for_upcoming_in_days(1)
    end
    assert_includes(e.message, 'Failed to send 1 day workshop reminders:')
    assert_includes(e.message, 'teacher enrollment')
    assert_includes(e.message, 'bad email')
  end

  test 'errors in organizer reminders in send_reminder_for_upcoming_in_days do not stop batch' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil).then.returns(nil).then.returns(nil).then.returns(nil).then.returns(nil).then.raises(RuntimeError, 'bad email')
    Pd::WorkshopMailjetMailer.stubs(:send_teacher_workshop_reminder).raises(RuntimeError, 'organizer workshop bad email')
    Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).returns(mock_mail).times(2)

    Pd::WorkshopMailer.expects(:organizer_enrollment_reminder).returns(mock_mail)

    user1 = create(:teacher)
    user2 = create(:teacher)
    user3 = create(:teacher)
    workshop = create(:workshop, facilitators: [create(:facilitator), create(:facilitator)])
    create(:pd_enrollment, workshop: workshop, user: user1)
    create(:pd_enrollment, workshop: workshop, user: user2)
    create(:pd_enrollment, workshop: workshop, user: user3)
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

    e = assert_raises RuntimeError do
      Pd::Workshop.send_reminder_for_upcoming_in_days(1)
    end
    assert_includes(e.message, 'Failed to send 1 day workshop reminders:')
    assert_includes(e.message, 'organizer workshop')
    assert_includes(e.message, 'bad email')
  end

  test 'errors in facilitator reminders in send_reminder_for_upcoming_in_days do not stop batch' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil).then.returns(nil).then.returns(nil).then.returns(nil).then.raises(RuntimeError, 'bad email').then.returns(nil)
    Pd::WorkshopMailjetMailer.stubs(:send_teacher_workshop_reminder).raises(RuntimeError, 'facilitator workshop bad email')
    Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).returns(mock_mail).times(2)
    Pd::WorkshopMailer.expects(:organizer_enrollment_reminder).returns(mock_mail)

    user1 = create(:teacher)
    user2 = create(:teacher)
    user3 = create(:teacher)
    workshop = create(:workshop, facilitators: [create(:facilitator), create(:facilitator)])
    create(:pd_enrollment, workshop: workshop, user: user1)
    create(:pd_enrollment, workshop: workshop, user: user2)
    create(:pd_enrollment, workshop: workshop, user: user3)
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

    e = assert_raises RuntimeError do
      Pd::Workshop.send_reminder_for_upcoming_in_days(1)
    end
    assert_includes(e.message, 'Failed to send 1 day workshop reminders:')
    assert_includes(e.message, 'facilitator')
    assert_includes(e.message, 'bad email')
  end

  test 'facilitator reminders are skipped when the facilitator is also the organizer' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil)

    facilitator = create(:facilitator)
    organizer = create(:workshop_organizer)

    # The organizer is also a facilitator, and should not receive a facilitator reminder email.
    workshop = create(:workshop, organizer: organizer, facilitators: [organizer, facilitator])
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

    Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).with(facilitator, workshop).returns(mock_mail)
    Pd::WorkshopMailer.expects(:facilitator_enrollment_reminder).with(organizer, workshop).never
    Pd::WorkshopMailer.expects(:organizer_enrollment_reminder).with(workshop).returns(mock_mail)
    Pd::Workshop.send_reminder_for_upcoming_in_days(1)
  end

  test '10 day reminder for academic year workshop sends pre email to facilitators' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil)

    user = create(:teacher)
    workshop = create(:academic_year_workshop, num_facilitators: 2)
    create_list(:pd_enrollment, 3, workshop: workshop, user: user)
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

    Pd::WorkshopMailer.expects(:facilitator_pre_workshop).returns(mock_mail).times(2)
    Pd::Workshop.send_reminder_for_upcoming_in_days(10)
  end

  test '3 day reminder for summer workshop does not send pre email to facilitators' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil)

    user = create(:teacher)
    workshop = create(:csp_summer_workshop, num_facilitators: 2)
    create_list(:pd_enrollment, 3, workshop: workshop, user: user)
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

    Pd::WorkshopMailer.expects(:facilitator_pre_workshop).returns(mock_mail).never
    Pd::Workshop.send_reminder_for_upcoming_in_days(3)
  end

  test 'CSA teacher pre-work 20 days out' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil)

    workshop = create(:csa_summer_workshop, num_facilitators: 2)
    create_list(:pd_enrollment, 3, workshop: workshop)
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

    Pd::WorkshopMailer.expects(:teacher_pre_workshop_csa).returns(mock_mail).times(3)
    Pd::Workshop.send_teacher_pre_work_csa
  end

  test 'CSA teacher pre-work doesnt send to non-summer workshops' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil)

    workshop = create(:csa_academic_year_workshop, num_facilitators: 2)
    create_list(:pd_enrollment, 3, workshop: workshop)
    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])

    Pd::WorkshopMailer.expects(:teacher_pre_workshop_csa).returns(mock_mail).never
    Pd::Workshop.send_teacher_pre_work_csa
  end

  test 'CSA teacher pre-work email sends to both the users email and alternate summer email if available' do
    mock_mail = stub
    mock_mail.stubs(:deliver_now).returns(nil)

    teacher = create(:teacher)
    workshop = create(:csa_academic_year_workshop, num_facilitators: 2, subject: Pd::Workshop::SUBJECT_CSA_SUMMER_WORKSHOP)
    application = create(:pd_teacher_application, course: 'csa', application_year: workshop.school_year, user: teacher, status: 'accepted')
    enrollment = create(:pd_enrollment, application_id: application.id, user: teacher, workshop: workshop)

    Pd::Workshop.expects(:scheduled_start_in_days).returns([workshop])
    Pd::WorkshopMailer.expects(:teacher_pre_workshop_csa).with(enrollment).returns(mock_mail)
    Pd::WorkshopMailer.expects(:teacher_pre_workshop_csa).with(enrollment, to_email: teacher.alternate_email).returns(mock_mail)
    Pd::Workshop.send_teacher_pre_work_csa
  end

  test 'workshop starting date picks the day of the first session' do
    session1 = create(:pd_session, start: Time.zone.today + 15.days)
    session2 = create(:pd_session, start: Time.zone.today + 20.days)
    workshop = create(:workshop, sessions: [session1, session2])
    assert_equal session1.start, workshop.workshop_starting_date
    assert_equal session2.start, workshop.workshop_ending_date
  end

  test 'workshop date range string for single session workshop' do
    workshop = create(:workshop, num_sessions: 1)
    assert_equal Time.zone.today.strftime('%B %e, %Y'), workshop.workshop_date_range_string
  end

  test 'workshop date range string for multi session workshop' do
    workshop = create(:workshop, num_sessions: 2)
    assert_equal "#{Time.zone.today.strftime('%B %e, %Y')} - #{Time.zone.tomorrow.strftime('%B %e, %Y')}", workshop.workshop_date_range_string
  end

  test 'workshop_dashboard_url' do
    expected_url = "http://#{CDO.dashboard_hostname}/pd/workshop_dashboard/workshops/#{@workshop.id}"
    assert_equal expected_url, @workshop.workshop_dashboard_url
  end

  test 'unattended_enrollments' do
    session = create(:pd_session, workshop: @workshop)
    @workshop.sessions << session

    # 2 enrollments with attendance
    2.times do
      enrollment = create(:pd_enrollment, workshop: @workshop)
      create(:pd_attendance, session: session, enrollment: enrollment)
    end

    # 2 enrollments without attendance
    enrollments = Array.new(2) do
      create(:pd_enrollment, workshop: @workshop)
    end

    assert_equal enrollments.pluck(:id).sort, @workshop.unattended_enrollments.pluck(:id).sort
  end

  test 'teachers_attending_all_sessions' do
    workshop = create(:workshop,
      course: Pd::Workshop::COURSE_CSP,
      sessions_from: Date.new(2019, 7, 1)
)

    2.times do
      create(:pd_workshop_participant, enrolled: true, workshop: workshop)
      create(:pd_workshop_participant, enrolled: true, attended: true, workshop: workshop)
      create(:pd_workshop_participant, enrolled: true, attended: true, cdo_scholarship_recipient: true, workshop: workshop)
    end

    assert_equal 4, workshop.teachers_attending_all_sessions.count

    # Test that scholarship filter works.
    # Set argument to filter to only scholarship teachers to true.
    assert_equal 2, workshop.teachers_attending_all_sessions(filter_by_cdo_scholarship: true).count
  end

  test 'teachers_attending_all_sessions with a teacher who deleted their account' do
    workshop = create(:workshop)

    workshop_participant = create(:pd_workshop_participant,
      enrolled: true,
      attended: true,
      cdo_scholarship_recipient: true,
      workshop: workshop
)

    # Should return 1 before we've done anything.
    assert_equal 1, workshop.teachers_attending_all_sessions(filter_by_cdo_scholarship: true).count

    # Delete the user.
    workshop_participant.destroy!
    workshop.reload

    # With no user account, the user doesn't show up in array of attending teachers.
    assert_equal 0, workshop.teachers_attending_all_sessions(filter_by_cdo_scholarship: true).count

    # Fully purge the user account's PD records,
    # which removes their user ID from attendances.
    DeleteAccountsHelper.new.clean_and_destroy_pd_content workshop_participant.id, workshop_participant.email
    workshop.reload

    # Should still return 0 once we've fully purged the teacher user ID from the attendance
    assert_equal 0, workshop.teachers_attending_all_sessions(filter_by_cdo_scholarship: true).count
  end

  test 'organizer_or_facilitator?' do
    facilitator = create(:facilitator)
    @organizer_workshop.facilitators << facilitator
    another_organizer = create(:workshop_organizer)
    another_facilitator = create(:facilitator)

    assert @organizer_workshop.organizer_or_facilitator?(@workshop_organizer)
    assert @organizer_workshop.organizer_or_facilitator?(facilitator)
    refute @organizer_workshop.organizer_or_facilitator?(another_organizer)
    refute @organizer_workshop.organizer_or_facilitator?(another_facilitator)
  end

  test 'organizer_or_facilitator? with program manager organizer' do
    facilitator = create(:facilitator)
    @workshop.facilitators << facilitator
    another_organizer = create(:workshop_organizer)
    another_facilitator = create(:facilitator)

    assert @workshop.organizer_or_facilitator?(@organizer)
    assert @workshop.organizer_or_facilitator?(facilitator)
    refute @workshop.organizer_or_facilitator?(another_organizer)
    refute @workshop.organizer_or_facilitator?(another_facilitator)
  end

  test 'suppress_reminders? is true for certain subjects by default' do
    suppressed = [
      # workshop subject is deprecated so validation must be skipped
      build(:fit_workshop, course: Pd::Workshop::COURSE_CSF).tap {|w| w.save(validate: false)},
      # workshop subject is deprecated so validation must be skipped
      build(:workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_TEACHER_CON).tap {|w| w.save(validate: false)},
      # workshop subject is deprecated so validation must be skipped
      build(:fit_workshop, course: Pd::Workshop::COURSE_CSD).tap {|w| w.save(validate: false)},
      # workshop subject is deprecated so validation must be skipped
      build(:workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_TEACHER_CON).tap {|w| w.save(validate: false)},
      # workshop subject is deprecated so validation must be skipped
      build(:fit_workshop, course: Pd::Workshop::COURSE_CSP).tap {|w| w.save(validate: false)},
      create(:admin_counselor_workshop, subject: Pd::Workshop::SUBJECT_ADMIN_COUNSELOR_WELCOME),
      create(:admin_counselor_workshop, subject: Pd::Workshop::SUBJECT_ADMIN_COUNSELOR_SLP_INTRO),
      create(:admin_counselor_workshop, subject: Pd::Workshop::SUBJECT_ADMIN_COUNSELOR_SLP_CALL1),
      create(:admin_counselor_workshop, subject: Pd::Workshop::SUBJECT_ADMIN_COUNSELOR_SLP_CALL2),
      create(:admin_counselor_workshop, subject: Pd::Workshop::SUBJECT_ADMIN_COUNSELOR_SLP_CALL3),
      create(:admin_counselor_workshop, subject: Pd::Workshop::SUBJECT_ADMIN_COUNSELOR_SLP_CALL4)
    ]

    refute @workshop.suppress_reminders?
    suppressed.each do |workshop|
      assert workshop.suppress_reminders?
    end
  end

  test 'workshops not suppressing reminders by default will suppress_reminders once suppress_email is set' do
    workshop = build(:workshop)

    refute workshop.suppress_reminders?

    workshop.suppress_email = true
    assert workshop.suppress_reminders?
  end

  test 'ready_to_close?' do
    # no sessions, not ready
    refute @workshop.ready_to_close?

    # 3 sessions, no attendance: not ready
    workshop = create(:workshop, num_sessions: 3)
    refute workshop.ready_to_close?

    # attendance in the first session only: not ready
    create(:pd_attendance, session: workshop.sessions.first)
    refute workshop.ready_to_close?

    # attendance in the last session: ready
    create(:pd_attendance, session: workshop.sessions.last)
    assert workshop.ready_to_close?
  end

  test 'pre_survey?' do
    csd_workshop = create(:workshop, course: Pd::Workshop::COURSE_CSD)
    csp_workshop = create(:workshop, course: Pd::Workshop::COURSE_CSP)
    other_workshop = create(:byo_workshop)

    assert csd_workshop.pre_survey?
    assert csp_workshop.pre_survey?
    refute other_workshop.pre_survey?
  end

  test 'pre_survey_units_and_lessons' do
    unit_group = create(:unit_group, name: 'pd-workshop-pre-survey-test-1991', family_name: 'pd-workshop-pre-survey-test', version_year: '1991')
    CourseOffering.add_course_offering(unit_group)
    next_position = 1
    add_unit = lambda do |unit_name, lesson_names|
      create(:script, name: unit_name).tap do |script|
        create(:unit_group_unit, unit_group: unit_group, script: script, position: (next_position += 1))
        create(:lesson_group, script: script)
        lesson_names.each {|lesson_name| create(:lesson, script: script, name: lesson_name, key: lesson_name, lesson_group: script.lesson_groups.first)}
      end
    end

    add_unit.call 'pre-survey-unit-1', ['Unit 1 - Lesson 1', 'Unit 1 - Lesson 2']
    add_unit.call 'pre-survey-unit-2', ['Unit 2 - Lesson 1', 'Unit 2 - Lesson 2']
    add_unit.call 'pre-survey-unit-3', ['Unit 3 - Lesson 1']

    workshop = build(:workshop)
    workshop.expects(:pre_survey?).returns(true).twice
    workshop.stubs(:pre_survey_course_offering_name).returns('pd-workshop-pre-survey-test')
    UnitGroup.expects(:latest_stable_version).with('pd-workshop-pre-survey-test').returns(unit_group)

    expected = [
      ['pre-survey-unit-1', ['Lesson 1: Unit 1 - Lesson 1', 'Lesson 2: Unit 1 - Lesson 2']],
      ['pre-survey-unit-2', ['Lesson 1: Unit 2 - Lesson 1', 'Lesson 2: Unit 2 - Lesson 2']],
      ['pre-survey-unit-3', ['Lesson 1: Unit 3 - Lesson 1']]
    ]
    assert_equal expected, workshop.pre_survey_units_and_lessons
  end

  test 'pre_workshop_course' do
    course_name = 'Fake Course Name'
    mock_course = mock

    # No pre-survey
    workshop = build(:workshop)
    workshop.stubs(:pre_survey?).returns(false)
    assert_nil workshop.pre_survey_course

    # With valid course name
    workshop.stubs(:pre_survey?).returns(true)
    workshop.stubs(:pre_survey_course_offering_name).returns(course_name)
    UnitGroup.expects(:latest_stable_version).with(course_name).returns(mock_course)
    assert_equal mock_course, workshop.pre_survey_course

    # With invalid course name
    UnitGroup.expects(:latest_stable_version).with(course_name).raises(ActiveRecord::RecordNotFound)
    e = assert_raises RuntimeError do
      workshop.pre_survey_course
    end
    assert_equal "No course found for course offering key #{course_name}", e.message
  end

  test 'friendly date range same month' do
    workshop = build(:workshop, num_sessions: 5, sessions_from: Date.new(2017, 3, 10))
    assert_equal 'March 10-14, 2017', workshop.friendly_date_range
  end

  test 'friendly date range different months' do
    workshop = build(:workshop, num_sessions: 5, sessions_from: Date.new(2017, 3, 30))
    assert_equal 'March 30 - April 3, 2017', workshop.friendly_date_range
  end

  test 'date_and_location_name with no location but with sessions' do
    workshop = build(:workshop, num_sessions: 5, sessions_from: Date.new(2017, 3, 30))

    assert_equal 'March 30 - April 3, 2017, Location TBA', workshop.date_and_location_name
  end

  test 'date_and_location_name with no location nor sessions' do
    workshop = create(:workshop, num_sessions: 0)

    assert_equal 'Dates TBA, Location TBA', workshop.date_and_location_name
  end

  test 'date_and_location_name for teachercon' do
    workshop = build(:workshop, :teachercon, num_sessions: 5, sessions_from: Date.new(2017, 3, 30), session_location_address: 'Seattle WA')

    assert_equal 'March 30 - April 3, 2017, Seattle WA TeacherCon', workshop.date_and_location_name
  end

  test 'date_and_location_name with virtual location and sessions' do
    workshop = build(:workshop, num_sessions: 5, sessions_from: Date.new(2017, 3, 30), virtual: true)

    assert_equal 'March 30 - April 3, 2017, Virtual Workshop', workshop.date_and_location_name
  end

  test 'friendly_location with no location returns tba' do
    workshop = build(:workshop)
    assert_equal 'Location TBA', workshop.friendly_location
  end

  test 'friendly_location with virtual location' do
    workshop = build(:workshop, virtual: true)
    assert_equal 'Virtual Workshop', workshop.friendly_location
  end

  test 'workshops organized by a non program manager are not assigned regional partner' do
    workshop = create(:workshop)
    assert_nil workshop.regional_partner
  end

  test 'workshops organized by a program manager are assigned the regional partner' do
    regional_partner = create(:regional_partner)
    program_manager = create(:program_manager, regional_partner: regional_partner)
    workshop = create(:workshop, organizer: program_manager)

    assert_equal regional_partner, workshop.regional_partner
  end

  test 'nearest' do
    target = create(:workshop, sessions_from: Time.zone.today + 1.week)

    x = create(:workshop, sessions_from: Time.zone.today + 2.weeks)
    y = create(:workshop, sessions_from: Time.zone.today - 2.weeks)

    ids = [target, x, y].map(&:id)

    assert_equal target, Pd::Workshop.where(id: ids).nearest
  end

  test 'nearest is independent of creation order' do
    x = create(:workshop, sessions_from: Time.zone.today - 2.weeks)
    target = create(:workshop, sessions_from: Time.zone.today + 1.week)
    y = create(:workshop, sessions_from: Time.zone.today + 2.weeks)

    ids = [x, target, y].map(&:id)

    nearest_workshop = Pd::Workshop.where(id: ids).nearest
    assert_equal target, nearest_workshop

    # Also make sure attributes are included
    assert_equal target.course, nearest_workshop.course
    assert_equal 1, nearest_workshop.sessions.count
  end

  test 'nearest with no matches returns nil' do
    assert_nil Pd::Workshop.none.nearest
  end

  test 'nearest combined with subject and enrollment' do
    user = create(:teacher)
    target = create(:csp_summer_workshop, sessions_from: Time.zone.today + 1.day)
    create(:pd_enrollment, :from_user, user: user, workshop: target)

    same_subject_farther = create(:csp_summer_workshop, sessions_from: Time.zone.today + 1.week)
    create(:pd_enrollment, :from_user, user: user, workshop: same_subject_farther)

    different_subject_closer = create(:workshop, sessions_from: Time.zone.today,
      course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1
)
    create(:pd_enrollment, :from_user, user: user, workshop: different_subject_closer)

    # closer, not enrolled
    create(:csp_summer_workshop, sessions_from: Time.zone.today)

    found = Pd::Workshop.where(subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP).enrolled_in_by(user).nearest
    assert_equal target, found
  end

  test 'with_nearest_attendance_by' do
    teacher = create(:teacher)

    # 2 workshops on the same day
    workshops = create_list(:workshop, 2, num_sessions: 2, sessions_from: Time.zone.today - 1.day)

    # Attend first session from one
    create(:pd_attendance, session: workshops[0].sessions[0], teacher: teacher)
    nearest_workshop = Pd::Workshop.with_nearest_attendance_by(teacher)
    assert_equal workshops[0], nearest_workshop

    # Also make sure attributes are included
    assert_equal workshops[0].course, nearest_workshop.course
    assert_equal 2, nearest_workshop.sessions.count

    # Attend second session (today, now nearest) from the other
    create(:pd_attendance, session: workshops[1].sessions[1], teacher: teacher)
    assert_equal workshops[1], Pd::Workshop.with_nearest_attendance_by(teacher)
  end

  test 'nearest_attended_or_enrolled_in_by' do
    teacher = create(:teacher)
    other_teacher = create(:teacher)

    # 2 workshops on the same day for each course
    csd_workshops = create_list(:workshop, 2, num_sessions: 2, sessions_from: Time.zone.today - 1.day, course: COURSE_CSD)
    csp_workshops = create_list(:workshop, 2, num_sessions: 2, sessions_from: Time.zone.today - 1.day, course: COURSE_CSP)

    # Enroll in the first of each
    create(:pd_enrollment, :from_user, user: teacher, workshop: csd_workshops[0])
    create(:pd_enrollment, :from_user, user: teacher, workshop: csp_workshops[0])

    assert_nil Pd::Workshop.where(course: COURSE_CSP).nearest_attended_or_enrolled_in_by(other_teacher)

    # No attendances, expect enrolled workshop
    assert_equal csp_workshops[0], Pd::Workshop.where(course: COURSE_CSP).nearest_attended_or_enrolled_in_by(teacher)

    # Now enroll in and attend the second csp workshop, expect the attended one
    create(:pd_enrollment, :from_user, user: teacher, workshop: csp_workshops[1])
    create(:pd_attendance, teacher: teacher, session: csp_workshops[1].sessions.first)
    assert_equal csp_workshops[1], Pd::Workshop.where(course: COURSE_CSP).nearest_attended_or_enrolled_in_by(teacher)

    # Switch workshops half way through. (Yes this actually happened in the wild)
    # No problem. Return the one associated with the most recent attendance
    create(:pd_attendance, teacher: teacher, session: csp_workshops[0].sessions.last)
    assert_equal csp_workshops[0], Pd::Workshop.where(course: COURSE_CSP).nearest_attended_or_enrolled_in_by(teacher)
  end

  test 'potential organizers' do
    workshop_admin = create(:workshop_admin)
    program_manager = create(:program_manager)
    csf_facilitator = create(:facilitator, course: COURSE_CSF)
    csd_facilitator = create(:facilitator, course: COURSE_CSD)

    # csf workshop has workshop admins, program managers, and other csf facilitators in list
    csf_workshop = build(:workshop, course: COURSE_CSF)
    potential_organizer_ids = csf_workshop.potential_organizers.ids

    assert_includes(potential_organizer_ids, workshop_admin.id)
    assert_includes(potential_organizer_ids, program_manager.id)
    assert_includes(potential_organizer_ids, csf_facilitator.id)
    # don't include other types of facilitators
    refute_includes(potential_organizer_ids, csd_facilitator.id)

    # non-csf workshop without regional partner has workshop admins and all program managers in list
    csd_workshop = create(:workshop, course: COURSE_CSD)
    potential_organizer_ids = csd_workshop.potential_organizers.ids
    assert_includes(potential_organizer_ids, workshop_admin.id)
    assert_includes(potential_organizer_ids, program_manager.id)
    # facilitators cannot be organizers for non-csf workshops
    refute_includes(potential_organizer_ids, csd_facilitator.id)

    # non-csf workshop with a regional partner has only that regional partner's program managers, and all workshop admins
    workshop_partner = create(:regional_partner)
    workshop_partner_program_manager = create(:program_manager, regional_partner: workshop_partner)
    csd_workshop.regional_partner = workshop_partner
    potential_organizer_ids = csd_workshop.potential_organizers.ids
    assert_includes(potential_organizer_ids, workshop_admin.id)
    assert_includes(potential_organizer_ids, workshop_partner_program_manager.id)
    refute_includes(potential_organizer_ids, program_manager.id)
  end

  test 'virtual workshops don\'t automatically suppress email' do
    workshop = build(:workshop)

    # Non-virtual workshops may suppress email or not
    workshop.suppress_email = false
    assert workshop.valid?

    workshop.suppress_email = true
    assert workshop.valid?

    # Virtual workshops may suppress email or not (change from previous behavior)
    workshop.sessions.first.session_format = 'virtual'
    workshop.suppress_email = false
    assert workshop.valid?

    workshop.suppress_email = true
    assert workshop.valid?
  end

  test 'CSP summer workshop must require teacher application' do
    workshop = create(:csp_summer_workshop, regional_partner: @regional_partner)
    assert workshop.require_application?
  end

  test 'CSD academic year workshop must require teacher application' do
    workshop = create(:csd_academic_year_workshop, regional_partner: @regional_partner)
    assert workshop.require_application?
  end

  test 'CSA summer workshop must require teacher application' do
    workshop = create(:csa_summer_workshop, regional_partner: @regional_partner)
    assert workshop.require_application?
  end

  test 'CSF workshop must not require teacher application' do
    workshop = build(:csf_workshop, regional_partner: @regional_partner)
    refute workshop.require_application?
  end

  test 'workshop without regional partner must not require teacher application' do
    workshop = create(:csp_summer_workshop)
    refute workshop.require_application?
  end

  test 'regional partner with partner application must not require teacher application' do
    rp = create(:regional_partner, link_to_partner_application: 'https://example.com')
    workshop = create(:csp_summer_workshop, regional_partner: rp)
    refute workshop.require_application?
  end

  test 'send_automated_emails sends pre-workshop 10 days before' do
    workshop = create(:csd_academic_year_workshop, sessions_from: Time.zone.today + 10.days)

    facilitator = create(:facilitator)
    workshop.facilitators = [facilitator]
    workshop.save!

    Pd::WorkshopMailer.any_instance.expects(:facilitator_pre_workshop).
      with(facilitator, workshop)
    Pd::WorkshopMailjetMailer.expects(:send_facilitator_post_workshop_survey).never

    Pd::Workshop.send_automated_emails
  end

  test 'workshop date range string is NA when no sessions' do
    workshop = create(:workshop, num_sessions: 0)
    assert_equal 'N/A', workshop.workshop_date_range_string
  end

  test 'bad time_zone value results in nil' do
    workshop = create(:workshop, time_zone: 'Bad/Zone')
    assert_equal nil, workshop.time_zone
  end

  test 'subject_must_be_valid_for_course validation passes if workshop has valid subject in course' do
    workshop = create(:workshop, course: Pd::Workshop::COURSE_CSD, subject: SUBJECT_CSD_WORKSHOP_1)
    assert workshop.valid?
  end

  test 'subject_must_be_valid_for_course validation error if workshop has invalid subject in course' do
    workshop = build(:workshop, course: Pd::Workshop::COURSE_CSD, subject: 'INVALID_SUBJECT')
    refute workshop.valid?
    assert_equal 1, workshop.errors.messages.count
    assert_equal 'Subject must be a valid option for the course', workshop.errors.full_messages[0]
  end

  test 'subject_must_be_valid_for_course validation passes if workshop has valid legacy subject in course' do
    workshop = create(:workshop, course: Pd::Workshop::COURSE_CSD, subject: SUBJECT_CSD_SUMMER_WORKSHOP)
    assert workshop.valid?
  end

  test 'subject_must_be_valid_for_course validation error if workshop has invalid legacy subject in course' do
    workshop = build(:workshop, course: Pd::Workshop::COURSE_CSD, subject: 'INVALID_SUBJECT')
    refute workshop.valid?
    assert_equal 1, workshop.errors.messages.count
    assert_equal 'Subject must be a valid option for the course', workshop.errors.full_messages[0]
  end

  test 'subject_must_be_valid_for_course validation passes if workshop course does not require subject and no subject is present' do
    workshop = create(:byo_workshop, subject: nil)
    assert workshop.valid?
  end

  test 'subject_must_be_valid_for_course validation error if workshop course does not require subject and subject is present' do
    workshop = build(:byo_workshop, subject: SUBJECT_CSD_WORKSHOP_1)
    refute workshop.valid?
    assert_equal 1, workshop.errors.messages.count
    assert_equal 'Subject must be a valid option for the course', workshop.errors.full_messages[0]
  end

  test 'subject_must_be_valid_for_course validation error if workshop course requires subject and no subject is present' do
    workshop = build(:workshop, course: Pd::Workshop::COURSE_CSD, subject: nil)
    refute workshop.valid?
    assert_equal 1, workshop.errors.messages.count
    assert_equal 'Subject must be a valid option for the course', workshop.errors.full_messages[0]
  end

  test 'workshop config_validation' do
    workshop = build(:pd_workshop, grades: nil, name: nil, description: nil)

    refute workshop.valid?
    assert_includes workshop.errors.full_messages, 'Please select at least one grade level'
    assert_includes workshop.errors.full_messages, 'Name is required'
    assert_includes workshop.errors.full_messages, 'Description is required'
  end

  test 'workshop config_validation does not raise errors for legacy courses without configs' do
    workshop = create(:admin_counselor_workshop)
    assert_empty workshop.errors
  end

  test 'valid_registration_link_format validation passes' do
    workshop = build(:workshop, registration_link: 'https://good/url/here')
    assert workshop.valid?
  end

  test 'valid_registration_link_format validation error' do
    workshop = build(:workshop, registration_link: 'bad/url here')
    refute workshop.valid?
    assert_equal 1, workshop.errors.messages.count
    assert_equal 'Registration link is not valid or is missing http or https', workshop.errors.full_messages[0]
  end

  test 'valid_grades rejects invalid grades' do
    workshop = build(:pd_workshop, grades: ['Other', 'CS 100'])

    refute workshop.valid?
    assert_includes workshop.errors.full_messages, 'Grade levels contains invalid grades: Other, CS 100'
  end

  test 'valid_grades allows valid grades' do
    workshop = build(:pd_workshop, grades: ['K', '1'])

    assert workshop.valid?
  end

  private def session_on_day(day_offset)
    # 9am-5pm
    session_on(day_offset, 9.hours, 17.hours)
  end

  private def session_on_day_late(day_offset)
    # Ending at 11:59pm
    session_on(day_offset, 12.hours, 23.hours + 59.minutes)
  end

  private def session_on_day_early(day_offset)
    # Starting at midnight
    session_on(day_offset, 0, 9.hours)
  end

  private def session_on(day_offset, start_offset, end_offset)
    day = today + day_offset.days
    create(:pd_session, start: day + start_offset, end: day + end_offset)
  end

  private def today
    Time.zone.today
  end
end
