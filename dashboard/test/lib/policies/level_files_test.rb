require 'test_helper'

module Policies
  class LevelFilesTest < ActiveSupport::TestCase
    test 'will provide a default if no file exists' do
      regular_level = create(:level)
      expected_file_path = Rails.root.join(
        'config/levels/custom',
        regular_level.game.app,
        "#{regular_level.name}.level"
      )
      refute(File.exist?(expected_file_path))
      assert_equal(Policies::LevelFiles.level_file_path(regular_level), expected_file_path)

      # can also provide a default for gameless levels, even though the regular
      # path includes the game name
      gameless_level = create(:level, game: nil)
      expected_file_path = Rails.root.join("config/levels/custom/#{gameless_level.name}.level")
      refute(File.exist?(expected_file_path))
      assert_equal(Policies::LevelFiles.level_file_path(gameless_level), expected_file_path)
    end

    test 'can find an existing level file from a variety of directories' do
      level = create(:level)
      level_files = [
        # Check in the default location
        'config/levels/custom',
        # Also check nested and deeply-nested subdirectories
        'config/levels/custom/foo',
        'config/levels/custom/foo/bar/baz',
      ].map {|dir| Rails.root.join(dir, "#{level.name}.level")}

      level_files.each do |level_file|
        FileUtils.mkdir_p(File.dirname(level_file))
        FileUtils.touch(level_file)
        assert_equal(Policies::LevelFiles.level_file_path(level), level_file)
        FileUtils.rm_f(level_file)
      end
    ensure
      # Make sure we clean up all touched level files, even if the test fails
      level_files.each {|level_file| FileUtils.rm_f(level_file)}
    end

    test 'will raise if multiple .level files found with the same name' do
      level = create(:level)
      level_files = [
        'config/levels/custom/foo',
        'config/levels/custom/bar',
      ].map {|dir| Rails.root.join(dir, "#{level.name}.level").to_s}
      level_files.each do |level_file|
        FileUtils.mkdir_p(File.dirname(level_file))
        FileUtils.touch(level_file)
      end

      exception = assert_raises {Policies::LevelFiles.level_file_path(level)}
      assert_includes(exception.message, "Multiple .level files for '#{level.name}' found:")
      level_files.each {|level_file| assert_includes(exception.message, level_file)}
    ensure
      level_files.each {|level_file| FileUtils.rm_f(level_file)}
    end

    test 'will only write to file in levelbuilder mode' do
      writable_level = create(:level)
      Rails.application.config.stubs(:levelbuilder_mode).returns(true)
      assert(Policies::LevelFiles.write_to_file?(writable_level))
      Rails.application.config.stubs(:levelbuilder_mode).returns(false)
      refute(Policies::LevelFiles.write_to_file?(writable_level))
    end

    test 'default path for UI Test levels is in the test/ui tree' do
      level = create(:level, name: 'UI Test LevelFiles default path')
      expected_file_path = Rails.root.join(
        'test/ui/config/levels/custom',
        level.game.app,
        "#{level.name}.level"
      )
      refute(File.exist?(expected_file_path))
      assert_equal(expected_file_path, Policies::LevelFiles.level_file_path(level))
    end

    test 'level_file_glob selects the tree by name' do
      assert_equal('./config/levels/**/Regular Level.level', Policies::LevelFiles.level_file_glob('Regular Level'))
      assert_equal('./test/ui/config/levels/**/UI Test Level.level', Policies::LevelFiles.level_file_glob('UI Test Level'))
      assert_equal('./config/standalone_projects/levels/**/New Glob Project.level', Policies::LevelFiles.level_file_glob('New Glob Project'))
      # the prefix is case-insensitive, and only counts as a prefix
      assert_equal('./test/ui/config/levels/**/ui test lowercase.level', Policies::LevelFiles.level_file_glob('ui test lowercase'))
      assert_equal('./config/levels/**/My UI Test Level.level', Policies::LevelFiles.level_file_glob('My UI Test Level'))
      # without a name, tree: picks which tree to enumerate
      assert_equal('./config/levels/**/*.level', Policies::LevelFiles.level_file_glob(nil))
      assert_equal('./test/ui/config/levels/**/*.level', Policies::LevelFiles.level_file_glob(nil, tree: :ui_test))
      assert_equal('./config/standalone_projects/levels/**/*.level', Policies::LevelFiles.level_file_glob(nil, tree: :standalone_project))
      assert_equal('/custom/root/test/ui/config/levels/**/*.level', Policies::LevelFiles.level_file_glob(nil, '/custom/root', tree: :ui_test))
    end

    test 'tree_for_name selects a tree by name and refuses a name matching two rules' do
      assert_equal :production, Policies::LevelFiles.tree_for_name('Regular Level')
      assert_equal :production, Policies::LevelFiles.tree_for_name('My UI Test Level')
      assert_equal :ui_test, Policies::LevelFiles.tree_for_name('UI Test Level')
      assert_equal :ui_test, Policies::LevelFiles.tree_for_name('ui test lowercase')
      assert_equal :standalone_project, Policies::LevelFiles.tree_for_name('New Tree Project')
      assert_equal :standalone_project, Policies::LevelFiles.tree_for_name('Tree Subproject')
      assert_equal :standalone_project, Policies::LevelFiles.tree_for_name('Calc Free Play')

      # UI Test names only: the project rule needs "New " at the start, and
      # the allow-list is an exact match
      assert_equal :ui_test, Policies::LevelFiles.tree_for_name('UI Test New Tree Project')
      assert_equal :ui_test, Policies::LevelFiles.tree_for_name('UI Test Calc Free Play')
      ['UI Test Tree Subproject', 'ui test lowercase subproject'].each do |name|
        e = assert_raises(ArgumentError) {Policies::LevelFiles.tree_for_name(name)}
        assert_includes e.message, 'only one'
      end
    end

    test 'same_tree? compares the trees two names select, and never raises' do
      assert Policies::LevelFiles.same_tree?('Regular Level', 'Other Level')
      assert Policies::LevelFiles.same_tree?('UI Test Level', 'ui test other')
      assert Policies::LevelFiles.same_tree?('New Tree Project', 'Tree Subproject')
      refute Policies::LevelFiles.same_tree?('Regular Level', 'UI Test Level')
      refute Policies::LevelFiles.same_tree?('Regular Level', 'Tree Subproject')
      refute Policies::LevelFiles.same_tree?('UI Test Level', 'New Tree Project')
      refute Policies::LevelFiles.same_tree?('UI Test Tree Subproject', 'UI Test Level')
    end

    test 'tree_for_path selects a tree by where the file sits' do
      assert_equal :production, Policies::LevelFiles.tree_for_path('config/levels/custom/maze/Foo.level')
      assert_equal :production, Policies::LevelFiles.tree_for_path(Rails.root.join('config/scripts/foo.multi'))
      assert_equal :ui_test, Policies::LevelFiles.tree_for_path('test/ui/config/levels/custom/UI Test Foo.level')
      assert_equal :ui_test, Policies::LevelFiles.tree_for_path('./test/ui/config/scripts/ui_test_foo.multi')
      assert_equal :standalone_project, Policies::LevelFiles.tree_for_path('config/standalone_projects/levels/custom/applab/New App Lab Project.level')
      assert_equal :standalone_project, Policies::LevelFiles.tree_for_path(Rails.root.join('config/standalone_projects/scripts/new_foo_project.bubble_choice'))
    end

    test 'default path for standalone project levels is in the standalone tree' do
      project = create(:level, name: 'New LevelFiles Default Path Project')
      assert_equal(
        Rails.root.join('config/standalone_projects/levels/custom', project.game.app, "#{project.name}.level"),
        Policies::LevelFiles.level_file_path(project)
      )
      subproject = create(:level, name: 'LevelFiles Default Path Subproject', game: nil)
      assert_equal(
        Rails.root.join("config/standalone_projects/levels/custom/#{subproject.name}.level"),
        Policies::LevelFiles.level_file_path(subproject)
      )
    end

    test 'a standalone project level never resolves to a file in the production tree' do
      level = create(:level, name: 'New LevelFiles Wrong Tree Project')
      stray = Rails.root.join('config/levels/custom', "#{level.name}.level")
      FileUtils.mkdir_p(File.dirname(stray))
      FileUtils.touch(stray)

      expected_file_path = Rails.root.join('config/standalone_projects/levels/custom', level.game.app, "#{level.name}.level")
      assert_equal(expected_file_path, Policies::LevelFiles.level_file_path(level))
    ensure
      FileUtils.rm_f(stray)
    end

    test 'a UI Test level never resolves to a file in the production tree' do
      level = create(:level, name: 'UI Test LevelFiles wrong tree')
      level_file = Rails.root.join('config/levels/custom', "#{level.name}.level")
      FileUtils.mkdir_p(File.dirname(level_file))
      FileUtils.touch(level_file)

      # the production-tree file is ignored; we get the test/ui default path
      expected_file_path = Rails.root.join('test/ui/config/levels/custom', level.game.app, "#{level.name}.level")
      assert_equal(expected_file_path, Policies::LevelFiles.level_file_path(level))
    ensure
      FileUtils.rm_f(level_file)
    end

    test 'will only write certain levels to file' do
      Rails.application.config.stubs(:levelbuilder_mode).returns(true)

      regular_level = create(:level)
      assert(Policies::LevelFiles.write_to_file?(regular_level))

      dsl_defined_level = External.create
      assert(dsl_defined_level.is_a?(DSLDefined))
      refute(Policies::LevelFiles.write_to_file?(dsl_defined_level))

      non_custom_level = create(:level, level_num: 'test_file_writing')
      refute(non_custom_level.custom?)
      refute(Policies::LevelFiles.write_to_file?(non_custom_level))
    end
  end
end
