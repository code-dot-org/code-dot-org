require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/external_sources/sync_up'

describe I18n::Resources::Apps::ExternalSources::SyncUp do
  let(:described_class) {I18n::Resources::Apps::ExternalSources::SyncUp}

  it 'inherits from I18n::Utils::SyncUpBase' do
    assert_equal I18n::Utils::SyncUpBase, described_class.superclass
  end

  describe '.config' do
    let(:config) {described_class.send(:config)}

    describe '#crowdin_project' do
      let(:crowdin_project) {config.crowdin_project}

      it 'returns correct Crowdin project' do
        assert_equal 'codeorg', crowdin_project
      end
    end

    describe '#source_paths' do
      let(:source_paths) {config.source_paths}

      it 'returns correct file paths' do
        expected_source_paths = [
          CDO.dir('i18n/locales/source/external-sources/**/*.{json,yml}'),
          CDO.dir('i18n/locales/source/blockly-core/**/*.{json,yml}'),
        ]

        assert_equal expected_source_paths, source_paths
      end
    end
  end
end
