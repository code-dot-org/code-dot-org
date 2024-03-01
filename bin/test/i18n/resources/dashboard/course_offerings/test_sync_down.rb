require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/course_offerings/sync_down'

describe I18n::Resources::Dashboard::CourseOfferings::SyncDown do
  let(:described_class) {I18n::Resources::Dashboard::CourseOfferings::SyncDown}
  let(:described_instance) {described_class.new}

  it 'inherits from I18n::Utils::SyncDownBase' do
    _(described_class.superclass).must_equal I18n::Utils::SyncDownBase
  end
end
