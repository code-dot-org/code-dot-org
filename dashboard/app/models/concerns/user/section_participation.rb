module User::SectionParticipation
  extend ActiveSupport::Concern

  def all_sections
    sections_as_teacher = student? ? [] : sections_instructed.to_a
    sections_as_teacher.concat(sections_as_student).uniq
  end

  # Figures out the unique set of courses assigned to sections that this user
  # is a part of.
  # @return [Array<Course>]
  def section_courses
    # In the future we may want to make it so that if assigned a script, but that
    # script has a default course, it shows up as a course here
    all_sections.filter_map(&:unit_group).uniq
  end

  def sections_as_student_participant
    sections_as_student.select {|s| !s.pl_section?}
  end

  def sections_as_pl_participant
    sections_as_student.select(&:pl_section?)
  end

  # return the id of the most-recently-created section the user instructs.
  def last_section_id
    teacher? ? sections_instructed.where(hidden: false).last&.id : nil
  end

  # The section which the user most recently joined as a student, or nil if none exists.
  # @return [Section|nil]
  def last_joined_section
    Follower.where(student_user: self).order(created_at: :desc).first.try(:section)
  end
end
