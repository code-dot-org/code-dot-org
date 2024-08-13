require 'test_helper'

class CourseOfferingsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    # stub writes so that we dont actually make updates to filesystem
    File.stubs(:write)

    @levelbuilder = create :levelbuilder

    @course_offering = create :course_offering, display_name: 'Course Offering Name', marketing_initiative: 'HOC', is_featured: false

    @update_params = {
      key: @course_offering.key,
      display_name: 'New Display Name',
      marketing_initiative: 'CSF',
      is_featured: false
    }
  end

  # only levelbuilders can edit or update course offerings
  test_user_gets_response_for :edit, params: -> {{key: @course_offering.key}}, user: nil, response: :redirect
  test_user_gets_response_for :edit, params: -> {{key: @course_offering.key}}, user: :student, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{key: @course_offering.key}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{key: @course_offering.key}}, user: :levelbuilder, response: :success

  # only levelbuilders can update
  test_user_gets_response_for :update, params: -> {{key: @course_offering.key}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :update, params: -> {@update_params}, user: :student, response: :forbidden
  test_user_gets_response_for :update, params: -> {@update_params}, user: :teacher, response: :forbidden
  test_user_gets_response_for :update, params: -> {@update_params}, user: :levelbuilder, response: :success

  test 'update course offering updates fields' do
    sign_in @levelbuilder

    course_offering = create :course_offering, display_name: 'Course Offering Name', marketing_initiative: 'HOC', is_featured: true

    put :update, params: {
      key: course_offering.key,
      display_name: 'New Display Name',
      marketing_initiative: 'CSD',
      is_featured: false
    }

    course_offering.reload

    assert_equal 'New Display Name', course_offering.display_name
    assert_equal 'CSD', course_offering.marketing_initiative
    assert_equal false, course_offering.is_featured
  end
end
