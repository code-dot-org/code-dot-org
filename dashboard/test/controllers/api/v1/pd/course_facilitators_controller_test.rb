require 'test_helper'

class Api::V1::Pd::CourseFacilitatorsControllerTest < ::ActionController::TestCase
  test 'admins can see course facilitators' do
    sign_in create(:admin)
    get :index, course: Pd::Workshop::COURSES.first
    assert_response :success
  end

  test 'workshop organizers can see course facilitators' do
    sign_in create(:workshop_organizer)
    get :index, course: Pd::Workshop::COURSES.first
    assert_response :success
  end

  test 'facilitators cannot see course facilitators' do
    sign_in create(:facilitator)
    get :index, course: Pd::Workshop::COURSES.first
    assert_response :forbidden
  end

  test 'teachers cannot see course facilitators' do
    sign_in create(:teacher)
    get :index, course: Pd::Workshop::COURSES.first
    assert_response :forbidden
  end
end
