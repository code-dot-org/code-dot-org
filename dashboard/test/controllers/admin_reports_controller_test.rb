require 'test_helper'

class AdminReportsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    sign_in create(:admin)
  end

  generate_admin_only_tests_for :debug
  generate_admin_only_tests_for :directory
  generate_admin_only_tests_for :level_answers

  test 'pd_progress should return 404 for unfound script' do
    get :pd_progress, params: {script: 'bogus-nonexistent-script-name'}
    assert_response :not_found
    assert_includes @response.body, "Script bogus-nonexistent-script-name not found"
  end

  test 'pd_progress should return 404 for unfound progress data' do
    script = create :script, name: "test-unfound-progress-data"
    Properties.stubs(:get).returns(nil)

    get :pd_progress, params: {script: script.name}
    assert_response :not_found
    assert_includes @response.body, "PD progress data not found for test-unfound-progress-data"
  end

  test 'pd_progress should sanitize script.name' do
    evil_script = Script.new(
      name: %q(<script type="text/javascript">alert('XSS');</script>)
    )
    Script.stubs(:get_from_cache).returns(evil_script)

    get :pd_progress, params: {
      script: %q(<script type="text/javascript">alert('XSS');</script>)
    }

    assert_response :not_found
    refute @response.body.include? '<script type="text/javascript">'
  end
end
