#!/usr/bin/env ruby

# Link to reference guides for csd-2023 and csd-2024 don't work
# The underlying root cause is that the clone for csd-2023 missed
# some set of standard steps resulting in missing links, reference
# guides being one of them. csd-2024 was cloned off of that resulting
# in the same issue.
# This script clones reference guides and links them to the appropriate
# courses.

require_relative '../../../dashboard/config/environment'

def data_fix_reference_guides
  raise unless Rails.application.config.levelbuilder_mode

  # List of course versions to be fixed
  course_versions_to_fix = ['csd-2023', 'csd-2024']
  source_course_version = CurriculumHelper.find_matching_course_version('csd-2022')

  course_versions_to_fix.each do |course|
    destination_course_version = CurriculumHelper.find_matching_course_version(course)
    source_course_version&.reference_guides&.each do |reference_guide|
      reference_guide.copy_to_course_version(destination_course_version)
    end
  end
end

data_fix_reference_guides
