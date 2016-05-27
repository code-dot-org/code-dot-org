require 'test_helper'

class Pd::DistrictReportTest < ActiveSupport::TestCase
  freeze_time

  setup do
    @teacher1 = create :teacher
    @teacher2 = create :teacher

    @district = create :district
    @district.users << @teacher1
    @district.users << @teacher2

    @workshop = create :pd_workshop, course: Pd::Workshop::COURSE_CSP, workshop_type: Pd::Workshop::TYPE_DISTRICT
    @session1 = create :pd_session, workshop: @workshop, start: Time.zone.now, end: Time.zone.now + 5.hours
    @session2 = create :pd_session, workshop: @workshop, start: Time.zone.now + 1.day, end: Time.zone.now + 1.day + 6.hours
    @session3 = create :pd_session, workshop: @workshop, start: Time.zone.now + 2.days, end: Time.zone.now + 2.days + 8.hours

    create :pd_attendance, session: @session1, teacher: @teacher1
    create :pd_attendance, session: @session1, teacher: @teacher2
    create :pd_attendance, session: @session2, teacher: @teacher2

    # Workshop must be in the end state to show up in reports.
    @workshop.reload
    @workshop.start!
    @workshop.end!
  end

  test 'generate daily terms' do
    create :pd_district_payment_term,
      district: @district,
      course: @workshop.course,
      rate_type: Pd::DistrictPaymentTerm::RATE_DAILY,
      rate: 10

    report = Pd::DistrictReport.generate_district_report [@district]
    assert_equal 2, report.length
    row1 = report[report.index{|row| row[:teacher_id].to_i == @teacher1.id}]
    assert_equal Pd::DistrictPaymentTerm::RATE_DAILY, row1[:payment_type]
    assert row1[:qualified]
    assert_equal 1, row1[:days]
    assert_equal 10, row1[:payment_amount]

    row2 = report[report.index{|row| row[:teacher_id].to_i == @teacher2.id}]
    assert_equal Pd::DistrictPaymentTerm::RATE_DAILY, row2[:payment_type]
    assert row2[:qualified]
    assert_equal 2, row2[:days]
    assert_equal 20, row2[:payment_amount]
  end

  test 'generate hourly terms' do
    create :pd_district_payment_term,
      district: @district,
      course: @workshop.course,
      rate_type: Pd::DistrictPaymentTerm::RATE_HOURLY,
      rate: 2

    report = Pd::DistrictReport.generate_district_report [@district]
    assert_equal 2, report.length
    row1 = report[report.index{|row| row[:teacher_id].to_i == @teacher1.id}]
    assert_equal Pd::DistrictPaymentTerm::RATE_HOURLY, row1[:payment_type]
    assert row1[:qualified]
    assert_equal 5, row1[:hours]
    assert_equal 10, row1[:payment_amount]

    row2 = report[report.index{|row| row[:teacher_id].to_i == @teacher2.id}]
    assert_equal Pd::DistrictPaymentTerm::RATE_HOURLY, row1[:payment_type]
    assert row2[:qualified]
    assert_equal 11, row2[:hours]
    assert_equal 22, row2[:payment_amount]
  end

  test 'not qualified' do
    @workshop.course = Pd::Workshop::COURSE_CSF
    @workshop.save!

    report = Pd::DistrictReport.generate_district_report [@district]
    row = report.last
    refute row[:qualified]
    assert_nil row[:payment_type]
    assert_equal 0, row[:payment_amount]
  end

  test 'generate rows' do
    report = Pd::DistrictReport.generate_district_report District.all
    assert_equal 2, report.count

    # Add 4 more districts and teachers for a total of 6
    4.times do
      district = create :district
      teacher = create :teacher
      district.users << teacher
      create :pd_attendance, session: @session1, teacher: teacher
    end
    report = Pd::DistrictReport.generate_district_report District.all
    assert_equal 6, report.count
  end

  test 'unexpected payment term rate' do
    mock_term = mock('Pd::DistrictPaymentTerm')
    mock_term.stubs(:rate_type).returns('nonsense')
    mock_term.stubs(:rate).returns(1)
    mock_term.stubs(:id).returns(1)
    Pd::DistrictPaymentTerm.stubs(:where).returns(mock(first: mock_term))

    e = assert_raises RuntimeError do
      Pd::DistrictReport.generate_district_report_row @district, @teacher1, @workshop
    end
    assert e.message.include? 'Unexpected district payment term rate type'
  end

  test 'only workshops that have ended' do
    report = Pd::DistrictReport.generate_district_report [@district]
    assert_equal 2, report.length

    new_workshop = create :pd_workshop
    new_workshop_session = create :pd_session, workshop: new_workshop
    create :pd_attendance, session: new_workshop_session, teacher: @teacher1
    new_workshop.reload

    report = Pd::DistrictReport.generate_district_report [@district]
    assert_equal 2, report.length

    new_workshop.start!
    report = Pd::DistrictReport.generate_district_report [@district]
    assert_equal 2, report.length

    new_workshop.end!
    report = Pd::DistrictReport.generate_district_report [@district]
    assert_equal 3, report.length
  end
end
