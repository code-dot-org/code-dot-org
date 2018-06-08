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
    doc = Nokogiri.XML(
      <<~XML
        <xml>
          <block
            type="#{DEFINITION_BLOCK_TYPES[block_type.to_sym]}"
            deletable="false"
            movable="false"
            editable="false"
          >
            <mutation>
              #{arguments_xml}
            </mutation>
            <title name="NAME">#{name}</title>
            <statement name="STACK">
              #{stack}
            </statement>
          </block>
        </xml>
      XML
    ) {|config| config.default_xml.noblanks}
    doc.root.to_xml(indent: 2)
  end

  def arguments_xml
    JSON.parse(arguments).map do |name, type|
      <<~XML
        <arg name="#{name}" type="#{type}"></arg>
      XML
    end.join('')
  end

  def xml_path(type=level_type, function_name=name)
    Rails.root.join "config/shared_functions/#{type}/#{function_name}.js"
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
end
