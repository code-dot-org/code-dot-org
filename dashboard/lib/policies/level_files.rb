module Policies
  module LevelFiles
    # We organize new level files into a `levels` directory to keep them
    # separate from scripts and further organize them by the associated Game if
    # it has one, to avoid packing too many files into a single directory.
    def self.default_level_file_path(level)
      return Rails.root.join(*['config/levels/custom', level.game&.app, "#{level.name}.level"].compact)
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
    # by name if provided, or all level files if not.
    #
    # Supports both our old level file location at
    # "config/scripts/**/{name}.level" and our new level file location at
    # "config/levels/(custom|dsl_defined)/{game}/{name}.level"
    #
    # TODO: once all old level files have been moved out of the config/scripts
    # directory, update this to just inspect config/levels/**
    def self.level_file_glob(level_name)
      level_name ? "config/**/#{level_name}.level" : 'config/**/*.level'
    end
  end
end
