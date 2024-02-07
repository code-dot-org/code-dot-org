require 'test_helper'

class CodeReviewCommentsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = false

  setup_all do
    @student_1 = create :student
    @student_2 = create :student
    @student_3 = create :student
    @teacher = create :teacher

    @section = create :section, code_review_expires_at: Time.now.utc + 1.day, teacher: @teacher
    student_1_follower = create :follower, section: @section, student_user: @student_1
    student_2_follower = create :follower, section: @section, student_user: @student_2
    create :follower, section: @section, student_user: @student_3

    # student_1 and student_2 are in a code review group together
    @code_review_group = create :code_review_group, section: @section
    create :code_review_group_member, follower: student_1_follower, code_review_group: @code_review_group
    create :code_review_group_member, follower: student_2_follower, code_review_group: @code_review_group

    @student_1_project = create :project, owner: @student_1
    @student_2_project = create :project, owner: @student_2
    @student_3_project = create :project, owner: @student_3

    @code_review = create :code_review, user_id: @student_1.id, project_id: @student_1_project.id
  end

  test 'create code review comment' do
    sign_in @student_2

    comment_text = "A comment for code review"
    post :create, params: {
      comment: comment_text,
      codeReviewId: @code_review.id,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    refute_nil response_json['id']
    assert_equal @student_2.name, response_json['commenterName']
    assert_equal comment_text, response_json['comment']
    assert_equal false, response_json['isResolved']
    refute_nil response_json['createdAt']
  end

  test 'cannot create a code review comment for a closed code review' do
    student_2_closed_code_review = create :code_review, user_id: @student_2.id, project_id: @student_2_project.id, closed_at: DateTime.now

    sign_in @student_1

    post :create, params: {
      comment: "A comment on closed code review",
      codeReviewId: student_2_closed_code_review.id,
    }

    assert_response :forbidden
  end

  test 'cannot create a code review comment for someone outside the code review group' do
    code_review_outside_group = create :code_review, user_id: @student_3.id, project_id: @student_3_project.id

    sign_in @student_2

    post :create, params: {
      comment: "A comment on project outside code review group",
      codeReviewId: code_review_outside_group.id,
    }

    assert_response :forbidden
  end

  test 'update resolved for code review comment' do
    review_comment = create :code_review_comment, code_review: @code_review, commenter: @student_2

    sign_in @student_1

    patch :update, params: {
      id: review_comment.id,
      isResolved: true
    }

    assert_response :success
    response_json = JSON.parse(response.body)
    refute_nil response_json['id']
    assert_equal true, response_json['isResolved']
  end

  test 'delete code review comment' do
    review_comment = create :code_review_comment, code_review: @code_review, commenter: @student_2

    sign_in @teacher

    delete :destroy, params: {
      id: review_comment.id
    }

    assert_response :success
  end

  test 'students cannot delete code review comment' do
    review_comment = create :code_review_comment, code_review: @code_review, commenter: @student_2

    sign_in @student_1

    delete :destroy, params: {
      id: review_comment.id
    }

    assert_response :forbidden
  end
end
