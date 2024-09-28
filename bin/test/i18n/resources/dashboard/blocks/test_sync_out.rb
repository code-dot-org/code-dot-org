require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/blocks/sync_out'

describe I18n::Resources::Dashboard::Blocks::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::Blocks::SyncOut}
  let(:described_instance) {described_class.new}

  let(:lang_locale) {'expected_locale'}
  let(:language) {{locale_s: lang_locale}}

  let(:target_i18n_file_path) {CDO.dir('dashboard/config/locales', "blocks.#{lang_locale}.json")}
  let(:i18n_file_path) {CDO.dir('i18n/locales', lang_locale, 'dashboard/blocks.json')}
  let(:crowdin_file_path) {CDO.dir('i18n/crowdin', lang_locale, 'dashboard/blocks.json')}
  let(:crowdin_file_data) do
    {
      'expected_block' => {
        'options' => {
          'option_1' => {
            'expected_key_1' => 'expected_option_1'
          },
          'option_2' => {
            'expected_key_2' => 'expected_option_2'
          }
        },
        'text' => 'expected_block_text',
      }
    }
  end

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#process' do
    let(:process_language) {described_instance.process(language)}

    before do
      FileUtils.mkdir_p(File.dirname(crowdin_file_path))
      File.write crowdin_file_path, JSON.dump(crowdin_file_data)
    end

    let(:expect_locale_wrapping) do
      I18nScriptUtils.expects(:to_dashboard_i18n_data).with(lang_locale, 'blocks', crowdin_file_data).
        returns({lang_locale => {'data' => {'blocks' => crowdin_file_data}}})
    end
    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:sanitize_data_and_write).with(
        {lang_locale => {'data' => {'blocks' => crowdin_file_data}}}, target_i18n_file_path
      )
    end
    let(:expect_crowdin_file_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:move_file).with(crowdin_file_path, i18n_file_path)
    end
    let(:expect_crowdin_resource_dir_removing) do
      I18nScriptUtils.expects(:remove_empty_dir).with(File.dirname(crowdin_file_path))
    end

    it 'distributes the localization to dashboard' do
      execution_sequence = sequence('execution')

      # Distribution
      expect_locale_wrapping.in_sequence(execution_sequence)
      expect_localization_distribution.in_sequence(execution_sequence)
      expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)
      expect_crowdin_resource_dir_removing.in_sequence(execution_sequence)

      process_language
    end

    context 'when the Crowdin file does not exist' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not wrap translations with locale, data, blocks' do
        expect_locale_wrapping.never
        process_language
      end

      it 'does not distribute the localization' do
        expect_localization_distribution.never
        process_language
      end

      it 'does not move Crowdin files to the i18n locale dir' do
        expect_crowdin_file_to_i18n_locale_dir_moving.never
        process_language
      end

      it 'does not try to remove the Crowdin resource dir' do
        expect_crowdin_resource_dir_removing.never
        process_language
      end
    end
  end
end
