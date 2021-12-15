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
    validates :instruction_type, acceptance: {accept: SharedCourseConstants::INSTRUCTION_TYPE.to_h.values, message: 'must be teacher_led or self_paced'}
    validates :instructor_audience, acceptance: {accept: SharedCourseConstants::INSTRUCTOR_AUDIENCE.to_h.values, message: 'must be universal instructor, plc reviewer, facilitator, or teacher'}
    validates :participant_audience, acceptance: {accept: SharedCourseConstants::PARTICIPANT_AUDIENCE.to_h.values, message: 'must be facilitator, teacher, or student'}

    validate :cannot_have_same_audiences
    validate :must_have_same_course_type_as_family
  end

  # All courses in the same family name must have the save instruction_type, instructor_audience, and participant audience
  def must_have_same_course_type_as_family
    if is_a?(Script) && unit_group
      family_name = unit_group.family_name
      puts "Script in unit group"
      puts "the family name is:" + family_name
      all_family_courses = UnitGroup.all.select {|c| c.family_name == family_name}
      #puts all_family_courses.inspect
      errors.add(:instructor_audience, 'Instructor Audience must be the same for all courses in a family.') if all_family_courses.map(&:instructor_audience).uniq.length > 1
      errors.add(:participant_audience, 'Participant Audience must be the same for all courses in a family.') if all_family_courses.map(&:participant_audience).uniq.length > 1
      errors.add(:instruction_type, 'Instruction Type must be the same for all courses in a family.') if all_family_courses.map(&:instruction_type).uniq.length > 1
    elsif is_a?(Script)
      puts "script alone"
      puts name
      puts "the family name is:" + family_name
      all_family_courses = Script.all.select {|c| c.family_name == family_name}
      #puts all_family_courses.inspect
      errors.add(:instructor_audience, 'Instructor Audience must be the same for all courses in a family.') if all_family_courses.map(&:instructor_audience).uniq.length > 1
      errors.add(:participant_audience, 'Participant Audience must be the same for all courses in a family.') if all_family_courses.map(&:participant_audience).uniq.length > 1
      errors.add(:instruction_type, 'Instruction Type must be the same for all courses in a family.') if all_family_courses.map(&:instruction_type).uniq.length > 1
    elsif is_a?(UnitGroup)
      puts "unit group alone"
      puts "the family name is:" + family_name
      all_family_courses = UnitGroup.all.select {|c| c.family_name == family_name}
      #puts all_family_courses.inspect
      errors.add(:instructor_audience, 'Instructor Audience must be the same for all courses in a family.') if all_family_courses.map(&:instructor_audience).uniq.length > 1
      errors.add(:participant_audience, 'Participant Audience must be the same for all courses in a family.') if all_family_courses.map(&:participant_audience).uniq.length > 1
      errors.add(:instruction_type, 'Instruction Type must be the same for all courses in a family.') if all_family_courses.map(&:instruction_type).uniq.length > 1
    end
  end

  # Instructor and Participant Audience can not be equal unless they are nil
  def cannot_have_same_audiences
    errors.add(:instructor_audience, 'You cannot have the same instructor and participant audiences.') if !instructor_audience.nil? && instructor_audience == participant_audience
  end

  # Checks if a user can be the instructor for the course. universal instructors and levelbuilders
  # can be the instructors of any course. Student accounts should never be able to be the instructor
  # of any course.
  def can_be_instructor?(user)
    # If unit is in a unit group then decide based on unit group audience
    return unit_group.can_be_instructor?(user) if is_a?(Script) && unit_group

    return false if user.student?
    return true if user.permission?(UserPermission::UNIVERSAL_INSTRUCTOR) || user.permission?(UserPermission::LEVELBUILDER)

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

  # A course is a professional learning course if the participant audience is something
  # other than students(it teaches adults)
  #
  # This is different than courses that use the professional learning course models
  # those can be checked for using old_professional_learning_course?
  def pl_course?
    # If unit is in a unit group then decide based on unit group
    return unit_group.pl_course? if is_a?(Script) && unit_group

    participant_audience != 'student'
  end
end
