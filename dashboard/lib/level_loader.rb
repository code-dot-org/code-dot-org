require 'set'

class LevelLoader
  # Top-level entry point, called by rake seed:custom_levels
  def self.load_custom_levels(level_name)
    levels_glob = level_name ? "config/scripts/**/#{level_name}.level" : 'config/scripts/**/*.level'
    import_levels levels_glob
  end

  #
  # Loads a group of level files from disk and imports them into the database.
  #
  # - Level files not found in the database will be created.
  # - Level files found in the database will be updated if they don't match the
  #   file as loaded from disk.
  #
  # @param [String] level_file_glob - dashboard-relative, wildcard-friendly path
  #   to one or more .level files.
  #   Examples:
  #     'config/scripts/levels/K-1 Bee 2.level'
  #     'config/scripts/**/*.level'
  #
  def self.import_levels(level_file_glob)
    level_file_paths = file_paths_from_glob(level_file_glob)

    # This is only expected to happen when LEVEL_NAME is set and the
    # filename is not found
    unless level_file_paths.count > 0
      raise 'no matching level names found. '\
        'please check level name for exact case and spelling. '\
        'the level name is the level filename without the .level suffix.'
    end

    # Use a transaction because loading levels requires two separate imports.
    Level.transaction do
      level_md5s_by_name = Hash[Level.pluck(:name, :md5)]
      existing_level_names = level_md5s_by_name.keys.to_set

      level_file_names = level_file_paths.map {|path| level_name_from_path path}
      if level_file_names.include? 'blockly'
        raise 'custom levels must not be named "blockly"'
      end

      # First, save stubs of any new levels - they'll need to have ids in
      # order to create certain associations (in particular
      # level_concept_difficulty) when we bulk-load the level properties.
      new_level_names = level_file_names.
        reject {|name| existing_level_names.include? name}
      Level.import! new_level_names.map {|name| {name: name}}

      # Load level properties from disk and build a collection of levels that
      # have changed.
      changed_levels = level_file_paths.
          map {|path| load_custom_level path, level_md5s_by_name}.
          compact.
          select(&:changed?)

      if [:development, :adhoc].include?(rack_env) && !CDO.properties_encryption_key
        puts "WARNING: skipping seeding encrypted levels because CDO.properties_encryption_key is not defined"
        changed_levels.reject!(&:encrypted?)
      end

      # activerecord-import (with MySQL, anyway) doesn't save associated
      # models, so we've got to do this manually.
      changed_lcds = changed_levels.map(&:level_concept_difficulty).compact
      lcd_update_columns = LevelConceptDifficulty.columns.map(&:name).map(&:to_sym).
          reject {|column| %i{id level_id created_at}.include? column}
      LevelConceptDifficulty.import! changed_lcds, on_duplicate_key_update: lcd_update_columns

      # activerecord-import doesn't trigger before_save and before_create hooks
      # for imported models, so we trigger these manually to make sure they're
      # set up the same way they would be otherwise.
      # @see https://github.com/zdennis/activerecord-import/wiki/Callbacks
      changed_levels.each do |level|
        level.run_callbacks(:save) {false}
        level.run_callbacks(:create) {false}
      end

      # Bulk-import changed levels.
      update_columns = Level.columns.map(&:name).map(&:to_sym).
        reject {|column| %i(id name created_at).include? column}
      Level.import! changed_levels, on_duplicate_key_update: update_columns
    end
  end

  #
  # Loads an individual .level file from disk into memory, using the existing
  # copy from the database as a starting point if it's available, or initializing
  # a new level if it's not.
  #
  # Does NOT actually save the level to the database; instead, returns the new
  # or updated level for bulk-import at a later time.
  #
  # Does not parse level XML at all if the level on disk has the same checksum
  # as the one we have on file in the db.
  #
  # @param [String] level_path
  # @param [Hash] level_md5s_by_name for levels in db
  # @return [Level]
  #
  private_class_method def self.load_custom_level(level_path, level_md5s_by_name)
    name = level_name_from_path level_path
    # Only reload level data when file contents change
    level_data = File.read(level_path)
    md5 = Digest::MD5.hexdigest(level_data)
    if level_md5s_by_name[name] != md5
      level = Level.find_by_name(name) || Level.new(name: name)
      level.md5 = md5
      level = load_custom_level_xml(level_data, level)
      level
    else
      nil
    end
  rescue Exception => e
    # print filename for better debugging
    new_e = Exception.new("in level: #{level_path}: #{e.message}")
    new_e.set_backtrace(e.backtrace)
    raise new_e
  end

  def self.load_custom_level_xml(xml, level)
    xml_node = Nokogiri::XML(xml, &:noblanks)
    level = level.with_type(xml_node.root.name)

    # Delete entries for all other attributes that may no longer be specified in the xml.
    # Fixes issue #75863324 (delete removed level properties on import)
    level.send(:write_attribute, 'properties', {})
    level.assign_attributes(level.load_level_xml(xml_node))

    level
  end

  private_class_method def self.level_name_from_path(path)
    File.basename(path, File.extname(path))
  end

  private_class_method def self.file_paths_from_glob(glob)
    Dir.glob(Rails.root.join(glob)).sort
  end
end
