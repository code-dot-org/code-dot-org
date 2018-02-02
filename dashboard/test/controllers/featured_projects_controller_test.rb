require 'test_helper'

class FeaturedProjectsControllerTest < ActionController::TestCase
  setup do
    @project_validator = create :project_validator
  end

  test 'project validators can feature projects' do
    sign_in @project_validator
    @controller.stubs (:storage_decrypt_channel_id).returns(["storage", "channel"])
    put :feature, params: {project_id: "123456"}
    assert_response :success
  end
end
