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
          current: false,
          description: "Information about different cat breeds",
          name: "cats",
          published: true
        }
      ],
      categories: [
        {
          datasets: [
            "cats"
          ],
          description: "description",
          name: "Animals",
          published: true
        }
      ]
    }
  end

  test 'update_manifest: can update manifest' do
    post :update_manifest, params: {manifest: @test_manifest.to_json}
    assert_response :success

    assert_equal JSON.parse(@test_manifest.to_json), DatablockStorageLibraryManifest.instance.library_manifest
  end
end
