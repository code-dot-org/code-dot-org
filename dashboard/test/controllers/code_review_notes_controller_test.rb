require 'test_helper'

class CodeReviewNotesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = false

  setup_all do
    @project_owner = create :student
    @peer = create :student
    @teacher = create :teacher
    @section = create :section, code_review_expires_at: Time.now.utc + 1.day, teacher: @teacher
    student_follower = create :follower, section: @section, student_user: @project_owner
    peer_follower = create :follower, section: @section, student_user: @peer

    @code_review_group = create :code_review_group, section: @section
    create :code_review_group_member, follower: student_follower, code_review_group: @code_review_group
    create :code_review_group_member, follower: peer_follower, code_review_group: @code_review_group

    @project = create :project, owner: @project_owner

    @code_review = create :code_review, user_id: @project_owner.id, project_id: @project.id
  end

  test 'create code review comment' do
    sign_in @peer

    comment_text = "A comment for code review"
    post :create, params: {
      comment: comment_text,
      codeReviewId: @code_review.id,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_not_nil response_json['id']
    assert_equal @peer.name, response_json['commenterName']
    assert_equal comment_text, response_json['comment']
    assert_equal false, response_json['isResolved']
    assert_not_nil response_json['createdAt']
  end

  test 'cannot create a code review note for a closed code review' do
    another_student = create :student
    another_student_follower = create :follower, section: @section, student_user: another_student
    create :code_review_group_member, follower: another_student_follower, code_review_group: @code_review_group
    another_student_project = create :project, owner: another_student

    closed_code_review = create :code_review, user_id: another_student.id, project_id: another_student_project.id, closed_at: DateTime.now

    sign_in @peer

    post :create, params: {
      comment: "A comment on closed code review",
      codeReviewId: closed_code_review.id,
    }

    assert_response :forbidden
  end

  test 'cannot create a code review note for someone outside the code review group' do
    student_outside_group = create :student
    create :follower, section: @section, student_user: student_outside_group
    outside_group_project = create :project, owner: student_outside_group

    code_review_outside_group = create :code_review, user_id: student_outside_group.id, project_id: outside_group_project.id

    sign_in @peer

    post :create, params: {
      comment: "A comment on project outside code review group",
      codeReviewId: code_review_outside_group.id,
    }

    assert_response :forbidden
  end

  test 'update resolved for code review comment' do
    review_note = create :code_review_note, code_review: @code_review, commenter: @peer

    sign_in @project_owner

    patch :update, params: {
      id: review_note.id,
      isResolved: true
    }

    assert_response :success
    response_json = JSON.parse(response.body)
    assert_not_nil response_json['id']
    assert_equal true, response_json['isResolved']
  end

  test 'delete code review comment' do
    review_note = create :code_review_note, code_review: @code_review, commenter: @peer

    sign_in @teacher

    delete :destroy, params: {
      id: review_note.id
    }

    assert_response :success
  end

  test 'students cannot delete code review comment' do
    review_note = create :code_review_note, code_review: @code_review, commenter: @peer

    sign_in @project_owner

    delete :destroy, params: {
      id: review_note.id
    }

    assert_response :forbidden
  end
end
