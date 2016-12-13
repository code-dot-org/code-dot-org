require 'test_helper'

class Api::V1::Pd::TeacherApplicationsControllerTest < ::ActionController::TestCase
  test 'logged in teachers can create teacher applications' do
    sign_in create(:teacher)

    assert_creates Pd::TeacherApplication do
      put :create, params: test_params
    end

    assert_response :success
  end

  test 'students cannot create teacher applications' do
    sign_in create(:student)

    put :create, params: test_params
    assert_response :forbidden
  end

  test 'not logged in users are redirected to sign in' do
    put :create, params: test_params
    assert_redirected_to_sign_in
  end

  test 'admins can index teacher applications' do
    5.times do
      create :pd_teacher_application
    end

    sign_in create(:admin)
    get :index
    assert_response :success

    response = JSON.parse(@response.body)
    assert_equal 5, response.count

    puts response
  end

  test 'non admins cannot index teacher applications' do
    sign_in create(:teacher)
    get :index
    assert_response :forbidden
  end

  private

  def test_params
    last_name = SecureRandom.hex(10)
    {
      personalEmail: "teacher#{SecureRandom.hex(5)}@example.net",
      schoolEmail: "teacher_#{last_name}@a_school.edu",
      firstName: 'Teacher',
      lastName: last_name
    }
  end
end
