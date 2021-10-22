#!/usr/bin/env ruby

# Sets instructor_audience and participant_audience on UnitGroup and Script
# Scripts that are in UnitGroups get their audiences from
# their UnitGroup so we don't need to set their audience values

require_relative '../../dashboard/config/environment'

def set_course_audiences
  raise unless Rails.application.config.levelbuilder_mode

  Script.all.each do |script|
    # scripts in unit_groups get their audiences from their unit group
    next if script.unit_group

    script.instructor_audience = if [].include?(script.name)
                                   SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator
                                 elsif [].include?(script.name)
                                   SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer
                                 elsif [].include?(script.name)
                                   SharedCourseConstants::INSTRUCTOR_AUDIENCE.code_admin
                                 else
                                   SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher
                                 end

    script.participant_audience = if [].include?(script.name)
                                    SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator
                                  elsif [].include?(script.name)
                                    SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
                                  else
                                    SharedCourseConstants::PARTICIPANT_AUDIENCE.student
                                  end
    script.save(skip_name_format_validation: true)
    script.write_script_json
  end

  UnitGroup.all.each do |course|
    # default is instructor_audience teacher and participant_audience student so only need to update unit groups we want something else
    next unless [].include?(course.name)

    course.instructor_audience = if [].include?(course.name)
                                   SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator
                                 elsif [].include?(course.name)
                                   SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer
                                 elsif [].include?(course.name)
                                   SharedCourseConstants::INSTRUCTOR_AUDIENCE.code_admin
                                 end

    course.participant_audience = if [].include?(course.name)
                                    SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator
                                  elsif [].include?(course.name)
                                    SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
                                  end

    course.save!
    course.write_serialization
  end
end

set_course_audiences
