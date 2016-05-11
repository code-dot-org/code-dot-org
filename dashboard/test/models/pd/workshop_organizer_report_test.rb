require 'test_helper'
require 'cdo/activity_constants'

class Pd::WorkshopOrganizerReportTest < ActiveSupport::TestCase
  freeze_time

  setup do
    @organizer = create :workshop_organizer
    @teacher1 = create :teacher
    @teacher2 = create :teacher

    @workshop = create :pd_workshop, organizer: @organizer
    @session1 = create :pd_session, workshop: @workshop, start: Time.zone.now, end: Time.zone.now + 5.hours
    @session2 = create :pd_session, workshop: @workshop, start: Time.zone.now + 1.day, end: Time.zone.now + 1.day + 6.hours
    start_and_end_workshop @workshop

    @facilitator = create :facilitator
    @workshop.facilitators << @facilitator

    create :pd_attendance, session: @session1, teacher: @teacher1
    create :pd_attendance, session: @session1, teacher: @teacher2
    create :pd_attendance, session: @session2, teacher: @teacher2

    @other_workshop = create :pd_workshop
    create :pd_session, workshop: @other_workshop
    start_and_end_workshop @other_workshop

    @admin = create :admin
  end

  test 'admins see all workshops' do
    Pd::WorkshopOrganizerReport.expects(:generate_organizer_report_row).with(@workshop)
    Pd::WorkshopOrganizerReport.expects(:generate_organizer_report_row).with(@other_workshop)
    Pd::WorkshopOrganizerReport.generate_organizer_report @admin
  end

  test 'workshop organizers see their workshops' do
    Pd::WorkshopOrganizerReport.expects(:generate_organizer_report_row).with(@workshop)
    Pd::WorkshopOrganizerReport.generate_organizer_report @organizer
  end

  test 'public csf workshop' do
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

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @workshop
    assert row[:qualified]
    assert_equal 'CSF Facilitator', row[:payment_type]

    # 50 * 1 qualified teacher
    assert_equal 50, row[:payment_amount]
  end

  test 'public csp workshop plp non-urban fewer than 10 teachers' do
    create :professional_learning_partner, contact: @organizer
    @workshop.course = Pd::Workshop::COURSE_CSP
    @workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @workshop
    assert row[:qualified]
    assert_equal 'PLP Non-urban', row[:payment_type]
    assert_equal 2460, row[:payment_amount]
  end

  test 'public csp workshop more than 10 teachers' do
    @workshop.course = Pd::Workshop::COURSE_CSP
    @workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC

    9.times do
      create :pd_attendance, session: @session1
    end

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @workshop
    assert row[:qualified]
    assert_equal 3280, row[:payment_amount]
  end

  test 'private ecs workshop plp urban' do
    create :professional_learning_partner, contact: @organizer, urban: true
    @workshop.course = Pd::Workshop::COURSE_ECS
    @workshop.workshop_type = Pd::Workshop::TYPE_PRIVATE

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @workshop
    assert row[:qualified]
    assert_equal 'PLP Urban', row[:payment_type]
    assert_equal 2825, row[:payment_amount]
  end

  test 'public csp no teachers' do
    @other_workshop.course = Pd::Workshop::COURSE_CSP
    @other_workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @other_workshop
    refute row[:qualified]
    assert_equal 0, row[:payment_amount]
  end

  test 'district cs_in_a plp non-urban workshop' do
    create :professional_learning_partner, contact: @organizer
    @workshop.course = Pd::Workshop::COURSE_CS_IN_A
    @workshop.workshop_type = Pd::Workshop::TYPE_DISTRICT

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @workshop
    assert row[:qualified]
    assert_equal 'PLP Non-urban', row[:payment_type]
    assert_equal 1160, row[:payment_amount]
  end

  test 'district cs_in_a plp urban workshop' do
    create :professional_learning_partner, contact: @organizer, urban: true
    @workshop.course = Pd::Workshop::COURSE_CS_IN_A
    @workshop.workshop_type = Pd::Workshop::TYPE_DISTRICT

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @workshop
    assert row[:qualified]
    assert_equal 'PLP Urban', row[:payment_type]
    assert_equal 1200, row[:payment_amount]
  end

  test 'district cs_in_a no teachers' do
    @other_workshop.course = Pd::Workshop::COURSE_CS_IN_A
    @other_workshop.workshop_type = Pd::Workshop::TYPE_DISTRICT

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @other_workshop
    refute row[:qualified]
    assert_equal 0, row[:payment_amount]
  end

  test 'counselor-admin public plp non-admin workshop' do
    create :professional_learning_partner, contact: @organizer
    @workshop.course = Pd::Workshop::COURSE_COUNSELOR_ADMIN
    @workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @workshop
    assert row[:qualified]
    assert_equal 'PLP Non-urban', row[:payment_type]
    assert_equal 690, row[:payment_amount]
  end

  test 'counselor-admin public plp admin workshop' do
    create :professional_learning_partner, contact: @organizer, urban: true
    @workshop.course = Pd::Workshop::COURSE_COUNSELOR_ADMIN
    @workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @workshop
    assert row[:qualified]
    assert_equal 'PLP Urban', row[:payment_type]
    assert_equal 862.5, row[:payment_amount]
  end

  test 'counselor-admin public no teachers admin workshop' do
    @other_workshop.course = Pd::Workshop::COURSE_COUNSELOR_ADMIN
    @other_workshop.workshop_type = Pd::Workshop::TYPE_PUBLIC

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @other_workshop
    refute row[:qualified]
    assert_equal 0, row[:payment_amount]
  end

  test 'district CSP unqualified' do
    @workshop.course = Pd::Workshop::COURSE_CSP
    @workshop.workshop_type = Pd::Workshop::TYPE_DISTRICT

    row = ::Pd::WorkshopOrganizerReport.generate_organizer_report_row @workshop
    refute row[:qualified]
    assert_equal 0, row[:payment_amount]
  end

  test 'only workshops that have ended' do
    report = Pd::WorkshopOrganizerReport.generate_organizer_report @organizer
    assert_equal 1, report.length

    new_workshop = create :pd_workshop, organizer: @organizer
    new_workshop_session = create :pd_session, workshop: new_workshop
    create :pd_attendance, session: new_workshop_session, teacher: @teacher1
    new_workshop.reload
    report = Pd::WorkshopOrganizerReport.generate_organizer_report @organizer
    assert_equal 1, report.length

    new_workshop.start!
    report = Pd::WorkshopOrganizerReport.generate_organizer_report @organizer
    assert_equal 1, report.length

    new_workshop.end!
    report = Pd::WorkshopOrganizerReport.generate_organizer_report @organizer
    assert_equal 2, report.length
  end

  private

  def start_and_end_workshop(workshop)
    # Workshops must be in the end state to show up in the report.
    workshop.reload
    workshop.start!
    workshop.end!
  end
end
