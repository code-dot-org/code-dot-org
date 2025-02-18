require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/mobile/sync_up'

describe I18n::Resources::Pegasus::Mobile::SyncUp do
  let(:described_class) {I18n::Resources::Pegasus::Mobile::SyncUp}
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
        CDO.dir('i18n/locales/source/pegasus/mobile.json'),
      ]
    end

    let(:unexpected_source_files) do
      [
        CDO.dir('i18n/locales/source/pegasus/unexpected.json'),
        CDO.dir('i18n/locales/source/pegasus/unexpected.yaml'),
        CDO.dir('i18n/locales/source/pegasus/unexpected.yml'),
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
