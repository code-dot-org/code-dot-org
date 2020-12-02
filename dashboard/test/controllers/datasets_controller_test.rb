require 'test_helper'
require 'firebase'

class DatasetsControllerTest < ActionController::TestCase
  setup do
    @levelbuilder = create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder
    @test_manifest = {
      tables: [
        {
          "current": false,
          "description": "Information about different cat breeds",
          "name": "cats",
          "published": true
        }
      ],
      categories: [
        {
          "datasets": [
            "cats"
          ],
          "description": "description",
          "name": "Animals",
          "published": true
        }
      ]
    }
  end

  test 'update_manifest: can update manifest' do
    test_response = mock
    test_response.expects(:code).returns(200)
    FirebaseHelper.any_instance.stubs(:set_library_manifest).returns(test_response)
    post :update_manifest, params: {manifest: @test_manifest.to_json}
    assert_response :success
  end

  test 'update_manifest: passes through the error code' do
    test_response = mock
    test_response.expects(:code).returns(401)
    FirebaseHelper.any_instance.stubs(:set_library_manifest).returns(test_response)
    post :update_manifest, params: {manifest: @test_manifest.to_json}
    assert_response :unauthorized
  end
end
