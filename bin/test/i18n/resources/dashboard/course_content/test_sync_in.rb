require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/course_content/sync_in'

class I18n::Resources::Dashboard::CourseContent::SyncInTest < Minitest::Test
  def setup
    I18n::Metrics.stubs(:report_runtime).yields(nil)
    File.stubs(:write)
    FileUtils.stubs(:mkdir_p)
  end

  def test_base_class_inheriting
    assert_equal I18n::Utils::SyncInBase, I18n::Resources::Dashboard::CourseOfferings::SyncIn.superclass
  end

  def test_execution
    execution_sequence = sequence('execution')

    I18n::Resources::Dashboard::CourseContent::SyncIn.any_instance.stubs(:variable_strings).returns('expected_variable_strings')
    I18n::Resources::Dashboard::CourseContent::SyncIn.any_instance.stubs(:parameter_strings).returns('expected_parameter_strings')

    I18n::Resources::Dashboard::CourseContent::SyncIn.any_instance.expects(:prepare_level_content).in_sequence(execution_sequence)
    I18n::Resources::Dashboard::CourseContent::SyncIn.any_instance.expects(:prepare_project_content).in_sequence(execution_sequence)

    I18n::Resources::Dashboard::CourseContent::SyncIn.any_instance.expects(:write_to_yml).with('variable_names', 'expected_variable_strings').in_sequence(execution_sequence)
    I18n::Resources::Dashboard::CourseContent::SyncIn.any_instance.expects(:write_to_yml).with('parameter_names', 'expected_parameter_strings').in_sequence(execution_sequence)

    I18n::Resources::Dashboard::CourseContent::SyncIn.perform
  end

  def test_level_content_preparation_of_hoc_script
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    expected_i18n_source_dir_path = CDO.dir('i18n/locales/source/course_content')
    expected_i18n_source_file_path = File.join(expected_i18n_source_dir_path, 'Hour of Code/hoc-script.json')
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
    script.expects(:in_initiative?).with('HOC').returns(true)
    I18nScriptUtils.expects(:unit_directory_change?).with(expected_i18n_source_dir_path, expected_i18n_source_file_path).in_sequence(exec_seq).returns(false)
    I18nScriptUtils.expects(:write_json_file).with(expected_i18n_source_file_path, {'expected_level_url' => {'expected_script_string_key' => 'expected_script_string_value'}}).in_sequence(exec_seq)
    sync_in_instance.expects(:redact_json_file).with(expected_i18n_source_file_path).in_sequence(exec_seq)

    sync_in_instance.expects(:write_to_yml).with('block_categories', expected_block_categories).in_sequence(exec_seq)
    sync_in_instance.expects(:write_to_yml).with('progressions', {expected_string_level_progression => expected_string_level_progression}).in_sequence(exec_seq)

    sync_in_instance.send(:prepare_level_content)

    assert_equal expected_variable_names, sync_in_instance.send(:variable_strings)
    assert_equal expected_parameter_names, sync_in_instance.send(:parameter_strings)
  end

  def test_level_content_preparation_of_unversioned_script
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    expected_i18n_source_dir_path = CDO.dir('i18n/locales/source/course_content')
    expected_i18n_source_file_path = File.join(expected_i18n_source_dir_path, 'other/unversioned-script.json')
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
    script.expects(:in_initiative?).with('HOC').in_sequence(exec_seq).returns(false)
    script.expects(:unversioned?).in_sequence(exec_seq).returns(true)
    I18nScriptUtils.expects(:unit_directory_change?).with(expected_i18n_source_dir_path, expected_i18n_source_file_path).in_sequence(exec_seq).returns(false)
    I18nScriptUtils.expects(:write_json_file).with(expected_i18n_source_file_path, {'expected_level_url' => {'expected_script_string_key' => 'expected_script_string_value'}}).in_sequence(exec_seq)
    sync_in_instance.expects(:redact_json_file).with(expected_i18n_source_file_path).in_sequence(exec_seq)

    sync_in_instance.expects(:write_to_yml).with('block_categories', expected_block_categories).in_sequence(exec_seq)
    sync_in_instance.expects(:write_to_yml).with('progressions', {expected_string_level_progression => expected_string_level_progression}).in_sequence(exec_seq)

    sync_in_instance.send(:prepare_level_content)

    assert_equal expected_variable_names, sync_in_instance.send(:variable_strings)
    assert_equal expected_parameter_names, sync_in_instance.send(:parameter_strings)
  end

  def test_level_content_preparation_versioned_script
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    expected_i18n_source_dir_path = CDO.dir('i18n/locales/source/course_content')
    expected_i18n_source_file_path = File.join(expected_i18n_source_dir_path, 'expected_version_year/versioned-script.json')
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
    script.expects(:in_initiative?).with('HOC').in_sequence(exec_seq).returns(false)
    script.expects(:unversioned?).in_sequence(exec_seq).returns(false)
    I18nScriptUtils.expects(:unit_directory_change?).with(expected_i18n_source_dir_path, expected_i18n_source_file_path).in_sequence(exec_seq).returns(false)
    I18nScriptUtils.expects(:write_json_file).with(expected_i18n_source_file_path, {'expected_level_url' => {'expected_script_string_key' => 'expected_script_string_value'}}).in_sequence(exec_seq)
    sync_in_instance.expects(:redact_json_file).with(expected_i18n_source_file_path).in_sequence(exec_seq)

    sync_in_instance.expects(:write_to_yml).with('block_categories', expected_block_categories).in_sequence(exec_seq)
    sync_in_instance.expects(:write_to_yml).with('progressions', {expected_string_level_progression => expected_string_level_progression}).in_sequence(exec_seq)

    sync_in_instance.send(:prepare_level_content)

    assert_equal expected_variable_names, sync_in_instance.send(:variable_strings)
    assert_equal expected_parameter_names, sync_in_instance.send(:parameter_strings)
  end

  def test_level_content_preparation_of_script_with_changed_derectory
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    expected_i18n_source_dir_path = CDO.dir('i18n/locales/source/course_content')
    expected_i18n_source_file_path = File.join(expected_i18n_source_dir_path, 'expected_version_year/versioned-script.json')
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
    script.expects(:in_initiative?).with('HOC').in_sequence(exec_seq).returns(false)
    script.expects(:unversioned?).in_sequence(exec_seq).returns(false)
    I18nScriptUtils.expects(:unit_directory_change?).with(expected_i18n_source_dir_path, expected_i18n_source_file_path).in_sequence(exec_seq).returns(true)
    I18nScriptUtils.expects(:write_json_file).with(expected_i18n_source_file_path, {'expected_level_url' => {'expected_script_string_key' => 'expected_script_string_value'}}).never
    sync_in_instance.expects(:redact_json_file).with(expected_i18n_source_file_path).never

    sync_in_instance.expects(:write_to_yml).with('block_categories', expected_block_categories).in_sequence(exec_seq)
    sync_in_instance.expects(:write_to_yml).with('progressions', {expected_string_level_progression => expected_string_level_progression}).in_sequence(exec_seq)

    sync_in_instance.send(:prepare_level_content)

    assert_equal expected_variable_names, sync_in_instance.send(:variable_strings)
    assert_equal expected_parameter_names, sync_in_instance.send(:parameter_strings)
  end

  def test_level_content_preparation_of_untranslatable_script
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new
    exec_seq = sequence('execution')

    expected_i18n_source_dir_path = CDO.dir('i18n/locales/source/course_content')
    expected_i18n_source_file_path = File.join(expected_i18n_source_dir_path, 'expected_version_year/versioned-script.json')
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
    script.expects(:in_initiative?).with('HOC').never.returns(false)
    script.expects(:unversioned?).never.returns(false)
    I18nScriptUtils.expects(:unit_directory_change?).with(expected_i18n_source_dir_path, expected_i18n_source_file_path).never.returns(false)
    I18nScriptUtils.expects(:write_json_file).with(expected_i18n_source_file_path, {'expected_level_url' => {'expected_script_string_key' => 'expected_script_string_value'}}).never
    sync_in_instance.expects(:redact_json_file).with(expected_i18n_source_file_path).never

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

      expected_i18n_source_dir_path = CDO.dir('i18n/locales/source/course_content')
      expected_i18n_source_file_path = File.join(expected_i18n_source_dir_path, 'projects.json')
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
      I18nScriptUtils.expects(:write_json_file).with(
        expected_i18n_source_file_path,
        {'https://studio.code.org/p/expected_project_key' => {'expected_script_string_key' => 'expected_script_string_value'}}
      ).in_sequence(exec_seq)
      sync_in_instance.expects(:redact_json_file).with(expected_i18n_source_file_path).in_sequence(exec_seq)

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

      expected_i18n_source_file_path = CDO.dir('i18n/locales/source/course_content/projects.json')
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
      I18nScriptUtils.expects(:write_json_file).with(expected_i18n_source_file_path, {}).once
      sync_in_instance.expects(:redact_json_file).with(expected_i18n_source_file_path).once

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
        hint_markdown: <<~XML.strip
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
    level.short_instructions = <<~XML.strip
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
    level.long_instructions = <<~XML.strip
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

  def test_i18n_strings_collection_for_level_start_libraries
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    level = FactoryBot.build(:level)

    level.start_libraries = JSON.generate(
      [{name: "I18N_library",
        description: "Test Library that gets translated",
        source: "var TRANSLATIONTEXT = {\n \"test_key_1\": \"expected_string_1\",\"test_key_2\": \"expected_string_2\"\n};\n\n//This library is translated\nfunction someFunction(key) {\n return TRANSLATIONTEXT[key];\n}\n"},
       {name: "non_translated_library",
        description: "Test Library that does not get translated",
        source: "var TRANSLATIONTEXT = {\n \"not_translated_key\": \"not_translated_string\"\n};\n\n//This library is not translated\nfunction someFunction(key) {\n return TRANSLATIONTEXT[key];\n}\n"}]
    )
    expected_result = {
      'start_libraries' => {
        'I18N_library' => {
          'test_key_1' => 'expected_string_1',
          'test_key_2' => 'expected_string_2',
        }
      }
    }
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)

    level.start_libraries = ''
    expected_result = {}
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)
  end

  def test_i18n_strings_collection_for_level_validations
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    level = FactoryBot.build(:music)

    level.validations = [
      {
        'conditions' => [{'name' => 'condition-1', 'value' => 1}],
        'message' => 'message-1',
        'next' => true,
        'key' => 'validation-1'
      },
      {
        'conditions' => [],
        'message' => 'message-2',
        'next' => false,
        'key' => 'validation-2',
      }
    ]

    expected_result = {
      'validations' => {
        'validation-1' => 'message-1',
        'validation-2' => 'message-2'
      }
    }

    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)

    level.validations = []
    expected_result = {}
    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)
  end

  def test_i18n_strings_collection_for_level_panels
    sync_in_instance = I18n::Resources::Dashboard::CourseContent::SyncIn.new

    level = FactoryBot.build(:panels)

    level.panels = [
      {
        'text' => 'text-1',
        'imageUrl' => 'imageUrl-1',
        'key' => 'panel-1',
        'layout' => 'text-bottom-left'
      },
      {
        'text' => 'text-2',
        'imageUrl' => 'imageUrl-2',
        'key' => 'panel-2',
        'nextUrl' => 'nextUrl-2'
      },
    ]

    expected_result = {
      'panels' => {
        'panel-1' => 'text-1',
        'panel-2' => 'text-2'
      }
    }

    assert_equal expected_result, sync_in_instance.send(:get_i18n_strings, level)

    level.panels = []
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
      'validations'        => 'expected_validations',
      'panels'             => 'expected_panels',
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
      'validations'        => 'expected_validations',
      'panels'             => 'expected_panels',
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
end

