require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/pegasus/emails'

describe I18n::Resources::Pegasus::Emails do
  describe '.sync_in' do
    it 'sync-in emails resource' do
      I18n::Resources::Pegasus::Emails::SyncIn.expects(:perform).once

      I18n::Resources::Pegasus::Emails.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out emails resource' do
      I18n::Resources::Pegasus::Emails::SyncOut.expects(:perform).once

      I18n::Resources::Pegasus::Emails.sync_out
    end
  end
end
