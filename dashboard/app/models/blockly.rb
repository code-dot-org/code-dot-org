# == Schema Information
#
# Table name: levels
#
#  id                       :integer          not null, primary key
#  game_id                  :integer
#  name                     :string(255)      not null
#  created_at               :datetime
#  updated_at               :datetime
#  level_num                :string(255)
#  ideal_level_source_id    :integer
#  solution_level_source_id :integer
#  user_id                  :integer
#  properties               :text(65535)
#  type                     :string(255)
#  md5                      :string(255)
#  published                :boolean          default(FALSE), not null
#  notes                    :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#

require 'nokogiri'
class Blockly < Level
  include SolutionBlocks

  serialized_attrs %w(
    level_url
    skin
    start_blocks
    toolbox_blocks
    required_blocks
    recommended_blocks
    solution_blocks
    ani_gif_url
    is_k1
    skip_instructions_popup
    never_autoplay_video
    scrollbars
    ideal
    min_workspace_height
    step_speed
    slider_speed
    disable_param_editing
    disable_variable_editing
    use_modal_function_editor
    use_contract_editor
    default_num_example_blocks
    open_function_definition
    contract_highlight
    contract_collapse
    examples_highlight
    examples_collapse
    examples_required
    definition_highlight
    definition_collapse
    disable_examples
    project_template_level_name
    is_project_level
    edit_code
    code_functions
    failure_message_override
    droplet_tooltips_disabled
    lock_zero_param_functions
  )

  before_save :update_ideal_level_source

  before_validation {
    self.scrollbars = nil if scrollbars == 'nil'
  }

  # These serialized fields will be serialized/deserialized as straight XML
  def xml_blocks
    %w(start_blocks toolbox_blocks required_blocks recommended_blocks solution_blocks)
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
    self.class.pretty_print_xml(xml_node.to_xml)
  end

  def load_level_xml(xml_node)
    block_nodes = xml_blocks.count > 0 ? xml_node.xpath(xml_blocks.map{|x| '//'+x}.join(' | ')).map(&:remove) : []
    level_properties = super(xml_node)
    block_nodes.each do |attr_node|
      level_properties[attr_node.name] = attr_node.child.serialize(save_with: XML_OPTIONS).strip
    end
    level_properties
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
    self.class.pretty_print_xml(xml_string)
  end

  def self.count_xml_blocks(xml_string)
    unless xml_string.blank?
      xml = Nokogiri::XML(xml_string, &:noblanks)
      # The structure of the XML will be
      # <document>
      #   <xml>
      #     ... blocks ...
      # So the blocks will be the children of the first child of the document
      return xml.try(:children).try(:first).try(:children).try(:length) || 0
    end
    0
  end

  def self.convert_toolbox_to_category(xml_string)
    xml = Nokogiri::XML(xml_string, &:noblanks)
    return xml_string if xml.nil? || xml.xpath('/xml/block[@type="category"]').empty?
    default_category = category_node = Nokogiri::XML("<category name='Default'>").child
    xml.child << default_category
    xml.xpath('/xml/block').each do |block|
      if block.attr('type') == 'category'
        category_name = block.xpath('title').text
        category_node = Nokogiri::XML("<category name='#{category_name}'>").child
        category_node['custom'] = 'PROCEDURE' if category_name == 'Functions'
        category_node['custom'] = 'VARIABLE' if category_name == 'Variables'
        xml.child << category_node
        block.remove
      else
        block.remove
        category_node << block
      end
    end
    default_category.remove if default_category.element_children.empty?
    xml.serialize(save_with: XML_OPTIONS).gsub("\n", '').strip
  end

  def self.convert_category_to_toolbox(xml_string)
    xml = Nokogiri::XML(xml_string, &:noblanks).child
    return xml_string if xml.nil?
    xml.xpath('/xml/category').map(&:remove).each do |category|
      category_name = category.xpath('@name')
      category_xml = <<-XML.strip_heredoc.chomp
        <block type="category">
          <title name="CATEGORY">#{category_name}</title>
        </block>
      XML
      block = Nokogiri::XML(category_xml, &:noblanks).child
      xml << block
      xml << category.children
      #block.xpath('statement')[0] << wrap_blocks(category.xpath('block').to_a) unless category.xpath('block').empty?
    end
    xml.serialize(save_with: XML_OPTIONS).gsub("\n", '').strip
  end

  # for levels with solutions
  def update_ideal_level_source
    return if !self.respond_to?(:solution_blocks) || solution_blocks.blank?
    self.ideal_level_source_id = LevelSource.find_identical_or_create(self, solution_blocks).id
  end

  # What blocks should be embedded for the given block_xml. Default behavior is to change nothing.
  def blocks_to_embed(block_xml)
    return block_xml
  end

  # Return a Blockly-formatted 'appOptions' hash derived from the level contents
  def blockly_options
    options = Rails.cache.fetch("#{cache_key}/blockly_level_options/v2") do
      level = self
      level_prop = {}

      # Map Dashboard-style names to Blockly-style names in level object.
      # Dashboard sample_property will be mapped to Blockly sampleProperty by default.
      # To override the default camelization add an entry to this hash.
      overrides = {
        required_blocks: 'levelBuilderRequiredBlocks',
        recommended_blocks: 'levelBuilderRecommendedBlocks',
        toolbox_blocks: 'toolbox',
        x: 'initialX',
        y: 'initialY',
        maze: 'map',
        ani_gif_url: 'aniGifURL',
        success_condition: 'fn_successCondition',
        failure_condition: 'fn_failureCondition',
      }
      level.properties.keys.each do |dashboard|
        blockly = overrides[dashboard.to_sym] || dashboard.camelize(:lower)
        # Select value from properties json
        # Don't override existing valid (non-nil/empty) values
        value = JSONValue.value(level.properties[dashboard].presence)
        level_prop[blockly] = value unless value.nil? # make sure we convert false
      end

      # Set some specific values

      if level.is_a? Blockly
        level_prop['startBlocks'] = level.try(:project_template_level).try(:start_blocks) || level.start_blocks
        level_prop['toolbox'] = level.try(:project_template_level).try(:toolbox_blocks) || level.toolbox_blocks
        level_prop['codeFunctions'] = level.try(:project_template_level).try(:code_functions) || level.code_functions
      end

      if level.is_a? Applab
        level_prop['startHtml'] = level.try(:project_template_level).try(:start_html) || level.start_html
      end

      if level.is_a?(Maze) && level.step_mode
        step_mode = JSONValue.value(level.step_mode)
        level_prop['step'] = step_mode == 1 || step_mode == 2
        level_prop['stepOnly'] = step_mode == 2
      end

      level_prop['images'] = JSON.parse(level_prop['images']) if level_prop['images'].present?

      # Blockly requires startDirection as an integer not a string
      level_prop['startDirection'] = level_prop['startDirection'].to_i if level_prop['startDirection'].present?
      level_prop['sliderSpeed'] = level_prop['sliderSpeed'].to_f if level_prop['sliderSpeed']
      level_prop['scale'] = {'stepSpeed' => level_prop['stepSpeed']} if level_prop['stepSpeed'].present?

      # Blockly requires these fields to be objects not strings
      %w(map initialDirt serializedMaze goal softButtons inputOutputTable).
          concat(NetSim.json_object_attrs).
          concat(Craft.json_object_attrs).
          each do |x|
        level_prop[x] = JSON.parse(level_prop[x]) if level_prop[x].is_a? String
      end

      # Blockly expects fn_successCondition and fn_failureCondition to be inside a 'goals' object
      if level_prop['fn_successCondition'] || level_prop['fn_failureCondition']
        level_prop['goal'] = {fn_successCondition: level_prop['fn_successCondition'], fn_failureCondition: level_prop['fn_failureCondition']}
        level_prop.delete('fn_successCondition')
        level_prop.delete('fn_failureCondition')
      end

      app_options = {}

      app_options[:levelGameName] = level.game.name if level.game
      app_options[:skinId] = level.skin if level.is_a?(Blockly)

      # Set some values that Blockly expects on the root of its options string
      non_nil_level_prop = level_prop.reject!{|_, value| value.nil?}
      app_options.merge!({
                             baseUrl: Blockly.base_url,
                             app: level.game.try(:app),
                             levelId: level.level_num,
                             level: non_nil_level_prop,
                             droplet: level.game.try(:uses_droplet?),
                             pretty: Rails.configuration.pretty_apps ? '' : '.min',
                         })
    end
    options[:level].freeze
    options.freeze
  end

  def self.base_url
    "#{Blockly.asset_host_prefix}/blockly/"
  end

  def self.asset_host_prefix
    host = ActionController::Base.asset_host
    (host.blank?) ? "" : "//#{host}"
  end

  # If true, don't autoplay videos before this level (but do keep them in the
  # related videos collection).
  def autoplay_blocked_by_level?
    # Wrapped since we store our serialized booleans as strings.
    self.never_autoplay_video == 'true'
  end
end
