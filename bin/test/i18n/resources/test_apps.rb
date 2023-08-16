require_relative '../../test_helper'
require_relative '../../../i18n/resources/apps'

class I18n::Resources::AppsTest < Minitest::Test
  def test_sync_in
    exec_seq = sequence('execution')

    I18n::Resources::Apps::Animations.expects(:sync_in).in_sequence(exec_seq)
    I18n::Resources::Apps::ExternalSources.expects(:sync_in).in_sequence(exec_seq)
    I18n::Resources::Apps::Labs.expects(:sync_in).in_sequence(exec_seq)

    I18n::Resources::Apps.sync_in
  end
end
