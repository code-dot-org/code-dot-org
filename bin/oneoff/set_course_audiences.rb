#!/usr/bin/env ruby

# Sets instructor_audience and participant_audience on UnitGroup and Script
# Scripts that are in UnitGroups get their audiences from
# their UnitGroup so we don't need to set their audience values

require_relative '../../dashboard/config/environment'

def set_course_audiences
  raise unless Rails.application.config.levelbuilder_mode

  Unit.all.each do |script|
    # scripts in unit_groups get their audiences from their unit group
    next if script.unit_group

    # rubocop:disable Style/WordArray
    # rubocop:disable Performance/CollectionLiteralInLoop
    script.instructor_audience = if ['csd1-dlp-18', 'csd2-dlp-18', 'csd3-dlp-18', 'csd4-dlp-18', 'csd5-dlp-18',
                                     'csd6-dlp-18', 'csp1-dlp-18', 'csp2-dlp-18', 'csp3-dlp-18', 'csp4-dlp-18',
                                     'csp5-dlp-18', 'csp-create-dlp-18', 'csp-explore-dlp-18', 'csp-novice-18',
                                     'csd-novice-18', 'csp-apprentice-18', 'csd-apprentice-18', 'fit-test',
                                     'andrea-test', 'fit2019-novice', 'fit2019-apprentice', 'dlp19-csp-mod-fit',
                                     'dlp19-csd-mod-fit', 'dlp19-csd-mod-w1', 'dlp19-csd-mod-w2', 'dlp19-csd-mod-w3',
                                     'dlp19-csd-mod-w4', 'dlp19-csp-mod-w1', 'dlp19-csp-mod-w2', 'dlp19-csp-mod-w3',
                                     'dlp19-csp-mod-w4', 'alltheplcthings', 'dlp21-csp-mod1', 'dlp21-csd-overview',
                                     'dlp21-csp-overview', 'dlp21-csp-mod2', 'dlp21-csp-mod3', 'dlp21-csp-mod4',
                                     'dlp21-csd-mod1', 'dlp21-csd-mod2', 'dlp21-csd-mod3', 'dlp21-csd-mod4'].include?(script.name)
                                   Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer
                                 else
                                   Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher
                                 end

    script.participant_audience = if ['csd1-dlp-18', 'csd2-dlp-18', 'csd3-dlp-18', 'csd4-dlp-18', 'csd5-dlp-18',
                                      'csd6-dlp-18', 'csp1-dlp-18', 'csp2-dlp-18', 'csp3-dlp-18', 'csp4-dlp-18',
                                      'csp5-dlp-18', ' csp-create-dlp-18', 'csp-explore-dlp-18', 'csp-novice-18',
                                      'csd-novice-18', 'csp-apprentice-18', 'csd-apprentice-18', 'fit-test',
                                      'andrea-test', 'fit2019-novice', 'fit2019-apprentice', 'dlp19-csp-mod-fit',
                                      'dlp19-csd-mod-fit', 'dlp19-csd-mod-w1', 'dlp19-csd-mod-w2', 'dlp19-csd-mod-w3',
                                      'dlp19-csd-mod-w4', 'dlp19-csp-mod-w1', 'dlp19-csp-mod-w2', 'dlp19-csp-mod-w3',
                                      'dlp19-csp-mod-w4', 'alltheplcthings', 'dlp21-csd-overview', 'dlp21-csp-overview',
                                      'dlp21-csp-mod2', 'dlp21-csp-mod3', 'dlp21-csp-mod4', 'dlp21-csd-mod1',
                                      'dlp21-csd-mod2', 'dlp21-csd-mod3', 'dlp21-csd-mod4'].include?(script.name)
                                    Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator
                                  else
                                    Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student
                                  end
    # rubocop:enable Style/WordArray
    # rubocop:enable Performance/CollectionLiteralInLoop

    script.update!(skip_name_format_validation: true)
    script.write_script_json
  end

  UnitGroup.all.each do |course|
    # default is instructor_audience teacher and participant_audience student so only need to update unit groups we want something else
    next unless course.name == 'self-paced-pl-csp-2021'

    course.instructor_audience = if course.name == 'self-paced-pl-csp-2021'
                                   Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.universal_instructor
                                 end

    course.participant_audience = if course.name == 'self-paced-pl-csp-2021'
                                    Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
                                  end

    course.save!
    course.write_serialization
  end
end

set_course_audiences
