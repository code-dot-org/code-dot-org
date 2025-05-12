require 'test_helper'

class AichatAssetHelperTest < ActionView::TestCase
  # Override ASSET_BUCKET with a test double since it's already instantiated in the helper
  # and cannot be easily stubbed. This avoids triggering real S3 calls during tests.
  FAKE_BUCKET = Object.new
  def FAKE_BUCKET.get(channel_id, filename)
    if filename == 'project.png'
      {status: 'FOUND', body: StringIO.new('project content')}
    else
      {status: 'NOT_FOUND'}
    end
  end

  if AichatAssetHelper.const_defined?(:ASSET_BUCKET)
    AichatAssetHelper.send(:remove_const, :ASSET_BUCKET)
  end
  AichatAssetHelper.const_set(:ASSET_BUCKET, FAKE_BUCKET)

  let(:channel_id) {'abc123'}
  let(:level_name) {'level-one'}

  let(:project_asset) {{"filename" => "project.png", "source" => "project"}}
  let(:level_asset)   {{"filename" => "level.png", "source" => "level"}}
  let(:missing_asset) {{"filename" => "missing.png", "source" => "level"}}

  before do
    LevelStarterAssetsHelper.stubs(:get_object).returns(
      OpenStruct.new(get: OpenStruct.new(body: StringIO.new("level content for uuid-123")))
    )

    Level.stubs(:find_by).with(name: level_name).returns(
      OpenStruct.new(
        starter_assets: {'level.png' => 'uuid-123'},
        project_template_level: nil
      )
    )
  end

  describe '.get_asset_data_uri (unit)' do
    subject {AichatAssetHelper.get_asset_data_uri(asset, channel_id, level_name)}

    context 'when fetch_asset returns FOUND' do
      let(:asset) {project_asset}

      before do
        AichatAssetHelper.stubs(:fetch_asset).with("project.png", "project", channel_id, level_name).returns(
          {status: 'FOUND', body: StringIO.new("stubbed content")}
        )
      end

      it 'returns a base64-encoded data URI' do
        subject.must_match(/^data:image\/png;base64,/)
        Base64.decode64(subject.split(',').last).must_equal "stubbed content"
      end
    end

    context 'when fetch_asset returns NOT_FOUND' do
      let(:asset) {missing_asset}

      before do
        AichatAssetHelper.stubs(:fetch_asset).with("missing.png", "level", channel_id, level_name).returns({status: 'NOT_FOUND'})
      end

      it 'raises an error' do
        err = -> {subject}.must_raise(StandardError)
        err.message.must_include "Error fetching asset"
        err.message.must_include "missing.png"
        err.message.must_include channel_id
        err.message.must_include level_name
        err.message.must_include "NOT_FOUND"
      end
    end
  end

  describe '.fetch_asset (unit)' do
    subject {AichatAssetHelper.fetch_asset(filename, source, channel_id, level_name)}

    context 'when source is level and asset exists' do
      let(:filename) {level_asset["filename"]}
      let(:source)   {level_asset["source"]}

      it 'returns FOUND with content' do
        subject[:status].must_equal 'FOUND'
        subject[:body].read.must_equal 'level content for uuid-123'
      end
    end

    context 'when source is level and asset is missing' do
      let(:filename) {missing_asset["filename"]}
      let(:source)   {missing_asset["source"]}

      before do
        Level.stubs(:find_by).with(name: level_name).returns(
          OpenStruct.new(starter_assets: {}, project_template_level: nil)
        )
      end

      it 'returns NOT_FOUND' do
        subject[:status].must_equal 'NOT_FOUND'
      end
    end

    context 'when source is project and asset exists' do
      let(:filename) {project_asset["filename"]}
      let(:source)   {project_asset["source"]}

      it 'returns FOUND with content' do
        subject[:status].must_equal 'FOUND'
        subject[:body].read.must_equal 'project content'
      end
    end

    context 'when source is project and asset is missing' do
      let(:filename) {'nonexistent.png'}
      let(:source)   {'project'}

      it 'returns NOT_FOUND response' do
        result = AichatAssetHelper.fetch_asset(filename, source, channel_id, level_name)
        result[:status].must_equal 'NOT_FOUND'
      end
    end
  end

  describe '.get_asset_data_uri (integration)' do
    subject {AichatAssetHelper.get_asset_data_uri(asset, channel_id, level_name)}

    context 'with a valid project asset' do
      let(:asset) {project_asset}

      it 'returns a base64-encoded data URI' do
        subject.must_match(/^data:image\/png;base64,/)
        Base64.decode64(subject.split(',').last).must_equal 'project content'
      end
    end

    context 'with a valid level asset' do
      let(:asset) {level_asset}

      it 'returns a base64-encoded data URI' do
        subject.must_match(/^data:image\/png;base64,/)
        Base64.decode64(subject.split(',').last).must_equal 'level content for uuid-123'
      end
    end

    context 'with a missing asset' do
      let(:asset) {missing_asset}

      before do
        Level.stubs(:find_by).with(name: level_name).returns(
          OpenStruct.new(starter_assets: {}, project_template_level: nil)
        )
      end

      it 'raises a StandardError' do
        -> {subject}.must_raise(StandardError)
      end
    end
  end
end
