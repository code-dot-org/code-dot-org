require 'test_helper'

module Pd::Summary
  class WorkshopSummaryTest < ActiveSupport::TestCase
    setup do
      @ended_workshop = create :workshop, :ended, enrolled_and_attending_users: 2, enrolled_absent_users: 2, num_sessions: 2
      @workshop_summary = WorkshopSummary.new(workshop: @ended_workshop)
    end

    test 'attendance_url' do
      refute_nil @workshop_summary.attendance_url
      assert_includes(
        @workshop_summary.attendance_url,
        "/pd/workshop_dashboard/workshops/#{@ended_workshop.id}/attendance/#{@ended_workshop.sessions.first.id}"
      )
    end

    test 'workshop_url' do
      refute_nil @workshop_summary.workshop_url
      assert_includes(
        @workshop_summary.workshop_url,
        "/pd/workshop_dashboard/workshops/#{@ended_workshop.id}"
      )
    end

    test 'num_teachers' do
      refute_nil @workshop_summary.num_teachers
      assert_equal(
        2,
        @workshop_summary.num_teachers
      )
    end

    test 'leaves out organizer info when organizer has been deleted' do
      @ended_workshop.organizer.destroy
      @ended_workshop.reload

      report = @workshop_summary.generate_workshop_summary_line_item
      assert_nil report[:organizer_email]
      assert_nil report[:organizer_name]
      assert_nil report[:organizer_id]
    end

    test 'workshop summary reports attendance count for all sessions attendance for regular workshops' do
      report = @workshop_summary.generate_workshop_summary_line_item
      assert_equal 2, report[:num_teachers_attending_all_sessions]
      assert_equal 0, report[:num_scholarship_teachers_attending_all_sessions]
    end

    test 'workshop summary reports nil for attendance count for all sessions attendance for admin workshop' do
      @ended_admin_workshop = build :admin_workshop, :ended, enrolled_and_attending_users: 2, enrolled_absent_users: 2, num_sessions: 2
      @ended_admin_workshop.save(validate: false)
      @workshop_summary = WorkshopSummary.new(workshop: @ended_admin_workshop)
      report = @workshop_summary.generate_workshop_summary_line_item
      assert_nil report[:num_teachers_attending_all_sessions]
      assert_nil report[:num_scholarship_teachers_attending_all_sessions]
    end

    test 'workshop summary reports nil for attendance count for all sessions attendance for admin/counselor workshop' do
      @ended_admin_counselor_workshop = create :admin_counselor_workshop, :ended, enrolled_and_attending_users: 2, enrolled_absent_users: 2, num_sessions: 2
      @workshop_summary = WorkshopSummary.new(workshop: @ended_admin_counselor_workshop)
      report = @workshop_summary.generate_workshop_summary_line_item
      assert_nil report[:num_teachers_attending_all_sessions]
      assert_nil report[:num_scholarship_teachers_attending_all_sessions]
    end

    test 'generate_workshop_summary_line_item returns expected summary' do
      report = @workshop_summary.generate_workshop_summary_line_item

      assert_equal @ended_workshop.organizer&.name, report[:organizer_name]
      assert_equal @ended_workshop.organizer&.email, report[:organizer_email]
      assert_equal @ended_workshop.regional_partner.try(:name), report[:regional_partner_name]
      assert_equal @ended_workshop.sessions.sum(&:hours), report[:num_hours]
      assert_equal @workshop_summary.attendance_url, report[:attendance_url]
      assert_equal @ended_workshop.facilitators.count, report[:num_facilitators]
      assert_equal @ended_workshop.enrollments.count, report[:num_registered]
      assert_equal @workshop_summary.num_scholarship_teachers_attending_all_sessions, report[:num_scholarship_teachers_attending_all_sessions]
      assert_equal 2, report[:attendance_day_1]
      assert_equal 2, report[:attendance_day_2]
      assert_nil report[:attendance_day_3]
      assert_nil report[:attendance_day_4]
      assert_nil report[:attendance_day_5]
      assert_equal @ended_workshop.organizer&.id, report[:organizer_id]
      assert_equal "", report[:facilitators]
      assert_equal @ended_workshop.id, report[:workshop_id]
      assert_equal @ended_workshop.course, report[:course]
      assert_equal @ended_workshop.subject, report[:subject]
      assert_equal 2, report[:num_qualified_teachers]
      assert_equal 2, report[:days]

      (1..6).each do |i|
        assert_nil report[:"facilitator_name_#{i}"]
        assert_nil report[:"facilitator_email_#{i}"]
      end

      assert_kind_of String, report[:workshop_name]
      assert report[:workshop_name].present?

      assert_kind_of String, report[:workshop_dates]
      assert report[:workshop_dates].present?
    end
  end
end
