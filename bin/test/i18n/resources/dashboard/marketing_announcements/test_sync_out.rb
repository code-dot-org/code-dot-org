require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/marketing_announcements/sync_out'

describe I18n::Resources::Dashboard::MarketingAnnouncements::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::CurriculumContent::SyncOut}
  let(:described_instance) {described_class.new}

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end
end
