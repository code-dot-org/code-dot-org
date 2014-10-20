require 'nokogiri'
class Blockly < Level
  serialized_attrs %w(
    level_url
    skin
    instructions
    start_blocks
    toolbox_blocks
    required_blocks
    ani_gif_url
    is_k1
    skip_instructions_popup
    scrollbars
    ideal
    min_workspace_height
    step_speed
    slider_speed
    disable_param_editing
    disable_variable_editing
  )

  before_validation {
    self.scrollbars = nil if scrollbars == 'nil'
  }

  # These serialized fields will be serialized/deserialized as straight XML
  def xml_blocks
    %w(start_blocks toolbox_blocks required_blocks)
  end

  def to_xml(options={})
    xml_node = Nokogiri::XML(super(options))
    Nokogiri::XML::Builder.with(xml_node.at(self.type)) do |xml|
      xml.blocks do
        xml_blocks.each do |attr|
          xml.send(attr) { |x| x << self.send(attr)} if self.send(attr).present?
        end
      end
    end
    self.class.pretty_print(xml_node.to_xml)
  end

  def load_level_xml(xml)
    xml_node = Nokogiri::XML(xml, &:noblanks)
    block_nodes = xml_node.xpath(xml_blocks.map{|x| '//'+x}.join(' | ')).map(&:remove)
    super(xml_node.to_xml)
    block_nodes.each do |attr_node|
      self.send("#{attr_node.name}=", attr_node.child.to_xml)
    end
    self.tap(&:save!)
  end

  def filter_level_attributes(level_hash)
    super(level_hash.tap{|hash| hash['properties'].except!(*xml_blocks)})
  end

  before_validation {
    xml_blocks.each {|attr| normalize_xml attr}
  }

  XML_OPTIONS = Nokogiri::XML::Node::SaveOptions::NO_DECLARATION

  def normalize_xml(attr)
    attr_val = self.send(attr)
    if attr_val.present?
      normalized_attr = Nokogiri::XML(attr_val, &:noblanks).serialize(save_with: XML_OPTIONS).strip
      self.send("#{attr}=", normalized_attr)
    end
  end

  # Overriden by different Blockly level types
  def self.skins
    []
  end

  def pretty_block(block_name)
    xml_string = self.send("#{block_name}_blocks")
    self.class.pretty_print(xml_string)
  end

  def self.convert_toolbox_to_category(xml_string)
    xml = Nokogiri::XML(xml_string, &:noblanks)
    return xml_string if xml.nil?
    xpath_query = "/xml/block[@type='procedures_defnoreturn' and starts-with(title/text(),'CATEGORY=')]"
    xml.xpath(xpath_query).map(&:remove).each do |category|
      category_name = category.xpath('title').text.tap { |x| x.slice!('CATEGORY=') }
      category_node = Nokogiri::XML("<category name='#{category_name}'").child
      category_node['custom'] = 'PROCEDURE' if category_name == 'Functions'
      category_node['custom'] = 'VARIABLE' if category_name == 'Variables'
      category_blocks = category.xpath("statement[@name='STACK']/block")
      unwrap_blocks(category_blocks).each { |block| category_node << block }
      xml.child << category_node
    end
    xml.serialize(save_with: XML_OPTIONS).gsub("\n", '').strip
  end

  def self.unwrap_blocks(node)
    next_node = node.xpath('next')[0]
    output = [node]
    output.concat(unwrap_blocks(next_node.remove.xpath('block')[0])) if next_node
    output
  end

  def self.wrap_blocks(blocks)
    current_block = blocks.slice!(0)
    unless blocks.empty?
      next_tag = Nokogiri::XML('<next/>').child
      next_tag << wrap_blocks(blocks)
      current_block << next_tag
    end
    current_block
  end

  def self.convert_category_to_toolbox(xml_string)
    xml = Nokogiri::XML(xml_string, &:noblanks).child
    return xml_string if xml.nil?
    xml.xpath('/xml/category').map(&:remove).each do |category|
      category_name = category.xpath('@name')
      category_xml = <<XML
<block type="procedures_defnoreturn">
  <mutation/>
  <title name="NAME">CATEGORY=#{category_name}</title>
  <statement name="STACK"/>
</block>
XML
      block = Nokogiri::XML(category_xml, &:noblanks).child
      xml << block
      block.xpath('statement')[0] << wrap_blocks(category.xpath('block').to_a) unless category.xpath('block').empty?
    end
    xml.serialize(save_with: XML_OPTIONS).gsub("\n", '').strip
  end

  # for levels with solutions
  def update_ideal_level_source
    return if !self.respond_to?(:solution_blocks) || solution_blocks.blank?
    self.ideal_level_source = LevelSource.find_identical_or_create(self, solution_blocks)
  end
end
