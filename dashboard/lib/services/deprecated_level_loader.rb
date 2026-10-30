module Services
  module DeprecatedLevelLoader
    def self.load_blockly_levels(root_dir = Rails.root)
      path = File.expand_path("#{root_dir}/config/deprecated_levels/blockly_levels.json")
      json = File.read(path)
      raw_levels_by_key = JSON.parse(json)
      raw_levels_by_key.each do |key, raw_level|
        raw_level.symbolize_keys!
        raise unless key.starts_with?('blockly')

        # this level is defined in levels.js. find/create the reference to this level
        level = Level.
          create_with(name: 'blockly').
          find_or_create_by!(Level.key_to_params(key))
        level = level.with_type(raw_level.delete(:type) || 'Blockly') if level.type.nil?
        if level.video_key && !raw_level[:video_key]
          raw_level[:video_key] = nil
        end

        level.update!(raw_level)
      end
    end
  end
end
