require 'simplecov'
SimpleCov.start do
  coverage_dir File.expand_path('../coverage', __FILE__)

  add_filter do |source|
    is_not_bin_file = !source.filename.start_with?(File.expand_path('../../', __FILE__))
    is_bin_test_file = source.filename.start_with?(File.expand_path('../', __FILE__))
    is_not_bin_file || is_bin_test_file
  end

  add_group 'I18n', 'i18n/'
  add_group 'Animations', 'animation_assets/'
end

require_relative '../../shared/test/test_helper'

require 'database_cleaner/active_record'
DatabaseCleaner.strategy = :transaction

require 'fileutils'
require 'json'
require 'yaml'

# Set up JUnit output for Circle
reporters = []
if ENV['CIRCLECI']
  reporters << Minitest::Reporters::ProgressReporter.new
  reporters << Minitest::Reporters::JUnitReporter.new("#{ENV.fetch('CIRCLE_TEST_REPORTS', nil)}/bin")
else
  reporters << Minitest::Reporters::SpecReporter.new
end
# Skip this if the tests are run in RubyMine
Minitest::Reporters.use! reporters unless ENV['RM_INFO']

module MiniTest
  module Assertions
    alias :actual_diff :diff

    def diff(exp, act)
      FakeFS.without do
        actual_diff(exp, act)
      end
    end
  end

  class Spec
    before do
      if ENV['CIRCLECI']
        $stdout.stubs(:print)
        $stdout.stubs(:puts)
        $stdout.stubs(:warn)
      end
    end
  end
end
