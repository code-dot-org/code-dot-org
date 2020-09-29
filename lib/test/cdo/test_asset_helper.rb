require_relative '../test_helper'
require_relative '../../cdo/asset_helper'

class AssetHelpersTest < Minitest::Test
  def setup
    AssetHelper.any_instance.stubs(:webpack_manifest_path).returns('./test/fixtures/webpack-manifest.json')
    @asset_helper = AssetHelper.clone.instance
    CDO.stubs(:optimize_webpack_assets).returns(true)
  end

  def test_valid_asset
    assert_equal(
      '/assets/js/cookieBanner.d90978a8439431440869.min.js',
      @asset_helper.webpack_asset_path('js/cookieBanner.js'),
      "incorrect webpack asset path"
    )
  end

  def test_invalid_asset
    e = assert_raises RuntimeError do
      @asset_helper.webpack_asset_path('invalid.js')
    end
    assert_equal "Invalid webpack asset name: 'invalid.js'", e.message
  end

  def test_missing_manifest
    AssetHelper.any_instance.stubs(:webpack_manifest_path).returns('./test/fixtures/nonexistent.json')
    assert_raises Errno::ENOENT do
      @asset_helper.webpack_asset_path('js/cookieBanner.js')
    end
  end

  def test_valid_asset_with_unoptimized_webpack_assets
    CDO.stubs(:optimize_webpack_assets).returns(false)
    CDO.stubs(:use_my_apps).returns(true)
    assert_equal(
      '/assets/js/cookieBanner.js',
      @asset_helper.webpack_asset_path('js/cookieBanner.js')
    )
  end

  def test_missing_manifest_with_unoptimized_webpack_assets
    CDO.stubs(:optimize_webpack_assets).returns(false)
    CDO.stubs(:use_my_apps).returns(true)
    AssetHelper.any_instance.stubs(:webpack_manifest_path).returns('./test/fixtures/nonexistent.json')
    assert_equal(
      '/assets/js/cookieBanner.js',
      @asset_helper.webpack_asset_path('js/cookieBanner.js')
    )
  end
end
