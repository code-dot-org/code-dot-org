# == Schema Information
#
# Table name: shared_blockly_functions
#
#  id          :integer          not null, primary key
#  name        :string(255)      not null
#  level_type  :string(255)
#  block_type  :integer          default("function"), not null
#  return      :string(255)
#  description :text(65535)
#  arguments   :text(65535)
#  stack       :text(65535)
#

DEFINITION_BLOCK_TYPES = {
  function: 'procedures_defnoreturn',
  behavior: 'behavior_definition',
}

BLOCK_TYPES_BY_DEFINITION_TYPE = DEFINITION_BLOCK_TYPES.invert

class SharedBlocklyFunction < ApplicationRecord
  include MultiFileSeeded

  enum block_type: {
    function: 0,
    behavior: 1,
  }

  CONFIG_DIRECTORY = 'shared_functions'
  SUBDIRECTORY_ATTRIBUTES = [:level_type]
  EXTENSION = 'xml'

  def file_content
    to_xml_doc.to_xml
  end

  def to_xml_fragment
    to_xml_doc.root.to_xml
  end

  def to_xml_doc
    Nokogiri::XML::Builder.new do |xml|
      xml.block(
        type: DEFINITION_BLOCK_TYPES[block_type.to_sym],
        deletable: false,
        movable: false,
        editable: false,
      ) do
        xml.mutation do
          JSON.parse(arguments).each do |name, type|
            xml.arg(name: name, type: type)
          end
          xml.description description
        end
        xml.title(name, name: 'NAME', id: name)
        xml.statement(name: 'STACK') do
          xml << stack.gsub(/\n */, '')
        end
      end
    end.doc
  end

  def self.arguments_from_xml(args_xml)
    JSON.generate(
      args_xml.map do |arg_xml|
        [arg_xml.attribute('name'), arg_xml.attribute('type')]
      end.to_h
    )
  end

  def self.properties_from_file(xml_path, content)
    level_type = File.basename(File.dirname(xml_path))
    function_doc = Nokogiri.XML(content) {|config| config.strict.noblanks}
    {
      level_type: level_type,
      block_type: BLOCK_TYPES_BY_DEFINITION_TYPE[
        function_doc.xpath('/block/@type').text
      ],
      name: function_doc.xpath('/block/title[@name="NAME"]/text()').text,
      description: function_doc.xpath('/block/mutation/description').text,
      arguments: arguments_from_xml(function_doc.xpath('/block/mutation/arg')),
      stack: function_doc.xpath('/block/statement[@name="STACK"]/*'),
    }
  end
end
