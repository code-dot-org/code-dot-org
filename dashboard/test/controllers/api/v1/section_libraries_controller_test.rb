require 'test_helper'

class Api::V1::SectionLibrariesControllerTest < ActionController::TestCase
  setup_all do
    @teacher = create(:teacher)
    @section = create(:section, user: @teacher, login_type: 'word')
    @student = create(:follower, section: @section).student_user
  end

  test 'logged out cannot list libraries' do
    get :index
    assert_response :redirect
  end

  test 'student can view section libraries' do
    sign_in @student
    get :index
    assert_response :success
  end
end
