require 'test_helper'

class UserLevelsControllerTest < ActionController::TestCase
  test "student's teacher can unsubmit user level" do
    follower = create :follower
    student = follower.student_user
    teacher = follower.user

    user_level = create :user_level, user: student

    sign_in teacher

    @request.headers['Accept'] = 'application/json'
    post :update, id: user_level.id, user_level: {best_result: Activity::FREE_PLAY_RESULT}
    assert_response :success

    user_level.reload

    assert_equal Activity::FREE_PLAY_RESULT, user_level.best_result
  end

  test "student cannot unsubmit own user level" do
    follower = create :follower
    student = follower.student_user

    user_level = create :user_level, user: student, best_result: Activity::SUBMITTED_RESULT

    sign_in student

    @request.headers['Accept'] = 'application/json'
    post :update, id: user_level.id, user_level: {best_result: Activity::FREE_PLAY_RESULT}
    assert_response :forbidden

    user_level.reload

    assert_equal Activity::SUBMITTED_RESULT, user_level.best_result
  end


  test "teacher cannot unsubmit random user level" do
    follower = create :follower
    teacher = follower.user

    user_level = create :user_level, user: create(:user), best_result: Activity::SUBMITTED_RESULT

    sign_in teacher

    @request.headers['Accept'] = 'application/json'
    post :update, id: user_level.id, user_level: {best_result: Activity::FREE_PLAY_RESULT}
    assert_response :forbidden

    user_level.reload

    assert_equal Activity::SUBMITTED_RESULT, user_level.best_result
  end

end
