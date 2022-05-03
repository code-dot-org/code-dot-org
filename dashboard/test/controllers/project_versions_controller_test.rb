require 'test_helper'

class ProjectVersionsControllerTest < ActionController::TestCase
  test "can create project version" do
    student = create :student
    sign_in student

    fake_storage_id = 123
    fake_project_id = 654
    fake_channel_id = 'abcdef'
    @controller.expects(:user_id_for_storage_id).with(fake_storage_id).returns(student.id)
    @controller.expects(:storage_decrypt_channel_id).with(fake_channel_id).returns([fake_storage_id, fake_project_id])

    assert_creates(ProjectVersion) do
      post :create, params: {storage_id: fake_channel_id, version_id: 'fghj', comment: 'This is a comment'}
    end
    project_version = ProjectVersion.find_by(project_id: fake_project_id, object_version_id: 'fghj')
    assert_not_nil project_version
    assert_equal 'This is a comment', project_version.comment
  end

  test "can fetch project versions" do
    student = create :student
    sign_in student

    fake_storage_id = 123
    fake_project_id = 654
    fake_channel_id = 'abcdef'
    @controller.expects(:user_id_for_storage_id).with(fake_storage_id).returns(student.id)
    @controller.expects(:storage_decrypt_channel_id).with(fake_channel_id).returns([fake_storage_id, fake_project_id])

    create :project_version, project_id: fake_project_id, comment: "First comment", created_at: 2.days.ago
    create :project_version, project_id: fake_project_id, comment: "Second comment", created_at: 1.day.ago
    create :project_version, project_id: fake_project_id, comment: "Third comment"

    get :project_commits, params: {channel_id: fake_channel_id}
    assert_response :ok

    returned_commits = JSON.parse(@response.body)
    assert_equal 3, returned_commits.length
    assert_equal ['Third comment', 'Second comment', 'First comment'], returned_commits.map {|c| c['comment']}
  end
end
