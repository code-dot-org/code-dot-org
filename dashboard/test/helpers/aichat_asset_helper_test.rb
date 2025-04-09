require 'test_helper'
class AichatAssetHelperTest < ActionView::TestCase
  # Set up a fake bucket object with a .get method
  FAKE_BUCKET = Object.new
  def FAKE_BUCKET.get(channel_id, filename)
    if filename == 'project.png'
      {status: 'FOUND', body: StringIO.new('project content')}
    else
      {status: 'NOT_FOUND'}
    end
  end

  # Replace ASSET_BUCKET constant safely
  if AichatAssetHelper.const_defined?(:ASSET_BUCKET)
    AichatAssetHelper.send(:remove_const, :ASSET_BUCKET)
  end
  AichatAssetHelper.const_set(:ASSET_BUCKET, FAKE_BUCKET)

  def setup
    @channel_id = 'abc123'
    @level_name = 'level-one'

    @project_asset = {"filename" => "project.png", "source" => "project"}
    @level_asset   = {"filename" => "level.png", "source" => "level"}

    LevelStarterAssetsHelper.stubs(:get_object).returns(
      OpenStruct.new(get: OpenStruct.new(body: StringIO.new("level content for uuid-123")))
    )

    # ✅ Stub Level return object
    Level.stubs(:find_by).with(name: @level_name).returns(
      OpenStruct.new(
        starter_assets: {'level.png' => 'uuid-123'},
        project_template_level: nil
      )
    )
  end

  test 'returns base64 data URI for project asset' do
    result = AichatAssetHelper.get_asset_data_uri(@project_asset, @channel_id, @level_name)
    assert_match(/^data:image\/png;base64,/, result)
    decoded = Base64.decode64(result.split(',').last)
    assert_equal 'project content', decoded
  end

  test 'returns base64 data URI for level asset' do
    result = AichatAssetHelper.get_asset_data_uri(@level_asset, @channel_id, @level_name)
    assert_match(/^data:image\/png;base64,/, result)
    decoded = Base64.decode64(result.split(',').last)
    assert_equal 'level content for uuid-123', decoded
  end

  test 'raises error if asset is not found' do
    missing_asset = {"filename" => "nonexistent.png", "source" => "level"}
    Level.stubs(:find_by).with(name: @level_name).returns(
      OpenStruct.new(starter_assets: {}, project_template_level: nil)
    )

    assert_raises(StandardError) do
      AichatAssetHelper.get_asset_data_uri(missing_asset, @channel_id, @level_name)
    end
  end
end
