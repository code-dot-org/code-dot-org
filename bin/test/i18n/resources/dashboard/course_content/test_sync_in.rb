require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/course_content/sync_in'

class I18n::Resources::Dashboard::CourseContent::SyncInTest < Minitest::Test
  def setup
    File.stubs(:write)
    FileUtils.stubs(:mkdir_p)
  end

  def test_performing
    sync_in_instance = mock(:execute)

    I18n::Resources::Dashboard::CourseContent::SyncIn.expects(:new).once.returns(sync_in_instance)

    I18n::Resources::Dashboard::CourseContent::SyncIn.perform
  end

  def test_execution
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    sync_in_instance.stubs(:variable_strings).returns('expected_variable_strings')
    sync_in_instance.stubs(:parameter_strings).returns('expected_parameter_strings')

    sync_in_instance.expects(:prepare_level_content).in_sequence(exec_seq)
    sync_in_instance.expects(:prepare_project_content).in_sequence(exec_seq)

    sync_in_instance.expects(:write_to_yml).with('variable_names', 'expected_variable_strings').in_sequence(exec_seq)
    sync_in_instance.expects(:write_to_yml).with('parameter_names', 'expected_parameter_strings').in_sequence(exec_seq)

    sync_in_instance.expects(:redact_level_content).in_sequence(exec_seq)

    sync_in_instance.execute
  end

  def test_level_content_preparation_of_hoc_script
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    expected_i18n_source_file_path = CDO.dir('i18n/locales/source/course_content/Hour of Code/hoc-script.json')
    expected_string_level_progression = 'expected_progression_string'
    expected_block_categories = {'expected_block_category_key' => 'expected_block_category_value'}
    expected_variable_names = {'expected_variable_name_key' => 'expected_variable_name_value'}
    expected_parameter_names = {'expected_parameter_name_key' => 'expected_parameter_name_value'}
    expected_level_i18n_strings = {
      'expected_script_string_key' => 'expected_script_string_value',
      'block_categories'           => expected_block_categories,
      'variable_names'             => expected_variable_names,
      'parameter_names'            => expected_parameter_names,
    }

    script = Unit.new(name: 'hoc-script')
    script_level = ScriptLevel.new(progression: expected_string_level_progression)
    level = Level.new(encrypted: false)

    Unit.stubs(:find_each).yields(script)
    script.stubs(:script_levels).returns([script_level])
    script_level.stubs(:oldest_active_level).returns(level)

    ScriptConstants.expects(:i18n?).with(script.name).in_sequence(exec_seq).returns(true)
    I18nScriptUtils.expects(:get_level_url_key).with(script, level).in_sequence(exec_seq).returns('expected_level_url')
    sync_in_instance.expects(:get_i18n_strings).with(level).in_sequence(exec_seq).returns(expected_level_i18n_strings)
    Unit.expects(:unit_in_category?).with('hoc', script.name).in_sequence(exec_seq).returns(true)
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/course_content/Hour of Code')).in_sequence(exec_seq)
    I18nScriptUtils.expects(:unit_directory_change?).with(CDO.dir('i18n/locales/source/course_content'), 'hoc-script.json', expected_i18n_source_file_path).in_sequence(exec_seq).returns(false)
    File.expects(:write).with(expected_i18n_source_file_path, %Q[{\n  "expected_level_url": {\n    "expected_script_string_key": "expected_script_string_value"\n  }\n}]).in_sequence(exec_seq)

    sync_in_instance.expects(:write_to_yml).with('block_categories', expected_block_categories).in_sequence(exec_seq)
    sync_in_instance.expects(:write_to_yml).with('progressions', {expected_string_level_progression => expected_string_level_progression}).in_sequence(exec_seq)

    sync_in_instance.send(:prepare_level_content)

    assert_equal expected_variable_names, sync_in_instance.send(:variable_strings)
    assert_equal expected_parameter_names, sync_in_instance.send(:parameter_strings)
  end

  def test_level_content_preparation_of_unversioned_script
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    expected_i18n_source_file_path = CDO.dir('i18n/locales/source/course_content/other/unversioned-script.json')
    expected_string_level_progression = 'expected_progression_string'
    expected_block_categories = {'expected_block_category_key' => 'expected_block_category_value'}
    expected_variable_names = {'expected_variable_name_key' => 'expected_variable_name_value'}
    expected_parameter_names = {'expected_parameter_name_key' => 'expected_parameter_name_value'}
    expected_level_i18n_strings = {
      'expected_script_string_key' => 'expected_script_string_value',
      'block_categories'           => expected_block_categories,
      'variable_names'             => expected_variable_names,
      'parameter_names'            => expected_parameter_names,
    }

    script = Unit.new(name: 'unversioned-script')
    script_level = ScriptLevel.new(progression: expected_string_level_progression)
    level = Level.new(encrypted: false)

    Unit.stubs(:find_each).yields(script)
    script.stubs(:script_levels).returns([script_level])
    script_level.stubs(:oldest_active_level).returns(level)

    ScriptConstants.expects(:i18n?).with(script.name).in_sequence(exec_seq).returns(true)
    I18nScriptUtils.expects(:get_level_url_key).with(script, level).in_sequence(exec_seq).returns('expected_level_url')
    sync_in_instance.expects(:get_i18n_strings).with(level).in_sequence(exec_seq).returns(expected_level_i18n_strings)
    Unit.expects(:unit_in_category?).with('hoc', script.name).in_sequence(exec_seq).returns(false)
    script.expects(:unversioned?).in_sequence(exec_seq).returns(true)
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/course_content/other')).in_sequence(exec_seq)
    I18nScriptUtils.expects(:unit_directory_change?).with(CDO.dir('i18n/locales/source/course_content'), 'unversioned-script.json', expected_i18n_source_file_path).in_sequence(exec_seq).returns(false)
    File.expects(:write).with(expected_i18n_source_file_path, %Q[{\n  "expected_level_url": {\n    "expected_script_string_key": "expected_script_string_value"\n  }\n}]).in_sequence(exec_seq)

    sync_in_instance.expects(:write_to_yml).with('block_categories', expected_block_categories).in_sequence(exec_seq)
    sync_in_instance.expects(:write_to_yml).with('progressions', {expected_string_level_progression => expected_string_level_progression}).in_sequence(exec_seq)

    sync_in_instance.send(:prepare_level_content)

    assert_equal expected_variable_names, sync_in_instance.send(:variable_strings)
    assert_equal expected_parameter_names, sync_in_instance.send(:parameter_strings)
  end

  def test_level_content_preparation_versioned_script
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    expected_i18n_source_file_path = CDO.dir('i18n/locales/source/course_content/expected_version_year/versioned-script.json')
    expected_string_level_progression = 'expected_progression_string'
    expected_block_categories = {'expected_block_category_key' => 'expected_block_category_value'}
    expected_variable_names = {'expected_variable_name_key' => 'expected_variable_name_value'}
    expected_parameter_names = {'expected_parameter_name_key' => 'expected_parameter_name_value'}
    expected_level_i18n_strings = {
      'expected_script_string_key' => 'expected_script_string_value',
      'block_categories'           => expected_block_categories,
      'variable_names'             => expected_variable_names,
      'parameter_names'            => expected_parameter_names,
    }

    script = Unit.new(name: 'versioned-script', version_year: 'expected_version_year')
    script_level = ScriptLevel.new(progression: expected_string_level_progression)
    level = Level.new(encrypted: false)

    Unit.stubs(:find_each).yields(script)
    script.stubs(:script_levels).returns([script_level])
    script_level.stubs(:oldest_active_level).returns(level)

    ScriptConstants.expects(:i18n?).with(script.name).in_sequence(exec_seq).returns(true)
    I18nScriptUtils.expects(:get_level_url_key).with(script, level).in_sequence(exec_seq).returns('expected_level_url')
    sync_in_instance.expects(:get_i18n_strings).with(level).in_sequence(exec_seq).returns(expected_level_i18n_strings)
    Unit.expects(:unit_in_category?).with('hoc', script.name).in_sequence(exec_seq).returns(false)
    script.expects(:unversioned?).in_sequence(exec_seq).returns(false)
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/course_content/expected_version_year')).in_sequence(exec_seq)
    I18nScriptUtils.expects(:unit_directory_change?).with(CDO.dir('i18n/locales/source/course_content'), 'versioned-script.json', expected_i18n_source_file_path).in_sequence(exec_seq).returns(false)
    File.expects(:write).with(expected_i18n_source_file_path, %Q[{\n  "expected_level_url": {\n    "expected_script_string_key": "expected_script_string_value"\n  }\n}]).in_sequence(exec_seq)

    sync_in_instance.expects(:write_to_yml).with('block_categories', expected_block_categories).in_sequence(exec_seq)
    sync_in_instance.expects(:write_to_yml).with('progressions', {expected_string_level_progression => expected_string_level_progression}).in_sequence(exec_seq)

    sync_in_instance.send(:prepare_level_content)

    assert_equal expected_variable_names, sync_in_instance.send(:variable_strings)
    assert_equal expected_parameter_names, sync_in_instance.send(:parameter_strings)
  end

  def test_level_content_preparation_of_script_with_changed_derectory
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    expected_i18n_source_file_path = CDO.dir('i18n/locales/source/course_content/expected_version_year/versioned-script.json')
    expected_string_level_progression = 'expected_progression_string'
    expected_block_categories = {'expected_block_category_key' => 'expected_block_category_value'}
    expected_variable_names = {'expected_variable_name_key' => 'expected_variable_name_value'}
    expected_parameter_names = {'expected_parameter_name_key' => 'expected_parameter_name_value'}
    expected_level_i18n_strings = {
      'expected_script_string_key' => 'expected_script_string_value',
      'block_categories'           => expected_block_categories,
      'variable_names'             => expected_variable_names,
      'parameter_names'            => expected_parameter_names,
    }

    script = Unit.new(name: 'versioned-script', version_year: 'expected_version_year')
    script_level = ScriptLevel.new(progression: expected_string_level_progression)
    level = Level.new(encrypted: false)

    Unit.stubs(:find_each).yields(script)
    script.stubs(:script_levels).returns([script_level])
    script_level.stubs(:oldest_active_level).returns(level)

    ScriptConstants.expects(:i18n?).with(script.name).in_sequence(exec_seq).returns(true)
    I18nScriptUtils.expects(:get_level_url_key).with(script, level).in_sequence(exec_seq).returns('expected_level_url')
    sync_in_instance.expects(:get_i18n_strings).with(level).in_sequence(exec_seq).returns(expected_level_i18n_strings)
    Unit.expects(:unit_in_category?).with('hoc', script.name).in_sequence(exec_seq).returns(false)
    script.expects(:unversioned?).in_sequence(exec_seq).returns(false)
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/course_content/expected_version_year')).in_sequence(exec_seq)
    I18nScriptUtils.expects(:unit_directory_change?).with(CDO.dir('i18n/locales/source/course_content'), 'versioned-script.json', expected_i18n_source_file_path).in_sequence(exec_seq).returns(true)
    File.expects(:write).with(expected_i18n_source_file_path, %Q[{\n  "expected_level_url": {\n    "expected_script_string_key": "expected_script_string_value"\n  }\n}]).never

    sync_in_instance.expects(:write_to_yml).with('block_categories', expected_block_categories).in_sequence(exec_seq)
    sync_in_instance.expects(:write_to_yml).with('progressions', {expected_string_level_progression => expected_string_level_progression}).in_sequence(exec_seq)

    sync_in_instance.send(:prepare_level_content)

    assert_equal expected_variable_names, sync_in_instance.send(:variable_strings)
    assert_equal expected_parameter_names, sync_in_instance.send(:parameter_strings)
  end

  def test_level_content_preparation_of_untranslatable_script
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    expected_i18n_source_file_path = CDO.dir('i18n/locales/source/course_content/expected_version_year/versioned-script.json')
    expected_string_level_progression = 'expected_progression_string'
    expected_block_categories = {'expected_block_category_key' => 'expected_block_category_value'}
    expected_variable_names = {'expected_variable_name_key' => 'expected_variable_name_value'}
    expected_parameter_names = {'expected_parameter_name_key' => 'expected_parameter_name_value'}
    expected_level_i18n_strings = {
      'expected_script_string_key' => 'expected_script_string_value',
      'block_categories'           => expected_block_categories,
      'variable_names'             => expected_variable_names,
      'parameter_names'            => expected_parameter_names,
    }

    script = Unit.new(name: 'versioned-script', version_year: 'expected_version_year')
    script_level = ScriptLevel.new(progression: expected_string_level_progression)
    level = Level.new(encrypted: false)

    Unit.stubs(:find_each).yields(script)
    script.stubs(:script_levels).returns([script_level])
    script_level.stubs(:oldest_active_level).returns(level)

    ScriptConstants.expects(:i18n?).with(script.name).in_sequence(exec_seq).returns(false)
    I18nScriptUtils.expects(:get_level_url_key).with(script, level).never.returns('expected_level_url')
    sync_in_instance.expects(:get_i18n_strings).with(level).never.returns(expected_level_i18n_strings)
    Unit.expects(:unit_in_category?).with('hoc', script.name).never.returns(false)
    script.expects(:unversioned?).never.returns(false)
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/course_content/expected_version_year')).never
    I18nScriptUtils.expects(:unit_directory_change?).with(CDO.dir('i18n/locales/source/course_content'), 'versioned-script.json', expected_i18n_source_file_path).never.returns(false)
    File.expects(:write).with(expected_i18n_source_file_path, %Q[{\n  "expected_level_url": {\n    "expected_script_string_key": "expected_script_string_value"\n  }\n}]).never

    sync_in_instance.expects(:write_to_yml).with('block_categories', {}).in_sequence(exec_seq)
    sync_in_instance.expects(:write_to_yml).with('progressions', {}).in_sequence(exec_seq)

    sync_in_instance.send(:prepare_level_content)

    assert_empty sync_in_instance.send(:variable_strings)
    assert_empty sync_in_instance.send(:parameter_strings)
  end

  def test_project_content_preparation
    exec_seq = sequence('execution')

    ProjectsController.stub_const(:STANDALONE_PROJECTS, {'expected_project_key' => {'name' => 'expected_project_name', 'i18n' => true}}) do
      sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
      level = FactoryBot.build(:level)

      expected_block_categories = {'expected_block_category_key' => 'expected_block_category_value'}
      expected_variable_names = {'expected_variable_name_key' => 'expected_variable_name_value'}
      expected_parameter_names = {'expected_parameter_name_key' => 'expected_parameter_name_value'}
      expected_project_i18n_strings = {
        'expected_script_string_key' => 'expected_script_string_value',
        'block_categories'           => expected_block_categories,
        'variable_names'             => expected_variable_names,
        'parameter_names'            => expected_parameter_names,
      }

      Level.expects(:find_by_name).with('expected_project_name').in_sequence(exec_seq).returns(level)
      sync_in_instance.expects(:get_i18n_strings).with(level).in_sequence(exec_seq).returns(expected_project_i18n_strings)
      File.expects(:write).with(
        CDO.dir('i18n/locales/source/course_content/projects.json'),
        %Q[{\n  "https://studio.code.org/p/expected_project_key": {\n    "expected_script_string_key": "expected_script_string_value"\n  }\n}]
      ).in_sequence(exec_seq)

      sync_in_instance.send(:prepare_project_content)

      assert_equal expected_variable_names, sync_in_instance.send(:variable_strings)
      assert_equal expected_parameter_names, sync_in_instance.send(:parameter_strings)
    end
  end

  def test_project_content_preparation_without_levels
    exec_seq = sequence('execution')

    ProjectsController.stub_const(:STANDALONE_PROJECTS, {'expected_project_key' => {'name' => 'expected_project_name', 'i18n' => true}}) do
      sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

      Level.expects(:find_by_name).with('expected_project_name').in_sequence(exec_seq).returns(nil)
      sync_in_instance.expects(:get_i18n_strings).never

      sync_in_instance.send(:prepare_project_content)

      assert_empty sync_in_instance.send(:variable_strings)
      assert_empty sync_in_instance.send(:parameter_strings)
    end
  end

  def test_untranslatable_project_content_preparation
    ProjectsController.stub_const(:STANDALONE_PROJECTS, {'expected_project_key' => {'name' => 'expected_project_name', 'i18n' => false}}) do
      sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
      level = FactoryBot.build(:level)

      expected_block_categories = {'expected_block_category_key' => 'expected_block_category_value'}
      expected_variable_names = {'expected_variable_name_key' => 'expected_variable_name_value'}
      expected_parameter_names = {'expected_parameter_name_key' => 'expected_parameter_name_value'}
      expected_project_i18n_strings = {
        'expected_script_string_key' => 'expected_script_string_value',
        'block_categories'           => expected_block_categories,
        'variable_names'             => expected_variable_names,
        'parameter_names'            => expected_parameter_names,
      }

      Level.expects(:find_by_name).with('expected_project_name').never.returns(level)
      sync_in_instance.expects(:get_i18n_strings).with(level).never.returns(expected_project_i18n_strings)
      File.expects(:write).with(
        CDO.dir('i18n/locales/source/course_content/projects.json'),
        %Q[{\n  "https://studio.code.org/p/expected_project_key": {\n    "expected_script_string_key": "expected_script_string_value"\n  }\n}]
      ).never

      sync_in_instance.send(:prepare_project_content)

      assert_empty sync_in_instance.send(:variable_strings)
      assert_empty sync_in_instance.send(:parameter_strings)
    end
  end

  def test_i18n_strings_collection_for_levels_tree
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    level = FactoryBot.build(:bubble_choice_level, name: 'expected_level')
    blockly_sublevel = FactoryBot.build(
      :level,
      name:                      'expected_blockly_sublevel_name',
      display_name:              'expected_blockly_sublevel_display_name',
      bubble_choice_description: 'expected_blockly_sublevel_bubble_choice_description',
      short_instructions:        'expected_blockly_sublevel_short_instructions',
      long_instructions:         'expected_blockly_sublevel_long_instructions',
      failure_message_override:  'expected_blockly_sublevel_failure_message_override',
      teacher_markdown:          'expected_blockly_sublevel_teacher_markdown',
    )
    free_response_sublevel = FactoryBot.build(
      :free_response,
      name:        'expected_free_response_sublevel_name',
      title:       'expected_free_response_sublevel_title',
      placeholder: 'expected_free_response_sublevel_placeholder',
    )
    contained_level_group_level = FactoryBot.build(:level_group, name: 'expected_contained_level_group_level')
    contained_level_group_child_level = FactoryBot.build(
      :level,
      name:                      'expected_contained_level_group_child_level_name',
      display_name:              'expected_contained_level_group_child_level_display_name',
      bubble_choice_description: 'expected_contained_level_group_child_level_bubble_choice_description',
      short_instructions:        'expected_contained_level_group_child_level_short_instructions',
      long_instructions:         'expected_contained_level_group_child_level_long_instructions',
      failure_message_override:  'expected_contained_level_group_child_level_failure_message_override',
      teacher_markdown:          'expected_contained_level_group_child_level_teacher_markdown',
    )

    level.expects(:dsl_text).returns('expected_bubble_choice_dsl_text')
    BubbleChoiceDSL.expects(:parse).with('expected_bubble_choice_dsl_text', '').returns(%w[unexpecxted_level_dsls expected_level_dsls])
    level.expects(:sublevels).returns([blockly_sublevel, free_response_sublevel])
    level.expects(:contained_levels).returns([contained_level_group_level])
    contained_level_group_level.expects(:child_levels).returns([contained_level_group_child_level])

    expected_result = {
      'dsls' => 'expected_level_dsls',
      'sublevels' => {
        'expected_blockly_sublevel_name' => {
          'display_name'              => 'expected_blockly_sublevel_display_name',
          'bubble_choice_description' => 'expected_blockly_sublevel_bubble_choice_description',
          'short_instructions'        => 'expected_blockly_sublevel_short_instructions',
          'long_instructions'         => 'expected_blockly_sublevel_long_instructions',
          'failure_message_override'  => 'expected_blockly_sublevel_failure_message_override',
          'teacher_markdown'          => 'expected_blockly_sublevel_teacher_markdown',
        },
        'expected_free_response_sublevel_name' => {
          'placeholder' => 'expected_free_response_sublevel_placeholder',
           'title'      => 'expected_free_response_sublevel_title',
        }
      },
      'contained levels' => [
        {
          'sublevels' => {
            'expected_contained_level_group_child_level_name' => {
              'display_name'              => 'expected_contained_level_group_child_level_display_name',
              'bubble_choice_description' => 'expected_contained_level_group_child_level_bubble_choice_description',
              'short_instructions'        => 'expected_contained_level_group_child_level_short_instructions',
              'long_instructions'         => 'expected_contained_level_group_child_level_long_instructions',
              'failure_message_override'  => 'expected_contained_level_group_child_level_failure_message_override',
              'teacher_markdown'          => 'expected_contained_level_group_child_level_teacher_markdown',
            }
          }
        }
      ]
    }

    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)
  end

  def test_i18n_strings_collection_for_level_authored_hints
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    level = FactoryBot.build(:level)

    level.authored_hints = [
      {
        hint_id:       'expected_level_authored_hint_id',
        hint_markdown: <<-XML.strip.gsub(/^ {10}/, '')
          <xml>
            <block type="text">
              <title name="TEXT">expected_text</title>
            </block>
            <block type="studio_ask">
              <title name="TEXT">expected_studio_ask_text</title>
            </block>
            <block type="studio_showTitleScreen">
              <title name="TITLE">expected_studio_showTitleScreen_title</title>
              <title name="TEXT">expected_studio_showTitleScreen_text</title>
            </block>
          </xml>
        XML
      }
    ].to_json
    expected_result = {
      'authored_hints' => {
        'expected_level_authored_hint_id' =>
          %Q[<xml>\n  <block type="text">\n    <title name="TEXT">expected_text</title>\n  </block>\n  <block type="studio_ask">\n    <title name="TEXT">expected_studio_ask_text</title>\n  </block>\n  <block type="studio_showTitleScreen">\n    <title name="TITLE">expected_studio_showTitleScreen_title</title>\n    <title name="TEXT">expected_studio_showTitleScreen_text</title>\n  </block>\n</xml>]
      },
      'placeholder_texts' => {
        '8b4392677953eadd44d4fd4b1a368898' => 'expected_text',
        '15fc5bdc0d791dd9ccabfd174452d0f3' => 'expected_studio_ask_text',
        'a8f3e57b784535af4d6a3ba9fa7bf976' => 'expected_studio_showTitleScreen_text',
        '42dfb6e185f9cf71e26ab0cfa0d63f42' => 'expected_studio_showTitleScreen_title',
      }
    }
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)

    level.authored_hints = '[]'
    expected_result = {}
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)
  end

  def test_i18n_strings_collection_for_level_callout_json
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    level = FactoryBot.build(:level)

    level.callout_json = [
      {
        localization_key: 'expected_callout_json_localization_key',
        callout_text:     'expected_callout_json_callout_text',
      }
    ].to_json
    expected_result = {
      'callouts' => {
        'expected_callout_json_localization_key' => 'expected_callout_json_callout_text'
      }
    }
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)

    level.callout_json = '[]'
    expected_result = {}
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)
  end

  def test_i18n_strings_collection_for_level_mini_rubric
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    level = FactoryBot.build(
      :level,
      rubric_key_concept:         'expected_rubric_key_concept',
      rubric_performance_level_1: 'expected_rubric_performance_level_1',
      rubric_performance_level_2: 'expected_rubric_performance_level_2',
      rubric_performance_level_3: 'expected_rubric_performance_level_3',
      rubric_performance_level_4: 'expected_rubric_performance_level_4',
    )

    level.mini_rubric = 'true'
    expected_result = {
      'mini_rubric' => {
        'rubric_key_concept'         => 'expected_rubric_key_concept',
        'rubric_performance_level_1' => 'expected_rubric_performance_level_1',
        'rubric_performance_level_2' => 'expected_rubric_performance_level_2',
        'rubric_performance_level_3' => 'expected_rubric_performance_level_3',
        'rubric_performance_level_4' => 'expected_rubric_performance_level_4',
      }
    }
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)

    level.mini_rubric = 'false'
    expected_result = {}
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)
  end

  def test_i18n_strings_collection_for_level_dynamic_instructions
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    level = FactoryBot.build(:level)

    level.dynamic_instructions = {'expected_dynamic_instruction_key' => 'expected_dynamic_instruction_value'}.to_json
    expected_result = {'dynamic_instructions' => {'expected_dynamic_instruction_key' => 'expected_dynamic_instruction_value'}}
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)

    level.dynamic_instructions = '{}'
    expected_result = {}
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)
  end

  def test_i18n_strings_collection_for_level_short_instructions
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    level = FactoryBot.build(:level)
    level.short_instructions = <<-XML.strip.gsub(/^ {6}/, '')
      <xml>
        <block type="text">
          <title name="TEXT">expected_text</title>
        </block>
        <block type="studio_ask">
          <title name="TEXT">expected_studio_ask_text</title>
        </block>
        <block type="studio_showTitleScreen">
          <title name="TITLE">expected_studio_showTitleScreen_title</title>
          <title name="TEXT">expected_studio_showTitleScreen_text</title>
        </block>
      </xml>
    XML

    expected_result = {
      'short_instructions' =>
        %Q[<xml>\n  <block type="text">\n    <title name="TEXT">expected_text</title>\n  </block>\n  <block type="studio_ask">\n    <title name="TEXT">expected_studio_ask_text</title>\n  </block>\n  <block type="studio_showTitleScreen">\n    <title name="TITLE">expected_studio_showTitleScreen_title</title>\n    <title name="TEXT">expected_studio_showTitleScreen_text</title>\n  </block>\n</xml>],
      'placeholder_texts' => {
        '8b4392677953eadd44d4fd4b1a368898' => 'expected_text',
        '15fc5bdc0d791dd9ccabfd174452d0f3' => 'expected_studio_ask_text',
        'a8f3e57b784535af4d6a3ba9fa7bf976' => 'expected_studio_showTitleScreen_text',
        '42dfb6e185f9cf71e26ab0cfa0d63f42' => 'expected_studio_showTitleScreen_title',
      }
    }

    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)
  end

  def test_i18n_strings_collection_for_level_long_instructions
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    level = FactoryBot.build(:level)
    level.long_instructions = <<-XML.strip.gsub(/^ {6}/, '')
      <xml>
        <block type="text">
          <title name="TEXT">expected_text</title>
        </block>
        <block type="studio_ask">
          <title name="TEXT">expected_studio_ask_text</title>
        </block>
        <block type="studio_showTitleScreen">
          <title name="TITLE">expected_studio_showTitleScreen_title</title>
          <title name="TEXT">expected_studio_showTitleScreen_text</title>
        </block>
      </xml>
    XML

    expected_result = {
      'long_instructions' =>
        %Q[<xml>\n  <block type="text">\n    <title name="TEXT">expected_text</title>\n  </block>\n  <block type="studio_ask">\n    <title name="TEXT">expected_studio_ask_text</title>\n  </block>\n  <block type="studio_showTitleScreen">\n    <title name="TITLE">expected_studio_showTitleScreen_title</title>\n    <title name="TEXT">expected_studio_showTitleScreen_text</title>\n  </block>\n</xml>],
      'placeholder_texts' => {
        '8b4392677953eadd44d4fd4b1a368898' => 'expected_text',
        '15fc5bdc0d791dd9ccabfd174452d0f3' => 'expected_studio_ask_text',
        'a8f3e57b784535af4d6a3ba9fa7bf976' => 'expected_studio_showTitleScreen_text',
        '42dfb6e185f9cf71e26ab0cfa0d63f42' => 'expected_studio_showTitleScreen_title',
      }
    }

    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)
  end

  def test_i18n_strings_collection_for_level_start_html
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    level = FactoryBot.build(:level)

    level.start_html = <<-HTML.strip.gsub(/^ {6}/, '')
      <div>
        <h1>expected_start_html_text_1</h1>
        <h2>expected_start_html_text_2</h2>
      </div>
    HTML
    expected_result = {
      'start_html' => {
        'expected_start_html_text_1' => 'expected_start_html_text_1',
        'expected_start_html_text_2' => 'expected_start_html_text_2',
      }
    }
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)

    level.start_html = ''
    expected_result = {}
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)
  end

  def test_yml_file_writting
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    expected_type = 'expected_type'
    expected_strings = {'expected_string_2' => '', 'expected_string_1' => ''}
    expected_file = mock
    expected_formatted_data = {
      'en' => {
        'data' => {
          expected_type => {
            'expected_string_1' => '',
            'expected_string_2' => ''
          }
        }
      }
    }

    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/dashboard')).once
    File.expects(:open).with(CDO.dir('i18n/locales/source/dashboard/expected_type.yml'), 'w').yields(expected_file)
    I18nScriptUtils.expects(:to_crowdin_yaml).with(expected_formatted_data).returns('expected_yml_data')
    expected_file.expects(:write).with('expected_yml_data').once

    sync_in_instance.send(:write_to_yml, expected_type, expected_strings)
  end

  def test_redactable_selection
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    provided_i18n_strings = {
      'unexpected_key'     => 'unexpected_value',
      'short_instructions' => 'expected_short_instructions',
      'long_instructions'  => 'expected_long_instructions',
      'teacher_markdown'   => 'expected_teacher_markdown',
      'authored_hints'     => 'expected_authored_hints',
      'contained levels'   => [
        {
          'unexpected_key'     => 'unexpected_value',
          'short_instructions' => '', # unexpected blank value
          'contained levels'   => [], # unexpected empty levels
        },
        {
          'short_instructions' => 'expected_short_instructions',
          'contained levels'   => [
            {'long_instructions' => 'expected_long_instructions'}
          ],
        },
      ]
    }
    expected_result = {
      'short_instructions' => 'expected_short_instructions',
      'long_instructions'  => 'expected_long_instructions',
      'teacher_markdown'   => 'expected_teacher_markdown',
      'authored_hints'     => 'expected_authored_hints',
      'contained levels'   => [
        {
          'short_instructions' => 'expected_short_instructions',
          'contained levels'   => [
            {'long_instructions' => 'expected_long_instructions'}
          ],
        },
      ]
    }

    assert_equal expected_result, sync_in_instance.send(:select_redactable, provided_i18n_strings)
  end

  def test_level_content_redaction
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    Dir.expects(:[]).with(CDO.dir('i18n/locales/source/course_content/**/*.json')).in_sequence(exec_seq).returns([CDO.dir('i18n/locales/source/course_content/blank_i18n_source_file.json'), CDO.dir('i18n/locales/source/course_content/expected_i18n_source_file.json')])

    # 'i18n/locales/source/course_content/blank_i18n_source_file.json' should be skipped
    JSON.expects(:load_file).with(CDO.dir('i18n/locales/source/course_content/blank_i18n_source_file.json')).in_sequence(exec_seq).returns({})
    sync_in_instance.expects(:select_redactable).with({}).never

    JSON.expects(:load_file).with(CDO.dir('i18n/locales/source/course_content/expected_i18n_source_file.json')).in_sequence(exec_seq).returns({'expected_level_url' => 'expected_i18n_strings'})
    sync_in_instance.expects(:select_redactable).with('expected_i18n_strings').in_sequence(exec_seq).returns({'expected_redactable_data' => 'expected_redactable_i18n_strings'})

    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/original/course_content')).in_sequence(exec_seq)
    File.expects(:write).with(CDO.dir('i18n/locales/original/course_content/expected_i18n_source_file.json'), %Q[{\n  "expected_level_url": {\n    "expected_redactable_data": "expected_redactable_i18n_strings"\n  }\n}]).in_sequence(exec_seq)

    RedactRestoreUtils.expects(:redact_data).with({'expected_level_url' => {'expected_redactable_data' => 'expected_redactable_i18n_strings'}}, %w[blockly]).in_sequence(exec_seq).returns({'expected_level_url' => {'expected_redactable_data' => 'expected_redacted_i18n_strings'}})
    File.expects(:write).with(CDO.dir('i18n/locales/source/course_content/expected_i18n_source_file.json'), %Q[{\n  "expected_level_url": {\n    "expected_redactable_data": "expected_redacted_i18n_strings"\n  }\n}]).in_sequence(exec_seq)

    sync_in_instance.send(:redact_level_content)
  end
end
