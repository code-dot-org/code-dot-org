require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/curriculum_content/sync_in'

class I18n::Resources::Dashboard::CurriculumContent::SyncInTest < Minitest::Test
  def test_performing
    exec_seq = sequence('execution')

    I18n::Resources::Dashboard::CurriculumContent::SyncIn.expects(:serialize).in_sequence(exec_seq)
    I18n::Resources::Dashboard::CurriculumContent::SyncIn.expects(:redact).in_sequence(exec_seq)

    I18n::Resources::Dashboard::CurriculumContent::SyncIn.perform
  end

  def test_serialization
    exec_seq = sequence('execution')
    expected_serialized_data = {expected: {expected_data: 'expected_data', unexpected_blank: {}}, unexpeted: 'unexpeted_data'}
    script_serializer_mock = mock(as_json: mock(compact: expected_serialized_data))
    expected_i18n_source_file_path = CDO.dir('i18n/locales/source/curriculum_content/expected_script_subdirectory/expected_script_name.json')

    script = FactoryBot.build_stubbed(:script, is_migrated: true, name: 'expected_script_name')

    ::Unit.expects(:find_each).in_sequence(exec_seq).yields(script)
    ::ScriptConstants.expects(:i18n?).with(script.name).in_sequence(exec_seq).returns(true)

    ::Services::I18n::CurriculumSyncUtils::Serializers::ScriptCrowdinSerializer.expects(:new).with(script, scope: {only_numbered_lessons: true}).in_sequence(exec_seq).returns(script_serializer_mock)
    I18n::Resources::Dashboard::CurriculumContent::SyncIn.expects(:get_script_subdirectory).with(script).in_sequence(exec_seq).returns('expected_script_subdirectory')
    I18nScriptUtils.expects(:unit_directory_change?).with(CDO.dir('i18n/locales/source/curriculum_content'), 'expected_script_name.json', expected_i18n_source_file_path).in_sequence(exec_seq).returns(false)

    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/curriculum_content/expected_script_subdirectory')).in_sequence(exec_seq)
    File.expects(:write).with(expected_i18n_source_file_path, %Q[{\n  "expected_data": "expected_data"\n}]).in_sequence(exec_seq)

    I18n::Resources::Dashboard::CurriculumContent::SyncIn.serialize
  end

  def test_serialization_of_not_migrated_script
    script = FactoryBot.build_stubbed(:script, is_migrated: false, name: 'unmigrated')

    ::Unit.expects(:find_each).once.yields(script)
    ::ScriptConstants.expects(:i18n?).with(script.name).never
    ::Services::I18n::CurriculumSyncUtils::Serializers::ScriptCrowdinSerializer.expects(:new).with(script, scope: {only_numbered_lessons: true}).never

    I18n::Resources::Dashboard::CurriculumContent::SyncIn.serialize
  end

  def test_serialization_of_untranslatable_script
    script = FactoryBot.build_stubbed(:script, is_migrated: true, name: 'untranslatable')

    ::Unit.expects(:find_each).once.yields(script)
    ::ScriptConstants.expects(:i18n?).with(script.name).once.returns(false)
    ::Services::I18n::CurriculumSyncUtils::Serializers::ScriptCrowdinSerializer.expects(:new).with(script, scope: {only_numbered_lessons: true}).never

    I18n::Resources::Dashboard::CurriculumContent::SyncIn.serialize
  end

  def test_serialization_of_script_with_blank_data
    exec_seq = sequence('execution')
    expected_serialized_data = {expected: {unexpected_blank: {}}, unexpeted: 'unexpeted_data'}
    script_serializer_mock = mock(as_json: mock(compact: expected_serialized_data))
    expected_i18n_source_file_path = CDO.dir('i18n/locales/source/curriculum_content/expected_script_subdirectory/expected_script_name.json')

    script = FactoryBot.build_stubbed(:script, is_migrated: true, name: 'expected_script_name')

    ::Unit.expects(:find_each).in_sequence(exec_seq).yields(script)
    ::ScriptConstants.expects(:i18n?).with(script.name).in_sequence(exec_seq).returns(true)
    ::Services::I18n::CurriculumSyncUtils::Serializers::ScriptCrowdinSerializer.expects(:new).with(script, scope: {only_numbered_lessons: true}).in_sequence(exec_seq).returns(script_serializer_mock)

    I18n::Resources::Dashboard::CurriculumContent::SyncIn.expects(:get_script_subdirectory).with(script).never.returns('expected_script_subdirectory')
    I18nScriptUtils.expects(:unit_directory_change?).with(CDO.dir('i18n/locales/source/curriculum_content'), 'expected_script_name.json', expected_i18n_source_file_path).never.returns(false)
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/curriculum_content/expected_script_subdirectory')).never
    File.expects(:write).with(expected_i18n_source_file_path, %Q[{\n  "expected_data": "expected_data"\n}]).never

    I18n::Resources::Dashboard::CurriculumContent::SyncIn.serialize
  end

  def test_serialization_of_script_with_unit_directory_changed_file
    exec_seq = sequence('execution')
    expected_serialized_data = {expected: {expected_data: 'expected_data', unexpected_blank: {}}, unexpeted: 'unexpeted_data'}
    script_serializer_mock = mock(as_json: mock(compact: expected_serialized_data))
    expected_i18n_source_file_path = CDO.dir('i18n/locales/source/curriculum_content/expected_script_subdirectory/expected_script_name.json')

    script = FactoryBot.build_stubbed(:script, is_migrated: true, name: 'expected_script_name')

    ::Unit.expects(:find_each).in_sequence(exec_seq).yields(script)
    ::ScriptConstants.expects(:i18n?).with(script.name).in_sequence(exec_seq).returns(true)

    ::Services::I18n::CurriculumSyncUtils::Serializers::ScriptCrowdinSerializer.expects(:new).with(script, scope: {only_numbered_lessons: true}).in_sequence(exec_seq).returns(script_serializer_mock)
    I18n::Resources::Dashboard::CurriculumContent::SyncIn.expects(:get_script_subdirectory).with(script).in_sequence(exec_seq).returns('expected_script_subdirectory')
    I18nScriptUtils.expects(:unit_directory_change?).with(CDO.dir('i18n/locales/source/curriculum_content'), 'expected_script_name.json', expected_i18n_source_file_path).in_sequence(exec_seq).returns(true)

    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/curriculum_content/expected_script_subdirectory')).never
    File.expects(:write).with(expected_i18n_source_file_path, %Q[{\n  "expected_data": "expected_data"\n}]).never

    I18n::Resources::Dashboard::CurriculumContent::SyncIn.serialize
  end

  def test_redaction
    exec_seq = sequence('execution')
    expected_i18n_source_file_path = CDO.dir('i18n/locales/source/curriculum_content/test.json')

    Dir.expects(:[]).with(CDO.dir('i18n/locales/source/curriculum_content/**/*.json')).in_sequence(exec_seq).returns([expected_i18n_source_file_path])

    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/original/curriculum_content')).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(expected_i18n_source_file_path, CDO.dir('i18n/locales/original/curriculum_content/test.json')).in_sequence(exec_seq)

    RedactRestoreUtils.expects(:redact_file).with(expected_i18n_source_file_path, %w[resourceLink vocabularyDefinition]).in_sequence(exec_seq).returns({expected: 'redacted_data'})
    File.expects(:write).with(expected_i18n_source_file_path, %Q[{\n  "expected": "redacted_data"\n}]).in_sequence(exec_seq)

    I18n::Resources::Dashboard::CurriculumContent::SyncIn.redact
  end

  def test_getting_subdirectory_of_hoc_category_script
    script = FactoryBot.build_stubbed(:script, name: 'expected_script_name')

    Unit.expects(:unit_in_category?).with('hoc', 'expected_script_name').once.returns(true)

    assert_equal 'Hour of Code', I18n::Resources::Dashboard::CurriculumContent::SyncIn.get_script_subdirectory(script)
  end

  def test_getting_subdirectory_of_script_without_course_version
    exec_seq = sequence('execution')
    script = FactoryBot.build_stubbed(:script, name: 'expected_script_name')

    Unit.expects(:unit_in_category?).with('hoc', 'expected_script_name').in_sequence(exec_seq).returns(false)
    script.expects(:get_course_version).in_sequence(exec_seq).returns({})

    assert_equal 'other', I18n::Resources::Dashboard::CurriculumContent::SyncIn.get_script_subdirectory(script)
  end

  def test_getting_subdirectory_of_csf_script
    exec_seq = sequence('execution')
    script = FactoryBot.build_stubbed(:script, name: 'expected_script_name')

    Unit.expects(:unit_in_category?).with('hoc', 'expected_script_name').in_sequence(exec_seq).returns(false)
    script.stubs(:get_course_version).returns(stub(key: 'expected_course_version_key'))
    script.expects(:csf?).in_sequence(exec_seq).returns(true)

    assert_equal 'expected_course_version_key/csf', I18n::Resources::Dashboard::CurriculumContent::SyncIn.get_script_subdirectory(script)
  end

  def test_getting_subdirectory_of_csc_script
    exec_seq = sequence('execution')
    script = FactoryBot.build_stubbed(:script, name: 'expected_script_name')

    Unit.expects(:unit_in_category?).with('hoc', 'expected_script_name').in_sequence(exec_seq).returns(false)
    script.stubs(:get_course_version).returns(stub(key: 'expected_course_version_key'))
    script.expects(:csf?).in_sequence(exec_seq).returns(false)
    script.expects(:csc?).in_sequence(exec_seq).returns(true)

    assert_equal 'expected_course_version_key/csc', I18n::Resources::Dashboard::CurriculumContent::SyncIn.get_script_subdirectory(script)
  end

  def test_getting_subdirectory_of_not_csf_script
    exec_seq = sequence('execution')
    script = FactoryBot.build_stubbed(:script, name: 'expected_script_name')

    Unit.expects(:unit_in_category?).with('hoc', 'expected_script_name').in_sequence(exec_seq).returns(false)
    script.stubs(:get_course_version).returns(stub(key: 'expected_course_version_key', course_offering: stub(key: 'expected_course_offering_key')))
    script.expects(:csf?).in_sequence(exec_seq).returns(false)
    script.expects(:csc?).in_sequence(exec_seq).returns(false)

    assert_equal 'expected_course_version_key/expected_course_offering_key', I18n::Resources::Dashboard::CurriculumContent::SyncIn.get_script_subdirectory(script)
  end
end
