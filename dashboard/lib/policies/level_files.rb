module Policies
  module LevelFiles
    # Levels whose names carry the "UI Test " prefix (Level.ui_test_name?) are
    # stored under test/ui/config, everything else under config. The two trees
    # never overlap: a UI Test level never resolves to config/levels/**, and
    # vice versa.
    LEVELS_SUBDIR = {
      production: 'config/levels',
      ui_test: 'test/ui/config/levels',
    }.freeze

    def self.tree_for_name(level_name)
      Level.ui_test_name?(level_name) ? :ui_test : :production
    end

    # We organize new level files into a `levels` directory to keep them
    # separate from scripts and further organize them by the associated Game if
    # it has one, to avoid packing too many files into a single directory.
    def self.default_level_file_path(level)
      subdir = LEVELS_SUBDIR[tree_for_name(level.name)]
      return Rails.root.join(*[subdir, 'custom', level.game&.app, "#{level.name}.level"].compact)
    end

    # Find the file which defines the given level if it exists, or a path to
    # which such a file should be written if it doesn't.
    def self.level_file_path(level)
      # If we already have a .level file that matches the given level name, use that.
      level_paths = Dir.glob(Rails.root.join(Policies::LevelFiles.level_file_glob(level.name)))
      raise("Multiple .level files for '#{level.name}' found: #{level_paths}") if level_paths.many?
      return Pathname.new(level_paths.first) unless level_paths.empty?

      # If we don't yet have a .level file, create a new one at the default path.
      return Policies::LevelFiles.default_level_file_path(level)
    end

    # Return whether or not the given level should be serialized to the file
    # system, based on both the level itself and the current environment.
    def self.write_to_file?(level)
      level.custom? && !level.is_a?(DSLDefined) && Rails.application.config.levelbuilder_mode
    end

    # Identify the name of the level defined by the given file path.
    def self.level_name_from_path(path)
      File.basename(path, File.extname(path))
    end

    # Return a glob which can be used either to find the specified level file
    # by name if provided, or all level files if not. With a name, the tree is
    # selected by the name's prefix; without one, `tree` picks which tree's
    # levels to enumerate.
    def self.level_file_glob(level_name, root_dir = '.', tree: nil)
      tree ||= level_name ? tree_for_name(level_name) : :production
      "#{root_dir}/#{LEVELS_SUBDIR.fetch(tree)}/**/#{level_name || '*'}.level"
    end
  end
end