describe I18n::Resources::Dashboard::CourseContent::SyncIn do
  let(:described_class) {I18n::Resources::Dashboard::CourseContent::SyncIn}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  describe '#get_i18n_strings' do
    let(:get_i18n_strings) {described_instance.send(:get_i18n_strings, level)}

    context 'when level has Categories' do
      let(:level) {FactoryBot.build :level, toolbox_blocks: toolbox_blocks}

      let(:toolbox_blocks) do
        <<~XML.strip
          <xml>
            <category name="expected_category_name"/>
          </xml>
        XML
      end

      it 'includes "block_categories"' do
        _(get_i18n_strings['block_categories']).must_equal(
          'expected_category_name' => 'expected_category_name',
        )
      end
    end

    context 'when level has Functions' do
      let(:level) {FactoryBot.build(:level, solution_blocks: solution_blocks)}

      let(:solution_blocks) do
        <<~XML.strip
          <xml>
            <block type="procedures_defnoreturn">
              <title name="NAME">expected_func_name</title>
              <mutation>
                <description>expected_func_desc</description>
                <arg name="expected_func_param1"/>
                <arg name="expected_func_param2"/>
              </mutation>
            </block>
          </xml>
        XML
      end

      it 'includes "function_definitions"' do
        _(get_i18n_strings['function_definitions']).must_equal(
          'expected_func_name' => {
            'name' => 'expected_func_name',
            'description' => 'expected_func_desc',
            'parameters' => {
              'expected_func_param1' => 'expected_func_param1',
              'expected_func_param2' => 'expected_func_param2',
            }
          }
        )
      end

      context 'with name in "field" tag' do
        let(:solution_blocks) do
          <<~XML.strip
            <xml>
              <block type="procedures_defnoreturn">
                <field name="NAME">expected_func_name</title>
                <mutation>
                  <description>expected_func_desc</description>
                  <arg name="expected_func_param"/>
                </mutation>
              </block>
            </xml>
          XML
        end

        it 'includes "function_definitions"' do
          _(get_i18n_strings['function_definitions']).must_equal(
            'expected_func_name' => {
              'name' => 'expected_func_name',
              'description' => 'expected_func_desc',
              'parameters' => {
                'expected_func_param' => 'expected_func_param',
              }
            }
          )
        end
      end

      context 'without name tag' do
        let(:solution_blocks) do
          <<~XML.strip
            <xml>
              <block type="procedures_defnoreturn">
                <mutation>
                  <description>expected_func_desc</description>
                  <arg name="expected_func_param"/>
                </mutation>
              </block>
            </xml>
          XML
        end

        it 'does not include "function_definitions"' do
          _(get_i18n_strings['function_definitions']).must_be_nil
        end
      end
    end

    context 'when level has Spritelab behaviors' do
      let(:level) {FactoryBot.build(:level, start_blocks: start_blocks)}

      let(:start_blocks) do
        <<~XML.strip
          <xml>
            <block type="behavior_definition">
              <title name="NAME">expected_behavior_name</title>
              <mutation>
                <description>expected_behavior_desc</description>
              </mutation>
            </block>
          </xml>
        XML
      end

      it 'includes "behavior_names"' do
        _(get_i18n_strings['behavior_names']).must_equal(
          'expected_behavior_name' => 'expected_behavior_name',
        )
      end

      it 'includes "behavior_descriptions"' do
        _(get_i18n_strings['behavior_descriptions']).must_equal(
          'expected_behavior_desc' => 'expected_behavior_desc',
        )
      end

      context 'with name in "field" tag' do
        let(:start_blocks) do
          <<~XML.strip
            <xml>
              <block type="behavior_definition">
                <field name="NAME">expected_behavior_name</title>
              </block>
            </xml>
          XML
        end

        it 'includes "behavior_names"' do
          _(get_i18n_strings['behavior_names']).must_equal(
            'expected_behavior_name' => 'expected_behavior_name',
          )
        end
      end

      context 'without name tag and mutation/description tag' do
        let(:start_blocks) do
          <<~XML.strip
            <xml>
              <block type="behavior_definition" />
            </xml>
          XML
        end

        it 'does not include "behavior_names"' do
          _(get_i18n_strings['behavior_names']).must_be_nil
        end

        it 'does not include "behavior_descriptions"' do
          _(get_i18n_strings['behavior_descriptions']).must_be_nil
        end
      end
    end

    context 'when level has Variable gets' do
      let(:level) {FactoryBot.build(:level, start_blocks: start_blocks)}

      let(:start_blocks) do
        <<~XML.strip
          <xml>
            <block type="variables_get">
              <title name="VAR">expected_var_get_name</title>
            </block>
          </xml>
        XML
      end

      it 'includes "variable_names"' do
        _(get_i18n_strings['variable_names']).must_equal(
          'expected_var_get_name' => 'expected_var_get_name',
        )
      end

      context 'with name in "field" tag' do
        let(:start_blocks) do
          <<~XML.strip
            <xml>
              <block type="variables_get">
                <field name="VAR">expected_var_get_name</title>
              </block>
            </xml>
          XML
        end

        it 'includes "variable_names"' do
          _(get_i18n_strings['variable_names']).must_equal(
            'expected_var_get_name' => 'expected_var_get_name',
          )
        end
      end

      context 'without name in tag' do
        let(:start_blocks) do
          <<~XML.strip
            <xml>
              <block type="variables_get" />
            </xml>
          XML
        end

        it 'does not include "variable_names"' do
          _(get_i18n_strings['variable_names']).must_be_nil
        end
      end
    end

    context 'when level has Variable sets' do
      let(:level) {FactoryBot.build(:level, start_blocks: start_blocks)}

      let(:start_blocks) do
        <<~XML.strip
          <xml>
            <block type="variables_set">
              <title name="VAR">expected_var_set_name</title>
            </block>
          </xml>
        XML
      end

      it 'includes "variable_names"' do
        _(get_i18n_strings['variable_names']).must_equal(
          'expected_var_set_name' => 'expected_var_set_name',
        )
      end

      context 'with name in "field" tag' do
        let(:start_blocks) do
          <<~XML.strip
            <xml>
              <block type="variables_set">
                <field name="VAR">expected_var_set_name</title>
              </block>
            </xml>
          XML
        end

        it 'includes "variable_names"' do
          _(get_i18n_strings['variable_names']).must_equal(
            'expected_var_set_name' => 'expected_var_set_name',
          )
        end
      end

      context 'without name in tag' do
        let(:start_blocks) do
          <<~XML.strip
            <xml>
              <block type="variables_set" />
            </xml>
          XML
        end

        it 'does not include "variable_names"' do
          _(get_i18n_strings['variable_names']).must_be_nil
        end
      end
    end

    context 'when level has Parameter gets' do
      let(:level) {FactoryBot.build(:level, start_blocks: start_blocks)}

      let(:start_blocks) do
        <<~XML.strip
          <xml>
            <block type="parameters_get">
              <title name="VAR">expected_param_get_name</title>
            </block>
          </xml>
        XML
      end

      it 'includes "parameter_names"' do
        _(get_i18n_strings['parameter_names']).must_equal(
          'expected_param_get_name' => 'expected_param_get_name',
        )
      end

      context 'with name in "field" tag' do
        let(:start_blocks) do
          <<~XML.strip
            <xml>
              <block type="parameters_get">
                <field name="VAR">expected_param_get_name</title>
              </block>
            </xml>
          XML
        end

        it 'includes "parameter_names"' do
          _(get_i18n_strings['parameter_names']).must_equal(
            'expected_param_get_name' => 'expected_param_get_name',
          )
        end
      end

      context 'without name in tag' do
        let(:start_blocks) do
          <<~XML.strip
            <xml>
              <block type="parameters_get" />
            </xml>
          XML
        end

        it 'does not include "parameter_names"' do
          _(get_i18n_strings['parameter_names']).must_be_nil
        end
      end
    end
  end

  describe '#redact_json_file' do
    let(:redact_json_file) {described_instance.send(:redact_json_file, i18n_source_file_path)}

    let(:i18n_original_file_path) {CDO.dir('i18n/locales/original/course_content/expected_version_year/unit.json')}
    let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/course_content/expected_version_year/unit.json')}
    let(:i18n_source_file_data) {{level_url => i18n_data}}

    let(:level_url) {'expected_level_url'}
    let(:i18n_data) {'expected_i18n_data'}

    let(:redactable_data) {{level_url => 'expected_redactable_data'}}
    let(:redacted_data) {{level_url => 'expected_redacted_data'}}

    before do
      FileUtils.mkdir_p File.dirname(i18n_source_file_path)
      File.write i18n_source_file_path, JSON.dump(i18n_source_file_data)

      described_instance.stubs(:select_redactable).with(i18n_data).returns(redactable_data[level_url])
      RedactRestoreUtils.stubs(:redact_data).with(redactable_data, %w[blockly]).returns(redacted_data)
    end

    it 'creates the i18n original file for restoration' do
      redact_json_file

      _(File.file?(i18n_original_file_path)).must_equal true
      _(JSON.load_file(i18n_original_file_path)).must_equal redactable_data
    end

    it 'redacts the i18n source file data' do
      redact_json_file

      _(JSON.load_file(i18n_source_file_path)).must_equal redacted_data
    end
  end
end
