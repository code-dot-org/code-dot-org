require_relative './test_helper'
require_relative '../helpers/asset_helpers'

class AssetHelpersTest < Minitest::Test
  ASSET_NAME = 'js/public/abcxyz/index.js'.freeze
  ASSET_PATH = "/assets/js/public/abcxyz/index.js".freeze
  DIGESTED_ASSET_PATH = "/assets/js/public/abcxyz/"\
    'index-ef90e2acd9003ff8b8bac522e6ce107da641d3b85aba5f58c77d5d28f77a496a.js'.freeze
  MINIFIED_DIGESTED_ASSET_PATH = "/assets/js/public/abcxyz/"\
    'index.min-5bb3b68c6f92cf8409eb7d0649cf572ffa0c66fca1b02b887b4454cab553daef.js'.freeze
  ASSET_NOT_IN_MAP = 'foo.js'.freeze
  MINIFIED_ASSET_NOT_IN_MAP = 'foo.min.js'.freeze
  ASSET_PATH_NOT_IN_MAP = "/assets/foo.js".freeze

  def setup
    CDO.stubs(:dashboard_assets_dir).returns('./test/fixtures/dashboard_assets')
    @asset_map = AssetMap.clone.instance
  end

  def test_asset_map_pretty
    CDO.stubs(:pretty_js).returns(true)
    assert_equal ASSET_PATH, @asset_map.asset_path(ASSET_NAME),
      "incorrect unminifiable asset path"
    # Should return the unminified path because pretty_js is true
    assert_equal ASSET_PATH, @asset_map.minifiable_asset_path(ASSET_NAME),
      "incorrect minifiable asset path"
  end

  def test_asset_map_ugly
    CDO.stubs(:pretty_js).returns(false)
    assert_equal DIGESTED_ASSET_PATH, @asset_map.asset_path(ASSET_NAME),
      "incorrect unminifiable asset path"
    assert_equal MINIFIED_DIGESTED_ASSET_PATH, @asset_map.minifiable_asset_path(ASSET_NAME),
      "incorrect minifiable asset path"
  end

  def test_missing_asset_map_without_pretty_js_raises
    # This directory does not have a manifest file in it.
    # Update the asset map to be nil.
    CDO.stubs(:dashboard_assets_dir).returns('./test/fixtures/')
    @asset_map = AssetMap.clone.instance
    CDO.stubs(:pretty_js).returns(false)

    e = assert_raises RuntimeError do
      @asset_map.asset_path(ASSET_NAME)
    end
    assert_equal 'Asset map not initialized', e.message

    e = assert_raises RuntimeError do
      @asset_map.minifiable_asset_path(ASSET_NAME)
    end
    assert_equal 'Asset map not initialized', e.message
  end

  def test_missing_asset_map_with_pretty_js_succeeds
    # This directory does not have a manifest file in it.
    # Update the asset map to be nil.
    CDO.stubs(:dashboard_assets_dir).returns('./test/fixtures/')
    @asset_map = AssetMap.clone.instance
    CDO.stubs(:pretty_js).returns(true)
    assert_equal ASSET_PATH, @asset_map.asset_path(ASSET_NAME),
      "should recover gracefully when no asset map for unminifiable asset"
    assert_equal ASSET_PATH, @asset_map.minifiable_asset_path(ASSET_NAME),
      "should recover gracefully when no asset map for minifiable asset"
  end

  def test_asset_not_in_map_without_pretty_js_raises
    CDO.stubs(:pretty_js).returns(false)

    e = assert_raises RuntimeError do
      @asset_map.asset_path(ASSET_NOT_IN_MAP)
    end
    assert_equal "Asset not found in asset map: '#{ASSET_NOT_IN_MAP}'", e.message

    e = assert_raises RuntimeError do
      @asset_map.minifiable_asset_path(ASSET_NOT_IN_MAP)
    end
    assert_equal "Asset not found in asset map: '#{MINIFIED_ASSET_NOT_IN_MAP}'", e.message
  end

  def test_asset_not_in_map_with_pretty_js_succeeds
    CDO.stubs(:pretty_js).returns(true)
    assert_equal ASSET_PATH_NOT_IN_MAP, @asset_map.asset_path(ASSET_NOT_IN_MAP),
      "should recover gracefully when unminifiable asset is not found"
    assert_equal ASSET_PATH_NOT_IN_MAP, @asset_map.minifiable_asset_path(ASSET_NOT_IN_MAP),
      "should recover gracefully when minifiable asset is not found"
  end
end
