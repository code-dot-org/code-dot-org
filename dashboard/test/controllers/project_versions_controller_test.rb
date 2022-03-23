require 'test_helper'

class ProjectVersionsControllerTest < ActionController::TestCase
  test "can create project version" do
    student = create :student
    sign_in student

    @controller.expects(:storage_decrypt_channel_id).with("abcdef").returns([123, 654])
    assert_creates(ProjectVersion) do
      post :create, params: {storage_id: 'abcdef', version_id: 'fghj', comment: 'This is a comment'}
    end
    project_version = ProjectVersion.find_by(storage_app_id: 654, object_version_id: 'fghj')
    assert_not_nil project_version
    assert_equal 'This is a comment', project_version.comment
  end
end
