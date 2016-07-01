require 'test_helper'
require 'cdo/activity_constants'

class Pd::WorkshopOrganizerPaymentTest < ActiveSupport::TestCase
  freeze_time

  setup do
    @organizer = create :workshop_organizer
    @teacher1 = create :teacher
    @teacher2 = create :teacher

    @workshop = create :pd_workshop, organizer: @organizer
    @session1 = create :pd_session, workshop: @workshop
    @session2 = create :pd_session, workshop: @workshop

    @facilitator = create :facilitator
    @workshop.facilitators << @facilitator

    create :pd_attendance, session: @session1, teacher: @teacher1
    create :pd_attendance, session: @session1, teacher: @teacher2
    create :pd_attendance, session: @session2, teacher: @teacher2

    @teachers = [@teacher1, @teacher2]
  end

  test 'teachers and teacher_days' do
    payment = Pd::WorkshopOrganizerPayment.new @workshop
    assert_equal 2, payment.teachers.count
    assert_equal 3, payment.teacher_days

    create :pd_attendance, session: @session2, teacher: @teacher1
    payment = Pd::WorkshopOrganizerPayment.new @workshop
    assert_equal 2, payment.teachers.count
    assert_equal 4, payment.teacher_days
  end

  test 'csf' do
    @workshop.course = Pd::Workshop::COURSE_CSF
    @workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC

    # Only 10 passing levels: not qualified
    10.times do
      create :user_level, user: @teacher1, best_result: ::ActivityConstants::MINIMUM_PASS_RESULT
    end
    create :user_level, user: @teacher1

    # > 10 passing levels: qualified
    11.times do
      create :user_level, user: @teacher2, best_result: ::ActivityConstants::MINIMUM_PASS_RESULT
    end

    payment = Pd::WorkshopOrganizerPayment.new @workshop
    assert payment.qualified
    assert_equal 50, payment.parts[:teacher]
    assert_equal 50, payment.total
  end

  test 'public unqualified' do
    empty_workshop = create :pd_workshop,
      course: Pd::Workshop::COURSE_CSP,
      workshop_type: Pd::Workshop::TYPE_PUBLIC

    payment = Pd::WorkshopOrganizerPayment.new empty_workshop
    assert_equal 0, payment.teachers.count
    refute payment.qualified
  end

  test 'public qualified small venue' do
    @workshop.course = Pd::Workshop::COURSE_CSP
    @workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC
    payment = Pd::WorkshopOrganizerPayment.new @workshop

    assert payment.qualified
    assert_equal 120, payment.parts[:teacher]
    assert_equal 1000, payment.parts[:facilitator]
    assert_equal 500, payment.parts[:staffer]
    assert_equal 800, payment.parts[:venue]
    assert_equal 2420, payment.total
  end

  test 'public qualified small venue plp urban' do
    @workshop.course = Pd::Workshop::COURSE_CSP
    @workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC
    create :professional_learning_partner, contact: @organizer, urban: true
    payment = Pd::WorkshopOrganizerPayment.new @workshop

    assert payment.qualified
    assert_equal 150, payment.parts[:teacher]
    assert_equal 1250, payment.parts[:facilitator]
    assert_equal 500, payment.parts[:staffer]
    assert_equal 1000, payment.parts[:venue]
    assert_equal 2900, payment.total
  end

  test 'public qualified large venue' do
    @workshop.course = Pd::Workshop::COURSE_CSP
    @workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC
    10.times do
      teacher = create :teacher
      create :pd_attendance, session: @session1, teacher: teacher
    end

    payment = Pd::WorkshopOrganizerPayment.new @workshop

    assert payment.qualified
    assert_equal 520, payment.parts[:teacher]
    assert_equal 1000, payment.parts[:facilitator]
    assert_equal 500, payment.parts[:staffer]
    assert_equal 900, payment.parts[:venue]
    assert_equal 2920, payment.total
  end

  test 'district unqualified' do
    empty_workshop = create :pd_workshop,
      course: Pd::Workshop::COURSE_CS_IN_A,
      workshop_type: Pd::Workshop::TYPE_DISTRICT,
      subject: Pd::Workshop::SUBJECTS[Pd::Workshop::COURSE_CS_IN_A].first

    payment = Pd::WorkshopOrganizerPayment.new empty_workshop
    assert_equal 0, payment.teachers.count
    refute payment.qualified
  end

  test 'district qualified' do
    @workshop.course = Pd::Workshop::COURSE_CS_IN_A
    @workshop.workshop_type = Pd::Workshop::TYPE_DISTRICT
    @workshop.subject = Pd::Workshop::SUBJECTS[Pd::Workshop::COURSE_CS_IN_A].first
    payment = Pd::WorkshopOrganizerPayment.new @workshop

    assert payment.qualified
    assert_equal 120, payment.parts[:teacher]
    assert_equal 1000, payment.parts[:facilitator]
    assert_equal 0, payment.parts[:staffer]
    assert_equal 0, payment.parts[:venue]
    assert_equal 1120, payment.total
  end

  test 'admin unqualified' do
    empty_workshop = create :pd_workshop,
      course: Pd::Workshop::COURSE_ADMIN,
      workshop_type: Pd::Workshop::TYPE_PUBLIC

    payment = Pd::WorkshopOrganizerPayment.new empty_workshop
    assert_equal 0, payment.teachers.count
    refute payment.qualified
  end

  test 'admin qualified' do
    @workshop.course = Pd::Workshop::COURSE_ADMIN
    @workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC
    payment = Pd::WorkshopOrganizerPayment.new @workshop

    assert payment.qualified
    assert_equal 60, payment.parts[:teacher]
    assert_equal 0, payment.parts[:facilitator]
    assert_equal 500, payment.parts[:staffer]
    assert_equal 800, payment.parts[:venue]
    assert_equal 1360, payment.total
  end

  test 'admin qualified plp urban' do
    @workshop.course = Pd::Workshop::COURSE_ADMIN
    @workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC
    create :professional_learning_partner, contact: @organizer, urban: true
    payment = Pd::WorkshopOrganizerPayment.new @workshop

    assert payment.qualified
    assert_equal 75, payment.parts[:teacher]
    assert_equal 0, payment.parts[:facilitator]
    assert_equal 625, payment.parts[:staffer]
    assert_equal 1000, payment.parts[:venue]
    assert_equal 1700, payment.total
  end
end
