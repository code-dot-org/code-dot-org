require_relative '../../deployment'
require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

# AssetMap must be re-initialized before each test with CDO.dashboard_assets_dir set properly
require_relative '../helpers/asset_helpers'

class AssetHelpersTest < Minitest::Test
  UNMINIFIED_ASSET_NAME = 'js/teacher-dashboard/index.js'
  UNMINIFIED_ASSET_PATH = "#{CDO.studio_url}/assets/js/teacher-dashboard/index-ef90e2acd9003ff8b8bac522e6ce107da641d3b85aba5f58c77d5d28f77a496a.js"
  MINIFIED_ASSET_PATH = "#{CDO.studio_url}/assets/js/teacher-dashboard/index.min-5bb3b68c6f92cf8409eb7d0649cf572ffa0c66fca1b02b887b4454cab553daef.js"
  UNMINIFIED_ASSET_NOT_IN_MAP = 'foo.js'
  MINIFIED_ASSET_NOT_IN_MAP = 'foo.min.js'

  def setup
    CDO.stub(:dashboard_assets_dir, './test/fixtures/dashboard_assets') do
      Singleton.__init__(AssetMap)
    end
  end

  def test_asset_map_pretty
    CDO.stub(:pretty_js, true) do
      assert_equal UNMINIFIED_ASSET_PATH, asset_path(UNMINIFIED_ASSET_NAME), "incorrect unminifiable asset path"
      # Should return the unminified path because pretty_js is true
      assert_equal UNMINIFIED_ASSET_PATH, minifiable_asset_path(UNMINIFIED_ASSET_NAME), "incorrect minifiable asset path"
    end
  end

  def test_asset_map_ugly
    CDO.stub(:pretty_js, false) do
      assert_equal UNMINIFIED_ASSET_PATH, asset_path(UNMINIFIED_ASSET_NAME), "incorrect unminifiable asset path"
      assert_equal MINIFIED_ASSET_PATH, minifiable_asset_path(UNMINIFIED_ASSET_NAME), "incorrect minifiable asset path"
    end
  end

  def test_production_no_asset_map
    # This directory does not have a manifest file in it
    CDO.stub(:dashboard_assets_dir, './test/fixtures/') do
      Singleton.__init__(AssetMap)
      CDO.stub(:rack_env, :production) do
        CDO.stub(:pretty_js, false) do
          begin
            asset_path(UNMINIFIED_ASSET_NAME)
            raise 'Expected asset_path to raise when asset map not initialized'
          rescue Exception => e
            assert_equal e.message, 'Asset map not initialized'
          end

          begin
            minifiable_asset_path(UNMINIFIED_ASSET_NAME)
            raise 'Expected minifiable_asset_path to raise when asset map not initialized'
          rescue Exception => e
            assert_equal e.message, 'Asset map not initialized'
          end
        end
      end
    end
  end

  def test_development_no_asset_map
    # This directory does not have a manifest file in it
    CDO.stub(:dashboard_assets_dir, './test/fixtures/') do
      Singleton.__init__(AssetMap)
      CDO.stub(:rack_env, :development) do
        CDO.stub(:pretty_js, true) do
          assert_equal UNMINIFIED_ASSET_NAME, asset_path(UNMINIFIED_ASSET_NAME), "should recover gracefully when no asset map for unminifiable asset"
          assert_equal UNMINIFIED_ASSET_NAME, minifiable_asset_path(UNMINIFIED_ASSET_NAME), "should recover gracefully when no asset map for minifiable asset"
        end
      end
    end
  end

  def test_production_asset_not_in_map
    CDO.stub(:rack_env, :production) do
      CDO.stub(:pretty_js, false) do
        begin
          asset_path(UNMINIFIED_ASSET_NOT_IN_MAP)
          raise 'Expected asset_path to raise when asset not found'
        rescue Exception => e
          assert_equal e.message, "Asset not found in asset map: '#{UNMINIFIED_ASSET_NOT_IN_MAP}'"
        end

        begin
          minifiable_asset_path(UNMINIFIED_ASSET_NOT_IN_MAP)
          raise 'Expected minifiable_asset_path to raise when asset not found'
        rescue Exception => e
          assert_equal e.message, "Asset not found in asset map: '#{UNMINIFIED_ASSET_NOT_IN_MAP}'"
        end
      end
    end
  end

  def test_development_asset_not_in_map
    CDO.stub(:rack_env, :development) do
      CDO.stub(:pretty_js, true) do
        assert_equal UNMINIFIED_ASSET_NOT_IN_MAP, asset_path(UNMINIFIED_ASSET_NOT_IN_MAP), "should recover gracefully when unminifiable asset is not found"
        assert_equal MINIFIED_ASSET_NOT_IN_MAP, minifiable_asset_path(UNMINIFIED_ASSET_NOT_IN_MAP), "should recover gracefully when minifiable asset is not found"
      end
    end
  end
end
