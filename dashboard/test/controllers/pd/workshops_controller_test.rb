require 'test_helper'
class Pd::WorkshopsControllerTest < ActionController::TestCase
  setup do
    @workshop = create :workshop
  end

  test 'logged-out users can view workshop marketing page' do
    get :index, params: {workshop_id: @workshop.id}

    assert_response :success
    assert_template :index
  end

  test 'students can view workshop marketing page' do
    student = create :student
    sign_in student
    get :index, params: {workshop_id: @workshop.id}

    assert_response :success
    assert_template :index
  end

  test 'teachers can view workshop marketing page' do
    teacher = create :teacher
    sign_in teacher
    get :index, params: {workshop_id: @workshop.id}

    assert_response :success
    assert_template :index
  end
end
