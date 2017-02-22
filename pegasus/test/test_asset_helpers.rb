require_relative '../../deployment'
require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

CDO.dashboard_assets_dir = './test/fixtures/dashboard_assets'
require_relative '../helpers/asset_helpers'

class AssetHelpersTest < Minitest::Test
  UNMINIFIED_ASSET_NAME = 'js/teacher-dashboard/index.js'
  UNMINIFIED_ASSET_PATH = "#{CDO.studio_url}/assets/js/teacher-dashboard/index-ef90e2acd9003ff8b8bac522e6ce107da641d3b85aba5f58c77d5d28f77a496a.js"
  MINIFIED_ASSET_PATH = "#{CDO.studio_url}/assets/js/teacher-dashboard/index.min-5bb3b68c6f92cf8409eb7d0649cf572ffa0c66fca1b02b887b4454cab553daef.js"

  def test_asset_map_pretty
    CDO.stub(:pretty_js, true) do
      assert_equal UNMINIFIED_ASSET_PATH, asset_path(UNMINIFIED_ASSET_NAME), "incorrect unminified asset path"
      # Should return the unminified path because pretty_js is true
      assert_equal UNMINIFIED_ASSET_PATH, minifiable_asset_path(UNMINIFIED_ASSET_NAME), "incorrect minified asset path"
    end
  end

  def test_asset_map_ugly
    CDO.stub(:pretty_js, false) do
      assert_equal UNMINIFIED_ASSET_PATH, asset_path(UNMINIFIED_ASSET_NAME), "incorrect unminified asset path"
      assert_equal MINIFIED_ASSET_PATH, minifiable_asset_path(UNMINIFIED_ASSET_NAME), "incorrect minified asset path"
    end
  end
end
