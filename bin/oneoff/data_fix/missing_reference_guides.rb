#!/usr/bin/env ruby

# https://codedotorg.atlassian.net/browse/TEACH-840
# CSD-2023 and CSD-2024 don't have any reference guides linked to them
# because of an issue in the way these units were originally cloned.
# This script clones the reference guides which were missed and links
#  them to the appropriate courses.

require_relative '../../../dashboard/config/environment'

def data_fix_reference_guides
  raise unless Rails.application.config.levelbuilder_mode

  # List of course versions to be fixed
  course_version_to_fix = CurriculumHelper.find_matching_course_version('csd-2024')

  # Source course version with the correct set of reference guides
  source_course_version = CurriculumHelper.find_matching_course_version('csd-2022')

  source_course_version&.reference_guides&.each do |reference_guide|
    reference_guide.copy_to_course_version(course_version_to_fix)
  end
end

data_fix_reference_guides
