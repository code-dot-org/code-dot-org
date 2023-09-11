require_relative '../../test_helper'
require_relative '../../../i18n/resources/apps'

describe I18n::Resources::Apps do
  describe '.sync_in' do
    it 'sync-in Apps resources' do
      exec_seq = sequence('execution')

      I18n::Resources::Apps::Animations.expects(:sync_in).in_sequence(exec_seq)
      I18n::Resources::Apps::ExternalSources.expects(:sync_in).in_sequence(exec_seq)
      I18n::Resources::Apps::Labs.expects(:sync_in).in_sequence(exec_seq)

      I18n::Resources::Apps.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Apps resources' do
      exec_seq = sequence('execution')

      I18n::Resources::Apps::Animations.expects(:sync_out).in_sequence(exec_seq)
      I18n::Resources::Apps::ExternalSources.expects(:sync_out).in_sequence(exec_seq)
      I18n::Resources::Apps::Labs.expects(:sync_out).in_sequence(exec_seq)

      I18n::Resources::Apps.sync_out
    end
  end
end
