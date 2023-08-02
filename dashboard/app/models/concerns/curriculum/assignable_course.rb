# Concern to determine if a course version is assignable for a user.
#
# To use, include in a model and call the desired method.
module Curriculum::AssignableCourse
  extend ActiveSupport::Concern

  def course_assignable?(user)
    return false unless get_course_version&.course_offering&.assignable?
    return false unless can_be_instructor?(user)
    return true if launched?
    return true if pilot? && has_pilot_experiment?(user)
    return true if is_a?(Unit) && has_editor_experiment?(user)
    return true if user.permission?(UserPermission::LEVELBUILDER)

    false
  end
end
