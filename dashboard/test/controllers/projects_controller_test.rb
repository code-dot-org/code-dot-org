require 'test_helper'

class ProjectsControllerTest < ActionController::TestCase
  include Devise::TestHelpers
  setup do
    sign_in create(:user)
  end

  test "get index" do
    get :index
    assert_response :success
  end

  test "get projects template" do
    get :template, template: 'projects'

    assert_response :success
    assert_template 'projects/projects'
  end

  test "template won't let you get index" do
    get :template, template: 'index'

    assert_response 404
  end

  test "template won't let you get files outside app/views" do
    get :template, template: '../../controllers/activities_controller.rb'

    assert_response 404
  end

end
