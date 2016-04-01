require 'test_helper'

class Plc::CourseViewControllerTest < ActionController::TestCase
  setup do

  end

  test 'Admins can access course view' do
    admin = create :admin

    sign_in(admin)
    get :render_dashboard
    assert_response :success
  end

  test 'Teachers can access course view' do
    teacher = create :teacher

    sign_in(teacher)
    get :render_dashboard
    assert_response :success
  end

  test 'Students cannot access course view' do
    student = create :student

    sign_in(student)
    get :render_dashboard
    assert_response :forbidden
  end
end
