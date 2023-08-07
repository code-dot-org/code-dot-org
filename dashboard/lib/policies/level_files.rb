module Policies
  module LevelFiles
    # Find the file which defines the level of the given name if it exists, or
    # a path to which such a file should be written if it doesn't.
    def self.level_file_path(level_name)
      level_paths = Dir.glob(Rails.root.join("config/scripts/**/#{level_name}.level"))
      raise("Multiple .level files for '#{level_name}' found: #{level_paths}") if level_paths.many?
      level_paths.first || Rails.root.join("config/scripts/levels/#{level_name}.level")
    end

    # Return whether or not the given level should be serialized to the file
    # system, based on both the level itself and the current environment.
    def self.write_to_file?(level)
      level.custom? && !level.is_a?(DSLDefined) && Rails.application.config.levelbuilder_mode
    end

    # Identify the name of the level defined by the given file path
    def self.level_name_from_path(path)
      File.basename(path, File.extname(path))
    end

    # Return a glob which can be used either to find the specified level file
    # by name if provided, or all level files if not.
    def self.level_file_glob(level_name)
      level_name ? "config/scripts/**/#{level_name}.level" : 'config/scripts/**/*.level'
    end
  end
end
