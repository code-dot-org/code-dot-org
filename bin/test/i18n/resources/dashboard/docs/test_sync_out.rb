require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/docs/sync_out'

describe I18n::Resources::Dashboard::Docs::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::Docs::SyncOut}
  let(:described_instance) {described_class.new}

  let(:programming_env) {'expected_programming_env'}

  let(:crowdin_locale) {'expected_crowdin_locale'}
  let(:i18n_locale) {'expected_i18n_locale'}
  let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}

  let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale, 'docs')}
  let(:i18n_locale_dir) {CDO.dir('i18n/locales', i18n_locale, 'docs')}

  let(:crowdin_file_path) {CDO.dir('i18n/locales', crowdin_locale, "docs/#{programming_env}.json")}
  let(:i18n_original_file_path) {CDO.dir("i18n/locales/original/docs/#{programming_env}.json")}
  let(:target_i18n_file_path) {CDO.dir('dashboard/config/locales', "programming_environments.#{i18n_locale}.json")}

  around do |test|
    DatabaseCleaner.start
    FakeFS.with_fresh {test.call}
    DatabaseCleaner.clean
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#progress' do
    let(:process_language) {described_instance.process(language)}

    before do
      FileUtils.mkdir_p(crowdin_locale_dir)
      I18nScriptUtils.stubs(:source_lang?).with(language).returns(false)
    end

    let(:expect_localization_distribution) do
      described_instance.expects(:distribute_localization).with(language)
    end
    let(:expect_crowdin_files_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:rename_dir).with(crowdin_locale_dir, i18n_locale_dir)
    end

    it 'distributes the language localization and then moves Crowdin files to the i18n locale dir' do
      execution_sequence = sequence('execution')

      expect_localization_distribution.in_sequence(execution_sequence)
      expect_crowdin_files_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

      process_language
    end

    context 'when the language is the source language' do
      before do
        I18nScriptUtils.expects(:source_lang?).with(language).returns(true)
      end

      it 'does not distribute the localization' do
        expect_localization_distribution.never
        process_language
      end

      it 'moves Crowdin files to the i18n locale dir' do
        expect_crowdin_files_to_i18n_locale_dir_moving.once
        process_language
      end
    end

    context 'when the Crowdin locale dir does not exists' do
      before do
        FileUtils.rm_r(crowdin_locale_dir)
      end

      it 'does not distribute the localization' do
        expect_localization_distribution.never
        process_language
      end

      it 'does not move Crowdin files to the i18n locale dir' do
        expect_crowdin_files_to_i18n_locale_dir_moving.never
        process_language
      end
    end
  end

  describe '#distribute_localization' do
    let(:distribute_language_localization) {described_instance.send(:distribute_localization, language)}

    let(:other_programming_env) {'other_programming_env'}
    let(:translatable_programming_envs) {[programming_env, other_programming_env]}

    let(:programming_env_i18n_data) {{programming_env => 'expected_programming_env_i18n_data'}}
    let(:other_programming_env_i18n_data) {{other_programming_env => 'expected_other_programming_env_i18n_data'}}
    let(:programming_envs_i18n_data) {{**programming_env_i18n_data, **other_programming_env_i18n_data}}
    let(:new_programming_env_i18n_data) {{programming_env => 'expected_new_programming_env_i18n_data'}}
    let(:new_programming_envs_i18n_data) {new_programming_env_i18n_data}

    around do |tests|
      described_class.stub_const(:TRANSLATABLE_PROGRAMMING_ENVS, translatable_programming_envs) {tests.call}
    end

    before do
      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      FileUtils.touch(crowdin_file_path)

      described_instance.stubs(:new_programming_envs_i18n_data).with(crowdin_file_path).returns(new_programming_envs_i18n_data)
      described_instance.stubs(:programming_envs_i18n_data).with(target_i18n_file_path).returns(programming_envs_i18n_data)
    end

    it 'distributes the language localization' do
      expected_dashboard_i18n_data = {
        i18n_locale => {
          'data' => {
            'programming_environments' => {
              **new_programming_env_i18n_data,
              **other_programming_env_i18n_data,
            }
          }
        }
      }

      I18nScriptUtils.expects(:sanitize_data_and_write).with(expected_dashboard_i18n_data, target_i18n_file_path).once

      distribute_language_localization
    end

    context 'when the programing env is not translatable' do
      let(:translatable_programming_envs) {[other_programming_env]}

      it 'does not distribute the language localization' do
        I18nScriptUtils.expects(:sanitize_data_and_write).with(anything, target_i18n_file_path).never
        distribute_language_localization
      end
    end
  end

  describe '#new_programming_envs_i18n_data' do
    let(:new_programming_envs_i18n_data) {described_instance.send(:new_programming_envs_i18n_data, crowdin_file_path)}

    it 'returns restored Crowdin file data' do
      expected_new_programming_envs_i18n_data = 'expected_new_programming_envs_i18n_data'

      RedactRestoreUtils.expects(:restore).with(
        i18n_original_file_path, crowdin_file_path, crowdin_file_path, %w[visualCodeBlock link resourceLink]
      ).once.returns(expected_new_programming_envs_i18n_data)

      assert_equal expected_new_programming_envs_i18n_data, new_programming_envs_i18n_data
    end
  end

  describe '#programming_envs_i18n_data' do
    let(:programming_envs_i18n_data) {described_instance.send(:programming_envs_i18n_data, target_i18n_file_path)}

    let(:expected_programming_envs_i18n_data) {'expected_programming_envs_i18n_data'}
    let(:target_i18n_file_data) do
      {
        i18n_locale => {
          'data' => {
            'programming_environments' => expected_programming_envs_i18n_data
          }
        }
      }
    end

    before do
      FileUtils.mkdir_p File.dirname(target_i18n_file_path)
      File.write(target_i18n_file_path, JSON.dump(target_i18n_file_data))
    end

    it 'returns existing programming envs i18n data' do
      assert_equal expected_programming_envs_i18n_data, programming_envs_i18n_data
    end

    context 'when the programming envs i18n data does not exist' do
      let(:expected_programming_envs_i18n_data) {nil}

      it 'returns empty hash' do
        assert_equal({}, programming_envs_i18n_data)
      end
    end

    context 'when the i18n data does not exist' do
      let(:target_i18n_file_data) {{}}

      it 'returns empty hash' do
        assert_equal({}, programming_envs_i18n_data)
      end
    end

    context 'when the target i18n file does not exist' do
      before do
        FileUtils.rm(target_i18n_file_path)
      end

      it 'returns empty hash' do
        assert_equal({}, programming_envs_i18n_data)
      end
    end
  end
end
