require_relative './test_helper'
require_relative '../helpers/asset_helpers'

class AssetHelpersTest < Minitest::Test
  UNMINIFIED_ASSET_NAME = 'js/public/abcxyz/index.js'.freeze
  UNDIGESTED_ASSET_PATH = "/assets/js/public/abcxyz/index.js".freeze
  UNMINIFIED_ASSET_PATH = "/assets/js/public/abcxyz/"\
    'index-ef90e2acd9003ff8b8bac522e6ce107da641d3b85aba5f58c77d5d28f77a496a.js'.freeze
  MINIFIED_ASSET_PATH = "/assets/js/public/abcxyz/"\
    'index.min-5bb3b68c6f92cf8409eb7d0649cf572ffa0c66fca1b02b887b4454cab553daef.js'.freeze
  UNMINIFIED_ASSET_NOT_IN_MAP = 'foo.js'.freeze
  MINIFIED_ASSET_NOT_IN_MAP = 'foo.min.js'.freeze
  UNDIGESTED_ASSET_PATH_NOT_IN_MAP = "/assets/foo.js".freeze

  def setup
    CDO.stubs(:dashboard_assets_dir).returns('./test/fixtures/dashboard_assets')
    @asset_map = AssetMap.clone.instance
  end

  def test_asset_map_pretty
    CDO.stubs(:pretty_js).returns(true)
    assert_equal UNDIGESTED_ASSET_PATH, @asset_map.asset_path(UNMINIFIED_ASSET_NAME),
      "incorrect unminifiable asset path"
    # Should return the unminified path because pretty_js is true
    assert_equal UNDIGESTED_ASSET_PATH, @asset_map.minifiable_asset_path(UNMINIFIED_ASSET_NAME),
      "incorrect minifiable asset path"
  end

  def test_asset_map_ugly
    CDO.stubs(:pretty_js).returns(false)
    assert_equal UNMINIFIED_ASSET_PATH, @asset_map.asset_path(UNMINIFIED_ASSET_NAME),
      "incorrect unminifiable asset path"
    assert_equal MINIFIED_ASSET_PATH, @asset_map.minifiable_asset_path(UNMINIFIED_ASSET_NAME),
      "incorrect minifiable asset path"
  end

  def test_no_asset_map
    # This directory does not have a manifest file in it.
    # Update the asset map to be nil.
    CDO.stubs(:dashboard_assets_dir).returns('./test/fixtures/')
    @asset_map = AssetMap.clone.instance
    CDO.stubs(:pretty_js).returns(false)

    e = assert_raises RuntimeError do
      @asset_map.asset_path(UNMINIFIED_ASSET_NAME)
    end
    assert_equal 'Asset map not initialized', e.message

    e = assert_raises RuntimeError do
      @asset_map.minifiable_asset_path(UNMINIFIED_ASSET_NAME)
    end
    assert_equal 'Asset map not initialized', e.message
  end

  def test_skip_flag_when_no_asset_map
    # This directory does not have a manifest file in it.
    # Update the asset map to be nil.
    CDO.stubs(:dashboard_assets_dir).returns('./test/fixtures/')
    @asset_map = AssetMap.clone.instance
    CDO.stubs(:pretty_js).returns(true)
    assert_equal UNDIGESTED_ASSET_PATH, @asset_map.asset_path(UNMINIFIED_ASSET_NAME),
      "should recover gracefully when no asset map for unminifiable asset"
    assert_equal UNDIGESTED_ASSET_PATH, @asset_map.minifiable_asset_path(UNMINIFIED_ASSET_NAME),
      "should recover gracefully when no asset map for minifiable asset"
  end

  def test_asset_not_in_map
    CDO.stubs(:pretty_js).returns(false)

    e = assert_raises RuntimeError do
      @asset_map.asset_path(UNMINIFIED_ASSET_NOT_IN_MAP)
    end
    assert_equal "Asset not found in asset map: '#{UNMINIFIED_ASSET_NOT_IN_MAP}'", e.message

    e = assert_raises RuntimeError do
      @asset_map.minifiable_asset_path(UNMINIFIED_ASSET_NOT_IN_MAP)
    end
    assert_equal "Asset not found in asset map: '#{MINIFIED_ASSET_NOT_IN_MAP}'", e.message
  end

  def test_skip_flag_when_asset_not_in_map
    CDO.stubs(:pretty_js).returns(true)
    assert_equal UNDIGESTED_ASSET_PATH_NOT_IN_MAP, @asset_map.asset_path(UNMINIFIED_ASSET_NOT_IN_MAP),
      "should recover gracefully when unminifiable asset is not found"
    assert_equal UNDIGESTED_ASSET_PATH_NOT_IN_MAP, @asset_map.minifiable_asset_path(UNMINIFIED_ASSET_NOT_IN_MAP),
      "should recover gracefully when minifiable asset is not found"
  end
end
