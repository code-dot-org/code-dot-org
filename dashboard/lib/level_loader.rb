require 'set'

class LevelLoader
  def self.file_paths(glob)
    Dir.glob(Rails.root.join(glob)).sort
  end

  def self.for_each_file(path, &block)
    file_paths(path).map(&block)
  end

  def self.load_custom_levels
    # Use a transaction because loading levels requires two separate imports.
    Level.transaction do
      level_md5s_by_name = Hash[Level.pluck(:name, :md5)]
      existing_level_names = level_md5s_by_name.keys.to_set
      level_file_paths = file_paths('config/scripts/**/*.level')

      # First, save stubs of any new levels - they'll need to have ids in
      # order to create certain associations (in particular
      # level_concept_difficulty) when we bulk-load the level properties.
      new_level_names = level_file_paths.
        map {|path| name_from_path path}.
        reject {|name| existing_level_names.include? name}
      Level.import! new_level_names.map {|name| {name: name}}

      # Load level properties from disk and build a collection of levels that
      # have changed.
      changed_levels = level_file_paths.
          map {|path| load_custom_level path, level_md5s_by_name}.
          compact.
          select(&:changed?)

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

  def self.name_from_path(path)
    File.basename(path, File.extname(path))
  end

  def self.level_file_path(name)
    level_paths = Dir.glob(Rails.root.join("config/scripts/**/#{name}.level"))
    raise("Multiple .level files for '#{name}' found: #{level_paths}") if level_paths.many?
    level_paths.first || Rails.root.join("config/scripts/levels/#{name}.level")
  end

  def self.load_custom_level(level_path, level_md5s_by_name = Hash[Level.pluck(:name, :md5)])
    name = name_from_path level_path
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

  def self.update_unplugged
    # Unplugged level data is specified in 'unplugged.en.yml' file
    unplugged = YAML.load_file(Rails.root.join('config/locales/unplugged.en.yml'))['en']['data']['unplugged'].keys
    unplugged_game = Game.find_by(name: 'Unplugged')
    unplugged.map do |name, _|
      Level.where(name: name).first_or_create.update(
        type: 'Unplugged',
        game: unplugged_game
      )
    end
  end
end
