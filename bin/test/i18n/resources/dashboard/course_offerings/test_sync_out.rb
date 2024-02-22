require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/course_offerings/sync_out'

describe I18n::Resources::Dashboard::CourseOfferings::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::CourseOfferings::SyncOut}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#process' do
    let(:sync_out) {described_instance.process(language)}

    let(:crowdin_locale) {'Not English'}
    let(:i18n_locale) {'not-EN'}
    let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}

    let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale)}
    let(:crowdin_file_path) {File.join(crowdin_locale_dir, 'dashboard/course_offerings.json')}
    let(:crowdin_file_data) {{'i18n_key' => 'i18n_val'}}

    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:sanitize_data_and_write).with(
        {i18n_locale => {'data' => {'course_offerings' => crowdin_file_data}}},
        CDO.dir("dashboard/config/locales/course_offerings.#{i18n_locale}.json")
      )
    end
    let(:expect_crowdin_file_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:move_file).with(
        crowdin_file_path, CDO.dir('i18n/locales', i18n_locale, 'dashboard/course_offerings.json')
      )
    end

    before do
      described_instance.stubs(:languages).returns([language])
      I18n::Metrics.stubs(:report_runtime).yields(nil)

      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      File.write(crowdin_file_path, crowdin_file_data.to_json)
    end

    it 'distributes the localization' do
      execution_sequence = sequence('execution')

      expect_localization_distribution.in_sequence(execution_sequence)
      expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

      sync_out
    end

    context 'when the Crowdin file does not exist' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not try to distribute the localization' do
        expect_localization_distribution.never
        expect_crowdin_file_to_i18n_locale_dir_moving.never

        sync_out
      end
    end
  end
end
