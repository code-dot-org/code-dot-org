require 'test_helper'

class AdaptivePathwaysControllerTest < ActionDispatch::IntegrationTest
  SAMPLE = "{\n  \"id\": \"sample\",   \"title\": \"Sample\"\n}\n".freeze

  setup do
    @dir = Pathname.new(Dir.mktmpdir)
    @dir.join('sample.json').write(SAMPLE)
    AdaptiveContent.stubs(:content_dir).returns(@dir)
    AdaptiveContent.reset_cache!
    Rails.application.config.stubs(:levelbuilder_mode).returns(true)
    sign_in create(:levelbuilder)
  end

  teardown do
    AdaptiveContent.reset_cache!
    FileUtils.remove_entry(@dir)
  end

  test "show returns the file's text unchanged" do
    get '/adaptive_pathways/sample'
    assert_response :success
    assert_equal 'application/json', response.media_type
    assert_equal SAMPLE, response.body
  end

  test "show and update 404 for a pathway with no file" do
    get '/adaptive_pathways/missing'
    assert_response :not_found
    put '/adaptive_pathways/missing', params: '{"id": "missing"}', headers: json_headers
    assert_response :not_found
    refute @dir.join('missing.json').exist?
  end

  test "update writes the submitted text" do
    put '/adaptive_pathways/sample', params: "{\"id\": \"sample\",\r\n \"title\": \"Edited\"}", headers: json_headers
    assert_response :no_content
    assert_equal "{\"id\": \"sample\",\n \"title\": \"Edited\"}\n", @dir.join('sample.json').read
  end

  test "update rejects content that is not a pathway for this id" do
    ['{"id": "sample",', '[{"id": "sample"}]', '{"id": "other"}'].each do |text|
      put '/adaptive_pathways/sample', params: text, headers: json_headers
      assert_response :unprocessable_entity, text
      assert_equal 1, response.parsed_body['errors'].length, text
    end
    assert_equal SAMPLE, @dir.join('sample.json').read
  end

  test "update is refused outside levelbuilder mode" do
    Rails.application.config.stubs(:levelbuilder_mode).returns(false)
    put '/adaptive_pathways/sample', params: '{"id": "sample"}', headers: json_headers
    assert_response :forbidden
    assert_equal SAMPLE, @dir.join('sample.json').read
  end

  test "requires a levelbuilder" do
    sign_in create(:teacher)
    get '/adaptive_pathways/sample'
    assert_response :forbidden
    put '/adaptive_pathways/sample', params: '{"id": "sample"}', headers: json_headers
    assert_response :forbidden
    assert_equal SAMPLE, @dir.join('sample.json').read
  end

  private def json_headers
    {'CONTENT_TYPE' => 'application/json'}
  end
end
