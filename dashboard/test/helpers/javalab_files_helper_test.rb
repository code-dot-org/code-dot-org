require 'test_helper'

class JavalabFilesHelperTest < ActiveSupport::TestCase
  CHANNEL_ID = 'fake-channel-id'

  setup do
    @level = Javalab.create(game_id: 68, level_num: "custom", name: "javalab_files_helper_level")
    AssetBucket.any_instance.stubs(:list).returns([])
  end

  def stub_main_json(main_json)
    source_data = {
      status: 'FOUND',
      body: StringIO.new(main_json),
      version_id: 'fake-version-id',
      last_modified: DateTime.now
    }
    SourceBucket.any_instance.stubs(:get).with(CHANNEL_ID, "main.json").returns(source_data)
  end

  def url_prefix
    JavalabFilesHelper.get_dashboard_url_prefix
  end

  test 'get_project_files strips url-backed entries into assetUrls' do
    stub_main_json(
      {
        source: {
          "Main.java" => {text: "class Main {}", isVisible: true},
          "cat.png" => {text: "", isVisible: true, url: "/v3/assets/#{CHANNEL_ID}/uuid-1.png"},
          "song.mp3" => {text: "", isVisible: true, url: "https://example.com/song.mp3"},
        }
      }.to_json
    )

    files = JavalabFilesHelper.get_project_files(CHANNEL_ID, @level.id)

    main_json = JSON.parse(files["sources"]["main.json"])
    assert_equal ["Main.java"], main_json["source"].keys
    assert_equal "class Main {}", main_json["source"]["Main.java"]["text"]

    # Relative urls are absolutized; absolute urls pass through.
    assert_equal "#{url_prefix}/v3/assets/#{CHANNEL_ID}/uuid-1.png", files["assetUrls"]["cat.png"]
    assert_equal "https://example.com/song.mp3", files["assetUrls"]["song.mp3"]
  end

  test 'get_project_files leaves a url-free legacy main.json semantically unchanged' do
    main_json = {
      source: {
        "Main.java" => {text: "class Main {}", isVisible: true, tabOrder: 0},
        "Hidden.java" => {text: "hidden", isVisible: false},
      }
    }.to_json
    stub_main_json(main_json)

    files = JavalabFilesHelper.get_project_files(CHANNEL_ID, @level.id)
    assert_equal JSON.parse(main_json), JSON.parse(files["sources"]["main.json"])
    assert_empty files["assetUrls"]
  end

  test 'get_project_files leaves malformed or unexpected main.json untouched' do
    ["not json", "{}", {source: "stringified source"}.to_json, ""].each do |blob|
      stub_main_json(blob)
      files = JavalabFilesHelper.get_project_files(CHANNEL_ID, @level.id)
      assert_equal blob, files["sources"]["main.json"]
    end
  end

  test 'get_project_files keeps entries with a blank url' do
    stub_main_json(
      {source: {"odd.png" => {text: "", isVisible: true, url: ""}}}.to_json
    )
    files = JavalabFilesHelper.get_project_files(CHANNEL_ID, @level.id)
    assert_equal ["odd.png"], JSON.parse(files["sources"]["main.json"])["source"].keys
    assert_empty files["assetUrls"]
  end

  test 'source-derived asset urls overwrite the legacy starter-assets mapping entry' do
    @level.add_starter_asset!("cat.png", "uuid-legacy.png")
    stub_main_json(
      {
        source: {
          "cat.png" => {text: "", isVisible: true, url: "/level_starter_assets/#{@level.name}/uuid/uuid-1.png"},
        }
      }.to_json
    )

    files = JavalabFilesHelper.get_project_files(CHANNEL_ID, @level.id)
    assert_equal(
      "#{url_prefix}/level_starter_assets/#{@level.name}/uuid/uuid-1.png",
      files["assetUrls"]["cat.png"]
    )
  end

  test 'get_project_files_with_overrides strips url-backed entries from a hash' do
    sources = {
      "Main.java" => {"text" => "class Main {}", "isVisible" => true},
      "cat.png" => {"text" => "", "isVisible" => true, "url" => "/v3/assets/#{CHANNEL_ID}/uuid-1.png"},
    }

    files = JavalabFilesHelper.get_project_files_with_overrides(sources, @level.id, nil)

    main_json = JSON.parse(files["sources"]["main.json"])
    assert_equal ["Main.java"], main_json["source"].keys
    assert_equal "#{url_prefix}/v3/assets/#{CHANNEL_ID}/uuid-1.png", files["assetUrls"]["cat.png"]
  end

  test 'get_project_files_with_overrides strips url-backed entries from ActionController::Parameters' do
    sources = ActionController::Parameters.new(
      "Main.java" => {"text" => "class Main {}", "isVisible" => true},
      "cat.png" => {"text" => "", "isVisible" => true, "url" => "/v3/assets/#{CHANNEL_ID}/uuid-1.png"}
    )

    files = JavalabFilesHelper.get_project_files_with_overrides(sources, @level.id, nil)

    main_json = JSON.parse(files["sources"]["main.json"])
    assert_equal ["Main.java"], main_json["source"].keys
    assert_equal "class Main {}", main_json["source"]["Main.java"]["text"]
    assert_equal "#{url_prefix}/v3/assets/#{CHANNEL_ID}/uuid-1.png", files["assetUrls"]["cat.png"]
  end

  test 'get_project_files_with_overrides passes string sources through unchanged' do
    files = JavalabFilesHelper.get_project_files_with_overrides("public class Main {}", @level.id, nil)
    assert_equal({source: "public class Main {}"}.to_json, files["sources"]["main.json"])
  end
end
