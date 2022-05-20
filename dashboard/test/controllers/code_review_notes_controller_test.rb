require 'test_helper'

class CodeReviewNotesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = false

  setup_all do
    @project_owner = create :student
    @peer = create :student
    @project = create :project, owner: @project_owner

    script_id = 12
    level_id = 5
    @code_review = create :code_review, user_id: @project_owner.id, project_id: @project.id
  end

  setup do
    sign_in @peer
  end

  test 'create code review comment' do
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
end
