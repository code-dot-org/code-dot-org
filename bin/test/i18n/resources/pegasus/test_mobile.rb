require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/pegasus/mobile'

describe I18n::Resources::Pegasus::Mobile do
  describe '.sync_in' do
    it 'sync-in Mobile resource' do
      I18n::Resources::Pegasus::Mobile::SyncIn.expects(:perform).once

      I18n::Resources::Pegasus::Mobile.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Mobile resource' do
      I18n::Resources::Pegasus::Mobile::SyncOut.expects(:perform).once

      I18n::Resources::Pegasus::Mobile.sync_out
    end
  end
end
