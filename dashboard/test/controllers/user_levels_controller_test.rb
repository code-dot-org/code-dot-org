require 'test_helper'

class UserLevelsControllerTest < ActionController::TestCase
  test "student's teacher can unsubmit user level" do
    follower = create :follower
    student = follower.student_user
    teacher = follower.user

    user_level = create :user_level, user: student, submitted: true

    sign_in teacher

    post :update, id: user_level.id, user_level: {submitted: false}
    assert_response :success

    user_level.reload

    assert_not user_level.submitted?
  end

  test "student can unsubmit own user level" do
    follower = create :follower
    student = follower.student_user

    user_level = create :user_level, user: student, submitted: true

    sign_in student

    post :update, id: user_level.id, user_level: {submitted: false}
    assert_response :success

    user_level.reload

    assert_not user_level.submitted?
  end

  test "teacher cannot unsubmit random user level" do
    follower = create :follower
    teacher = follower.user

    user_level = create :user_level, user: create(:user), submitted: true

    sign_in teacher

    post :update, id: user_level.id, user_level: {submitted: false}
    assert_response :forbidden

    user_level.reload

    assert user_level.submitted?
  end

end
