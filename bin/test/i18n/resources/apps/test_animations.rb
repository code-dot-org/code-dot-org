require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/apps/animations'

class I18n::Resources::Apps::AnimationsTest < Minitest::Test
  def test_sync_in
    I18n::Resources::Apps::Animations::SyncIn.expects(:perform).once

    I18n::Resources::Apps::Animations.sync_in
  end

  def test_sync_out
    I18n::Resources::Apps::Animations::SyncOut.expects(:perform).once

    I18n::Resources::Apps::Animations.sync_out
  end
end
