# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :integer
#  user_id               :integer
#  properties            :text(65535)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

require 'nokogiri'
class Blockly < Level
  include SolutionBlocks
  before_save :fix_examples

  serialized_attrs %w(
    level_url
    skin
    initialization_blocks
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
    disable_procedure_autopopulate
    top_level_procedure_autopopulate
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
    hide_share_and_remix
    is_project_level
    edit_code
    code_functions
    palette_category_at_start
    failure_message_override
    droplet_tooltips_disabled
    lock_zero_param_functions
    contained_level_names
    encrypted_examples
    disable_if_else_editing
  )

  before_save :update_ideal_level_source

  before_validation do
    self.scrollbars = nil if scrollbars == 'nil'
  end

  # These serialized fields will be serialized/deserialized as straight XML
  def xml_blocks
    %w(initialization_blocks start_blocks toolbox_blocks required_blocks recommended_blocks solution_blocks)
  end

  def to_xml(options={})
    xml_node = Nokogiri::XML(super(options))
    Nokogiri::XML::Builder.with(xml_node.at(type)) do |xml|
      xml.blocks do
        xml_blocks.each do |attr|
          xml.send(attr) {|x| x << send(attr)} if send(attr).present?
        end
      end
    end
    self.class.pretty_print_xml(xml_node.to_xml)
  end

  def load_level_xml(xml_node)
    block_nodes = xml_blocks.count > 0 ? xml_node.xpath(xml_blocks.map {|x| '//' + x}.join(' | ')).map(&:remove) : []
    level_properties = super(xml_node)
    block_nodes.each do |attr_node|
      level_properties[attr_node.name] = attr_node.child.serialize(save_with: XML_OPTIONS).strip
    end
    level_properties
  end

  def filter_level_attributes(level_hash)
    super(level_hash.tap {|hash| hash['properties'].except!(*xml_blocks)})
  end

  before_save :update_contained_levels

  def update_contained_levels
    contained_level_names = properties["contained_level_names"]
    contained_level_names.try(:delete_if, &:blank?)
    contained_level_names = nil unless contained_level_names.try(:present?)
    properties["contained_level_names"] = contained_level_names
  end

  before_validation do
    xml_blocks.each {|attr| normalize_xml attr}
  end

  XML_OPTIONS = Nokogiri::XML::Node::SaveOptions::NO_DECLARATION

  def normalize_xml(attr)
    attr_val = send(attr)
    if attr_val.present?
      normalized_attr = Nokogiri::XML(attr_val, &:noblanks).serialize(save_with: XML_OPTIONS).strip
      send("#{attr}=", normalized_attr)
    end
  end

  # Overriden by different Blockly level types
  def self.skins
    []
  end

  def pretty_block(block_name)
    xml_string = send("#{block_name}_blocks")
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
    xml.serialize(save_with: XML_OPTIONS).delete("\n").strip
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
    xml.serialize(save_with: XML_OPTIONS).delete("\n").strip
  end

  # for levels with solutions
  def update_ideal_level_source
    return if !respond_to?(:solution_blocks) || solution_blocks.blank?
    self.ideal_level_source_id = LevelSource.find_identical_or_create(self, solution_blocks).id
  end

  # What blocks should be embedded for the given block_xml. Default behavior is to change nothing.
  def blocks_to_embed(block_xml)
    return block_xml
  end

  def blockly_app_options(game, skin_id)
    options = Rails.cache.fetch("#{cache_key}/blockly_app_options/v2") do
      app_options = {}

      app_options[:levelGameName] = game.name if game
      app_options[:skinId] = skin_id if skin_id

      # Set some values that Blockly expects on the root of its options string

      droplet = game.try(:uses_droplet?)
      #TODO(ram) normalize or remove the edit_code field
      if edit_code == "false"
        droplet = false
      elsif edit_code == true
        droplet = true
      end

      app_options.merge!(
        {
          baseUrl: Blockly.base_url,
          app: game.try(:app),
          droplet: droplet,
          pretty: Rails.configuration.pretty_apps ? '' : '.min',
        }
      )
    end
    options.freeze
  end

  # Return a Blockly-formatted 'appOptions' hash derived from the level contents
  def blockly_level_options
    options = Rails.cache.fetch("#{cache_key}/blockly_level_options/v2") do
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
      properties.keys.each do |dashboard|
        blockly = overrides[dashboard.to_sym] || dashboard.camelize(:lower)
        # Select value from properties json
        # Don't override existing valid (non-nil/empty) values
        value = JSONValue.value(properties[dashboard].presence)
        level_prop[blockly] = value unless value.nil? # make sure we convert false
      end

      # Set some specific values

      if is_a? Blockly
        level_prop['startBlocks'] = try(:project_template_level).try(:start_blocks) || start_blocks
        level_prop['toolbox'] = try(:project_template_level).try(:toolbox_blocks) || toolbox_blocks
        level_prop['codeFunctions'] = try(:project_template_level).try(:code_functions) || code_functions
      end

      if is_a? Applab
        level_prop['startHtml'] = try(:project_template_level).try(:start_html) || start_html
      end

      if is_a? Gamelab
        level_prop['startAnimations'] = try(:project_template_level).try(:start_animations) || start_animations
      end

      if is_a?(Maze) && step_mode
        step_mode_value = JSONValue.value(step_mode)
        level_prop['step'] = step_mode_value == 1 || step_mode_value == 2
        level_prop['stepOnly'] = step_mode_value == 2
      end

      level_prop['levelId'] = level_num
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
        level_prop['goal'] ||= {}
        level_prop['goal'].merge!({fn_successCondition: level_prop['fn_successCondition'], fn_failureCondition: level_prop['fn_failureCondition']})
        level_prop.delete('fn_successCondition')
        level_prop.delete('fn_failureCondition')
      end

      # We don't want this to be cached (as we only want it to be seen by authorized teachers), so
      # set it to nil here and let other code put it in app_options
      level_prop['teacherMarkdown'] = nil

      # Set some values that Blockly expects on the root of its options string
      level_prop.reject! {|_, value| value.nil?}
    end
    options.freeze
  end

  def localized_failure_message_override
    if should_localize? && failure_message_override
      I18n.t("data.failure_message_overrides").
        try(:[], "#{name}_failure_message_override".to_sym)
    end
  end

  def localized_authored_hints
    return unless authored_hints

    if should_localize?
      translations = I18n.t("data.authored_hints").
        try(:[], "#{name}_authored_hint".to_sym)

      return unless translations.instance_of? Hash

      localized_hints = JSON.parse(authored_hints).map do |hint|
        next if hint['hint_markdown'].nil? || hint['hint_id'].nil?

        translated_text = translations.try(:[], hint['hint_id'].to_sym)
        original_text = hint['hint_markdown']

        if !translated_text.nil? && translated_text != original_text
          hint['hint_markdown'] = translated_text
          hint["tts_url"] = tts_url(TextToSpeech.sanitize(translated_text))
        end

        hint
      end
      JSON.generate(localized_hints)
    else
      hints = JSON.parse(authored_hints).map do |hint|
        if hint['hint_video'].present?
          hint['hint_video'] = Video.find_by_key(hint['hint_video']).summarize
        end
        hint
      end
      JSON.generate(hints)
    end
  end

  def localized_instructions
    if custom?
      loc_val = I18n.t("data.instructions").try(:[], "#{name}_instruction".to_sym)
      unless I18n.en? || loc_val.nil?
        return loc_val
      end
    else
      val = [game.app, game.name].map do |name|
        I18n.t("data.level.instructions").try(:[], "#{name}_#{level_num}".to_sym)
      end.compact.first
      return val unless val.nil?
    end
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
    never_autoplay_video == 'true'
  end

  def fix_examples
    # remove nil and empty strings from examples
    return if examples.nil?
    self.examples = examples.select(&:present?)
  end
end
