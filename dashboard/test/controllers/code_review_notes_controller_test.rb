require 'test_helper'

class CodeReviewNotesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @project_owner = create :student
    @peer = create :student
    @storage_id = create_storage_id_for_user(@project_owner.id)
    @channel_id = create :project, storage_id: @storage_id
    _,  @project_id = storage_decrypt_channel_id(@channel_id)

    script_id = 12
    level_id = 5
    @code_review_request = create :code_review, user_id: @project_owner.id, project_id: @project_id,
      script_id: script_id, level_id: level_id, closed_at: nil
  end

  setup do
    sign_in @peer
  end

  test 'create code review note' do
    comment_text = "A note for code review"
    post :create, params: {
      comment: comment_text,
      codeReviewId: @code_review_request.id,
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
