require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/scripts/sync_down'

describe I18n::Resources::Dashboard::Scripts::SyncDown do
  let(:described_class) {I18n::Resources::Dashboard::Scripts::SyncDown}
  let(:described_instance) {described_class.new}

  it 'inherits from I18n::Utils::SyncDownBase' do
    _(described_class.superclass).must_equal I18n::Utils::SyncDownBase
  end
end
