# Model concern for common curriculum audience methods
# To use, include in a model and call the desired method.
module Curriculum::CourseAudiences
  extend ActiveSupport::Concern

  # Checks if a user can be the instructor for the course. Code instructors and levelbuilders
  # can be the instructors of any course. Student accounts should never be able to be the instructor
  # of any course.
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

  # Checks if a user can be the participant in a course. If a course has a
  # participant_audience of students anyone should be able to be a participant in the course
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
