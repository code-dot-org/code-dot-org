require 'test_helper'

class CourseOfferingsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    # stub writes so that we dont actually make updates to filesystem
    File.stubs(:write)

    @levelbuilder = create :levelbuilder

    @course_offering = create :course_offering, display_name: 'Course Offering Name', category: 'Other'
  end

  # only levelbuilders can edit or update course offerings
  test_user_gets_response_for :edit, params: -> {{key: @course_offering.key}}, user: nil, response: :redirect
  test_user_gets_response_for :edit, params: -> {{key: @course_offering.key}}, user: :student, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{key: @course_offering.key}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{key: @course_offering.key}}, user: :levelbuilder, response: :success

  test_user_gets_response_for :update, params: -> {{key: @course_offering.key}}, user: nil, response: :redirect
  test_user_gets_response_for :update, params: -> {{key: @course_offering.key}}, user: :student, response: :forbidden
  test_user_gets_response_for :update, params: -> {{key: @course_offering.key}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :update, params: -> {{key: @course_offering.key}}, user: :levelbuilder, response: :success

  test 'edit course offering' do
    sign_in @levelbuilder

    get :edit, params: {
      key: @course_offering.key
    }
    assert_response :ok
  end

  test 'update course offering' do
    sign_in @levelbuilder

    get :update, params: {
      key: @course_offering.key
    }
    assert_response :ok
  end
end
