# Model concern for common course type methods.
#
# Course Types are determined by the audience of the course, the instruction type of
# the course or both. For example pl courses are any course that is taught to
# adults (participant_audience is not students). A self paced pl course (participant_audience is not students)
# is pl course that has the instruction_type of self-paced.
#
# To use, include in a model and call the desired method.
module Curriculum::CourseTypes
  extend ActiveSupport::Concern

  included do
    validates :instruction_type, acceptance: {accept: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.to_h.values, message: 'must be teacher_led or self_paced'}
    validates :instructor_audience, acceptance: {accept: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.to_h.values, message: 'must be universal instructor, plc reviewer, facilitator, or teacher'}
    validates :participant_audience, acceptance: {accept: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.to_h.values, message: 'must be facilitator, teacher, or student'}

    validate :cannot_have_same_audiences
    # (Dani) Turning off this validation while I move over K5 self paced pl to the right audience
    # validate :must_have_same_course_type_as_family
  end

  # All courses in the same family name must have the save instruction_type, instructor_audience, and participant audience
  def must_have_same_course_type_as_family
    all_family_courses = get_family_courses
    return if all_family_courses.nil_or_empty?

    return unless all_family_courses.length > 1
    errors.add(:instructor_audience, 'must be the same for all courses in a family.') if all_family_courses.map(&:instructor_audience).any? {|audience| audience != instructor_audience}
    errors.add(:participant_audience, 'must be the same for all courses in a family.') if all_family_courses.map(&:participant_audience).any? {|audience| audience != participant_audience}
    errors.add(:instruction_type, 'must be the same for all courses in a family.') if all_family_courses.map(&:instruction_type).any? {|type| type != instruction_type}
  end

  # If course we are check is a unit_group.
  # If the course is a unit that is not in a unit_group check the unit for the family_name
  # If unit that is in a unit_group then family name should be nil and we should not need to check anything
  def get_family_courses
    return nil if family_name.nil_or_empty?

    all_family_courses = nil

    if is_a?(UnitGroup)
      all_family_courses = UnitGroup.all.select {|c| c.family_name == family_name}
    elsif is_a?(Unit) && !original_unit_group
      all_family_courses = Unit.get_family_from_cache(family_name)
    end

    all_family_courses
  end

  # Instructor and Participant Audience can not be equal unless they are nil
  def cannot_have_same_audiences
    errors.add(:instructor_audience, 'should be different from participant audiences.') if !instructor_audience.nil? && instructor_audience == participant_audience
  end

  # Checks if a user can be the instructor for the course. universal instructors and levelbuilders
  # can be the instructors of any course. Student accounts should never be able to be the instructor
  # of any course.
  def can_be_instructor?(user)
    return false unless user

    # If unit is in a unit group then decide based on unit group audience
    return original_unit_group.can_be_instructor?(user) if is_a?(Unit) && original_unit_group

    return false if user.student?
    return true if user.permission?(UserPermission::UNIVERSAL_INSTRUCTOR) || user.permission?(UserPermission::LEVELBUILDER)

    case instructor_audience
    when 'plc_reviewer'
      return user.permission?(UserPermission::PLC_REVIEWER)
    when 'facilitator'
      return user.permission?(UserPermission::FACILITATOR)
    when 'teacher'
      return user.teacher?
    end

    false
  end

  # Checks if a user is acting as a participant in a course. If they are able to be an
  # instructor in the course then this will return false because we do not want
  # to treat them like a participant. Signed out users should be able to be participants
  # in student courses.
  def can_be_participant?(user)
    # If unit is in a unit group then decide based on unit group audience
    return original_unit_group.can_be_participant?(user) if is_a?(Unit) && original_unit_group

    # Signed out users can only use student facing courses
    return false if !user && participant_audience != 'student'
    return false if can_be_instructor?(user)

    case participant_audience
    when 'facilitator'
      return user.permission?(UserPermission::FACILITATOR)
    when 'teacher'
      return user.teacher?
    when 'student'
      return true #if participant audience is student let anyone join
    end

    false
  end

  # A course is a professional learning course if the participant audience is something
  # other than students(it teaches adults)
  #
  # This is different than courses that use the professional learning course models
  # those can be checked for using old_professional_learning_course?
  def pl_course?
    # If unit is in a unit group then decide based on unit group
    return original_unit_group.pl_course? if is_a?(Unit) && original_unit_group

    participant_audience != 'student'
  end
end
