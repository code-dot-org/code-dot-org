require 'test_helper'

module Pd::Payment
  class WorkshopSummaryTest < ActiveSupport::TestCase
    setup do
      @ended_workshop = create :workshop, :ended
      @workshop_summary = WorkshopSummary.new(
        workshop: @ended_workshop,
        pay_period: 'a pay period',
        num_days: 1,
        num_hours: 6,
        min_attendance_days: 1,
        calculator_class: PaymentCalculatorBase,
        attendance_count_per_session: [0]
      )
    end

    test 'attendance_url' do
      assert_not_nil @workshop_summary.attendance_url
      assert @workshop_summary.attendance_url.include?(
        "/pd/workshop_dashboard/workshops/#{@ended_workshop.id}/attendance/#{@ended_workshop.sessions.first.id}"
      )
    end

    test 'leaves out organizer info when organizer has been deleted' do
      @ended_workshop.organizer.destroy
      @ended_workshop.reload

      report = @workshop_summary.generate_organizer_report_line_item
      assert_nil report[:organizer_email]
      assert_nil report[:organizer_name]
      assert_nil report[:organizer_id]
    end

    test 'workshop summary reports nil for attendance count for all sessions attendance for admin workshop' do
      @ended_admin_workshop = create :admin_workshop, :ended
      @workshop_summary = WorkshopSummary.new(
        workshop: @ended_admin_workshop,
        pay_period: 'a pay period',
        num_days: 1,
        num_hours: 6,
        min_attendance_days: 1,
        calculator_class: PaymentCalculatorBase,
        attendance_count_per_session: [1]
      )
      report = @workshop_summary.generate_organizer_report_line_item

      assert_nil report[:num_scholarship_teachers_attending_all_sessions]
    end
  end
end
