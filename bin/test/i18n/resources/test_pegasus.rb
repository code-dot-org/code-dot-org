require_relative '../../test_helper'
require_relative '../../../i18n/resources/pegasus'

describe I18n::Resources::Pegasus do
  let(:described_class) {I18n::Resources::Pegasus}

  describe '.sync_in' do
    it 'sync-in Pegasus resources' do
      execution_sequence = sequence('execution')

      described_class::HourOfCode.expects(:sync_in).in_sequence(execution_sequence)
      described_class::Markdown.expects(:sync_in).in_sequence(execution_sequence)
      described_class::Mobile.expects(:sync_in).in_sequence(execution_sequence)

      described_class.sync_in
    end
  end

  describe '.sync_up' do
    it 'sync-up Pegasus resources' do
      execution_sequence = sequence('execution')

      described_class::HourOfCode.expects(:sync_up).in_sequence(execution_sequence)
      described_class::Markdown.expects(:sync_up).in_sequence(execution_sequence)
      described_class::Mobile.expects(:sync_up).in_sequence(execution_sequence)

      described_class.sync_up
    end
  end

  describe '.sync_out' do
    it 'sync-out Pegasus resources' do
      execution_sequence = sequence('execution')

      described_class::HourOfCode.expects(:sync_out).in_sequence(execution_sequence)
      described_class::Markdown.expects(:sync_out).in_sequence(execution_sequence)
      described_class::Mobile.expects(:sync_out).in_sequence(execution_sequence)

      described_class.sync_out
    end
  end
end
