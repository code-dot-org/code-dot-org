require 'test_helper'

class CodeReviewCommentsControllerTest < ActionController::TestCase
  setup_all do
    @pilot_teacher = create :teacher
    create(:single_user_experiment, min_user_id: @pilot_teacher.id, name: 'csa-pilot')
  end

  test 'can create CodeReviewComment' do
    sign_in(@pilot_teacher)

    channel_token = create :channel_token
    commenter = create :teacher

    post :create, params: {
      channel_token_id: channel_token.id,
      project_version: 'a_project_version_string',
      commenter_id: commenter.id,
      comment: 'a comment'
    }

    assert_response :success
  end

  test 'can delete CodeReviewComment' do
    sign_in(@pilot_teacher)

    code_review_comment = create :code_review_comment

    assert_not_nil CodeReviewComment.find_by(id: code_review_comment.id)

    delete :destroy, params: {
      id: code_review_comment.id
    }

    assert_response :success
    assert_nil CodeReviewComment.find_by(id: code_review_comment.id)
  end

  test 'can get all comments for a given project and version' do
    sign_in(@pilot_teacher)

    channel_token = create :channel_token

    2.times do
      create :code_review_comment,
        channel_token: channel_token,
        project_version: 'test_get_project_comments_string'
    end

    # Create third code review comment from another project
    # to make sure we only fetch the correct set of comments.
    create :code_review_comment

    get :project_comments, params: {
      channel_token_id: channel_token.id,
      project_version: 'test_get_project_comments_string'
    }

    assert_response :success
    assert_equal 2, JSON.parse(response.body).length
  end

  test 'renders successfully for project with no comments' do
    sign_in(@pilot_teacher)

    channel_token = create :channel_token

    get :project_comments, params: {
      channel_token_id: channel_token.id,
      project_version: 'test_get_project_comments_string'
    }

    assert_response :success
    assert_empty JSON.parse(response.body)
  end

  test 'can mark comment as resolved' do
    sign_in(@pilot_teacher)

    code_review_comment = create :code_review_comment

    assert_nil code_review_comment.is_resolved

    patch :resolve, params: {
      id: code_review_comment.id
    }

    assert_response :success
    assert code_review_comment.reload.is_resolved
  end
end
