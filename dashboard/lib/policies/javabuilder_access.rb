# frozen_string_literal: true

class Policies::JavabuilderAccess
  def self.allowed?(user)
    verified_teacher_ids(user).any?
  end

  def self.verified_teacher_ids(user)
    return [user.id] if user.verified_instructor?

    (user.sections_as_student + user.sections_instructed).filter_map do |section|
      next unless section.assigned_csa? && section.teacher&.verified_instructor?

      section.teacher.id
    end.uniq
  end
end
