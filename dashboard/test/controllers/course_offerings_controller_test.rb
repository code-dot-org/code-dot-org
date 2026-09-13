require 'test_helper'

class CourseOfferingsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    # stub writes so that we dont actually make updates to filesystem
    File.stubs(:write)

    @levelbuilder = create(:levelbuilder)

    @course_offering = create(:course_offering, display_name: 'Course Offering Name', marketing_initiative: 'HOC', is_featured: false)

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

    course_offering = create(:course_offering, display_name: 'Course Offering Name', marketing_initiative: 'HOC', is_featured: true)

    put :update, params: {
      key: course_offering.key,
      display_name: 'New Display Name',
      marketing_initiative: 'CSD',
      is_featured: false,
      facilitator_course_permissions: ["CS Fundamentals", "CS Principles", "CS Discoveries"]
    }

    course_offering.reload

    assert_equal 'New Display Name', course_offering.display_name
    assert_equal 'CSD', course_offering.marketing_initiative
    assert_equal false, course_offering.is_featured
    assert_equal ["CS Fundamentals", "CS Principles", "CS Discoveries"], course_offering.facilitator_course_permissions
  end

  test 'update course offering updates fields with nested strong parameters' do
    sign_in @levelbuilder

    course_offering = create(:course_offering, display_name: 'Course Offering Name', marketing_initiative: 'HOC', is_featured: true)

    put :update, params: {
      key: course_offering.key,
      course_offering: {
        display_name: 'New Display Name',
        marketing_initiative: 'CSD',
        is_featured: false,
        facilitator_course_permissions: ["CS Fundamentals", "CS Principles", "CS Discoveries"]
      }
    }

    course_offering.reload

    assert_equal 'New Display Name', course_offering.display_name
    assert_equal 'CSD', course_offering.marketing_initiative
    assert_equal false, course_offering.is_featured
    assert_equal ["CS Fundamentals", "CS Principles", "CS Discoveries"], course_offering.facilitator_course_permissions
  end

  test 'instant section course offerings rejects students' do
    sign_in create(:student)

    get :instant_section_course_offerings

    assert_response :forbidden
  end

  test 'instant section course offerings returns assignable HOAI courses for teachers' do
    teacher = create(:teacher)
    sign_in teacher

    first_course = mock
    first_course.expects(:hoai?).returns(true)
    first_course.expects(:can_be_assigned?).with(teacher).returns(true)
    first_course.expects(:summarize_for_instant_section_catalog).with(teacher, I18n.locale.to_s).returns({key: 'first', display_name: 'A course'})

    second_course = mock
    second_course.expects(:hoai?).returns(true)
    second_course.expects(:can_be_assigned?).with(teacher).returns(true)
    second_course.expects(:summarize_for_instant_section_catalog).with(teacher, I18n.locale.to_s).returns({key: 'second', display_name: 'B course'})

    unavailable_course = mock
    unavailable_course.expects(:hoai?).returns(true)
    unavailable_course.expects(:can_be_assigned?).with(teacher).returns(false)

    other_initiative = mock
    other_initiative.expects(:hoai?).returns(false)

    CourseOffering.expects(:assignable_published_for_students_course_offerings).returns(
      [second_course, unavailable_course, other_initiative, first_course]
    )

    get :instant_section_course_offerings

    assert_response :success
    assert_equal ['first', 'second'], response.parsed_body.pluck('key')
  end
end
