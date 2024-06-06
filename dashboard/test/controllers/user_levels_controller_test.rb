require 'test_helper'

class UserLevelsControllerTest < ActionController::TestCase
  test "student's teacher can unsubmit user level" do
    follower = create :follower
    student = follower.student_user
    teacher = follower.user

    user_level = create :user_level, user: student, submitted: true

    sign_in teacher

    post :update, params: {id: user_level.id, user_level: {submitted: false}}
    assert_response :success

    user_level.reload

    refute user_level.submitted?
  end

  test "student can unsubmit own user level" do
    follower = create :follower
    student = follower.student_user

    user_level = create :user_level, user: student, submitted: true

    sign_in student

    post :update, params: {id: user_level.id, user_level: {submitted: false}}
    assert_response :success

    user_level.reload

    refute user_level.submitted?
  end

  test "teacher cannot unsubmit random user level" do
    follower = create :follower
    teacher = follower.user

    user_level = create :user_level, user: create(:user), submitted: true

    sign_in teacher

    post :update, params: {id: user_level.id, user_level: {submitted: false}}
    assert_response :forbidden

    user_level.reload

    assert user_level.submitted?
  end

  test "students teacher can clear response for user level" do
    follower = create :follower
    student = follower.student_user
    teacher = follower.user

    user_level = create :user_level, user: student

    sign_in teacher

    post :destroy, params: {id: user_level.id}
    assert_response :success

    assert UserLevel.find_by(id: user_level.id).nil?
  end

  test "student cannot clear response for own user level" do
    follower = create :follower
    student = follower.student_user

    user_level = create :user_level, user: student

    sign_in student

    post :destroy, params: {id: user_level.id}
    assert_response 403

    refute_nil UserLevel.find_by(id: user_level.id)
  end

  test "teacher cannot clear response for random user level" do
    follower = create :follower
    teacher = follower.user

    user_level = create :user_level, user: create(:user)

    sign_in teacher

    post :destroy, params: {id: user_level.id}
    assert_response 403

    refute_nil UserLevel.find_by(id: user_level.id)
  end

  [Multi, FreeResponse].each do |level_type|
    test "teacher can delete own progress on #{level_type} level" do
      user = create :teacher
      sign_in user
      script = create :script
      level = create :level, type: level_type
      create :user_level, user: user, script: script, level: level

      assert_destroys(UserLevel) do
        post :delete_predict_level_progress, params: {
          script_id: script.id,
          level_id: level.id
        }
        assert_response :success
      end
    end

    test "teacher only deletes their progress on #{level_type} level" do
      user = create :teacher
      other_user = create :teacher
      sign_in user
      script = create :script
      level = create :level, type: level_type
      create :user_level, user: other_user, script: script, level: level

      assert_does_not_destroy(UserLevel) do
        post :delete_predict_level_progress, params: {
          script_id: script.id,
          level_id: level.id
        }
        assert_response :success
      end
    end

    test "student cannot delete their own progress on #{level_type} level" do
      user = create :student
      sign_in user
      script = create :script
      level = create :level, type: level_type
      create :user_level, user: user, script: script, level: level

      assert_does_not_destroy(UserLevel) do
        post :delete_predict_level_progress, params: {
          script_id: script.id,
          level_id: level.id
        }
        assert_response :forbidden
      end
    end
  end

  test "teacher cannot delete own progress on an unsupported level" do
    user = create :teacher
    sign_in user
    script = create :script
    level = create :level, type: 'Blockly'
    create :user_level, user: user, script: script, level: level

    assert_does_not_destroy(UserLevel) do
      post :delete_predict_level_progress, params: {
        script_id: script.id,
        level_id: level.id
      }
      assert_response :bad_request
    end
  end
end
