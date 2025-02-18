require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/musiclab_libraries/sync_up'

describe I18n::Resources::Apps::MusiclabLibraries::SyncUp do
  let(:described_class) {I18n::Resources::Apps::MusiclabLibraries::SyncUp}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncUpBase' do
    assert_equal I18n::Utils::SyncUpBase, described_class.superclass
  end

  describe '#source_files' do
    let(:source_files) {described_instance.send(:source_files)}

    let(:expected_source_files) do
      [
        CDO.dir('i18n/locales/source/musiclab_libraries/music-library-intro2024.json'),
        CDO.dir('i18n/locales/source/musiclab_libraries/music-library-launch2024.json'),
      ]
    end

    let(:unexpected_source_files) do
      [
        CDO.dir('i18n/locales/source/musiclab_libraries/unexpected.json'),
        CDO.dir('i18n/locales/source/musiclab_libraries/unexpected.yaml'),
        CDO.dir('i18n/locales/source/musiclab_libraries/unexpected.yml'),
      ]
    end

    before do
      expected_source_files.each do |expected_source_file|
        FileUtils.mkdir_p File.dirname(expected_source_file)
        FileUtils.touch expected_source_file
      end

      unexpected_source_files.each do |unexpected_source_file|
        FileUtils.mkdir_p File.dirname(unexpected_source_file)
        FileUtils.touch unexpected_source_file
      end
    end

    it 'returns correct source files' do
      assert_equal expected_source_files, source_files
    end
  end
end
