require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/course_offerings/sync_in'

describe I18n::Resources::Dashboard::CourseOfferings::SyncIn do
  let(:sync_in) {I18n::Resources::Dashboard::CourseOfferings::SyncIn.new}

  around do |test|
    DatabaseCleaner.start
    FakeFS.with_fresh {test.call}
    DatabaseCleaner.clean
  end

  before do
    STDOUT.stubs(:print)
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Dashboard::CourseOfferings::SyncIn.any_instance.expects(:execute).once

      I18n::Resources::Dashboard::CourseOfferings::SyncIn.perform
    end
  end

  describe '#execute' do
    let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/dashboard/course_offerings.json')}

    before do
      CourseOffering.destroy_all
    end

    it 'prepares the i18n source file' do
      FactoryBot.create(:course_offering, key: 'i18n-key-2', display_name: 'i18n-val-1')
      FactoryBot.create(:course_offering, key: 'i18n-key-1', display_name: 'i18n-val-2')

      sync_in.execute

      assert File.exist?(i18n_source_file_path)
      assert_equal %Q[{\n  "i18n-key-1": "i18n-val-2",\n  "i18n-key-2": "i18n-val-1"\n}], File.read(i18n_source_file_path)
    end
  end
end
