require 'simplecov'
SimpleCov.start do
  coverage_dir 'test/coverage'

  add_filter 'test/'

  add_group 'I18n', 'i18n/'
  add_group 'Animations', 'animation_assets/'
end

require 'database_cleaner/active_record'
DatabaseCleaner.strategy = :transaction

require 'fileutils'
require 'json'
require 'yaml'

require_relative '../../shared/test/test_helper'

# Set up JUnit output for Circle
reporters = [Minitest::Reporters::SpecReporter.new]
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV['CIRCLE_TEST_REPORTS']}/bin")
end

# Skip this if the tests are run in RubyMine
Minitest::Reporters.use! reporters unless ENV['RM_INFO']

class Minitest::Spec
  before do
    STDOUT.stubs(:print) # to skip the progress bar output
  end
end
