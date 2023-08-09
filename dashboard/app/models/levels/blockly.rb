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
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(4294967295)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#

require 'nokogiri'
class Blockly < Level
  include SolutionBlocks
  before_save :fix_examples, :update_goal_override

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
    hide_share_and_remix
    is_project_level
    code_functions
    palette_category_at_start
    failure_message_override
    droplet_tooltips_disabled
    lock_zero_param_functions
    encrypted_examples
    disable_if_else_editing
    show_type_hints
    include_shared_functions
    preload_asset_list
    skip_autosave
    skip_run_save
    goal_override
  )

  before_save :update_ideal_level_source

  before_validation do
    self.scrollbars = nil if scrollbars == 'nil'
  end

  # DCDO key for turning this feature on or off.
  BLOCKLY_I18N_IN_TEXT_DCDO_KEY = 'blockly_i18n_in_text'.freeze

  def self.field_or_title(xml_doc)
    num_fields = xml_doc.xpath('//field').count
    num_titles = xml_doc.xpath('//title').count
    raise "unexpected error: XML contains both field and title elements" if num_fields > 0 && num_titles > 0
    return "field" unless num_fields == 0
    "title"
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

  before_save :update_preload_asset_list

  def update_preload_asset_list
    preload_asset_list = properties["preload_asset_list"]
    preload_asset_list.try(:delete_if, &:blank?)
    preload_asset_list = nil unless preload_asset_list.try(:present?)
    properties["preload_asset_list"] = preload_asset_list
  end

  before_validation do
    xml_blocks.each {|attr| normalize_xml attr}
  end

  XML_OPTIONS = Nokogiri::XML::Node::SaveOptions::NO_DECLARATION

  def normalize_xml(attr)
    attr_val = send(attr)
    if attr_val.present?
      attr_doc = Nokogiri::XML(attr_val) {|config| config.strict.noblanks}
      normalized_attr = attr_doc.serialize(save_with: XML_OPTIONS).strip
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
    if xml_string.present?
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

  CATEGORY_CUSTOM_NAMES = {
    Behavior: 'Behaviors',
    Location: 'Locations',
    PROCEDURE: 'Functions',
    VARIABLE: 'Variables',
  }

  GOOGLE_BLOCKLY_NAMESPACE_XML = "<xml xmlns=\"https://developers.google.com/blockly/xml\">"

  # This function converts category blocks used by levelbuilders to edit the toolbox to category tags
  # and places the appropriate blocks within each category
  def self.convert_toolbox_to_category(xml_string)
    is_google_blockly = false
    if xml_string.include? GOOGLE_BLOCKLY_NAMESPACE_XML
      is_google_blockly = true
      xml_string[GOOGLE_BLOCKLY_NAMESPACE_XML] = "<xml>"
    end
    xml = Nokogiri::XML(xml_string, &:noblanks)
    tag = Blockly.field_or_title(xml)
    return xml_string if xml.nil? || (xml.xpath('/xml/block[@type="category"]').empty? && xml.xpath('xml/block[@type="custom_category"]').empty?)
    default_category = category_node = Nokogiri::XML("<category name='Default'>").child
    xml.child << default_category
    xml.xpath('/xml/block').each do |block|
      case block.attr('type')
      when 'category'
        category_name = block.xpath(tag).text
        category_node = Nokogiri::XML("<category name='#{category_name}'>").child
        category_node['custom'] = 'PROCEDURE' if category_name == 'Functions'
        category_node['custom'] = 'VARIABLE' if category_name == 'Variables'
        xml.child << category_node
        block.remove
      when 'custom_category'
        custom_type = block.xpath(tag).text
        category_name = CATEGORY_CUSTOM_NAMES[custom_type.to_sym]
        category_node = Nokogiri::XML("<category name='#{category_name}'>").child
        category_node['custom'] = custom_type
        xml.child << category_node
        block.remove
      else
        block.remove_attribute('x')
        block.remove_attribute('y')
        block.remove
        category_node << block
      end
    end
    default_category.remove if default_category.element_children.empty?
    xml_string = xml.serialize(save_with: XML_OPTIONS).delete("\n").strip
    if is_google_blockly
      xml_string["<xml>"] = GOOGLE_BLOCKLY_NAMESPACE_XML
    end
    return xml_string
  end

  # This function converts category tags to blocks so that levelbuilders can more easily edit
  # a toolbox that contains categories.
  def self.convert_category_to_toolbox(xml_string)
    if xml_string.include? GOOGLE_BLOCKLY_NAMESPACE_XML
      xml_string[GOOGLE_BLOCKLY_NAMESPACE_XML] = "<xml>"
    end
    xml = Nokogiri::XML(xml_string, &:noblanks).child
    tag = Blockly.field_or_title(xml)
    return xml_string if xml.nil?
    xml.xpath('/xml/category').map(&:remove).each do |category|
      category_name = category.xpath('@name')
      custom_category = category.xpath('@custom')
      category_xml =
        if custom_category.present?
          <<-XML.strip_heredoc.chomp
            <block type="custom_category">
              <#{tag} name="CUSTOM">#{custom_category}</#{tag}>
            </block>
          XML
        else
          <<-XML.strip_heredoc.chomp
            <block type="category">
              <#{tag} name="CATEGORY">#{category_name}</#{tag}>
            </block>
          XML
        end
      block = Nokogiri::XML(category_xml, &:noblanks).child
      xml << block
      xml << category.children
      #block.xpath('statement')[0] << wrap_blocks(category.xpath('block').to_a) unless category.xpath('block').empty?
    end
    xml.serialize(save_with: XML_OPTIONS).delete("\n").strip
  end

  # "counter" mutations should not be stored because it results in the language being
  # hardcoded. The only exception to this is student saved projects.
  def self.remove_counter_mutations(xml_string)
    xml = Nokogiri::XML(xml_string, &:noblanks)
    return xml_string if xml.nil?
    xml.xpath("//block[@type='controls_for_counter']//mutation[@counter='counter']").each(&:remove)
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
      app_options.merge!(
        {
          baseUrl: Blockly.base_url,
          app: game.try(:app),
          droplet: uses_droplet?,
        }
      )
    end
    options.freeze
  end

  # simple helper to set the given key and value on the given hash unless the
  # value is nil, used to set localized versions of level options without
  # calling the localization methods twice
  def set_unless_nil(hash, key, value)
    hash[key] = value unless value.nil?
  end

  def localized_blockly_level_options(script)
    options = Rails.cache.fetch("#{cache_key}/#{script.try(:cache_key)}/#{I18n.locale}/localized_blockly_level_options", force: !Unit.should_cache?) do
      level_options = blockly_level_options.dup

      # For historical reasons, `localized_instructions` and
      # `localized_authored_hints` should happen independent of `should_localize?`
      set_unless_nil(level_options, 'shortInstructions', localized_short_instructions)
      set_unless_nil(level_options, 'authoredHints', localized_authored_hints)

      if should_localize?
        set_unless_nil(level_options, 'sharedBlocks', localized_shared_blocks(level_options['sharedBlocks']))
        set_unless_nil(level_options, 'sharedFunctions', localized_shared_functions(level_options['sharedFunctions']))

        set_unless_nil(level_options, 'longInstructions', localized_long_instructions)
        set_unless_nil(level_options, 'failureMessageOverride', localized_failure_message_override)

        # We are not localizing startHtml content until platform team addresses issues that break
        # current curriculum for students. For more details see Jira P20-102.
        # https://codedotorg.atlassian.net/browse/P20-102
        # set_unless_nil(level_options, 'startHtml', localized_start_html(level_options['startHtml']))

        # Unintuitively, it is completely possible for a Blockly level to use
        # Droplet, so we need to confirm the editor style before assuming that
        # these fields contain Blockly xml.
        unless uses_droplet?
          set_unless_nil(level_options, 'toolbox', localized_toolbox_blocks(level_options['toolbox']))

          %w(
            initializationBlocks
            startBlocks
            toolbox
            levelBuilderRequiredBlocks
            levelBuilderRecommendedBlocks
            solutionBlocks
          ).each do |xml_block_prop|
            next unless level_options.key? xml_block_prop
            set_unless_nil(level_options, xml_block_prop, localized_function_blocks(level_options[xml_block_prop]))
            set_unless_nil(level_options, xml_block_prop, localized_placeholder_text_blocks(level_options[xml_block_prop]))
            set_unless_nil(level_options, xml_block_prop, localized_variable_blocks(level_options[xml_block_prop]))
            set_unless_nil(level_options, xml_block_prop, localized_loop_blocks(level_options[xml_block_prop]))
            set_unless_nil(level_options, xml_block_prop, localized_remaining_variable_blocks(level_options[xml_block_prop]))
          end
        end
      end

      level_options
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
        level_prop['toolbox'] =
          try(:project_template_level).try(:toolbox_blocks) ||
          toolbox_blocks ||
          default_toolbox_blocks
        level_prop['codeFunctions'] = try(:project_template_level).try(:code_functions) || code_functions
        level_prop['sharedBlocks'] = shared_blocks
        level_prop['sharedFunctions'] = shared_functions if JSONValue.value(include_shared_functions)
      end

      if is_a? Applab
        level_prop['startHtml'] = try(:project_template_level).try(:start_html) || start_html
        level_prop['dataTables'] = try(:project_template_level).try(:data_tables) || data_tables
        level_prop['dataProperties'] = try(:project_template_level).try(:data_properties) || data_properties
        level_prop['name'] = name
      end

      if is_a? Gamelab
        level_prop['startAnimations'] = try(:project_template_level).try(:start_animations) || start_animations
        level_prop['name'] = name
      end

      if is_a?(Maze) && step_mode
        step_mode_value = JSONValue.value(step_mode)
        level_prop['step'] = [1, 2].include?(step_mode_value)
        level_prop['stepOnly'] = step_mode_value == 2
      end

      level_prop['levelId'] = level_num
      level_prop['images'] = JSON.parse(level_prop['images']) if level_prop['images'].present?

      # Blockly requires startDirection as an integer not a string
      level_prop['startDirection'] = level_prop['startDirection'].to_i if level_prop['startDirection'].present?
      level_prop['sliderSpeed'] = level_prop['sliderSpeed'].to_f if level_prop['sliderSpeed']
      level_prop['scale'] = {'stepSpeed' => level_prop['stepSpeed']} if level_prop['stepSpeed'].present?
      level_prop['editCode'] = uses_droplet?

      # Blockly requires these fields to be objects not strings
      %w(map initialDirt serializedMaze goal softButtons inputOutputTable scale).
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
      level_prop.compact!
    end
    options.freeze
  end

  # FND-985 Create shared API to get localized level properties.
  def get_localized_property(property_name)
    if should_localize? && try(property_name)
      I18n.t(
        name,
        scope: [:data, property_name.pluralize],
        default: nil,
        smart: true
      )
    end
  end

  # due to some circumstances we refer to the property `failure_message_override` in the plural form,
  # the plural form alias was added in order not to break the existing i18n business logic and existing translations
  alias_attribute :failure_message_overrides, :failure_message_override

  def localized_failure_message_override
    get_localized_property("failure_message_overrides")
  end

  def localized_long_instructions
    localized_long_instructions = get_localized_property("long_instructions")
    localized_blockly_in_text(localized_long_instructions)
  end

  def localized_start_html(start_html)
    return unless start_html
    start_html_doc = Nokogiri::HTML(start_html, &:noblanks)

    # match any element that contains text
    start_html_doc.xpath('//*[text()[normalize-space()]]').each do |element|
      localized_text = I18n.t(
        element.text,
        scope: [:data, :start_html, name],
        default: nil,
        smart: true
      )
      element.content = localized_text if localized_text
    end

    # returning the children of body removes extra <html><body> tags added by parsing with ::HTML
    # the save_with option prevents the to_html method from pretty printing and adding newlines
    # see: https://github.com/premailer/premailer/issues/345
    start_html_doc.xpath("//body").children.to_html(
      encoding: 'UTF-8',
      save_with: Nokogiri::XML::Node::SaveOptions::DEFAULT_HTML ^ Nokogiri::XML::Node::SaveOptions::FORMAT
    )
  end

  def localized_authored_hints
    return unless authored_hints

    if should_localize?
      scope = [:data, :authored_hints, name]

      localized_hints = JSON.parse(authored_hints).map do |hint|
        # Skip empty hints, or hints with videos (these aren't translated).
        next if hint['hint_markdown'].nil? || hint['hint_id'].nil? || hint['hint_video'].present?

        translated_text = hint['hint_id'].empty? ? nil :
          I18n.t(hint['hint_id'], scope: scope, default: nil, smart: true)
        translated_text = localized_blockly_in_text(translated_text)
        original_text = hint['hint_markdown']

        if !translated_text.nil? && translated_text != original_text
          hint['hint_markdown'] = translated_text
          hint["tts_url"] = tts_url(TextToSpeech.sanitize(translated_text))
        end

        hint
      end
      JSON.generate(localized_hints.compact)
    else
      hints = JSON.parse(authored_hints).map do |hint|
        if hint['hint_video'].present?
          hint['hint_video'] = Video.current_locale.find_by_key(hint['hint_video']).summarize
        end
        hint
      end
      JSON.generate(hints)
    end
  end

  # Can apply translations to blockly block XML which is embedded in rich text such as Markdown
  # strings.
  # For example:
  # "Esto es un <xml><block>block</block></xml>." -> "Esto es un <xml><block>bloque</block></xml>."
  # @param text [String] Text which might have blockly XML embedded in it and needs localization.
  # @return [String] Text with localized blockly blocks.
  def localized_blockly_in_text(text)
    return text unless text && DCDO.get(BLOCKLY_I18N_IN_TEXT_DCDO_KEY, false)
    # Tracks the original xml and maps it to the translated xml.
    translated_xml_texts = {}
    # Selects each <xml></xml> because these might be blockly blocks which need translation.
    text.scan(/<xml>[\s\S]*?<\/xml>/).each do |xml_text|
      xml_doc = Nokogiri::XML(xml_text, &:noblanks)
      localized_function_blocks_xml(xml_doc)
      localize_all_placeholder_text_block_types(xml_doc)
      # TODO: add `localized_variable_blocks_xml(xml_doc)`
      # NO_EMPTY_TAGS used because <mutation /> blocks fail to render correctly but
      # <mutation></mutation> works.
      # `encoding: 'UTF-8'` used to avoid unnecessary escaping of accented characters like é and á.
      translated_xml_text = xml_doc.serialize(
        save_with: XML_OPTIONS | Nokogiri::XML::Node::SaveOptions::NO_EMPTY_TAGS,
        encoding: 'UTF-8'
      ).strip
      translated_xml_texts[xml_text] = translated_xml_text
    end
    # Replace the untranslated <xml></xml> with the translated <xml></xml>.
    translated_xml_texts.each do |orig_xml, translated_xml|
      text = text.gsub(orig_xml, translated_xml)
    end
    text
  end

  def localized_short_instructions
    if custom?
      loc_instructions = get_localized_property("short_instructions")
      loc_val = localized_blockly_in_text(loc_instructions)
      unless I18n.en? || loc_val.nil?
        return loc_val
      end
    else
      val = [game.app, game.name].filter_map do |name|
        I18n.t("data.level.instructions.#{name}_#{level_num}", default: nil)
      end.first
      return val unless val.nil?
    end
  end

  def localized_toolbox_blocks(blocks)
    return nil if blocks.nil?

    block_xml = Nokogiri::XML(localized_function_blocks(blocks), &:noblanks)
    block_xml.xpath('//../category').each do |category|
      name = category.attr('name')
      localized_name = I18n.t("data.block_categories.#{name}", default: nil)

      category.set_attribute('name', localized_name) if localized_name
    end
    return block_xml.serialize(save_with: XML_OPTIONS).strip
  end

  # Localizes the given function blockly blocks in the given XML document. Localization will be
  # applied directly to the given document.
  # @param block_xml [Nokogiri::XML::Document] an XML doc to be localized and modified.
  # @return [Nokogiri::XML::Document] the given XML doc localized.
  def localized_function_blocks_xml(block_xml)
    tag = Blockly.field_or_title(block_xml)
    block_xml.xpath("//block[@type=\"procedures_defnoreturn\"]").each do |function|
      function_name = function.at_xpath("./#{tag}[@name=\"NAME\"]")
      next unless function_name
      localized_name = I18n.t(
        "name",
        scope: [:data, :function_definitions, name, function_name.content],
        default: nil,
        smart: true
      )
      original_function_name = function_name.content
      function_name.content = localized_name if localized_name
      # The description and parameter declarations are in a mutation.
      # If this function doesn't have a mutation, it won't have a
      # description or parameters, so we can move on.
      function_mutation = function.at_xpath('./mutation')
      next unless function_mutation
      function_description = function_mutation.at_xpath('./description')
      localized_description = I18n.t(
        "description",
        scope: [:data, :function_definitions, name, original_function_name],
        default: nil,
        smart: true
      )
      # Some levels add a description to the function in the solution
      # but not in the starter/toolbox blocks. These functions have the same key if they have the same name
      function_description.content = localized_description if function_description && localized_description
      # Translate the "declared" parameter names
      function_mutation.xpath("./arg").each do |parameter|
        localized_parameter = I18n.t(
          parameter["name"],
          scope: [:data, :function_definitions, name, original_function_name, "parameters"],
          default: nil,
          smart: true
        )
        parameter["name"] = localized_parameter if localized_parameter
      end
      # Replace usages of parameters with their translated name
      function.xpath(".//#{tag}[@name=\"VAR\"]").each do |parameter|
        parameter_name = parameter.content
        localized_parameter = I18n.t(
          parameter_name,
          scope: [:data, :function_definitions, name, original_function_name, "parameters"],
          default: nil,
          smart: true
        )
        parameter.content = localized_parameter if localized_parameter
      end
    end
    block_xml.xpath("//block[@type=\"procedures_callnoreturn\"]").each do |function|
      mutation = function.at_xpath('./mutation')
      next unless mutation
      mutation_name = mutation.attr('name')
      localized_name = I18n.t(
        "name",
        scope: [:data, :function_definitions, name, mutation.attr('name')],
        default: nil,
        smart: true
      )
      mutation.xpath('./arg').each do |arg|
        localized_parameter = I18n.t(
          arg["name"],
          scope: [:data, :function_definitions, name, mutation_name, :parameters],
          default: nil,
          smart: true
        )
        arg["name"] = localized_parameter if localized_parameter
      end
      mutation.set_attribute('name', localized_name) if localized_name
    end
    block_xml.xpath("//block[@type=\"gamelab_behavior_get\"]").each do |behavior|
      behavior_name = behavior.at_xpath("./#{tag}[@name=\"VAR\"]")
      next unless behavior_name
      localized_name = I18n.t(
        behavior_name.content,
        scope: [:data, :behavior_names, name],
        default: nil,
        smart: true
      )
      behavior_name.content = localized_name if localized_name
    end
    block_xml.xpath("//block[@type=\"behavior_definition\"]").each do |behavior|
      behavior_name = behavior.at_xpath("./#{tag}[@name=\"NAME\"]")
      next unless behavior_name
      localized_name = I18n.t(
        behavior_name.content,
        scope: [:data, :behavior_names, name],
        default: nil,
        smart: true
      )
      behavior_name.content = localized_name if localized_name
    end

    localize_behaviors(block_xml)
    block_xml
  end

  # Localizes the given function blockly blocks in the given XML document string.
  # @param blocks [String] an XML doc to be localized.
  # @return [String] the given XML doc localized.
  def localized_function_blocks(blocks)
    return nil if blocks.nil?

    block_xml = localized_function_blocks_xml(Nokogiri::XML(blocks, &:noblanks))
    block_xml.serialize(save_with: XML_OPTIONS).strip
  end

  # Localizing variable names in "variables_get" and "parameters_get" block types
  def localized_variable_blocks(blocks)
    return nil if blocks.nil?

    block_xml = Nokogiri::XML(blocks, &:noblanks)
    tag = Blockly.field_or_title(block_xml)
    variables_get = block_xml.xpath("//block[@type=\"variables_get\"]")
    variables_set = block_xml.xpath("//block[@type=\"variables_set\"]")
    variables = variables_get + variables_set
    variables.each do |variable|
      variable_name = variable.at_xpath("./#{tag}[@name=\"VAR\"]")
      next unless variable_name
      localized_name = I18n.t(
        variable_name.content,
        scope: [:data, :variable_names],
        default: nil,
        smart: true
      )
      variable_name.content = localized_name if localized_name
    end

    block_xml.xpath("//block[@type=\"parameters_get\"]").each do |parameter|
      parameter_name = parameter.at_xpath("./#{tag}[@name=\"VAR\"]")
      next unless parameter_name
      localized_name = I18n.t(
        parameter_name.content,
        scope: [:data, :parameter_names],
        default: nil,
        smart: true
      )
      parameter_name.content = localized_name if localized_name
    end

    return block_xml.serialize(save_with: XML_OPTIONS).strip
  end

  # Localizing variable names in "controls_for" block types
  def localized_loop_blocks(blocks)
    return nil if blocks.nil?

    block_xml = Nokogiri::XML(blocks, &:noblanks)
    tag = Blockly.field_or_title(block_xml)
    block_xml.xpath("//block[@type=\"controls_for\"]").each do |controls_for_block|
      controls_for_name = controls_for_block.at_xpath("./#{tag}[@name=\"VAR\"]")
      next unless controls_for_name
      localized_name = I18n.t(
        controls_for_name.content,
        scope: [:data, :variable_names],
        default: nil,
        smart: true
      )
      controls_for_name.content = localized_name if localized_name
    end

    return block_xml.serialize(save_with: XML_OPTIONS).strip
  end

  # Localizing variable names in all remaining block types.
  # @param blocks [String] an XML doc to be localized.
  # @return [String] the given XML doc localized.
  def localized_remaining_variable_blocks(blocks)
    return nil if blocks.nil?

    block_xml = Nokogiri::XML(blocks, &:noblanks)
    tag = Blockly.field_or_title(block_xml)

    # The block types that are otherwise unaccounted for.
    block_types = %w[
      studio_ask
      math_change
      gamelab_textVariableJoin
    ]

    # Localize each 'catch-all' block type.
    block_types.each do |block_type|
      block_xml.xpath("//block[@type=\"#{block_type}\"]").each do |block|
        # Find all <title/field name="VAR" /> blocks and maybe update their
        # content if there exists a localization key for them.
        block.xpath("./#{tag}[@name=\"VAR\"]").each do |var|
          localized_name = I18n.t(
            var.content,
            scope: [:data, :variable_names],
            default: nil,
            smart: true
          )
          var.content = localized_name if localized_name
        end
      end
    end

    return block_xml.serialize(save_with: XML_OPTIONS).strip
  end

  # Localizes all supported types of the given placeholder text blockly
  # blocks in the given XML document string.
  # @param blocks [String] an XML doc to be localized.
  # @return [String] the given XML doc localized.
  def localize_all_placeholder_text_block_types(block_xml)
    localize_placeholder_text_blocks_xml(block_xml, 'text', ['TEXT'])
    localize_placeholder_text_blocks_xml(block_xml, 'studio_ask', ['TEXT'])
    localize_placeholder_text_blocks_xml(block_xml, 'studio_showTitleScreen', %w(TEXT TITLE))
  end

  # Localizes the given placeholder text blockly blocks in the given XML document string.
  # @param blocks [String] an XML doc to be localized.
  # @return [String] the given XML doc localized.
  # @see unit test for an example of blocks that contain placeholder texts.
  def localized_placeholder_text_blocks(blocks)
    return nil if blocks.nil?
    block_xml = Nokogiri::XML(blocks, &:noblanks)

    localize_all_placeholder_text_block_types(block_xml)

    block_xml.serialize(save_with: XML_OPTIONS).strip
  end

  # Localizes the given placeholder text blockly blocks in the given XML document.
  # Localization will be applied directly to the given document.
  # @param block_xml [Nokogiri::XML::Document]
  # @param block_type [String]
  # @param field_names [Array<String>]
  # @return [Nokogiri::XML::Document]
  def localize_placeholder_text_blocks_xml(block_xml, block_type, field_names)
    tag = Blockly.field_or_title(block_xml)
    block_xml.xpath("//block[@type=\"#{block_type}\"]").each do |block|
      field_names.each do |field_name|
        field = block.at_xpath("./#{tag}[@name=\"#{field_name}\"]")
        next unless field&.content&.present?

        # Must generate text_key in the same way it is created in
        # the get_i18n_strings function in sync-in.rb script.
        text_key = Digest::MD5.hexdigest field.content
        localized_text = I18n.t(
          text_key,
          scope: [:data, :placeholder_texts, name],
          default: nil,
          smart: true
        )
        field.content = localized_text if localized_text
      end
    end
    block_xml
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

  # This should just return false, but we have a few levels.js levels that use
  # droplet (starwars, and a few test levels). They all have level records of
  # type 'Blockly', so they can't override this as needed
  def uses_droplet?
    %w(MazeEC ArtistEC Applab StudioEC Gamelab).include? game.name
  end

  def default_toolbox_blocks
    nil
  end

  # Clear 'is_project_level' from cloned levels
  def clone_with_name(name, editor_experiment: nil)
    level = super(name, editor_experiment: editor_experiment)
    level.update!(is_project_level: false)
    level
  end

  def shared_blocks
    Block.for(type)
  end

  # Default to getting shared_functions of same level type, but allows subclasses to override
  # this value if needed. See poetry.rb
  def shared_function_type
    type
  end

  def shared_functions
    Rails.cache.fetch("shared_functions/#{shared_function_type}", force: !Unit.should_cache?) do
      SharedBlocklyFunction.where(level_type: shared_function_type).map(&:to_xml_fragment)
    end.join
  end

  def localize_behaviors(block_xml)
    tag = Blockly.field_or_title(block_xml)
    block_xml.xpath("//block[@type=\"behavior_definition\"]").each do |behavior|
      mutation = behavior.at_xpath('./mutation')
      mutation.xpath('./arg').each do |arg|
        next unless arg["name"] == I18n.t('behaviors.this_sprite', locale: :en)
        arg["name"] = I18n.t('behaviors.this_sprite')
      end

      behavior.xpath(".//#{tag}[@name=\"NAME\"]").each do |name_element|
        localized_name = I18n.t(name_element.content, scope: [:data, :shared_functions], default: nil, smart: true)
        name_element.content = localized_name if localized_name

        mutation.xpath('.//description').each do |description|
          # Using name_element['id'] so we still access the correct translation key even if the
          # content has been translated in a previous step
          localized_description = I18n.t(name_element['id'], scope: [:data, :behavior_descriptions, name], default: nil, smart: true)
          description.content = localized_description if localized_description
        end
      end
    end

    block_xml.xpath(".//#{tag}[@name=\"VAR\"]").each do |parameter|
      next unless parameter.content == I18n.t('behaviors.this_sprite', locale: :en)
      parameter.content = I18n.t('behaviors.this_sprite')
    end
  end

  def localized_shared_functions(shared_functions)
    block_xml = Nokogiri::XML("<xml>#{shared_functions}</xml>", &:noblanks)
    localize_behaviors(block_xml)
    return block_xml.serialize(save_with: XML_OPTIONS).strip
  end

  # Display translated custom block text and options
  def localized_shared_blocks(level_objects)
    return nil if level_objects.blank?

    level_objects_copy = level_objects.deep_dup
    level_objects_copy.each do |level_object|
      next if level_object.blank?
      block_text = level_object[:config]["blockText"]
      next if block_text.blank?
      block_text_translation = I18n.t(
        "text",
        scope: [:data, :blocks, level_object[:name]],
        default: nil,
        smart: true
      )
      level_object[:config]["blockText"] = block_text_translation unless block_text_translation.nil?
      arguments = level_object[:config]["args"]
      next if arguments.blank?
      arguments.each do |argument|
        next if argument["options"].blank?
        argument["options"]&.each_with_index do |option, i|
          # Options come in arrays representing key,value pairs, which will
          # ultimately determine the display of the dropdown.
          # When only one element is in the array, it represents both the key
          # and the value.
          option_value = option.length > 1 ? option[1] : option[0]

          # Get the translation from the value
          option_translation = I18n.t(
            option_value,
            scope: [:data, :blocks, level_object[:name], :options, argument['name']],
            default: nil,
            smart: true
          )
          # Update the key (the first element) with the new translated value
          argument["options"][i][0] = option_translation unless option_translation.nil?
        end
      end
      level_object[:config]["args"] = arguments
    end
    level_objects_copy
  end

  def update_goal_override
    if goal_override.is_a?(String)
      self.goal_override = JSON.parse(goal_override)
    end
  end

  def summarize_for_lesson_show(can_view_teacher_markdown)
    super.merge(
      {
        longInstructions: localized_long_instructions || long_instructions,
        shortInstructions: localized_short_instructions || short_instructions,
        skin: skin
      }
    )
  end
end
