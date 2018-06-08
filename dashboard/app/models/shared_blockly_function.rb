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
  enum block_type: {
    function: 0,
    behavior: 1,
  }

  after_save :write_file
  after_destroy :delete_file
  validates_presence_of :name
  validates_uniqueness_of :name

  before_save do
    self.block_type = 'behavior'
    self.level_type = 'GameLabJr'
  end

  def file_xml
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
        xml.title(name, name: 'NAME')
        xml.statement(name: 'STACK') do
          xml << stack
        end
      end
    end.to_xml
  end

  def self.arguments_from_xml(args_xml)
    JSON.generate(
      args_xml.map do |arg_xml|
        [arg_xml.attribute('name'), arg_xml.attribute('type')]
      end.to_h
    )
  end

  def xml_path(type=level_type, function_name=name)
    Rails.root.join "config/shared_functions/#{type}/#{function_name}.xml"
  end

  def write_file
    delete_file(level_type_was, name_was) if name_changed? || level_type_changed?
    FileUtils.mkdir_p "config/shared_functions/#{level_type}"
    File.write xml_path, file_xml
  end

  def delete_file(old_level_type=level_type, old_name=name)
    path = xml_path(old_level_type, old_name)
    File.delete path if File.exist? path
  end

  def self.load_functions
    function_names = []
    LevelLoader.for_each_file('config/shared_functions/**/*.xml') do |xml_path|
      function_names << load_function(xml_path)
    end
  end

  def self.load_function(xml_path)
    level_type = File.basename(File.dirname(xml_path))
    function_doc = File.open(xml_path) do |f|
      Nokogiri.XML(f) {|config| config.strict.noblanks}
    end
    block_type = function_doc.xpath('/block/@type').text
    arguments = arguments_from_xml(function_doc.xpath('/block/mutation/arg'))
    description = function_doc.xpath('/block/mutation/description').text
    name = function_doc.xpath('/block/title[@name="NAME"]/text()').text
    stack = function_doc.xpath('/block/statement[@name="STACK"]/*')

    function = find_or_initialize_by(name: name)
    function.level_type = level_type
    function.block_type = BLOCK_TYPES_BY_DEFINITION_TYPE[block_type]
    function.arguments = arguments
    function.description = description
    function.stack = stack
    function.save!
  end
end
