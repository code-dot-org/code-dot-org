require 'test_helper'

class Api::V1::Pd::TeacherApplicationsControllerTest < ::ActionController::TestCase
  test 'logged in teachers can create teacher applications' do
    sign_in create(:teacher)

    assert_creates Pd::TeacherApplication do
      put :create, params: test_params
      assert_response :success
    end
  end

  # For now. Perhaps we'll render a different view explaining how to upgrade to teacher account in the future.
  test 'students can create teacher applications' do
    sign_in create(:student)

    assert_creates Pd::TeacherApplication do
      put :create, params: test_params
      assert_response :success
    end
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
      application: {
        primaryEmail: "teacher#{last_name}@example.net",
        secondaryEmail: "teacher#{last_name}@my.school.edu",
        firstName: 'Teacher',
        lastName: last_name
      }
    }
  end
end
