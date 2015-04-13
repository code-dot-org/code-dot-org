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
    use_modal_function_editor
    use_contract_editor
    default_num_example_blocks
    open_function_definition
    contract_highlight
    contract_collapse
    examples_highlight
    examples_collapse
    definition_highlight
    definition_collapse
    disable_examples
    project_template_level_name
    is_project_level
    edit_code
    code_functions
    failure_message_override
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
    self.class.pretty_print(xml_string)
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
    Rails.cache.fetch("#{cache_key}/blockly_level_options") do
      level = self
      # Use values from properties json when available (use String keys instead of Symbols for consistency)
      level_prop = level.properties.dup || {}

      # Set some specific values

      if level.is_a? Blockly
        level_prop['start_blocks'] = level.try(:project_template_level).try(:start_blocks) || level.start_blocks
        level_prop['toolbox_blocks'] = level.try(:project_template_level).try(:toolbox_blocks) || level.toolbox_blocks
        level_prop['code_functions'] = level.try(:project_template_level).try(:code_functions) || level.code_functions
      end

      if level.is_a?(Maze) && level.step_mode
        step_mode = JSONValue.value(level.step_mode)
        level_prop['step'] = step_mode == 1 || step_mode == 2
        level_prop['stepOnly'] = step_mode == 2
      end

      # Map Dashboard-style names to Blockly-style names in level object.
      # Dashboard underscore_names mapped to Blockly lowerCamelCase, or explicit 'Dashboard:Blockly'
      Hash[%w(
        start_blocks
        solution_blocks
        predraw_blocks
        slider_speed
        start_direction
        instructions
        initial_dirt
        final_dirt
        nectar_goal
        honey_goal
        flower_type
        skip_instructions_popup
        is_k1
        required_blocks:levelBuilderRequiredBlocks
        toolbox_blocks:toolbox
        x:initialX
        y:initialY
        maze:map
        ani_gif_url:aniGifURL
        shapeways_url
        images
        free_play
        min_workspace_height
        permitted_errors
        disable_param_editing
        disable_variable_editing
        success_condition:fn_successCondition
        failure_condition:fn_failureCondition
        first_sprite_index
        protaganist_sprite_index
        timeout_failure_tick
        soft_buttons
        edge_collisions
        projectile_collisions
        allow_sprites_outside_playspace
        sprites_hidden_to_start
        background
        coordinate_grid_background
        use_modal_function_editor
        use_contract_editor
        contract_highlight
        contract_collapse
        examples_highlight
        examples_collapse
        definition_highlight
        definition_collapse
        disable_examples
        default_num_example_blocks
        impressive
        open_function_definition
        disable_sharing
        edit_code
        code_functions
        app_width
        app_height
        embed
        generate_function_pass_blocks
        timeout_after_when_run
        custom_game_type
        project_template_level_name
        scrollbars
        is_project_level
        failure_message_override
        show_clients_in_lobby
        show_routers_in_lobby
        show_add_router_button
        router_expects_packet_header
        client_initial_packet_header
        show_add_packet_button
        show_packet_size_control
        default_packet_size_limit
        show_tabs
        default_tab_index
        show_encoding_controls
        default_enabled_encodings
        show_router_bandwidth_control
        default_router_bandwidth
        show_router_memory_control
        default_router_memory
        show_dns_mode_control
        default_dns_mode
        input_output_table
        complete_on_success_condition_not_goals
      ).map{ |x| x.include?(':') ? x.split(':') : [x,x.camelize(:lower)]}]
          .each do |dashboard, blockly|
        # Select value from properties json
        # Don't override existing valid (non-nil/empty) values
        property = level_prop[dashboard].presence
        value = JSONValue.value(level_prop[blockly] || property)
        level_prop[blockly] = value unless value.nil? # make sure we convert false
      end

      level_prop['images'] = JSON.parse(level_prop['images']) if level_prop['images'].present?

      # Blockly requires startDirection as an integer not a string
      level_prop['startDirection'] = level_prop['startDirection'].to_i if level_prop['startDirection'].present?
      level_prop['sliderSpeed'] = level_prop['sliderSpeed'].to_f if level_prop['sliderSpeed']
      level_prop['scale'] = {'stepSpeed' => level_prop['step_speed'].to_i} if level_prop['step_speed'].present?

      # Blockly requires these fields to be objects not strings
      (
      %w(map initialDirt finalDirt goal soft_buttons inputOutputTable)
          .concat NetSim.json_object_attrs
      ).each do |x|
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
      app_options.merge!({
                             baseUrl: "#{ActionController::Base.asset_host}/blockly/",
                             app: level.game.try(:app),
                             levelId: level.level_num,
                             level: level_prop,
                             cacheBust: level.class.cache_bust,
                             droplet: level.game.try(:uses_droplet?),
                             pretty: Rails.configuration.pretty_apps ? '' : '.min',
                         })

      app_options
    end
  end

  # XXX Since Blockly doesn't play nice with the asset pipeline, a query param
  # must be specified to bust the CDN cache. CloudFront is enabled to forward
  # query params. Don't cache bust during dev, so breakpoints work.
  # See where ::CACHE_BUST is initialized for more details.
  def self.cache_bust
    if ::CACHE_BUST.blank?
      false
    else
      ::CACHE_BUST
    end
  end
end
