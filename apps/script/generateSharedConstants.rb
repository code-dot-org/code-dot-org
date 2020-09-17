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

# This generates a JS object from its ruby equivalent based on the constant
# name in shared_constants
# @param [String] shared_const_name
# @param [Module] source_module: (optional, default SharedConstants)
# @param [Boolean] transform_keys: (optional, default false) if true, transform the hash keys into js style lowerCamelCase.
def generate_constants(shared_const_name, source_module: SharedConstants, transform_keys: false)
  raw = source_module.const_get(shared_const_name)
  hash_or_array = parse_raw(raw)
  hash_or_array = hash_or_array.deep_transform_keys {|k| k.to_s.camelize(:lower)} if transform_keys && hash_or_array.is_a?(Hash)
  "export const #{shared_const_name.downcase.camelize} = #{JSON.pretty_generate(hash_or_array)};"
end

# Generate a set of JS objects from their ruby equivalents
# It calls #generate_constants for each supplied const name. See above for more options
# @param [Array] shared_const_names
def generate_multiple_constants(shared_const_names, *options)
  shared_const_names.map do |shared_const_name|
    generate_constants shared_const_name, *options
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
  shared_content = generate_multiple_constants %w(
    ARTIST_AUTORUN_OPTIONS
    LEVEL_KIND
    LEVEL_STATUS
    SECTION_LOGIN_TYPE
    POST_MILESTONE_MODE
    ALWAYS_PUBLISHABLE_PROJECT_TYPES
    ALL_PUBLISHABLE_PROJECT_TYPES
    CONDITIONALLY_PUBLISHABLE_PROJECT_TYPES
    ALLOWED_WEB_REQUEST_HEADERS
    ABUSE_CONSTANTS
    ERROR_SEVERITY_LEVELS
  )

  generate_shared_js_file(shared_content, "#{REPO_DIR}/apps/src/util/sharedConstants.js")
  generate_shared_js_file(generate_constants('APPLAB_BLOCKS'), "#{REPO_DIR}/apps/src/applab/sharedApplabBlocks.js")
  generate_shared_js_file(generate_constants('APPLAB_GOAL_BLOCKS'), "#{REPO_DIR}/apps/src/applab/sharedApplabGoalBlocks.js")
  generate_shared_js_file(generate_constants('GAMELAB_BLOCKS'), "#{REPO_DIR}/apps/src/p5lab/gamelab/sharedGamelabBlocks.js")

  generate_shared_js_file(
    generate_multiple_constants(
      %w(
        COURSES
        COURSE_KEY_MAP
        SUBJECT_NAMES
        SUBJECTS
        VIRTUAL_ONLY_SUBJECTS
        MUST_SUPPRESS_EMAIL_SUBJECTS
        ACADEMIC_YEAR_WORKSHOP_SUBJECTS
        LEGACY_SUBJECTS
        STATES
        WORKSHOP_APPLICATION_STATES
        WORKSHOP_SEARCH_ERRORS
        WORKSHOP_TYPES
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
      %w(SECTION_HEADERS PAGE_LABELS VALID_SCORES LABEL_OVERRIDES NUMBERED_QUESTIONS TEXT_FIELDS INTERVIEW_QUESTIONS SCOREABLE_QUESTIONS),
      source_module: Pd::Facilitator1920ApplicationConstants,
      transform_keys: true
    ),
    "#{REPO_DIR}/apps/src/generated/pd/facilitatorApplicationConstants.js"
  )

  generate_shared_js_file(
    generate_multiple_constants(
      %w(SECTION_HEADERS PAGE_LABELS VALID_SCORES LABEL_OVERRIDES TEXT_FIELDS MULTI_ANSWER_QUESTION_FIELDS SCOREABLE_QUESTIONS),
      source_module: Pd::Teacher2021ApplicationConstants,
      transform_keys: true
    ),
    "#{REPO_DIR}/apps/src/generated/pd/teacherApplicationConstants.js"
  )

  generate_shared_js_file(
    generate_multiple_constants(
      %w(PAGE_LABELS TEXT_FIELDS),
      source_module: Pd::PrincipalApproval2021ApplicationConstants,
      transform_keys: true
    ),
    "#{REPO_DIR}/apps/src/generated/pd/principalApprovalApplicationConstants.js"
  )

  generate_shared_js_file(
    generate_multiple_constants(
      %w(TEACHER_SEAT_ACCEPTANCE_OPTIONS TEXT_FIELDS),
      source_module: Pd::Teachercon1819RegistrationConstants,
      transform_keys: true
    ),
    "#{REPO_DIR}/apps/src/generated/pd/teachercon1819RegistrationConstants.js"
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
