require 'policies/lti'
require 'policies/demo_sections'

module Policies::StudentBadges
  LIFETIME = 365.days
  EXPIRATION_WARNING = 30.days
  IDLE_TIMEOUT = 2.hours
  ABSOLUTE_TIMEOUT = 12.hours

  def self.authentication_enabled?
    DCDO.get('student_badge_authentication', false)
  end

  def self.issuance_enabled?(teacher)
    teacher&.teacher? && Gatekeeper.allows('student_badge_issuance', where: {user_id: teacher.id}, default: false)
  end

  def self.account_eligible?(user)
    return false unless user&.student?
    !user.admin? && !user.deleted? && user.active_for_authentication? && user.permissions.none? &&
      !Policies::DemoSections.demo_student?(user.id) && !Policies::Lti.restricted_user?(user)
  end

  def self.manageable?(teacher, student, section)
    teacher&.teacher? && account_eligible?(student) && student.teacher_managed_account? &&
      section && !section.demo_section? &&
      [Section::LOGIN_TYPE_WORD, Section::LOGIN_TYPE_PICTURE].include?(section.login_type) &&
      section.instructors.exists?(id: teacher.id) && section.students.exists?(id: student.id)
  end
end
