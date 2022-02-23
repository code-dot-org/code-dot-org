# Concern to determine if a course version is assignable for a user.
#
# To use, include in a model and call the desired method.
module Curriculum::AssignableCourse
  extend ActiveSupport::Concern

  def course_assignable?(user)
    return false unless can_be_instructor?(user)
    return true if launched?
    return true if Script.has_any_pilot_access?(user) && has_pilot_access?(user)
    return true if user.permission?(UserPermission::LEVELBUILDER) && in_development?

    false
  end
end
