require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/pegasus/hourofcode'

describe I18n::Resources::Pegasus::HourOfCode do
  describe '.sync_in' do
    it 'sync-in HourOfCode resource' do
      I18n::Resources::Pegasus::HourOfCode::SyncIn.expects(:perform).once

      I18n::Resources::Pegasus::HourOfCode.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out HourOfCode resource' do
      I18n::Resources::Pegasus::HourOfCode::SyncOut.expects(:perform).once

      I18n::Resources::Pegasus::HourOfCode.sync_out
    end
  end
end
