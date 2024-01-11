require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/curriculum_content/sync_out'

describe I18n::Resources::Dashboard::CurriculumContent::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::CurriculumContent::SyncOut}
  let(:described_instance) {described_class.new}

  let(:crowdin_locale) {'expected_crowdin_locale'}
  let(:i18n_locale) {'expected_i18n_locale'}
  let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}

  let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale, 'curriculum_content')}
  let(:i18n_locale_dir) {CDO.dir('i18n/locales', i18n_locale, 'curriculum_content')}

  let(:type) {'expected_type'}
  let(:crowdin_file_path) {File.join(crowdin_locale_dir, "#{type}.json")}

  around do |test|
    DatabaseCleaner.start
    FakeFS.with_fresh {test.call}
    DatabaseCleaner.clean
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#process' do
    let(:process_language) {described_instance.process(language)}

    let(:expect_localization_distribution) do
      described_instance.expects(:distribute_localization).with(language)
    end
    let(:expect_crowdin_files_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:rename_dir).with(crowdin_locale_dir, i18n_locale_dir)
    end

    before do
      I18nScriptUtils.stubs(:source_lang?).with(language).returns(false)
      FileUtils.mkdir_p(crowdin_locale_dir)
    end

    it 'distributes the language localization and then moves Crowdin files to the i18n locale dir' do
      execution_sequence = sequence('execution')

      expect_localization_distribution.in_sequence(execution_sequence)
      expect_crowdin_files_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

      process_language
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
  end

  describe '#distribute_localization' do
    let(:distribute_localization) {described_instance.send(:distribute_localization, language)}

    let(:type) {'expected_type'}
    let(:type_i18n_data) {{'uuid' => 'new_i18n_data'}}
    let(:types_i18n_data) {{type => type_i18n_data}}

    let(:target_i18n_file_path) {CDO.dir('dashboard/config/locales', "#{type}.#{i18n_locale}.json")}

    before do
      described_instance.stubs(:types_i18n_data_of).with(language).returns(types_i18n_data)
    end

    it 'distributes localization of the language' do
      expected_i18n_data = {i18n_locale => {'data' => {type => type_i18n_data}}}

      I18nScriptUtils.expects(:write_json_file).with(target_i18n_file_path, expected_i18n_data).once

      distribute_localization
    end

    context 'when the target i18n file already exists' do
      let(:target_i18n_file_data) do
        {
          i18n_locale => {
            'data' => {
              type => {
                'untranslated_uuid' => 'untranslated_data',
                'uuid' => 'origin_i18n_data'
              }
            }
          }
        }
      end

      before do
        FileUtils.mkdir_p File.dirname(target_i18n_file_path)
        File.write target_i18n_file_path, JSON.dump(target_i18n_file_data)
      end

      it 'adds new i18n data to existing i18n data' do
        expected_i18n_data = {
          i18n_locale => {
            'data' => {
              type => {
                'untranslated_uuid' => 'untranslated_data',
                **type_i18n_data,
              }
            }
          }
        }

        I18nScriptUtils.expects(:write_json_file).with(target_i18n_file_path, expected_i18n_data).once

        distribute_localization
      end
    end

    context 'when the types i18n data is blank' do
      let(:types_i18n_data) {{}}

      it 'does not distribute localization of the language' do
        I18nScriptUtils.expects(:write_json_file).with(target_i18n_file_path, anything).never
        distribute_localization
      end
    end
  end

  describe '#types_i18n_data_of' do
    let(:types_i18n_data) {described_instance.send(:types_i18n_data_of, language)}

    let(:restored_type_i18n_data) {'restored_type_i18n_data'}
    let(:flatten_types_i18n_data) {'flatten_types_i18n_data'}
    let(:restored_lesson_keys_i18n_data) {'restored_lesson_keys_i18n_data'}
    let(:restored_reference_guide_keys_i18n_data) {'restored_reference_guide_keys_i18n_data'}
    let(:fixed_resource_urls_i18n_data) {{fixed_resource_urls: {i18n_key: 'i18n_data'}}}

    before do
      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      FileUtils.touch(crowdin_file_path)
    end

    it 'returns hash with restored i18n data for each type' do
      execution_sequence = sequence('execution')

      described_instance.expects(:restore_file_content).with(crowdin_file_path).in_sequence(execution_sequence).returns(restored_type_i18n_data)
      described_instance.expects(:flatten).with({type => restored_type_i18n_data}).in_sequence(execution_sequence).returns(flatten_types_i18n_data)
      described_instance.expects(:restore_lesson_i18n_keys).with(flatten_types_i18n_data).in_sequence(execution_sequence).returns(restored_lesson_keys_i18n_data)
      described_instance.expects(:restore_reference_guide_i18n_keys).with(restored_lesson_keys_i18n_data).in_sequence(execution_sequence).returns(restored_reference_guide_keys_i18n_data)
      described_instance.expects(:fix_resource_urls).with(restored_reference_guide_keys_i18n_data).in_sequence(execution_sequence).returns(fixed_resource_urls_i18n_data)

      assert_equal({'fixed_resource_urls' => {'i18n_key' => 'i18n_data'}}, types_i18n_data)
    end
  end

  describe '#restore_file_content' do
    let(:restore_file_content) {described_instance.send(:restore_file_content, crowdin_file_path)}

    let(:original_file_path) {CDO.dir("i18n/locales/original/curriculum_content/#{type}.json")}

    it 'restores the Crowdin file content and returns restore i18 data' do
      expected_i18n_data = 'expected_i18n_data'

      RedactRestoreUtils.expects(:restore).with(
        original_file_path, crowdin_file_path, crowdin_file_path, %w[resourceLink vocabularyDefinition]
      ).once
      I18nScriptUtils.expects(:parse_file).with(crowdin_file_path).once.returns(expected_i18n_data)

      assert_equal expected_i18n_data, restore_file_content
    end
  end

  describe '#flatten' do
    let(:flatten_i18n_data) {described_instance.send(:flatten, raw_i18n_data)}

    class TestUnitSerializer < Services::I18n::CurriculumSyncUtils::Serializers::CrowdinSerializer
      class TestResourceSerializer < Services::I18n::CurriculumSyncUtils::Serializers::CrowdinSerializer
        attributes :resource_attr
      end

      attributes :unit_attr

      has_many :resources, serializer: TestResourceSerializer
    end

    let(:raw_i18n_data) do
      {
        'unit_key' => {
          'unexpected_attr' => 'unexpected_val',
          'unit_attr' => 'unit_val',
          'resources' => {
            'resource_key' => {
              'unexpected_attr' => 'unexpected_val',
              'resource_attr' => 'resource_val',
            }
          }
        }
      }
    end

    let(:expected_flatten_i18n_data) do
      {
        scripts: {
          'unit_key' => {
            unit_attr: 'unit_val'
          }
        },
        resources: {
          'resource_key' => {
            resource_attr: 'resource_val'
          }
        }
      }
    end

    it 'returns flatten i18n data' do
      described_class.stub_const(:UNIT_SERIALIZER, TestUnitSerializer) do
        assert_equal expected_flatten_i18n_data, flatten_i18n_data
      end
    end
  end

  describe '#restore_lesson_i18n_keys' do
    let(:restore_lesson_i18n_keys) {described_instance.send(:restore_lesson_i18n_keys, init_types_i18n_data)}

    let(:unit_name) {'expected-unit-name'}
    let(:unit) {FactoryBot.create(:unit, name: unit_name)}

    let(:lesson_is_numbered) {true}
    let(:relative_position) {9}
    let(:lesson) do
      FactoryBot.create(
        :lesson,
        script: unit,
        name: unit_name,
        relative_position: relative_position,
        has_lesson_plan: lesson_is_numbered,
        lockable: !lesson_is_numbered,
      )
    end

    let(:init_types_i18n_data) do
      {
        lessons: {
          "https://studio.code.org/s/#{unit_name}/lessons/#{relative_position}" => 'expected_lesson_i18n_data'
        }
      }
    end
    let(:restored_lesson_i18n_key) {'restored_lesson_i18n_key'}
    let(:types_i18n_data_with_restored_lesson_i18n_keys) do
      {
        lessons: {
          restored_lesson_i18n_key => 'expected_lesson_i18n_data'
        }
      }
    end

    before do
      Services::GloballyUniqueIdentifiers.stubs(:build_lesson_key).with(lesson).returns(restored_lesson_i18n_key)
    end

    it 'returns the types i18n data with restored lesson i18n keys' do
      assert_equal types_i18n_data_with_restored_lesson_i18n_keys, restore_lesson_i18n_keys
    end

    context 'when more than one lesson is found by the lesson url data' do
      before do
        FactoryBot.create(
          :lesson,
          script: unit,
          name: unit_name,
          relative_position: relative_position,
          has_lesson_plan: lesson_is_numbered,
          lockable: !lesson_is_numbered,
        )
      end

      it 'returns the types i18n data without unrestored lesson i18n keys' do
        assert_equal({lessons: {}}, restore_lesson_i18n_keys)
      end
    end

    context 'when no lesson is found by the lesson url data' do
      before do
        lesson.delete
      end

      it 'returns the types i18n data without unrestored lesson i18n keys' do
        assert_equal({lessons: {}}, restore_lesson_i18n_keys)
      end
    end

    context 'when the lesson is not "numbered"' do
      let(:lesson_is_numbered) {false}

      it 'returns the types i18n data without unrestored lesson i18n keys' do
        assert_equal({lessons: {}}, restore_lesson_i18n_keys)
      end
    end

    context 'when the types i18n data does not contain lessons i18n data' do
      let(:init_types_i18n_data) do
        {
          lessons: nil
        }
      end

      it 'returns the initial types i18n data' do
        assert_equal init_types_i18n_data, restore_lesson_i18n_keys
      end
    end
  end

  describe '#restore_reference_guide_i18n_keys' do
    let(:restore_reference_guide_i18n_keys) {described_instance.send(:restore_reference_guide_i18n_keys, init_types_i18n_data)}

    let(:course_offering_key) {'expected-course-offering-key'}
    let(:course_offering) {FactoryBot.create(:course_offering, key: course_offering_key)}

    let(:course_version_key) {'version'}
    let(:course_version) {FactoryBot.create(:course_version, key: course_version_key, course_offering: course_offering)}

    let(:reference_guide_key) {'expected-reference-guide-key'}
    let(:reference_guide) {FactoryBot.create(:reference_guide, key: reference_guide_key, course_version: course_version)}

    let(:init_types_i18n_data) do
      {
        reference_guides: {
          "https://studio.code.org/courses/#{course_offering_key}-#{course_version_key}/guides/#{reference_guide_key}" => 'expected_reference_guide_i18n_data'
        }
      }
    end
    let(:restored_reference_guide_i18n_key) {'restored_lesson_i18n_key'}
    let(:types_i18n_data_with_restored_reference_guide_i18n_keys) do
      {
        reference_guides: {
          restored_reference_guide_i18n_key => 'expected_reference_guide_i18n_data'
        }
      }
    end

    before do
      Services::GloballyUniqueIdentifiers.stubs(:build_reference_guide_key).with(reference_guide).returns(restored_reference_guide_i18n_key)
    end

    it 'returns the initial types i18n data without restored reference guide i18n keys' do
      assert_equal types_i18n_data_with_restored_reference_guide_i18n_keys, restore_reference_guide_i18n_keys
    end

    context 'when no reference guide is found by the lesson url data' do
      before do
        reference_guide.destroy
      end

      it 'returns the types i18n data without unrestored reference guide i18n keys' do
        assert_equal({reference_guides: {}}, restore_reference_guide_i18n_keys)
      end
    end

    context 'when the course version is found by the lesson url data' do
      before do
        course_version.destroy
      end

      it 'returns the types i18n data without unrestored reference guide i18n keys' do
        assert_equal({reference_guides: {}}, restore_reference_guide_i18n_keys)
      end
    end

    context 'when the course offering is found by the lesson url data' do
      before do
        course_offering.destroy
      end

      it 'returns the types i18n data without unrestored reference guide i18n keys' do
        assert_equal({reference_guides: {}}, restore_reference_guide_i18n_keys)
      end
    end

    context 'when the types i18n data does not contain reference guides i18n data' do
      let(:init_types_i18n_data) do
        {
          lessons: nil
        }
      end

      it 'returns the initial types i18n data' do
        assert_equal init_types_i18n_data, restore_reference_guide_i18n_keys
      end
    end
  end

  describe '#fix_resource_urls' do
    let(:fix_resource_urls) {described_instance.send(:fix_resource_urls, init_types_i18n_data)}

    let(:init_types_i18n_data) do
      {
        resources: {
          'resource_key' => {
            url: ' <expected_url> '
          }
        }
      }
    end
    let(:types_i18n_data_with_fixed_resource_urls) do
      {
        resources: {
          'resource_key' => {
            url: 'expected_url'
          }
        }
      }
    end

    it 'returns the types i18n data with fixed resource urls' do
      assert_equal types_i18n_data_with_fixed_resource_urls, fix_resource_urls
    end

    context 'when the initial types i18n data does not contain resources i18n data' do
      let(:init_types_i18n_data) do
        {
          resources: nil
        }
      end

      it 'returns the initial types i18n data' do
        assert_equal init_types_i18n_data, fix_resource_urls
      end
    end
  end
end
