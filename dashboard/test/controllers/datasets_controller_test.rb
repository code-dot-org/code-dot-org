require 'test_helper'

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

  # Exceeding max table count allows curriculum writers to add new shared datasets in levelbuilder mode
  test 'update: can exceed max table count for shared tables' do
    original_max_table_count = DatablockStorageTable::MAX_TABLE_COUNT
    DatablockStorageTable.const_set(:MAX_TABLE_COUNT, 1)

    csv_data = <<~CSV
      id,name,age
      1,fluffy,7
    CSV

    post :update, params: {dataset_name: 'cats', csv_data: csv_data}
    assert_response :success

    post :update, params: {dataset_name: 'dogs', csv_data: csv_data}
    assert_response :success

    assert_equal 2, DatablockStorageTable.get_shared_table_names.count
  ensure
    DatablockStorageTable.const_set(:MAX_TABLE_COUNT, original_max_table_count)
  end
end
