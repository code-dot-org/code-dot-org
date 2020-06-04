require 'test_helper'

class ApplabTest < ActiveSupport::TestCase
  test 'add_starter_asset! saves key-value pair in level properties' do
    level = create :applab
    assert_nil level.starter_assets

    level.add_starter_asset!("my-file.png", "12345.png")
    level.reload
    expected_assets = {"my-file.png" => "12345.png"}
    assert_equal expected_assets, level.starter_assets

    level.add_starter_asset!("file with spaces.png", "54321.png")
    level.reload
    expected_assets["file with spaces.png"] = "54321.png"
    assert_equal expected_assets, level.starter_assets

    # Overwrite "my-file.png" starter asset
    level.add_starter_asset!("my-file.png", "6789.png")
    level.reload
    expected_assets["my-file.png"] = "6789.png"
    assert_equal expected_assets, level.starter_assets
  end

  test 'add_starter_asset! raises if level fails to save' do
    level = create :applab
    level.expects(:valid?).returns(false)

    assert_raises ActiveRecord::RecordInvalid do
      level.add_starter_asset!("my-file.png", "123.png")
    end
  end

  test 'remove_starter_asset! returns true if starter_assets are nil' do
    level = create :applab
    level.expects(:save).never
    assert_nil level.starter_assets

    assert level.remove_starter_asset!('non-existent-asset.png')
  end

  test 'remove_starter_asset! deletes key-value pair from starter_assets' do
    key = 'my-key.png'
    level = create :applab, starter_assets: {key => '123-abc.png'}
    assert_equal 1, level.starter_assets.length

    successful_save = level.remove_starter_asset!(key)
    level.reload

    assert successful_save
    assert_nil level.starter_assets
  end
end
