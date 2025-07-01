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

  describe '.get_asset_base64_string (unit)' do
    subject {AichatAssetHelper.get_asset_base64_string(filename, source, channel_id, level_name)}

    context 'when fetch_asset succeeds' do
      let(:filename) {project_asset["filename"]}
      let(:source) {project_asset["source"]}

      before do
        AichatAssetHelper.stubs(:fetch_asset).with("project.png", "project", channel_id, level_name).returns(
          "stubbed content"
        )
      end

      it 'returns a base64-encoded string' do
        Base64.decode64(subject).must_equal "stubbed content"
      end
    end
  end

  describe '.get_asset_data_uri (unit)' do
    subject {AichatAssetHelper.get_asset_data_uri(filename, source, channel_id, level_name)}

    context 'when fetch_asset succeeds' do
      let(:filename) {project_asset["filename"]}
      let(:source) {project_asset["source"]}

      before do
        AichatAssetHelper.stubs(:fetch_asset).with("project.png", "project", channel_id, level_name).returns(
          "stubbed content"
        )
      end

      it 'returns a base64-encoded data URI' do
        subject.must_match(/^data:image\/png;base64,/)
        Base64.decode64(subject.split(',').last).must_equal "stubbed content"
      end
    end
  end

  describe '.fetch_asset (unit)' do
    subject {AichatAssetHelper.fetch_asset(filename, source, channel_id, level_name)}

    context 'when source is level and file exists' do
      let(:filename) {level_asset["filename"]}
      let(:source)   {level_asset["source"]}

      it 'returns level content' do
        subject.must_equal 'level content for uuid-123'
      end
    end

    context 'when source is level and file is missing' do
      let(:filename) {missing_asset["filename"]}
      let(:source)   {missing_asset["source"]}

      before do
        Level.stubs(:find_by).with(name: level_name).returns(
          OpenStruct.new(starter_assets: {}, project_template_level: nil)
        )
      end

      it 'raises an AichatLevelAssetFetchError' do
        err = -> {subject}.must_raise(AichatAssetHelper::AichatLevelAssetFetchError)
        err.message.must_include "missing.png"
        err.message.must_include channel_id
        err.message.must_include level_name
      end
    end

    context 'when source is project and file exists' do
      let(:filename) {project_asset["filename"]}
      let(:source)   {project_asset["source"]}

      it 'returns project content' do
        subject.must_equal 'project content'
      end
    end

    context 'when source is project and file is missing' do
      let(:filename) {'nonexistent.png'}
      let(:source)   {'project'}

      it 'raises an AichatProjectAssetFetchError' do
        err = -> {subject}.must_raise(AichatAssetHelper::AichatProjectAssetFetchError)
        err.message.must_include "nonexistent.png"
        err.message.must_include channel_id
        err.message.must_include level_name
      end
    end
  end

  describe '.get_asset_data_uri (integration)' do
    subject {AichatAssetHelper.get_asset_data_uri(filename, source, channel_id, level_name)}

    context 'with a valid project filename' do
      let(:filename) {project_asset["filename"]}
      let(:source) {project_asset["source"]}

      it 'returns a base64-encoded data URI' do
        subject.must_match(/^data:image\/png;base64,/)
        Base64.decode64(subject.split(',').last).must_equal 'project content'
      end
    end

    context 'with a valid level filename' do
      let(:filename) {level_asset["filename"]}
      let(:source) {level_asset["source"]}

      it 'returns a base64-encoded data URI' do
        subject.must_match(/^data:image\/png;base64,/)
        Base64.decode64(subject.split(',').last).must_equal 'level content for uuid-123'
      end
    end

    context 'with a missing level file' do
      let(:filename) {missing_asset["filename"]}
      let(:source) {missing_asset["source"]}

      before do
        Level.stubs(:find_by).with(name: level_name).returns(
          OpenStruct.new(starter_assets: {}, project_template_level: nil)
        )
      end

      it 'raises an AichatLevelAssetFetchError' do
        -> {subject}.must_raise(AichatAssetHelper::AichatLevelAssetFetchError)
      end
    end
  end
end
