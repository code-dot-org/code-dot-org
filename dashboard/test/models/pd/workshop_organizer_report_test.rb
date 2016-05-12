require 'test_helper'

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
