module Services
  module LevelXml
    def self.level_to_xml(level, options = {})
      builder = Nokogiri::XML::Builder.new do |xml|
        xml.send(level.type) do
          xml.config do
            hash = level.serializable_hash(include: :level_concept_difficulty).deep_dup
            hash = level.filter_level_attributes(hash)
            if level.encrypted?
              hash['encrypted_properties'] = Encryption.encrypt_object(hash.delete('properties'))
              hash['encrypted_notes'] = Encryption.encrypt_object(hash.delete('notes'))
            end
            xml.cdata(JSON.pretty_generate(hash.as_json))
          end
        end
      end
      builder.to_xml(Level::PRETTY_PRINT)
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
  end
end
