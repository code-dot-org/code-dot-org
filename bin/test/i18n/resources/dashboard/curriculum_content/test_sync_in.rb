require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/curriculum_content/sync_in'

describe I18n::Resources::Dashboard::CurriculumContent::SyncIn do
  let(:described_class) {I18n::Resources::Dashboard::CurriculumContent::SyncIn}
  let(:described_instance) {described_class.new}

  around do |test|
    DatabaseCleaner.start
    FakeFS.with_fresh {test.call}
    DatabaseCleaner.clean
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#translatable_units' do
    let(:translatable_units) {described_instance.send(:translatable_units)}

    let(:untranslatable_unit) {FactoryBot.create(:unit, name: 'untranslatable')}
    let(:translatable_unit) {FactoryBot.create(:unit, name: 'translatable')}

    before do
      untranslatable_unit
      translatable_unit
    end

    it 'returns only translatable Unit records' do
      ScriptConstants.stub_const(:TRANSLATEABLE_UNITS, [translatable_unit.name]) do
        assert_equal [translatable_unit.name], translatable_units.pluck(:name)
      end
    end
  end

  describe '#get_unit_subdirectory' do
    let(:unit_subdirectory) {described_instance.send(:get_unit_subdirectory, unit)}

    let(:course_version_key) {'expected-course-version-key'}
    let(:course_offering_key) {'expected-course-offering-key'}
    let(:unit_course_version) do
      FactoryBot.build(
        :course_version,
        key: course_version_key,
        course_offering: FactoryBot.build(
          :course_offering,
          key: course_offering_key
        )
      )
    end

    let(:unit_name) {'expected-unit-name'}
    let(:unit) {FactoryBot.create(:unit, name: unit_name, course_version: unit_course_version)}

    before do
      unit.stubs(:in_initiative?).with('HOC').returns(false)
      unit.stubs(:csf?).returns(false)
      unit.stubs(:csc?).returns(false)
    end

    it 'returns the unit subdirectory path based on course_version and course_offering keys' do
      assert_equal "#{course_version_key}/#{course_offering_key}", unit_subdirectory
    end

    context 'when the unit is `csc`' do
      before do
        unit.expects(:csc?).returns(true)
      end

      it 'returns the csc unit subdirectory path' do
        assert_equal "#{course_version_key}/csc", unit_subdirectory
      end
    end

    context 'when the unit is `csf`' do
      before do
        unit.expects(:csf?).returns(true)
      end

      it 'returns the csf unit subdirectory path' do
        assert_equal "#{course_version_key}/csf", unit_subdirectory
      end
    end

    context 'when the init does not have a course version' do
      let(:unit_course_version) {nil}

      it 'returns subdirectory path for "other" units' do
        assert_equal 'other', unit_subdirectory
      end
    end

    context 'when the init in the "hoc" category' do
      before do
        unit.expects(:in_initiative?).with('HOC').returns(true)
      end

      it 'returns subdirectory path for "Hour of Code" units' do
        assert_equal 'Hour of Code', unit_subdirectory
      end
    end
  end

  describe '#redact_file_content' do
    let(:redact_i18n_source_file_content) {described_instance.send(:redact_file_content, i18n_source_file_path)}

    let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/curriculum_content/test.json')}
    let(:i18n_original_file_path) {CDO.dir('i18n/locales/original/curriculum_content/test.json')}

    before do
      FileUtils.mkdir_p File.dirname(i18n_source_file_path)
      FileUtils.touch(i18n_source_file_path)
    end

    it 'creates the backup and then redact the i18n source file content' do
      execution_sequence = sequence('execution')

      I18nScriptUtils.expects(:copy_file).with(i18n_source_file_path, i18n_original_file_path).in_sequence(execution_sequence)

      RedactRestoreUtils.
        expects(:redact).
        with(i18n_source_file_path, i18n_source_file_path, %w[resourceLink vocabularyDefinition]).
        in_sequence(execution_sequence)

      redact_i18n_source_file_content
    end
  end

  describe '#process' do
    let(:process_resource) {described_instance.send(:process)}

    let(:unit_name) {'expected_unit_name'}
    let(:unit_is_migrated) {true}
    let(:unit) {FactoryBot.build_stubbed(:unit, name: unit_name, is_migrated: unit_is_migrated)}

    let(:i18n_source_dir) {CDO.dir('i18n/locales/source/curriculum_content')}
    let(:unit_subdirectory) {'expected_unit_subdirectory'}
    let(:unit_file_name) {"#{unit_name}.json"}
    let(:i18n_source_file_path) {File.join(i18n_source_dir, unit_subdirectory, unit_file_name)}

    let(:crowdin_serializer) {stub(as_json: unit_serialized_data)}
    let(:translatable_units) do
      translatable_units = [unit]
      translatable_units.stubs(:find_each).yields(*translatable_units)
      translatable_units
    end

    let(:unit_serialized_data) do
      {
        'unit_key' => {
          'i18n_key' => 'i18n_val',
          'blank' => '',
        }
      }
    end
    let(:expected_i18n_source_file_content) do
      <<~JSON.strip
        {
          "i18n_key": "i18n_val"
        }
      JSON
    end

    let(:expect_i18n_source_file_creation) do
      I18nScriptUtils.expects(:write_file).with(i18n_source_file_path, expected_i18n_source_file_content)
    end
    let(:expect_i18n_source_file_redaction) do
      described_instance.expects(:redact_file_content).with(i18n_source_file_path)
    end

    before do
      described_instance.stubs(:translatable_units).returns(translatable_units)

      Services::I18n::CurriculumSyncUtils::Serializers::ScriptCrowdinSerializer.
        stubs(:new).
        with(unit, scope: {only_numbered_lessons: true}).
        returns(crowdin_serializer)

      described_instance.stubs(:get_unit_subdirectory).with(unit).returns(unit_subdirectory)
      I18nScriptUtils.stubs(:unit_directory_change?).with(i18n_source_dir, i18n_source_file_path).returns(false)
    end

    it 'prepares the i18n source file' do
      execution_sequence = sequence('execution')

      expect_i18n_source_file_creation.in_sequence(execution_sequence)
      expect_i18n_source_file_redaction.in_sequence(execution_sequence)

      process_resource
    end

    context 'when the unit i18n data is blank' do
      let(:unit_serialized_data) do
        {
          'unit_key' => {
            'blank' => '',
          }
        }
      end

      it 'does not prepare the i18n source file' do
        expect_i18n_source_file_redaction.never

        process_resource

        refute File.exist?(i18n_source_file_path)
      end
    end

    context 'when the unit i18n data is nil' do
      let(:unit_serialized_data) do
        {
          'unit_key' => nil
        }
      end

      it 'does not prepare the i18n source file' do
        expect_i18n_source_file_redaction.never

        process_resource

        refute File.exist?(i18n_source_file_path)
      end
    end

    context 'when the unit directory is changed' do
      before do
        I18nScriptUtils.expects(:unit_directory_change?).with(i18n_source_dir, i18n_source_file_path).returns(true)
      end

      it 'does not prepare the i18n source file' do
        expect_i18n_source_file_redaction.never

        process_resource

        refute File.exist?(i18n_source_file_path)
      end
    end

    context 'when the unit is not migrated' do
      let(:unit_is_migrated) {false}

      it 'does not prepare the i18n source file' do
        expect_i18n_source_file_redaction.never

        process_resource

        refute File.exist?(i18n_source_file_path)
      end
    end
  end
end
