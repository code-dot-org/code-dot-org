require_relative '../../test_helper'
require_relative '../../../i18n/resources/apps'

describe I18n::Resources::Apps do
  let(:described_class) {I18n::Resources::Apps}

  describe '.sync_in' do
    it 'sync-in Apps resources' do
      execution_sequence = sequence('execution')

      described_class::Animations.expects(:sync_in).in_sequence(execution_sequence)
      described_class::MusiclabLibraries.expects(:sync_in).in_sequence(execution_sequence)
      described_class::ExternalSources.expects(:sync_in).in_sequence(execution_sequence)
      described_class::Labs.expects(:sync_in).in_sequence(execution_sequence)

      described_class.sync_in
    end
  end

  describe '.sync_up' do
    it 'sync-up Apps resources' do
      execution_sequence = sequence('execution')

      described_class::Animations.expects(:sync_up).in_sequence(execution_sequence)
      described_class::MusiclabLibraries.expects(:sync_up).in_sequence(execution_sequence)
      described_class::ExternalSources.expects(:sync_up).in_sequence(execution_sequence)
      described_class::Labs.expects(:sync_up).in_sequence(execution_sequence)

      described_class.sync_up
    end
  end

  describe '.sync_down' do
    it 'sync-down Apps resources' do
      execution_sequence = sequence('execution')

      described_class::Animations.expects(:sync_down).in_sequence(execution_sequence)
      described_class::MusiclabLibraries.expects(:sync_down).in_sequence(execution_sequence)
      described_class::ExternalSources.expects(:sync_down).in_sequence(execution_sequence)
      described_class::Labs.expects(:sync_down).in_sequence(execution_sequence)

      described_class.sync_down
    end
  end

  describe '.sync_out' do
    it 'sync-out Apps resources' do
      execution_sequence = sequence('execution')

      described_class::Animations.expects(:sync_out).in_sequence(execution_sequence)
      described_class::MusiclabLibraries.expects(:sync_out).in_sequence(execution_sequence)
      described_class::ExternalSources.expects(:sync_out).in_sequence(execution_sequence)
      described_class::Labs.expects(:sync_out).in_sequence(execution_sequence)
      described_class::TextToSpeech.expects(:sync_out).in_sequence(execution_sequence)

      described_class.sync_out
    end
  end
end
