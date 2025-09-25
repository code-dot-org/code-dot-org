module Pd::Summary
  class TeacherSummary
    TeacherAttendanceTotal = Struct.new(:days, :hours) do
      def initialize(days = 0, hours = 0)
        super(days, hours)
      end

      def add_session(hours)
        self.days += 1
        self.hours += hours
      end
    end

    def initialize(enrollment:)
      @teacher = enrollment&.user
      @enrollment = enrollment
    end

    attr_reader(:enrollment, :teacher)

    delegate :workshop, to: :enrollment

    def school_district
      enrollment.try(&:school_info).try(&:school_district)
    end

    def state
      enrollment.try(&:school_info).try(&:state)
    end

    def school
      enrollment.try(&:school_name)
    end

    def calculate_teacher_attendance
      teacher_attendance = TeacherAttendanceTotal.new
      session_ids = workshop.sessions.pluck(:id)
      conditions = {pd_session_id: session_ids}
      if teacher&.id
        conditions[:teacher_id] = teacher.id
      elsif enrollment.id
        conditions[:pd_enrollment_id] = enrollment.id
      else
        return teacher_attendance
      end
      attendances = Pd::Attendance.where(conditions)

      attendances.each do |attendance|
        session = workshop.sessions.find {|s| s.id == attendance.pd_session_id}
        teacher_attendance.add_session(session.hours) if session
      end

      teacher_attendance
    end

    def generate_teacher_summary_line_item
      attendance = calculate_teacher_attendance
      line_item = {
        teacher_first_name: enrollment.first_name,
        teacher_last_name: enrollment.last_name,
        teacher_id: teacher.try(&:id),
        teacher_email: enrollment.email,
        plp_name: workshop.regional_partner.try(&:name),
        state: state,
        district_name: school_district.try(&:name),
        district_id: school_district.try(&:id),
        school: school,
        course: workshop.course,
        subject: workshop.subject,
        workshop_id: workshop.id,
        workshop_dates: workshop.sessions.map(&:formatted_date).join(' '),
        workshop_name: workshop.friendly_name,
        organizer_name: workshop.organizer.try(&:name),
        organizer_email: workshop.organizer.try(&:email),
        year: workshop.year,
        hours: attendance.hours,
        days: attendance.days,
      }
      line_item
    end
  end
end
