require 'test_helper'

class CodeReviewCommentsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @project_owner = create :student
    @another_student = create :student
    @project_owner_channel_id = 'encrypted_channel_id'
    @project_owner_storage_id = 123
    @project_storage_app_id = 456
    @project_version_string = 'special_long_project_version_stringzzzz'

    @teacher = create :teacher
    @section = create :section, user: @teacher
  end

  test 'student can create CodeReviewComment on their own project' do
    stub_storage_apps_calls

    sign_in @project_owner

    post :create, params: {
      channel_id: @project_owner_channel_id,
      project_version: 'a_project_version_string',
      comment: 'a comment'
    }

    assert_response :success
  end

  test 'student not in same section with project owner cannot comment on project' do
    stub_storage_apps_calls

    sign_in @another_student

    post :create, params: {
      channel_id: @project_owner_channel_id,
      project_version: 'a_project_version_string',
      comment: 'a comment'
    }

    assert_response :forbidden
  end

  test 'student in same section with project owner can comment on project' do
    stub_storage_apps_calls

    [@project_owner, @another_student].each do |student|
      create :follower, student_user: student, section: @section
    end

    sign_in @another_student

    post :create, params: {
      channel_id: @project_owner_channel_id,
      project_version: 'a_project_version_string',
      comment: 'a comment'
    }

    assert_response :success
  end

  test 'teacher can create CodeReviewComment for student in their section' do
    stub_storage_apps_calls

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
    stub_storage_apps_calls

    sign_in @teacher

    post :create, params: {
      channel_id: @project_owner_channel_id,
      project_version: 'a_project_version_string',
      comment: 'a comment'
    }

    assert_response :forbidden
  end

  test 'comment creator can update their own comment' do
    code_review_comment = create :code_review_comment, commenter_id: @another_student.id

    sign_in @another_student

    patch :update, params: {
      id: code_review_comment.id,
      comment: 'updated comment'
    }

    assert_response :success
    assert_equal 'updated comment', code_review_comment.reload.comment
  end

  test 'someone who is not comment creator cannot update comment' do
    code_review_comment = create :code_review_comment, commenter_id: @another_student.id

    sign_in @project_owner

    patch :update, params: {
      id: code_review_comment.id,
      comment: 'updated comment'
    }

    assert_response :forbidden
  end

  test 'project owner can resolve comments on their project' do
    code_review_comment = create :code_review_comment,
      commenter_id: @another_student.id,
      project_owner_id: @project_owner.id

    assert_nil code_review_comment.is_resolved

    sign_in @project_owner

    patch :resolve, params: {id: code_review_comment.id}

    assert_response :success
    assert code_review_comment.reload.is_resolved
  end

  test 'someone who is not project owner cannot resolve comments' do
    code_review_comment = create :code_review_comment,
      commenter_id: @another_student.id,
      project_owner_id: @project_owner.id

    assert_nil code_review_comment.is_resolved

    sign_in @another_student

    patch :resolve, params: {id: code_review_comment.id}

    assert_response :forbidden
  end

  test 'teacher can delete CodeReviewComment for projects of students in their section' do
    create :follower, student_user: @project_owner, section: @section
    code_review_comment = create :code_review_comment,
      project_owner_id: @project_owner.id

    sign_in @teacher

    delete :destroy, params: {id: code_review_comment.id}

    assert_response :success
  end

  test 'teacher cannot delete CodeReviewComment for projects of students not in their section' do
    code_review_comment = create :code_review_comment,
      project_owner_id: @project_owner.id

    sign_in @teacher

    delete :destroy, params: {id: code_review_comment.id}

    assert_response :forbidden
  end

  test 'student can delete their own comments' do
  end

  test 'project owner can fetch project comments for their projects' do
    stub_storage_apps_calls

    2.times do
      create :code_review_comment,
        storage_app_id: @project_storage_app_id,
        project_version: @project_version_string,
        project_owner_id: @project_owner.id
    end

    # Create third code review comment from another project
    # to make sure we only fetch the correct set of comments.
    create :code_review_comment

    sign_in @project_owner

    get :project_comments, params: {
      channel_id: @project_owner_channel_id,
      project_version: @project_version_string
    }

    assert_response :success
    assert_equal 2, JSON.parse(response.body).length
  end

  test 'student in same section as project owner can fetch project comments' do
  end

  test 'student not in same sectino as project owner cannot fetch project comments' do
  end

  test 'teacher of section project owner is enrolled in can fetch project comments' do
  end

  test 'teacher cannot fetch project comments if not leading section of project owner' do
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

  private

  def stub_storage_apps_calls
    CodeReviewCommentsController.any_instance.expects(:storage_decrypt_channel_id).with(@project_owner_channel_id).returns([@project_owner_storage_id, @project_storage_app_id])
    CodeReviewCommentsController.any_instance.expects(:user_id_for_storage_id).with(@project_owner_storage_id).returns(@project_owner.id)
  end
end
