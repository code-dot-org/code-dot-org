require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/course_offerings/sync_out'

describe I18n::Resources::Dashboard::CourseOfferings::SyncOut do
  let(:sync_out) {I18n::Resources::Dashboard::CourseOfferings::SyncOut.new}

  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Dashboard::CourseOfferings::SyncOut.any_instance.expects(:execute).once
      I18n::Resources::Dashboard::CourseOfferings::SyncOut.perform
    end
  end

  describe '#execute' do
    let(:crowdin_locale) {'Not English'}
    let(:i18n_locale) {'not-EN'}

    let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale)}
    let(:crowdin_file_path) {File.join(crowdin_locale_dir, 'dashboard/course_offerings.json')}
    let(:crowdin_file_data) {{'i18n_key' => 'i18n_val'}}

    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:sanitize_data_and_write).with(
        {i18n_locale => {'data' => {'course_offerings' => crowdin_file_data}}},
        CDO.dir('dashboard/config/locales', "course_offerings.#{i18n_locale}.json")
      )
    end
    let(:expect_crowdin_file_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:move_file).with(
        crowdin_file_path, CDO.dir('i18n/locales', i18n_locale, 'dashboard/course_offerings.json')
      )
    end
    let(:expect_empty_crowdin_locale_dir_removing) do
      I18nScriptUtils.expects(:remove_empty_dir).with(crowdin_locale_dir)
    end

    before do
      PegasusLanguages.stubs(:get_crowdin_name_and_locale).returns([{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}])

      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      File.write(crowdin_file_path, crowdin_file_data.to_json)
    end

    it 'distributes the localization' do
      execution_sequence = sequence('execution')

      expect_localization_distribution.in_sequence(execution_sequence)
      expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)
      expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

      sync_out.execute
    end

    context 'when the Crowdin file does not exist' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not try to distribute the localization' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.never
        expect_crowdin_file_to_i18n_locale_dir_moving.never
        expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

        sync_out.execute
      end
    end

    context 'when the locale is en-US' do
      let(:crowdin_locale) {'English'}
      let(:i18n_locale) {'en-US'}

      it 'does not distribute the localization' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.never
        expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)
        expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

        sync_out.execute
      end
    end
  end
end
