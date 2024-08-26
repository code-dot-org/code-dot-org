#!/usr/bin/env ruby
#
# This file is used to generate a static JS file containing some of the same
# constants that we have defined in a ruby file. This allows us to ensure that
# we're using the same set of constants in dashboard and apps.
#
require 'json'
require 'active_support/inflector'
require 'active_support/core_ext/hash'
require 'fileutils'
require 'require_all'

require_relative '../../lib/cdo/shared_constants'
require_relative '../../lib/cdo/shared_constants/curriculum/shared_course_constants'
autoload_all File.expand_path('../../lib/cdo/shared_constants/pd', File.dirname(__FILE__))

REPO_DIR = File.expand_path('../../../', __FILE__)

def generate_shared_js_file(content, path)
  output = <<CONTENT
/* eslint-disable */

// This is a generated file and SHOULD NOT BE EDITED MANUALLY!!
// Contents are generated as part of grunt build
// Source of truth is lib/cdo/shared_constants.rb and files in lib/cdo/shared_constants/

#{content}
CONTENT

  FileUtils.mkdir_p File.dirname(path)
  File.open(path, 'w') {|f| f.write(output)}
end

# This generates a JS/TS object from its ruby equivalent based on the constant
# name in shared_constants
# @param [String] shared_const_name
# @param [Module] source_module: (optional, default SharedConstants)
# @param [Boolean] transform_keys: (optional, default false) if true, transform the hash keys into js style lowerCamelCase.
# @param [String] file_type: (optional, default 'js') the file type (JavaScript or TypeScript) to generate
def generate_constants(shared_const_name, source_module: SharedConstants, transform_keys: false, file_type: 'js')
  raw = source_module.const_get(shared_const_name)
  begin
    hash_or_array = parse_raw(raw)
    hash_or_array = hash_or_array.deep_transform_keys {|k| k.to_s.camelize(:lower)} if transform_keys && hash_or_array.is_a?(Hash)
    "export const #{shared_const_name.downcase.camelize} = #{JSON.pretty_generate(hash_or_array)}" + (file_type == 'ts' ? ' as const;' : ';');
  rescue JSON::ParserError
    if raw.is_a?(String)
      "export const #{shared_const_name.downcase.camelize} = '#{raw}'" + (file_type == 'ts' ? ' as const;' : ';');
    else
      raise "unrecognized raw type: #{raw.class}"
    end
  end
end

# Generate a set of JS objects from their ruby equivalents
# It calls #generate_constants for each supplied const name. See above for more options
# @param [Array] shared_const_names
def generate_multiple_constants(shared_const_names, **options)
  shared_const_names.map do |shared_const_name|
    generate_constants(shared_const_name, **options)
  end.join("\n\n")
end

# @param raw [Hash|Array|OpenStruct|String] A hash, array, OpenStruct, or
# JSON-encoded string representing an object or array.
# @returns [Hash|Array] A hash or array representation of the input.
def parse_raw(raw)
  if raw.is_a?(OpenStruct)
    raw.marshal_dump
  elsif raw.is_a?(Hash) || raw.is_a?(Array)
    raw
  elsif raw.is_a?(String)
    JSON.parse(raw)
  else
    raise "unrecognized raw type: #{raw.class}"
  end
end

