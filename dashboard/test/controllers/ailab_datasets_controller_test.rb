require 'test_helper'

class AilabDatasetsControllerTest < ActionDispatch::IntegrationTest
  CSV = "Name,Legs\nRex,4\nTweety,2\n".freeze
  METADATA = {name: 'birds', card: {source: 'A test'}, fields: [{id: 'Name'}, {id: 'Legs', type: 'numerical'}]}.freeze

  setup do
    @dir = Pathname.new(Dir.mktmpdir)
    AilabDatasets.stubs(:content_dir).returns(@dir.join('stored'))
    AilabDatasets.reset_cache!
    Rails.application.config.stubs(:levelbuilder_mode).returns(true)
    @upload = @dir.join('upload.csv')
    @upload.write(CSV)
  end

  teardown do
    AilabDatasets.reset_cache!
    FileUtils.remove_entry(@dir)
  end

  test "create requires a levelbuilder" do
    sign_in create(:teacher)
    post '/ailab_datasets', params: dataset_params
    assert_response :forbidden
    assert_nil AilabDatasets.stored('birds')
  end

  test "create is refused outside levelbuilder mode" do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns(false)
    post '/ailab_datasets', params: dataset_params
    assert_response :forbidden
    assert_nil AilabDatasets.stored('birds')
  end

  test "create saves the dataset and returns its manifest entry" do
    sign_in create(:levelbuilder)
    post '/ailab_datasets', params: dataset_params(name: ' Birds ', is_toy: 'true')
    assert_response :success

    entry = AilabDatasets.stored('birds')
    assert_equal entry, response.parsed_body
    assert_equal({'id' => 'birds', 'name' => 'Birds', 'isToy' => true, 'rowCount' => 2}, entry.except('path', 'metadataPath'))
    assert_equal CSV, AilabDatasets.csv_file('birds').read
    assert_equal METADATA.deep_stringify_keys, JSON.parse(AilabDatasets.metadata_file('birds').read)
  end

  test "create rejects parameters that are not a dataset" do
    sign_in create(:levelbuilder)
    {
      {id: 'my birds', metadata: '{"name": "my birds"}'} => 'ID: use only letters, numbers, hyphens and underscores',
      {name: ' '} => 'Name: must not be blank',
      {row_count: '1'} => 'Row count: must be 2 or more',
      {csv: 'Name,Legs'} => 'CSV: must be a file',
      {metadata: '{"name": "birds"'} => 'Metadata: is not valid JSON',
      {metadata: '["birds"]'} => 'Metadata: must be a JSON object',
      {metadata: '{"name": "ants"}'} => 'Metadata: the name "ants" is not the dataset ID',
    }.each do |changes, error|
      post '/ailab_datasets', params: dataset_params(**changes)
      assert_response :unprocessable_entity, changes.to_s
      assert_equal [error], response.parsed_body['errors']
    end
    refute @dir.join('stored').exist?
  end

  test "csv and metadata give the files of a stored dataset to all users" do
    AilabDatasets.save(id: 'birds', name: 'Birds', is_toy: false, row_count: 2, csv: CSV, metadata: METADATA)

    get '/ailab_datasets/birds/csv'
    assert_response :success
    assert_equal 'text/csv', response.media_type
    assert_equal CSV, response.body

    get '/ailab_datasets/birds/metadata'
    assert_response :success
    assert_equal 'application/json', response.media_type
    assert_equal METADATA.deep_stringify_keys, response.parsed_body
  end

  test "csv and metadata 404 for a dataset that is not stored" do
    get '/ailab_datasets/zoo/csv'
    assert_response :not_found
    get '/ailab_datasets/zoo/metadata'
    assert_response :not_found
  end

  private def dataset_params(**changes)
    {
      id: 'birds',
      name: 'Birds',
      is_toy: 'false',
      row_count: '2',
      csv: Rack::Test::UploadedFile.new(@upload.to_s, 'text/csv'),
      metadata: METADATA.to_json,
    }.merge(changes)
  end
end
