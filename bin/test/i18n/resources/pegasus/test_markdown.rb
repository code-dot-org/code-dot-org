require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/pegasus/markdown'

describe I18n::Resources::Pegasus::Markdown do
  describe '.sync_in' do
    it 'sync-in Markdown resource' do
      I18n::Resources::Pegasus::Markdown::SyncIn.expects(:perform).once

      I18n::Resources::Pegasus::Markdown.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Markdown resource' do
      I18n::Resources::Pegasus::Markdown::SyncOut.expects(:perform).once

      I18n::Resources::Pegasus::Markdown.sync_out
    end
  end
end
