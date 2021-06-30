require 'test_helper'

class CodeReviewCommentsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    # @pilot_teacher = create :teacher
    # create(:single_user_experiment, min_user_id: @pilot_teacher.id, name: 'csa-pilot')

    @project_owner = create :student
    @project_owner_channel_id = 'encrypted_channel_id'

    # CodeReviewCommentsController.any_instance.stubs(:storage_decrypt_channel_id).with(@project_owner_channel_id).returns([123, 456])
    # CodeReviewCommentsController.any_instance.stubs(:user_id_for_storage_id).with(123).returns(@project_owner.id)

    @teacher = create :teacher
    @section = create :section, user: @teacher
  end

  #setup {sign_in @pilot_teacher}
  setup do
    CodeReviewCommentsController.any_instance.stubs(:storage_decrypt_channel_id).with(@project_owner_channel_id).returns([123, 456])
    CodeReviewCommentsController.any_instance.stubs(:user_id_for_storage_id).with(123).returns(@project_owner.id)
  end

  test 'student can create CodeReviewComment on their own project' do
    sign_in @project_owner

    post :create, params: {
      channel_id: @project_owner_channel_id,
      project_version: 'a_project_version_string',
      comment: 'a comment'
    }

    assert_response :success
  end

  test 'student not in same section with project owner cannot comment on project' do
    unrelated_student = create :student
    sign_in unrelated_student

    post :create, params: {
      channel_id: @project_owner_channel_id,
      project_version: 'a_project_version_string',
      comment: 'a comment'
    }

    assert_response :forbidden
  end

  test 'student in same section with project owner can comment on project' do
    same_section_student = create :student

    [@project_owner, same_section_student].each do |student|
      create :follower, student_user: student, section: @section
    end

    sign_in same_section_student

    post :create, params: {
      channel_id: @project_owner_channel_id,
      project_version: 'a_project_version_string',
      comment: 'a comment'
    }

    assert_response :success
  end

  test 'teacher can create CodeReviewComment for student in their section' do
    create :follower, student_user: @project_owner, section: @section
    sign_in @teacher

    post :create, params: {
      channel_id: @project_owner_channel_id,
      project_version: 'a_project_version_string',
      comment: 'a comment'
    }

    assert_response :success
  end

  test 'teacher cannot create CodeReviewComment for student not in their section' do
    sign_in @teacher

    post :create, params: {
      channel_id: @project_owner_channel_id,
      project_version: 'a_project_version_string',
      comment: 'a comment'
    }

    assert_response :forbidden
  end
  #
  # test 'can delete CodeReviewComment' do
  #   code_review_comment = create :code_review_comment
  #
  #   assert_not_nil CodeReviewComment.find_by(id: code_review_comment.id)
  #
  #   delete :destroy, params: {
  #     id: code_review_comment.id
  #   }
  #
  #   assert_response :success
  #   assert_nil CodeReviewComment.find_by(id: code_review_comment.id)
  # end
  #
  # test 'can get all comments for a given project and version' do
  #   project_identifiers = {
  #     storage_app_id: 1234,
  #     project_version: 'test_get_project_comments_string'
  #   }
  #
  #   2.times do
  #     create :code_review_comment, project_identifiers
  #   end
  #
  #   # Create third code review comment from another project
  #   # to make sure we only fetch the correct set of comments.
  #   create :code_review_comment
  #
  #   get :project_comments, params: project_identifiers
  #
  #   assert_response :success
  #   assert_equal 2, JSON.parse(response.body).length
  # end
  #
  # test 'responds successfully for project with no comments' do
  #   channel_token = create :channel_token
  #
  #   get :project_comments, params: {
  #     channel_token_id: channel_token.id,
  #     project_version: 'test_get_project_comments_string'
  #   }
  #
  #   assert_response :success
  #   assert_empty JSON.parse(response.body)
  # end
  #
  # test 'can mark comment as resolved' do
  #   code_review_comment = create :code_review_comment
  #
  #   assert_nil code_review_comment.is_resolved
  #
  #   patch :resolve, params: {
  #     id: code_review_comment.id
  #   }
  #
  #   assert_response :success
  #   assert code_review_comment.reload.is_resolved
  # end
end
