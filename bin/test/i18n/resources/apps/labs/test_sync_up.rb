require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/labs/sync_up'

describe I18n::Resources::Apps::Labs::SyncUp do
  let(:described_class) {I18n::Resources::Apps::Labs::SyncUp}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncUpBase' do
    assert_equal I18n::Utils::SyncUpBase, described_class.superclass
  end

  describe '#crowdin_project' do
    let(:crowdin_project) {described_instance.send(:crowdin_project)}

    let(:is_testing) {false}

    before do
      described_instance.stubs(:testing?).returns(is_testing)
    end

    it 'returns Crowdin project from config' do
      assert_equal 'codeorg', crowdin_project
    end

    context 'when testing' do
      let(:is_testing) {true}

      it 'returns test Crowdin project from mapping' do
        assert_equal 'codeorg-testing', crowdin_project
      end
    end
  end

  describe '#source_files' do
    let(:source_files) {described_instance.send(:source_files)}

    let(:expected_source_files) do
      [
        CDO.dir('i18n/locales/source/blockly-mooc/aichat.json'),
      ]
    end

    let(:ignored_source_files) do
      [
        CDO.dir('i18n/locales/source/blockly-mooc/mlPlayground.json'),
        CDO.dir('i18n/locales/source/blockly-mooc/calc.json'),
        CDO.dir('i18n/locales/source/blockly-mooc/eval.json'),
        CDO.dir('i18n/locales/source/blockly-mooc/netsim.json'),
      ]
    end

    let(:unexpected_source_files) do
      [
        CDO.dir('i18n/locales/source/unexpected.json'),
        CDO.dir('i18n/locales/source/unexpected.yaml'),
        CDO.dir('i18n/locales/source/unexpected.yml'),
      ]
    end

    before do
      expected_source_files.each do |expected_source_file|
        FileUtils.mkdir_p File.dirname(expected_source_file)
        FileUtils.touch expected_source_file
      end

      ignored_source_files.each do |ignored_source_file|
        FileUtils.mkdir_p File.dirname(ignored_source_file)
        FileUtils.touch ignored_source_file
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
