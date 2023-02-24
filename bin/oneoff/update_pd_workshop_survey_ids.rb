#!/usr/bin/env ruby
require_relative '../../lib/cdo/only_one'
abort 'Script already running' unless only_one_running?(__FILE__)

require_relative '../../dashboard/config/environment'
require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'

def main
  # Find existing survey responses and update Pd::Enrollment.completed_survey_id
  DB[:forms].where(kind: 'PdWorkshopSurvey').each do |survey|
    data = JSON.parse(survey[:data])
    enrollment_id = data['enrollment_id_i']
    Pd::Enrollment.find(enrollment_id).update!(completed_survey_id: survey[:id])
  end
end

main
