require 'test_helper'

class ProjectsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  generate_admin_only_tests_for :index

  test "get index" do
    sign_in create(:admin)
    get :index
    assert_response :success
  end

  test "get projects template" do
    sign_in create(:admin)
    get :template, template: 'projects'

    assert_response :success
    assert_template 'projects/projects'
  end

  test "template won't let you get index" do
    sign_in create(:admin)
    get :template, template: 'index'

    assert_response 404
  end

  test "template won't let you get files outside app/views" do
    sign_in create(:admin)
    get :template, template: '../../controllers/activities_controller.rb'

    assert_response 404
  end

end
