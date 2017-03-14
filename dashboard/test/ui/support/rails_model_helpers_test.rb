require 'test_helper'
require_relative 'rails_model_helpers'

class RailsModelHelpersTest < ActionController::TestCase
  include RailsModelHelpers

  test 'require_i18n_translations' do
    run_test 'require_i18n_translations'
  end

  test 'require_rails_models' do
    run_test 'require_rails_models'
  end

  test 'test wrapper failures are caught' do
    a = assert_raises Minitest::Assertion do
      run_test 'nonexistent_method'
    end

    assert a.to_s.include? 'Error in nonexistent_method'
    assert a.to_s.include? 'undefined method `nonexistent_method'
  end

  def run_test(method)
    test_wrapper = File.join(File.dirname(__FILE__), 'rails_model_helpers_wrapper.rb')
    _, stderr, status = Open3.capture3(test_wrapper, method)
    exitstatus = status.exitstatus

    assert_equal 0, exitstatus, "Error in #{method}: #{stderr}"
  end
end
