require 'test_helper'

module Policies
  # Checks standalone_projects.yml against the definition files beside it
  # under config/standalone_projects. Reads only those and the ui-test tree,
  # so it needs no production content mapped in. See
  # dashboard/config/standalone_projects/README.md.
  class StandaloneProjectsTest < ActiveSupport::TestCase
    STANDALONE_TREE = Rails.root.join('config/standalone_projects')
    UI_TEST_TREE = Rails.root.join('test/ui/config')
    DSL_EXTENSIONS = %w(text_match contract_match external match multi evaluation_multi bubble_choice level_group).freeze

    VALID_CONFIG = {'applab' => {'name' => 'New App Lab Project', 'login_required' => true}}.freeze

    test 'validate! accepts a well-formed entry' do
      Policies::StandaloneProjects.validate!(VALID_CONFIG)
    end

    test 'validate! names the file and key when an entry body is outdented' do
      # `applab:` followed by `name: ...` at column 0 parses as a nil entry plus a top-level `name` key.
      error = assert_invalid({'applab' => nil, 'name' => 'New App Lab Project'})
      assert_includes error.message, 'standalone_projects.yml: project type "applab":'
      assert_includes error.message, 'check indentation'
    end

    test 'validate! rejects an outdented flag' do
      error = assert_invalid(VALID_CONFIG.merge('i18n' => true))
      assert_includes error.message, 'project type "i18n":'
    end

    test 'validate! rejects unknown keys' do
      error = assert_invalid('applab' => VALID_CONFIG['applab'].merge('logn_required' => true))
      assert_includes error.message, 'unknown keys ["logn_required"]'
    end

    test 'validate! rejects a name YAML read as a boolean' do
      error = assert_invalid('applab' => {'name' => true})
      assert_includes error.message, 'name must be a string, got true'
    end

    test 'validate! rejects a missing name' do
      error = assert_invalid('applab' => {'i18n' => true})
      assert_includes error.message, 'needs a name'
    end

    test 'validate! rejects a flag that is not a boolean' do
      error = assert_invalid('applab' => VALID_CONFIG['applab'].merge('i18n' => 'true'))
      assert_includes error.message, 'i18n must be true or false, got "true"'
    end

    test 'validate! rejects a key that is not a URL segment' do
      assert_invalid('app-lab' => VALID_CONFIG['applab'])
    end

    test 'validate! rejects an empty file' do
      assert_invalid(nil)
    end

    test 'every configured level has a standalone tree name and exactly one definition file in the standalone tree' do
      definitions = definitions_under(STANDALONE_TREE)
      ui_test_definitions = definitions_under(UI_TEST_TREE)
      Policies::StandaloneProjects.all.each do |key, config|
        name = config[:name]
        assert Policies::StandaloneProjects.tree_name?(name),
          "#{key}: #{name.dump} is not a standalone tree name (\"New ... Project\", \"... Subproject\", or LEGACY_PROJECT_NAMES); rename the level"
        assert_equal 1, definitions.fetch(name, []).size,
          "#{key}: expected exactly one definition of #{name.dump} under #{STANDALONE_TREE}, found #{definitions.fetch(name, [])}"
        assert_empty ui_test_definitions.fetch(name, []), "#{key}: #{name.dump} is also defined in the ui-test tree"
      end
    end

    test 'every definition in the standalone tree has a standalone tree name' do
      definitions = definitions_under(STANDALONE_TREE)
      refute_empty definitions
      definitions.each do |name, paths|
        assert Policies::StandaloneProjects.tree_name?(name),
          "#{paths.join(', ')} defines #{name.dump}, which is neither \"New ... Project\" nor \"... Subproject\"; move the file to the tree its name selects"
      end
    end

    test 'no definition in the ui-test or standalone tree matches two partition rules' do
      [UI_TEST_TREE, STANDALONE_TREE].each do |tree|
        definitions_under(tree).each do |name, paths|
          refute Level.ui_test_name?(name) && Policies::StandaloneProjects.tree_name?(name),
            "#{paths.join(', ')} defines #{name.dump}, which matches both the \"UI Test \" and the standalone project rules"
        end
      end
    end

    test 'level_names and project_level_name? follow the config' do
      assert_equal Policies::StandaloneProjects.all.values.pluck(:name), Policies::StandaloneProjects.level_names
      assert Policies::StandaloneProjects.project_level_name?('New App Lab Project')
      refute Policies::StandaloneProjects.project_level_name?('New Nonexistent Project')
    end

    test 'tree_name? follows the name rules' do
      ['New App Lab Project', 'new lowercase project', 'Calc Free Play', 'eval free play',
       'Dancer AI Subproject', 'dancer ai subproject'].each do |name|
        assert Policies::StandaloneProjects.tree_name?(name), name
      end
      ['New Project', 'Newish Project', 'New Projects', 'A New Foo Project', 'Subproject', 'Dancer AI', nil].each do |name|
        refute Policies::StandaloneProjects.tree_name?(name), name.inspect
      end
    end

    # name => [definition file paths] for every .level and DSL file under dir.
    private def definitions_under(dir)
      definitions = Hash.new {|hash, name| hash[name] = []}
      Dir.glob(dir.join('**/*.level')).sort.each do |path|
        definitions[Policies::LevelFiles.level_name_from_path(path)] << path
      end
      dsl_files_under(dir).each do |path|
        name = dsl_name(path)
        definitions[name] << path if name
      end
      definitions
    end

    private def dsl_files_under(dir)
      Dir.glob(dir.join("**/*.{#{DSL_EXTENSIONS.join(',')}}")).sort
    end

    private def dsl_name(path)
      File.read(path)[/^name\s+['"](.+?)['"]\s*$/, 1]
    end

    private def assert_invalid(config)
      assert_raises(Policies::StandaloneProjects::InvalidConfig) do
        Policies::StandaloneProjects.validate!(config)
      end
    end
  end
end
