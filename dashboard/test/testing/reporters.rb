# frozen_string_literal: true

require 'minitest/reporters'
require_relative 'reporters/slowest_tests_reporter'

reporters = [Minitest::Reporters::SlowestTestsReporter.new, Minitest::Reporters::ProgressReporter.new]

if CI::Utils.ci_job_ui_tests?
  reporters << Minitest::Reporters::JUnitReporter.new(File.join(ENV.fetch('CI_TEST_REPORTS', nil), 'dashboard'))
end

# Skip this if the tests are run in RubyMine
Minitest::Reporters.use! reporters unless ENV['RM_INFO']
