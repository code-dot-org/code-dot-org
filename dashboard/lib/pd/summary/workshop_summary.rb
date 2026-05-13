module Pd::Summary
  class WorkshopSummary
    # Number of columns for facilitator details, name and email
    # e.g. facilitator_name_1 and facilitator_email_1
    REPORT_FACILITATOR_DETAILS_COUNT = 6

    # Number of session attendance columns.
    # e.g. attendance_day_1
    REPORT_ATTENDANCE_DAY_COUNT = 5

    def initialize(workshop:)
      @workshop = workshop
      @num_days = workshop.sessions.count
      @attendance_count_per_session = workshop.sessions.map {|s| s.attendances.count}
    end

    attr_reader :workshop, :num_days

    # @return [Array<Integer>] Number of teachers marked attended for each session.
    attr_reader :attendance_count_per_session

    # @return [Array<TeacherSummary>] teacher summaries for this workshop.
    attr_accessor :teacher_summaries

    def attendance_url
      return nil if workshop.sessions.empty?
      "#{workshop_url}/attendance/#{workshop.sessions.first.id}"
    end

    def workshop_url
      CDO.studio_url("pd/workshop_dashboard/workshops/#{workshop.id}", CDO.default_scheme)
    end

    def num_teachers
      session_ids = workshop.sessions.pluck(:id)
      Pd::Attendance.where(pd_session_id: session_ids).
        pluck(:teacher_id).
        uniq.
        count
    end

    def plp
      workshop.regional_partner
    end

    # Get number of teachers attending all sessions, except for admin and counselor PD where logging in
    # to attend is not required.
    def num_teachers_attending_all_sessions(filter_by_cdo_scholarship: false)
      workshop.account_required_for_attendance? ? workshop.teachers_attending_all_sessions(filter_by_cdo_scholarship: filter_by_cdo_scholarship).count : nil
    end

    def num_scholarship_teachers_attending_all_sessions
      num_teachers_attending_all_sessions(filter_by_cdo_scholarship: true)
    end

    def generate_workshop_summary_line_item
      line_item = {
        organizer_name: workshop.organizer&.name,
        organizer_email: workshop.organizer&.email,
        regional_partner_name: workshop.regional_partner.try(:name),
        workshop_dates: workshop.sessions.map(&:formatted_date).join(' '),
        num_hours: workshop.sessions.sum(&:hours),
        attendance_url: attendance_url,
        num_facilitators: workshop.facilitators.count,
        num_registered: workshop.enrollments.count,
        num_scholarship_teachers_attending_all_sessions: num_scholarship_teachers_attending_all_sessions,
        num_teachers_attending_all_sessions: num_teachers_attending_all_sessions,
        organizer_id: workshop.organizer&.id,
        facilitators: workshop.facilitators.pluck(:name).join(', '),
        workshop_id: workshop.id,
        workshop_name: workshop.friendly_name,
        course: workshop.course,
        subject: workshop.subject,
        num_qualified_teachers: num_teachers,
        days: num_days,
      }

      # Attendance days 1-5
      session_attendance_counts = attendance_count_per_session
      (1..REPORT_ATTENDANCE_DAY_COUNT).each do |n|
        line_item[:"attendance_day_#{n}"] = session_attendance_counts[n - 1]
      end

      # Facilitator names and emails, 1-6
      (1..REPORT_FACILITATOR_DETAILS_COUNT).each do |n|
        line_item[:"facilitator_name_#{n}"] = workshop.facilitators[n - 1].try(&:name)
        line_item[:"facilitator_email_#{n}"] = workshop.facilitators[n - 1].try(&:email)
      end

      line_item
    end
  end
end
