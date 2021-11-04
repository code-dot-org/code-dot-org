# Model concern for common curriculum audience methods
# To use, include in a model and call the desired method.
module CourseAudiences
  extend ActiveSupport::Concern

  included do
    scope :script, ->(instructor_audience, participant_audience, unit_group) {where(instructor_audience: instructor_audience, participant_audience: participant_audience, unit_group: unit_group)}
    scope :unit_group, ->(instructor_audience, participant_audience) {where(instructor_audience: instructor_audience, participant_audience: participant_audience)}
  end

  class_methods do
    def can_be_instructor?(user)
      # If unit is in a unit group then decide based on unit group audience
      return unit_group.can_be_instructor?(user) if is_a?(Script) && unit_group

      return false if user.student?
      return true if user.permission?(UserPermission::CODE_INSTRUCTOR) || user.permission?(UserPermission::LEVELBUILDER)

      if instructor_audience == 'plc_reviewer'
        return user.permission?(UserPermission::PLC_REVIEWER)
      elsif instructor_audience == 'facilitator'
        return user.permission?(UserPermission::FACILITATOR)
      elsif instructor_audience == 'teacher'
        return user.teacher?
      end

      false
    end

    def can_be_participant?(user)
      # If unit is in a unit group then decide based on unit group audience
      return unit_group.can_be_participant?(user) if is_a?(Script) && unit_group

      if participant_audience == 'facilitator'
        return user.permission?(UserPermission::FACILITATOR)
      elsif participant_audience == 'teacher'
        return user.teacher?
      elsif participant_audience == 'student'
        return true #if participant audience is student let anyone join
      end

      false
    end
  end
end
