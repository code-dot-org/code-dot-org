require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/course_content/sync_out'

describe I18n::Resources::Dashboard::CourseContent::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::CourseContent::SyncOut}
  let(:described_instance) {described_class.new}

  around do |test|
    DatabaseCleaner.start
    FakeFS.with_fresh {test.call}
    DatabaseCleaner.clean
  end

  before do
    I18n::Utils::MalformedI18nReporter.any_instance.stubs(:process_file)
    I18n::Utils::MalformedI18nReporter.any_instance.stubs(:report)
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '.perform' do
    let(:perform_sync_out) {described_class.perform}

    let(:language) {{crowdin_name_s: 'expected Crowdin locale'}}

    before do
      I18n::Resources::Dashboard::CourseContent::SyncOut.any_instance.stubs(:languages).returns([language])
    end

    it 'distributes localizations in correct order' do
      execution_sequence = sequence('execution')

      described_class.any_instance.expects(:distribute_level_content).with(language).in_sequence(execution_sequence)
      described_class.any_instance.expects(:distribute_localization_of).with('block_categories', language).in_sequence(execution_sequence)
      described_class.any_instance.expects(:distribute_localization_of).with('parameter_names', language).in_sequence(execution_sequence)
      described_class.any_instance.expects(:distribute_localization_of).with('progressions', language).in_sequence(execution_sequence)
      described_class.any_instance.expects(:distribute_localization_of).with('variable_names', language).in_sequence(execution_sequence)

      perform_sync_out
    end
  end

  describe '#restore_level_content' do
    let(:level_content_restored) {described_instance.send(:restore_level_content, file_subpath, crowdin_file_path)}

    let(:file_subpath) {'type.json'}
    let(:original_file_path) {CDO.dir('i18n/locales/original/course_content', file_subpath)}
    let(:crowdin_file_path) {CDO.dir('i18n/locales/English/course_content', file_subpath)}
    let(:crowdin_file_data) do
      {
        'en' => {
          'i18n_key' => 'redacted_i18n_data',
          'i18n_key_2' => 'unredacted_i18n_data'
        }
      }
    end

    let(:expect_level_content_restoration) do
      RedactRestoreUtils.
        expects(:restore_file).
        with(original_file_path, crowdin_file_path, %w[blockly]).
        returns({'en' => {'i18n_key' => 'restored_i18n_data'}})
    end

    before do
      FileUtils.mkdir_p File.dirname(original_file_path)
      FileUtils.touch(original_file_path)

      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      File.write(crowdin_file_path, JSON.dump(crowdin_file_data))
    end

    it 'restores the Crowdin file level content and returns true' do
      expect_level_content_restoration.once

      expected_restored_crowdin_file_content = <<~JSON.strip
        {
          "en": {
            "i18n_key": "restored_i18n_data",
            "i18n_key_2": "unredacted_i18n_data"
          }
        }
      JSON

      assert level_content_restored
      assert_equal expected_restored_crowdin_file_content, File.read(crowdin_file_path)
    end

    context 'when the origin file does not exists' do
      before do
        FileUtils.rm(original_file_path)
      end

      it 'does not restore the Crowdin file level content and returns false' do
        expect_level_content_restoration.never

        refute level_content_restored
        assert_equal crowdin_file_data, JSON.load_file(crowdin_file_path)
      end
    end
  end

  describe '#level_types_i18n_data' do
    let(:level_types_i18n_data) {described_instance.send(:level_types_i18n_data, level, level_i18n_data)}

    let(:level_name) {'expected_level_name'}
    let(:level) {FactoryBot.build_stubbed(:level, name: level_name)}

    let(:sublevel_name) {'expected_sublevel_name'}
    let(:sublevel_type) {'expected_sublevel_type'}
    let(:sublevel_type_i18n_data) {'expected_sublevel_type_i18n_data'}
    let(:sublevel_i18n_data) {{sublevel_type => sublevel_type_i18n_data}}

    let(:contained_level_name) {'expected_contained_level_name'}
    let(:contained_level_type) {'expected_contained_level_type'}
    let(:contained_level_type_i18n_data) {'expected_contained_level_type_i18n_data'}
    let(:contained_level_i18n_data) {{contained_level_type => contained_level_type_i18n_data}}

    let(:other_type) {'expected_other_type'}
    let(:other_type_i18n_data) {'expected_other_type_i18n_data'}

    let(:level_i18n_data) do
      {
        'sublevels' => {sublevel_name => sublevel_i18n_data},
        'contained levels' => {contained_level_name => contained_level_i18n_data},
        other_type => other_type_i18n_data,
      }
    end

    it 'returns i18n data of the level types' do
      expected_level_types_i18n_data = {
        other_type => {
          level_name => other_type_i18n_data,
        }
      }

      assert_equal expected_level_types_i18n_data, level_types_i18n_data
    end

    context 'when a sublevel exists' do
      let(:sublevel) {FactoryBot.build_stubbed(:level, name: sublevel_name)}

      before do
        Level.expects(:find_by_name).with(sublevel_name).returns(sublevel)
      end

      it 'returns i18n data of the sublevel and other level types' do
        expected_level_types_i18n_data = {
          sublevel_type => {
            sublevel_name => sublevel_type_i18n_data,
          },
          other_type => {
            level_name => other_type_i18n_data,
          }
        }

        assert_equal expected_level_types_i18n_data, level_types_i18n_data
      end
    end

    context 'when a contained level of the level exists' do
      let(:contained_level) {FactoryBot.build_stubbed(:level, name: contained_level_name)}

      before do
        level.expects(:contained_levels).returns begin
          contained_levels = stub
          contained_levels.
            expects(:zip).
            with({contained_level_name => contained_level_i18n_data}).
            returns({contained_level => contained_level_i18n_data})
          contained_levels
        end
      end

      it 'returns i18n data of the contained level and other level types' do
        expected_level_types_i18n_data = {
          contained_level_type => {
            contained_level_name => contained_level_type_i18n_data,
          },
          other_type => {
            level_name => other_type_i18n_data,
          }
        }

        assert_equal expected_level_types_i18n_data, level_types_i18n_data
      end
    end
  end

  describe '#i18n_data_of' do
    let(:i18n_data_of_language) {described_instance.send(:i18n_data_of, language, crowdin_locale_dir)}

    let(:crowdin_locale) {'expected_crowdin_locale'}
    let(:i18n_locale) {'expected_i18n_locale'}
    let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}

    let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale, 'course_content')}

    let(:level) {'expected_level_instance'}
    let(:level_url) {'expected_level_url'}
    let(:level_type) {'expected_level_type'}
    let(:level_i18n_data) {'expected_level_i18n_data'}
    let(:crowdin_file_data) {{level_url => level_i18n_data}}
    let(:file_subpath) {'expected/type.json'}
    let(:crowdin_file_path) {File.join(crowdin_locale_dir, file_subpath)}

    let(:expected_level_type_i18n_data) {{'expected_level_type_i18n_key' => 'expected_level_type_i18n_val'}}
    let(:expected_level_types_i18n_data) {{level_type => expected_level_type_i18n_data}}

    let(:malformed_i18n_reporter) {stub}
    let(:expect_level_content_restoration) do
      described_instance.expects(:restore_level_content).with(file_subpath, crowdin_file_path)
    end
    let(:expect_malformed_i18n_reporter_file_processing) do
      malformed_i18n_reporter.expects(:process_file).with(crowdin_file_path)
    end
    let(:expect_malformed_i18n_reporting) do
      malformed_i18n_reporter.expects(:report)
    end

    before do
      malformed_i18n_reporter.stubs(:process_file)
      malformed_i18n_reporter.stubs(:report)

      I18n::Utils::MalformedI18nReporter.stubs(:new).with(i18n_locale).returns(malformed_i18n_reporter)
      I18nScriptUtils.stubs(:get_level_from_url).with(level_url).returns(level)
      described_instance.stubs(:level_types_i18n_data).with(level, level_i18n_data).returns(expected_level_types_i18n_data)

      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      File.write crowdin_file_path, JSON.dump(crowdin_file_data)
    end

    it 'returns i18n data collected from the restored Crowdin level content json file' do
      execution_sequence = sequence('execution')

      expect_level_content_restoration.in_sequence(execution_sequence).returns(true)
      expect_malformed_i18n_reporter_file_processing.in_sequence(execution_sequence)
      expect_malformed_i18n_reporting.in_sequence(execution_sequence)

      assert_equal expected_level_types_i18n_data, i18n_data_of_language
    end

    context 'when the level is not found' do
      let(:level) {nil}

      it 'restores the level content and returns empty hash' do
        execution_sequence = sequence('execution')

        expect_level_content_restoration.in_sequence(execution_sequence).returns(true)
        expect_malformed_i18n_reporter_file_processing.in_sequence(execution_sequence)
        expect_malformed_i18n_reporting.in_sequence(execution_sequence)

        assert_equal({}, i18n_data_of_language)
      end
    end

    context 'when the level content is not restored' do
      it 'returns empty hash' do
        execution_sequence = sequence('execution')

        expect_level_content_restoration.in_sequence(execution_sequence).returns(false)
        expect_malformed_i18n_reporter_file_processing.never
        expect_malformed_i18n_reporting.in_sequence(execution_sequence)

        assert_equal({}, i18n_data_of_language)
      end
    end

    context 'when there is other level content json file' do
      let(:level_i18n_data_2) {'expected_level_i18n_data_2'}
      let(:crowdin_file_2_data) {{level_url => level_i18n_data_2}}
      let(:file_2_subpath) {'expected/type2.json'}
      let(:crowdin_file_2_path) {File.join(crowdin_locale_dir, file_2_subpath)}

      let(:expected_level_type_i18n_data_2) {{'expected_level_type_i18n_key_2' => 'expected_level_type_i18n_val_2'}}
      let(:expected_level_types_i18n_data_2) {{level_type => expected_level_type_i18n_data_2}}

      before do
        FileUtils.mkdir_p File.dirname(crowdin_file_2_path)
        File.write crowdin_file_2_path, JSON.dump(crowdin_file_2_data)
      end

      it 'returns i18n data collected from restored Crowdin level content json files' do
        execution_sequence = sequence('execution')

        described_instance.expects(:restore_level_content).with(file_subpath, crowdin_file_path).in_sequence(execution_sequence).returns(true)
        described_instance.expects(:level_types_i18n_data).with(level, level_i18n_data).in_sequence(execution_sequence).returns(expected_level_types_i18n_data)

        described_instance.expects(:restore_level_content).with(file_2_subpath, crowdin_file_2_path).in_sequence(execution_sequence).returns(true)
        described_instance.expects(:level_types_i18n_data).with(level, level_i18n_data_2).in_sequence(execution_sequence).returns(expected_level_types_i18n_data_2)

        assert_equal({level_type => {**expected_level_type_i18n_data, **expected_level_type_i18n_data_2}}, i18n_data_of_language)
      end
    end
  end

  describe '#distribute_level_content' do
    let(:distribute_level_content) {described_instance.send(:distribute_level_content, language)}

    let(:crowdin_locale) {'expected_crowdin_locale'}
    let(:i18n_locale) {'expected_i18n_locale'}
    let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}
    let(:level_type) {'expected_type'}
    let(:level_type_i18n_data) {{'level_type_1i8n_key' => 'level_type_1i8n_val'}}
    let(:i18n_data) {{level_type => level_type_i18n_data}}

    let(:expected_dashboard_i18n_data) {{i18n_locale => {'data' => i18n_data}}}
    let(:expected_target_i18n_file_format) {'json'}

    let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale, 'course_content')}
    let(:target_i18n_file_path) {CDO.dir("dashboard/config/locales/#{level_type}.#{i18n_locale}.#{expected_target_i18n_file_format}")}

    let(:expect_i18n_data_collecting) do
      described_instance.expects(:i18n_data_of).with(language, crowdin_locale_dir)
    end
    let(:expect_crowdin_course_content_files_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:rename_dir).with(
        crowdin_locale_dir, CDO.dir('i18n/locales', i18n_locale, 'course_content')
      )
    end
    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:sanitize_data_and_write).with(expected_dashboard_i18n_data, target_i18n_file_path)
    end

    before do
      FileUtils.mkdir_p(crowdin_locale_dir)
    end

    it 'distributes level content localization' do
      execution_sequence = sequence('execution')

      expect_i18n_data_collecting.in_sequence(execution_sequence).returns(i18n_data)
      expect_crowdin_course_content_files_to_i18n_locale_dir_moving.in_sequence(execution_sequence)
      expect_localization_distribution.in_sequence(execution_sequence)

      distribute_level_content
    end

    context 'when the target dashboard i18n file already exists' do
      let(:original_dashboard_i18n_data) do
        {
          i18n_locale => {
            'data' => {
              level_type => {
                'original_level_subtype' => 'original_subtype_i18n_data',
              },
            }
          }
        }
      end
      let(:expected_dashboard_i18n_data) do
        {
          i18n_locale => {
            'data' => {
              level_type => {
                'original_level_subtype' => 'original_subtype_i18n_data',
                **level_type_i18n_data,
              },
            }
          }
        }
      end

      before do
        FileUtils.mkdir_p File.dirname(target_i18n_file_path)
        File.write target_i18n_file_path, JSON.dump(original_dashboard_i18n_data)
      end

      it 'distributes level content localization with merged original localization' do
        execution_sequence = sequence('execution')

        expect_i18n_data_collecting.in_sequence(execution_sequence).returns(i18n_data)
        expect_crowdin_course_content_files_to_i18n_locale_dir_moving.in_sequence(execution_sequence)
        expect_localization_distribution.in_sequence(execution_sequence)

        distribute_level_content
      end
    end

    context 'when the level type is "dsls"' do
      let(:level_type) {'dsls'}

      let(:expected_target_i18n_file_format) {'yml'}

      it 'distributes level content localization into yaml file instead of json' do
        execution_sequence = sequence('execution')

        expect_i18n_data_collecting.in_sequence(execution_sequence).returns(i18n_data)
        expect_crowdin_course_content_files_to_i18n_locale_dir_moving.in_sequence(execution_sequence)
        expect_localization_distribution.in_sequence(execution_sequence)

        distribute_level_content
      end
    end

    context 'when the processed language is the source language' do
      before do
        I18nScriptUtils.expects(:source_lang?).with(language).returns(true)
      end

      it 'does not distribute level content localization' do
        execution_sequence = sequence('execution')

        expect_i18n_data_collecting.in_sequence(execution_sequence).returns(i18n_data)
        expect_crowdin_course_content_files_to_i18n_locale_dir_moving.in_sequence(execution_sequence)
        expect_localization_distribution.never

        distribute_level_content
      end
    end

    context 'when the Crowdin locale dir does not exist' do
      before do
        FileUtils.rm_r(crowdin_locale_dir)
      end

      it 'skips the language processing' do
        expect_i18n_data_collecting.never.returns(i18n_data)
        expect_crowdin_course_content_files_to_i18n_locale_dir_moving.never
        expect_localization_distribution.never

        distribute_level_content
      end
    end
  end

  describe '#distribute_localization_of' do
    let(:distribute_localization) {described_instance.send(:distribute_localization_of, type, language)}

    let(:crowdin_locale) {'English'}
    let(:i18n_locale) {'en-US'}

    let(:type) {'expected_type'}
    let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}

    let(:crowdin_file_path) {CDO.dir('i18n/locales', crowdin_locale, "dashboard/#{type}.yml")}
    let(:i18n_file_path) {CDO.dir('i18n/locales', i18n_locale, "dashboard/#{type}.yml")}
    let(:target_i18n_file_path) {CDO.dir("dashboard/config/locales/#{type}.#{i18n_locale}.yml")}

    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:sanitize_file_and_write).with(crowdin_file_path, target_i18n_file_path)
    end
    let(:expect_crowdin_file_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:move_file).with(crowdin_file_path, i18n_file_path)
    end

    before do
      I18nScriptUtils.stubs(:source_lang?).with(language).returns(false)

      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      FileUtils.touch(crowdin_file_path)
    end

    it 'distributes the localization of the type' do
      execution_sequence = sequence('execution')

      expect_localization_distribution.in_sequence(execution_sequence)
      expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

      distribute_localization
    end

    context 'when the language is the source language' do
      before do
        I18nScriptUtils.expects(:source_lang?).with(language).returns(true)
      end

      it 'does not distribute the localization of the type' do
        expect_localization_distribution.never
        expect_crowdin_file_to_i18n_locale_dir_moving.once

        distribute_localization
      end
    end

    context 'when the type Crowdin file does not exist' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not distribute the localization of the type' do
        expect_localization_distribution.never
        expect_crowdin_file_to_i18n_locale_dir_moving.never

        distribute_localization
      end
    end
  end
end