def main
  shared_content = generate_multiple_constants(
        %w(
      DEFAULT_LOCALE
      ARTIST_AUTORUN_OPTIONS
      LEVEL_KIND
      LEVEL_STATUS
      SECTION_LOGIN_TYPE
      STUDENT_GRADE_LEVELS
      PL_GRADE_VALUE
      POST_MILESTONE_MODE
      ALWAYS_PUBLISHABLE_PROJECT_TYPES
      ALL_PUBLISHABLE_PROJECT_TYPES
      CONDITIONALLY_PUBLISHABLE_PROJECT_TYPES
      ABUSE_CONSTANTS
      ERROR_SEVERITY_LEVELS
      RESTRICTED_PUBLISH_PROJECT_TYPES
      RUBRIC_UNDERSTANDING_LEVELS
      RUBRIC_AI_EVALUATION_STATUS
      RUBRIC_AI_EVALUATION_LIMITS
      EMAIL_LINKS
      CHILD_ACCOUNT_COMPLIANCE_STATES
      CENSUS_CONSTANTS
      DANCE_SONG_MANIFEST_FILENAME
      AI_INTERACTION_STATUS
      AI_TUTOR_INTERACTION_STATUS
      AI_TUTOR_TYPES
      AI_REQUEST_EXECUTION_STATUS
      AI_CHAT_MODEL_IDS
      FEATURED_PROJECT_STATUS
      FEATURED_PROJECT_CONSTANTS
      LMS_LINKS
      USER_TYPES
    ), 
    file_type: 'ts'
  )

  # please place all generated scripts into #{REPO_DIR}/apps/generated_scripts
  # then import with import { needed } from "@cdo/generated-scripts/generatedFile"
  generate_shared_js_file(shared_content, "#{REPO_DIR}/apps/generated-scripts/sharedConstants.ts")
  generate_shared_js_file(generate_constants('VOICES'), "#{REPO_DIR}/apps/generated-scripts/sharedVoices.js")
  generate_shared_js_file(generate_constants('APPLAB_BLOCKS'), "#{REPO_DIR}/apps/generated-scripts/sharedApplabBlocks.js")
  generate_shared_js_file(generate_constants('APPLAB_GOAL_BLOCKS'), "#{REPO_DIR}/apps/generated-scripts/sharedApplabGoalBlocks.js")
  generate_shared_js_file(generate_constants('GAMELAB_BLOCKS'), "#{REPO_DIR}/apps/generated-scripts/sharedGamelabBlocks.js")

  generate_shared_js_file(
    generate_multiple_constants(
        %w(
      PUBLISHED_STATE
      INSTRUCTION_TYPE
      PARTICIPANT_AUDIENCE
      INSTRUCTOR_AUDIENCE
      CURRICULUM_UMBRELLA
      COURSE_OFFERING_CURRICULUM_TYPES
      COURSE_OFFERING_HEADERS
      COURSE_OFFERING_MARKETING_INITIATIVES
      COURSE_OFFERING_CS_TOPICS
      COURSE_OFFERING_SCHOOL_SUBJECTS
      DEVICE_TYPES
      DEVICE_COMPATIBILITY_LEVELS
      PARTICIPANT_AUDIENCES_BY_TYPE
    ),
      source_module: Curriculum::SharedCourseConstants, transform_keys: false
    ),
    "#{REPO_DIR}/apps/src/generated/curriculum/sharedCourseConstants.js"
  )

  generate_shared_js_file(
    generate_multiple_constants(
      %w(
        COURSES
        ACTIVE_COURSES
        ARCHIVED_COURSES
        COURSE_KEY_MAP
        SUBJECT_NAMES
        SUBJECTS
        VIRTUAL_ONLY_SUBJECTS
        HIDE_FEE_INFORMATION_SUBJECTS
        HIDE_ON_WORKSHOP_MAP_SUBJECTS
        HIDE_FUNDED_SUBJECTS
        MUST_SUPPRESS_EMAIL_SUBJECTS
        ACADEMIC_YEAR_WORKSHOP_SUBJECTS
        LEGACY_SUBJECTS
        STATES
        WORKSHOP_APPLICATION_STATES
        WORKSHOP_SEARCH_ERRORS
        ACTIVE_COURSE_WORKSHOPS
        ACTIVE_COURSES_WITH_SURVEYS
        WORKSHOP_TYPES
        NOT_FUNDED_SUBJECTS
        CSD_CUSTOM_WORKSHOP_MODULES
      ),
      source_module: Pd::SharedWorkshopConstants,
      transform_keys: false
    ),
    "#{REPO_DIR}/apps/src/generated/pd/sharedWorkshopConstants.js"
  )

  generate_shared_js_file(
    generate_constants(
      'COHORT_CALCULATOR_STATUSES',
      source_module: Pd::SharedApplicationConstants,
      transform_keys: true
    ),
    "#{REPO_DIR}/apps/src/generated/pd/sharedApplicationConstants.js"
  )

  generate_shared_js_file(
    generate_multiple_constants(
      %w(
        PRINCIPAL_APPROVAL_STATE
        SEND_ADMIN_APPROVAL_EMAIL_STATUSES
        YEAR SECTION_HEADERS
        PAGE_LABELS
        VALID_SCORES
        LABEL_OVERRIDES
        TEXT_FIELDS
        MULTI_ANSWER_QUESTION_FIELDS
        SCOREABLE_QUESTIONS
      ),
      source_module: Pd::TeacherApplicationConstants,
      transform_keys: true
    ),
    "#{REPO_DIR}/apps/src/generated/pd/teacherApplicationConstants.js"
  )

  generate_shared_js_file(
    generate_multiple_constants(
      %w(PAGE_LABELS TEXT_FIELDS),
      source_module: Pd::PrincipalApprovalApplicationConstants,
      transform_keys: true
    ),
    "#{REPO_DIR}/apps/src/generated/pd/principalApprovalApplicationConstants.js"
  )

  generate_shared_js_file(
    generate_constants(
      'COURSE_SPECIFIC_SCHOLARSHIP_DROPDOWN_OPTIONS',
      source_module: Pd::ScholarshipInfoConstants,
      transform_keys: true
    ),
    "#{REPO_DIR}/apps/src/generated/pd/scholarshipInfoConstants.js"
  )
end

main
