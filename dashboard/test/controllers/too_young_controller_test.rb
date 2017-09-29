require 'test_helper'

class TooYoungControllerTest < ActionController::TestCase
  test 'young student with no teacher gets too young warning' do
    sign_in create(:young_student)

    get :index

    assert_includes flash[:alert], 'not available for younger students'
    refute_includes flash[:alert], 'teacher'
    assert_redirected_to '/'
  end

  test 'young student with teacher gets accept terms warning' do
    sign_in create(:young_student_with_teacher)

    get :index

    assert_includes flash[:alert], 'not available for younger students'
    assert_includes flash[:alert], 'teacher'
    assert_redirected_to '/'
  end
end
