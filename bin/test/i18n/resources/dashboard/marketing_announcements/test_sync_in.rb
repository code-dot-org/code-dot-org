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

  describe '#process' do
    let(:run_process) {described_instance.process}

    let(:banner_id) {'expected_banner_id'}
    let(:banner_title) {'expected_banner_title'}
    let(:banner_body) {'expected_banner_body'}
    let(:banner_button_text) {'expected_banner_buttonText'}

    let(:origin_marketing_announcements_data) do
      {
        'unexpected_key' => 'unexpected_val',
        'banners' => {
          banner_id => {
            'unexpected_attr' => 'unexpected_val',
            'title' => banner_title,
            'body' => banner_body,
            'buttonText' => banner_button_text,
          }
        }
      }
    end

    before do
      FileUtils.mkdir_p File.dirname(origin_i18n_file_path)
      File.write origin_i18n_file_path, JSON.dump(origin_marketing_announcements_data)
    end

    it 'prepares marketing announcement banners and write to a JSON file' do
      expected_i18n_source_file_content = <<~JSON.strip
          {
          "banners": {
            "#{banner_id}": {
              "title": "#{banner_title}",
              "body": "#{banner_body}",
              "buttonText": "#{banner_button_text}"
            }
          }
        }
      JSON

      run_process

      assert File.exist?(i18n_source_file_path)
      assert_equal expected_i18n_source_file_content, File.read(i18n_source_file_path)
    end
  end
end
