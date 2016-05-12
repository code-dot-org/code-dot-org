require 'test_helper'

class Pd::TeacherProgressReportTest < ActiveSupport::TestCase
  freeze_time

  setup do
    now = Time.zone.now

    @workshop1 = create :pd_workshop
    @session1 = create :pd_session, workshop: @workshop1, start: now, end: now + 1.hours
    start_and_end_workshop @workshop1

    @workshop2 = create :pd_workshop
    @session2_1 = create :pd_session, workshop: @workshop2, start: now, end: now + 2.hours
    @session2_2 = create :pd_session, workshop: @workshop2, start: now + 1.day, end: now + 1.day + 3.hours
    start_and_end_workshop @workshop2

    @workshop3 = create :pd_workshop
    @session3 = create :pd_session, workshop: @workshop3, start: now, end: now + 4.hours
    start_and_end_workshop @workshop3

    # Teacher 1, with a district, in 1 workshop
    @teacher1 = create :teacher
    @district = create :district
    @district.users << @teacher1
    create :pd_attendance, session: @session1, teacher: @teacher1

    # Teacher 2, no district, in 2 workshops
    @teacher2 = create :teacher
    create :pd_attendance, session: @session2_1, teacher: @teacher2
    create :pd_attendance, session: @session2_2, teacher: @teacher2
    create :pd_attendance, session: @session3, teacher: @teacher2

    # Teacher 3, no district, no workshops
    @teacher3 = create :teacher

    @teachers = [@teacher1, @teacher2]
  end

  test 'generate_report' do
    Pd::TeacherProgressReport.expects(:generate_report_row).with(@teacher1, @district, @workshop1)
    Pd::TeacherProgressReport.expects(:generate_report_row).with(@teacher2, nil, @workshop2)
    Pd::TeacherProgressReport.expects(:generate_report_row).with(@teacher2, nil, @workshop3)

    Pd::TeacherProgressReport.generate_report @teachers
  end

  test 'basic info' do
    row = Pd::TeacherProgressReport.generate_report_row @teacher1, @district, @workshop1
    assert_equal @district.name, row[:district_name]
    assert_equal @workshop1.course, row[:course]
    assert_equal @workshop1.subject, row[:subject]
    assert_equal @workshop1.friendly_name, row[:workshop_name]
    assert_equal @workshop1.workshop_type, row[:workshop_type]
    assert_equal @teacher1.name, row[:teacher_name]
    assert_equal @teacher1.id, row[:teacher_id]
    assert_equal @teacher1.email, row[:teacher_email]
    assert_equal 1, row[:hours]
    assert_equal 1, row[:days]
  end

  test 'multiple sessions' do
    row = Pd::TeacherProgressReport.generate_report_row @teacher2, nil, @workshop2
    assert_equal 5, row[:hours]
    assert_equal 2, row[:days]
  end

  test 'report for admin' do
    Pd::TeacherProgressReport.expects(:generate_report).with(@teachers)
    Pd::TeacherProgressReport.generate_report_for_user create(:admin)
  end

  test 'report for district contact' do
    Pd::TeacherProgressReport.expects(:generate_report).with([@teacher1])
    Pd::TeacherProgressReport.generate_report_for_user @district.contact
  end

  test 'report for workshop organizer' do
    organizer = @workshop1.organizer
    Pd::TeacherProgressReport.expects(:generate_report).with([@teacher1])
    Pd::TeacherProgressReport.generate_report_for_user organizer

    # Also organize workshop2
    @workshop2.organizer = organizer
    @workshop2.save!
    Pd::TeacherProgressReport.expects(:generate_report).with(@teachers)
    Pd::TeacherProgressReport.generate_report_for_user organizer
  end

  test 'teachers cannot generate reports' do
    e = assert_raises RuntimeError do
      Pd::TeacherProgressReport.generate_report_for_user @teacher1
    end
    assert_equal 'Unauthorized', e.message
  end

  test 'only workshops that have ended' do
    organizer = @workshop1.organizer
    report = Pd::TeacherProgressReport.generate_report_for_user organizer
    assert_equal 1, report.length

    new_workshop = create :pd_workshop
    new_workshop_session = create :pd_session, workshop: new_workshop
    create :pd_attendance, session: new_workshop_session, teacher: @teacher1
    new_workshop.reload
    report = Pd::TeacherProgressReport.generate_report_for_user organizer
    assert_equal 1, report.length

    new_workshop.start!
    report = Pd::TeacherProgressReport.generate_report_for_user organizer
    assert_equal 1, report.length

    new_workshop.end!
    report = Pd::TeacherProgressReport.generate_report_for_user organizer
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
