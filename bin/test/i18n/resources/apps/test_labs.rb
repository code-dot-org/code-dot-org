require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/apps/labs'

describe I18n::Resources::Apps::Labs do
  describe '.sync_in' do
    it 'sync-in Labs (blockly-mooc) resource' do
      I18n::Resources::Apps::Labs::SyncIn.expects(:perform).once

      I18n::Resources::Apps::Labs.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Labs (blockly-mooc) resource' do
      I18n::Resources::Apps::Labs::SyncOut.expects(:perform).once

      I18n::Resources::Apps::Labs.sync_out
    end
  end
end
