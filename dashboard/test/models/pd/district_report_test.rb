require 'test_helper'

module Pd
  class DistrictReportTest < ActiveSupport::TestCase

    setup do
      day1start = Time.new(2016,1,1,9)

      @teacher1 = create :teacher
      @teacher2 = create :teacher

      @district = create :district
      @district.users << @teacher1
      @district.users << @teacher2

      @session1 = create :pd_session, start: day1start, end: day1start + 5.hours
      @session2 = create :pd_session, start: day1start + 1.day, end: day1start + 1.day + 6.hours
      @session3 = create :pd_session, start: day1start + 2.days, end: day1start + 2.days + 8.hours

      # qualified for payment
      @workshop = create :pd_workshop, course: Pd::Workshop::COURSE_CSP, workshop_type: Pd::Workshop::TYPE_DISTRICT
      @workshop.sessions << @session1
      @workshop.sessions << @session2
      @workshop.sessions << @session3

      create :pd_attendance, session: @session1, teacher: @teacher1
      create :pd_attendance, session: @session1, teacher: @teacher2
      create :pd_attendance, session: @session2, teacher: @teacher2
    end

    test 'generate daily terms' do
      create :pd_district_payment_term,
             district: @district,
             course: @workshop.course,
             rate_type: DistrictPaymentTerm::RATE_DAILY,
             rate: 10

      report = DistrictReport.generate_district_report @district
      assert_equal 2, report.length
      row1 = report[report.index{|row| row[:teacher_id].to_i == @teacher1.id}]
      assert_equal DistrictPaymentTerm::RATE_DAILY, row1[:payment_type]
      assert row1[:qualified]
      assert_equal 1, row1[:days]
      assert_equal 10, row1[:payment_amount]

      row2 = report[report.index{|row| row[:teacher_id].to_i == @teacher2.id}]
      assert_equal DistrictPaymentTerm::RATE_DAILY, row2[:payment_type]
      assert row2[:qualified]
      assert_equal 2, row2[:days]
      assert_equal 20, row2[:payment_amount]
    end

    test 'generate hourly terms' do
      create :pd_district_payment_term,
             district: @district,
             course: @workshop.course,
             rate_type: DistrictPaymentTerm::RATE_HOURLY,
             rate: 2

      report = DistrictReport.generate_district_report @district
      assert_equal 2, report.length
      row1 = report[report.index{|row| row[:teacher_id].to_i == @teacher1.id}]
      assert_equal DistrictPaymentTerm::RATE_HOURLY, row1[:payment_type]
      assert row1[:qualified]
      assert_equal 5, row1[:hours]
      assert_equal 10, row1[:payment_amount]

      row2 = report[report.index{|row| row[:teacher_id].to_i == @teacher2.id}]
      assert_equal DistrictPaymentTerm::RATE_HOURLY, row1[:payment_type]
      assert row2[:qualified]
      assert_equal 11, row2[:hours]
      assert_equal 22, row2[:payment_amount]
    end

    test 'not qualified' do
      @workshop.course = Pd::Workshop::COURSE_CSF
      @workshop.save!

      report = DistrictReport.generate_district_report @district
      row = report.first
      refute row[:qualified]
      assert_nil row[:payment_type]
      assert_equal 0, row[:payment_amount]
    end

    test 'generate rows' do
      4.times do
        district = create :district
        teacher = create :teacher
        district.users << teacher
        create :pd_attendance, session: @session1, teacher: teacher
      end
      report = DistrictReport.generate_district_report *District.all
      assert_equal 6, report.count
    end

  end
end
