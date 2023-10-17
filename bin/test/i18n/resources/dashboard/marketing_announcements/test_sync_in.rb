require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/marketing_announcements/sync_in'

describe I18n::Resources::Dashboard::MarketingAnnouncements::SyncIn do
  let(:described_class) {I18n::Resources::Dashboard::MarketingAnnouncements::SyncIn}
  let(:described_instance) {described_class.new}

  let(:origin_i18n_file_path) {CDO.dir('dashboard/config/marketing/announcements.json')}
  let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/dashboard/marketing_announcements.json')}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#prepare_marketing_announcements_data' do
    let(:origin_marketing_announcements_data) do
      <<~JSON.strip
        {"pages": {"page1": "Test Page"},
         "banners": {
           "banner1": {
             "title": "Banner Title",
             "body": "Banner Body",
             "buttonText": "Button Text"
           }
         }
        }
      JSON
    end

    it 'should prepare marketing announcement banners and write to a JSON file' do
    end
  end

  describe '#perform' do
    let(:process_resource) {described_instance.send(:process)}
    let(:expected_i18n_source_file_content) do
      <<~JSON.strip
        {
          "banners": {
            "banner1": {
              "title": "Banner Title",
              "body": "Banner Body",
              "buttonText": "Button Text"
            }
          }
        }
      JSON
    end
    let(:expect_i18n_source_file_creation) do
      I18nScriptUtils.expects(:write_file).with(i18n_source_file_path, expected_i18n_source_file_content)
    end

    it 'prepares the i18n source file' do
      execution_sequence = sequence('execution')
      expect_i18n_source_file_creation.in_sequence(execution_sequence)
      process_resource
    end
  end
end
