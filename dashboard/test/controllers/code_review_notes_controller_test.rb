require 'test_helper'

class CodeReviewNotesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = false

  setup_all do
    @project_owner = create :student
    @peer = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    student_follower = create :follower, section: section, student_user: @project_owner
    peer_follower = create :follower, section: section, student_user: @peer

    code_review_group = create :code_review_group, section: section
    create :code_review_group_member, follower: student_follower, code_review_group: code_review_group
    create :code_review_group_member, follower: peer_follower, code_review_group: code_review_group

    @project = create :project, owner: @project_owner

    script_id = 12
    level_id = 5
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
end
