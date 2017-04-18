#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'
require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'cdo/only_one'
require src_dir 'database'

def main
  # Find existing survey responses and update Pd::Enrollment.completed_survey_id
  DB[:forms].where(kind: 'PdWorkshopSurvey').each do |survey|
    data = JSON.parse(survey[:data])
    enrollment_id = data['enrollment_id_i']
    Pd::Enrollment.find(enrollment_id).update!(completed_survey_id: survey[:id])
  end
end

main if only_one_running?(__FILE__)
