require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/standards/sync_out'

describe I18n::Resources::Dashboard::Standards::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::Standards::SyncOut}
  let(:described_instance) {described_class.new}

  let(:crowdin_locale) {'expected_crowdin_locale'}
  let(:i18n_locale) {'expected_i18n_locale'}
  let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}

  let(:standards_i18n_file_path) {CDO.dir('dashboard/config/locales', "standards.#{i18n_locale}.json")}
  let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale, 'standards')}
  let(:i18n_locale_dir) {CDO.dir('i18n/locales', i18n_locale, 'standards')}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#progress' do
    let(:process_language) {described_instance.process(language)}

    before do
      FileUtils.mkdir_p crowdin_locale_dir
    end

    let(:expect_localizations_distribution) do
      described_instance.expects(:distribute_localizations).with(language)
    end
    let(:expect_crowdin_files_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:rename_dir).with(crowdin_locale_dir, i18n_locale_dir)
    end

    it 'distributes the localization' do
      execution_sequence = sequence('execution')

      expect_localizations_distribution.in_sequence(execution_sequence)
      expect_crowdin_files_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

      process_language
    end

    context 'when the language is the source language' do
      before do
        I18nScriptUtils.expects(:source_lang?).with(language).returns(true)
      end

      it 'does not distribute the localization' do
        expect_localizations_distribution.never
        process_language
      end

      it 'moves Crowdin files to the i18n locale dir' do
        expect_crowdin_files_to_i18n_locale_dir_moving.once
        process_language
      end
    end

    context 'when the Crowdin locale directory does not exists' do
      before do
        FileUtils.rm_r(crowdin_locale_dir)
      end

      it 'does not distribute the localization' do
        expect_localizations_distribution.never
        process_language
      end

      it 'does not move Crowdin files to the i18n locale dir' do
        expect_crowdin_files_to_i18n_locale_dir_moving.never
        process_language
      end
    end
  end

  describe '#distribute_localizations' do
    let(:distribute_localizations) {described_instance.send(:distribute_localizations, language)}

    let(:framework_shortcode) {'expected-framework-shortcode'}
    let(:new_framework_name_i18n) {'new_framework_name_i18n'}
    let(:category_shortcode) {'expected-category-shortcode'}
    let(:new_category_desc_i18n) {'new_category_desc_i18n'}
    let(:standard_shortcode) {'expected-standard-shortcode'}
    let(:new_standard_desc_i18n) {'new_standard_desc_i18n'}

    let(:crowdin_file_path) {File.join(crowdin_locale_dir, "#{framework_shortcode}.json")}
    let(:crowdin_file_data) do
      {
        'name' => new_framework_name_i18n,
        'categories' => {
          category_shortcode => {
            'description' => new_category_desc_i18n
          }
        },
        'standards' => {
          standard_shortcode => {
            'description' => new_standard_desc_i18n
          }
        }
      }
    end

    before do
      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      File.write crowdin_file_path, JSON.dump(crowdin_file_data)
    end

    describe 'frameworks localization distribution' do
      let(:frameworks_i18n_file_path) {CDO.dir('dashboard/config/locales', "frameworks.#{i18n_locale}.json")}
      let(:frameworks_i18n_file_data) do
        {
          i18n_locale => {
            'data' => {
              'frameworks' => {
                'unchanged_framework_shortcode' => {
                  'name' => 'unchanged_framework_name_i18n',
                },
                framework_shortcode => {
                  'name' => 'old_framework_name_i18n',
                }
              }
            }
          }
        }
      end

      before do
        FileUtils.mkdir_p File.dirname(frameworks_i18n_file_path)
        File.write frameworks_i18n_file_path, JSON.dump(frameworks_i18n_file_data)
      end

      it 'distributes the frameworks localization' do
        new_frameworks_i18n_file_content = <<~JSON.strip
          {
            "#{i18n_locale}": {
              "data": {
                "frameworks": {
                  "#{framework_shortcode}": {
                    "name": "#{new_framework_name_i18n}"
                  },
                  "unchanged_framework_shortcode": {
                    "name": "unchanged_framework_name_i18n"
                  }
                }
              }
            }
          }
        JSON

        distribute_localizations

        assert_equal new_frameworks_i18n_file_content, File.read(frameworks_i18n_file_path)
      end

      describe 'standard categories localization distribution' do
        let(:categories_i18n_file_path) {CDO.dir('dashboard/config/locales', "standard_categories.#{i18n_locale}.json")}
        let(:categories_i18n_file_data) do
          {
            i18n_locale => {
              'data' => {
                'standard_categories' => {
                  'unchanged_category_shortcode' => {
                    'description' => 'unchanged_category_desc_i18n',
                  },
                  category_shortcode => {
                    'description' => 'old_category_desc_i18n',
                  }
                }
              }
            }
          }
        end

        before do
          FileUtils.mkdir_p File.dirname(categories_i18n_file_path)
          File.write categories_i18n_file_path, JSON.dump(categories_i18n_file_data)
        end

        it 'distributes the standard categories localization' do
          new_categories_i18n_file_content = <<~JSON.strip
            {
              "#{i18n_locale}": {
                "data": {
                  "standard_categories": {
                    "#{category_shortcode}": {
                      "description": "#{new_category_desc_i18n}"
                    },
                    "unchanged_category_shortcode": {
                      "description": "unchanged_category_desc_i18n"
                    }
                  }
                }
              }
            }
          JSON

          distribute_localizations

          assert_equal new_categories_i18n_file_content, File.read(categories_i18n_file_path)
        end
      end

      describe 'standards localization distribution' do
        let(:standards_i18n_file_path) {CDO.dir('dashboard/config/locales', "standards.#{i18n_locale}.json")}
        let(:standards_i18n_file_data) do
          {
            i18n_locale => {
              'data' => {
                'standards' => {
                  'unchanged_standard_shortcode' => {
                    'description' => 'unchanged_standard_desc_i18n',
                  },
                  standard_shortcode => {
                    'description' => 'old_standard_desc_i18n',
                  }
                }
              }
            }
          }
        end

        before do
          FileUtils.mkdir_p File.dirname(standards_i18n_file_path)
          File.write standards_i18n_file_path, JSON.dump(standards_i18n_file_data)
        end

        it 'distributes the standards localization' do
          new_standards_i18n_file_content = <<~JSON.strip
            {
              "#{i18n_locale}": {
                "data": {
                  "standards": {
                    "#{standard_shortcode}": {
                      "description": "#{new_standard_desc_i18n}"
                    },
                    "unchanged_standard_shortcode": {
                      "description": "unchanged_standard_desc_i18n"
                    }
                  }
                }
              }
            }
          JSON

          distribute_localizations

          assert_equal new_standards_i18n_file_content, File.read(standards_i18n_file_path)
        end
      end
    end
  end
end
