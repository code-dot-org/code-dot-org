require 'test_helper'

class CodeReviewCommentsControllerTest < ActionController::TestCase
  test 'can create CodeReviewComment' do
    channel_token = create :channel_token
    commenter = create :teacher

    post :create, params: {
      code_review_comment: {
        channel_token_id: channel_token.id,
        project_version: 'a_project_version_string',
        commenter_id: commenter.id,
        comment: 'a comment'
      }
    }

    assert_response :success
  end
end
