module Services
  module LevelFiles
    # Creates or updates the corresponding .level file for the given level
    #
    # @param [Level]
    # @return [String] path to the .level file
    def self.write_custom_level_file(level)
      # Don't update the file system unless we both expect to have a file for
      # this level and are ready for that file to be updated.
      return unless Policies::LevelFiles.write_to_file?(level) && level.published

      file_path = Policies::LevelFiles.level_file_path(level.name)
      File.write(file_path, level.to_xml)
      file_path
    end

    # Deletes the corresponding .level file for a given level
    #
    # @param [Level]
    def self.delete_custom_level_file(level)
      # Don't update the file system unless we expect to have a file for this level.
      return unless Policies::LevelFiles.write_to_file?(level)

      # TODO: not sure why this isn't using level_file_path
      file_path = Dir.glob(Rails.root.join("config/scripts/**/#{level.name}.level")).first
      File.delete(file_path) if file_path && File.exist?(file_path)
    end

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
    def self.load_custom_level(level_path, level_md5s_by_name)
      name = Policies::LevelFiles.level_name_from_path(level_path)
      # Only reload level data when file contents change
      level_data = File.read(level_path)
      md5 = Digest::MD5.hexdigest(level_data)
      if level_md5s_by_name[name] == md5
        nil
      else
        level = Level.find_by_name(name) || Level.new(name: name)
        level.md5 = md5
        level = Services::LevelFiles.load_custom_level_xml(level_data, level)
        level
      end
    rescue Exception => exception
      # print filename for better debugging
      new_e = Exception.new("in level: #{level_path}: #{exception.message}")
      new_e.set_backtrace(exception.backtrace)
      raise new_e
    end

    # Populate the given Level object with data from the given XML-formatted String
    def self.load_custom_level_xml(xml, level)
      xml_node = Nokogiri::XML(xml, &:noblanks)
      level = level.with_type(xml_node.root.name)

      # Delete entries for all other attributes that may no longer be specified in the xml.
      # Fixes issue #75863324 (delete removed level properties on import)
      level.send(:write_attribute, 'properties', {})
      level.assign_attributes(level.load_level_xml(xml_node))

      level
    end
  end
end
