class Pd::TeacherProgressReport
  def self.generate_report_for_user(user)
    teachers =
      if user.admin?
        # All teachers in all workshops
        Pd::Attendance.distinct_teachers
      elsif user.district_contact?
        # All teachers attending workshops, from districts for which I am a contact
        Pd::Attendance.for_district(user.district_as_contact).distinct_teachers
      elsif user.workshop_organizer?
        # All teachers in workshops I organized
        Pd::Workshop.in_state(Pd::Workshop::STATE_ENDED).organized_by(user).map do |workshop|
          Pd::Attendance.for_workshop(workshop).distinct_teachers
        end.flatten
      else
        raise 'Unauthorized'
      end

    generate_report teachers
  end

  # Construct a report row for each teacher
  def self.generate_report(teachers)
    [].tap do |rows|
      teachers.map do |teacher|
        district = District.joins(:users).where(users: {id: teacher.id}).first
        Pd::Workshop.in_state(Pd::Workshop::STATE_ENDED).attended_by(teacher).each do |workshop|
          rows << generate_report_row(teacher, district, workshop)
        end
      end
    end
  end

  def self.generate_report_row(teacher, district, workshop)
    attendances = Pd::Attendance.for_teacher(teacher).for_workshop(workshop)
    hours = attendances.map(&:session).map(&:hours).reduce(&:+)
    days = attendances.count

    {
      district_name: district.try(:name),
      school: teacher.school,
      course: workshop.course,
      subject: workshop.subject,
      workshop_dates: workshop.sessions.map(&:formatted_date).join(' '),
      workshop_name: workshop.friendly_name,
      workshop_type: workshop.workshop_type,
      teacher_name: teacher.name,
      teacher_id: teacher.id,
      teacher_email: teacher.email,
      year: workshop.sessions.first.start.year,
      hours: hours,
      days: days
    }
  end
end
