#!/usr/bin/env ruby

# Script to migrate all the workshops and relevant associated data from the old
# `workshops` table to the new `pd_workshops` table.
#
# Relies on the field `workshops.pd_workshop_id` to be correctly populated by
# this script as it executes to prevent accidental re-migration of
# already-migrated data.
#
# TODO: elijah: remove this script and the associated tables once all data has
# been migrated and verified.

require_relative '../../dashboard/config/environment'

PROGRAM_TYPES_TO_COURSES = {
  "1" => Pd::SharedWorkshopConstants::COURSE_CS_IN_S,
  "2" => Pd::SharedWorkshopConstants::COURSE_CS_IN_A,
  "3" => Pd::SharedWorkshopConstants::COURSE_ECS,
  "4" => Pd::SharedWorkshopConstants::COURSE_CSP,
  "5" => Pd::SharedWorkshopConstants::COURSE_CSF,
  "6" => Pd::SharedWorkshopConstants::COURSE_ADMIN,
}

PHASE_TO_SUBJECT = {
  Pd::SharedWorkshopConstants::COURSE_ECS => {
    nil => Pd::SharedWorkshopConstants::SUBJECT_ECS_PHASE_2,
    "4" => Pd::SharedWorkshopConstants::SUBJECT_ECS_UNIT_3,
    "5" => Pd::SharedWorkshopConstants::SUBJECT_ECS_UNIT_4,
    "6" => Pd::SharedWorkshopConstants::SUBJECT_ECS_UNIT_5,
    "7" => Pd::SharedWorkshopConstants::SUBJECT_ECS_UNIT_6,
    "8" => Pd::SharedWorkshopConstants::SUBJECT_ECS_PHASE_4,
  },
  Pd::SharedWorkshopConstants::COURSE_CS_IN_A => {
    nil => Pd::SharedWorkshopConstants::SUBJECT_CS_IN_A_PHASE_2,
    "3" => Pd::SharedWorkshopConstants::SUBJECT_CS_IN_A_PHASE_2,
    "4" => Pd::SharedWorkshopConstants::SUBJECT_CS_IN_A_PHASE_3,
    "5" => Pd::SharedWorkshopConstants::SUBJECT_CS_IN_A_PHASE_3,
  },
  Pd::SharedWorkshopConstants::COURSE_CS_IN_S => {
    nil => Pd::SharedWorkshopConstants::SUBJECT_CS_IN_S_PHASE_2,
    "4" => Pd::SharedWorkshopConstants::SUBJECT_CS_IN_S_PHASE_3_SEMESTER_1,
    "5" => Pd::SharedWorkshopConstants::SUBJECT_CS_IN_S_PHASE_3_SEMESTER_2,
  },
  Pd::SharedWorkshopConstants::COURSE_CSP => {
    nil => Pd::SharedWorkshopConstants::SUBJECT_SUMMER_WORKSHOP,
    "1" => Pd::SharedWorkshopConstants::SUBJECT_FIT,
    "2" => Pd::SharedWorkshopConstants::SUBJECT_TEACHER_CON,
    "4" => Pd::SharedWorkshopConstants::SUBJECT_CSP_WORKSHOP_1,
    "5" => Pd::SharedWorkshopConstants::SUBJECT_CSP_WORKSHOP_2,
    "6" => Pd::SharedWorkshopConstants::SUBJECT_CSP_WORKSHOP_3,
    "7" => Pd::SharedWorkshopConstants::SUBJECT_CSP_WORKSHOP_4,
  },
  Pd::SharedWorkshopConstants::COURSE_CSF => {
    nil => Pd::SharedWorkshopConstants::SUBJECT_CSF_101
  }
}.freeze

def get_or_create_enrollment(pd_workshop, teacher, created_at=nil)
  if Pd::Enrollment.exists?(pd_workshop_id: pd_workshop.id, user_id: teacher.id)
    return Pd::Enrollment.find_by(pd_workshop_id: pd_workshop.id, user_id: teacher.id)
  end

  enrollment = Pd::Enrollment.new(
    pd_workshop_id: pd_workshop.id,
    user_id: teacher.id,
    first_name: teacher.name,
    email: teacher.email,
    created_at: created_at,
  )

  # apply a hack to bypass the last name and school info requirements; we only
  # require those if the enrollment was created after a certain date, but we
  # also examine whether or not the enrollment record has been persisted when
  # considering that. Becuase these records were "created" before that date,
  # they should pass validation but only _after_ they have been persisted in
  # the db.
  enrollment.save(validate: false)
  enrollment.validate!

  return enrollment
end

Workshop.where(pd_workshop_id: nil).each do |old_workshop|
  next unless old_workshop.facilitators.count > 0

  new_workshop = Pd::Workshop.new

  # old workshops didn't have organizers, so pick one of the facilitators to be
  # the new organizer
  new_workshop.organizer = old_workshop.facilitators.first

  new_workshop.location_name = old_workshop.location
  new_workshop.created_at = old_workshop.created_at

  # These values don't really matter anymore, but stick em in the notes field
  # just for posterity
  new_workshop.notes = "#{old_workshop.name}\n\n#{old_workshop.instructions}"

  # Set Course and Subject based on ProgramType and Phase, which were the old
  # equivalents.
  new_workshop.course = PROGRAM_TYPES_TO_COURSES[old_workshop.program_type]
  if subjects = PHASE_TO_SUBJECT[new_workshop.course]
    key = old_workshop.phase
    key = nil unless subjects.key?(key)
    new_workshop.subject = subjects[key]
  end

  # capacity doesn't actually matter; set it to a number that will make sure
  # all the enrollments will fit, and make sure it's not 0
  new_workshop.capacity = [1, (old_workshop.attendances.count + old_workshop.teachers.count)].max

  # all old workshops were paid but not on the map
  new_workshop.funded = true
  new_workshop.on_map = false

  # funded CSF workshops were facilitator-funded
  if new_workshop.course == Pd::SharedWorkshopConstants::COURSE_CSF
    new_workshop.funding_type = 'facilitator'
  end

  new_workshop.save!

  # facilitators => facilitators
  old_workshop.facilitators.each do |facilitator|
    new_workshop.facilitators << facilitator
  end

  # teachers => enrollments
  old_workshop.teachers.each do |teacher|
    get_or_create_enrollment(new_workshop, teacher, old_workshop.created_at)
  end

  # segments => sessions
  old_workshop.segments.each do |segment|
    session = Pd::Session.create!(
      start: segment.start,
      end: segment.end,
      created_at: segment.created_at,
      pd_workshop_id: new_workshop.id
    )

    # attendances => attendances
    segment.attendances.each do |old_attendance|
      next if old_attendance.teacher_id.nil?
      teacher = old_attendance.teacher

      enrollment = get_or_create_enrollment(new_workshop, teacher, old_attendance.created_at)

      next unless old_attendance.status == "present"
      next if Pd::Attendance.exists?(pd_session_id: session.id, teacher_id: teacher.id)

      Pd::Attendance.create!(
        pd_session_id: session.id,
        teacher_id: teacher.id,
        pd_enrollment_id: enrollment.id
      )
    end
  end

  new_workshop.save!

  # save the id of the newly-created workshop so we can keep track of which of
  # the old workshops have and have not been converted.
  old_workshop.pd_workshop_id = new_workshop.id
  old_workshop.save!
end
