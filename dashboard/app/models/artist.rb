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

IGNORED_SOLUTION_BLOCK_ATTRS = {
  'uservisible' => 'false',
  'deletable' => 'false',
  'editable' => 'false',
  'disabled' => 'true',
  'movable' => 'false'
}
NEW_CATEGORY_XML = '<category name="NEW BLOCKS"/>'
STRIPPED_NODES_XPATH = './next|./value|./statement|./title'
STRIPPED_ATTRS = ['id', 'inline'] + IGNORED_SOLUTION_BLOCK_ATTRS.keys

class Artist < Blockly
  serialized_attrs %w(
    start_direction
    x y
    predraw_blocks
    images
    free_play
    permitted_errors
    impressive
    shapeways_url
    disable_sharing
  )

  def xml_blocks
    super + %w(predraw_blocks)
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    ['artist', 'artist_zombie', 'elsa', 'anna']
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(
        user: params[:user],
        game: Game.custom_artist,
        level_num: 'custom',
    ))
  end

  def toolbox(type)
    <<-XML.strip_heredoc.chomp
#{k1_blocks_category}
    <category id="actions" name="Actions">
      <block type="draw_move_by_constant">
        <title name="VALUE">100</title>
      </block>
      <block type="draw_move_by_constant_dropdown">
        <title name="VALUE" config="50,100,150,200,300">???</title>
      </block>
      <block type="draw_move">
        <value name="VALUE">
          <block type="math_number">
            <title name="NUM">100</title>
          </block>
        </value>
      </block>
      <block type="draw_turn_by_constant">
        <title name="VALUE">90</title>
      </block>
      <block type="draw_turn_by_constant_dropdown">
        <title name="VALUE" config="45,60,90,120,180">???</title>
      </block>
      <block type="draw_turn">
        <value name="VALUE">
          <block type="math_number">
            <title name="NUM">90</title>
          </block>
        </value>
      </block>
      <block type="jump_by_constant">
        <title name="VALUE">100</title>
      </block>
      <block type="jump_by_constant_dropdown">
        <title name="VALUE" config="50,100,150,200,300">???</title>
      </block>
      <block type="jump">
        <value name="VALUE">
          <block type="math_number">
            <title name="NUM">100</title>
          </block>
        </value>
      </block>
      <block type="draw_width_inline">
        <title name="WIDTH">1</title>
      </block>
      <block type="draw_width">
        <value name="WIDTH">
          <block type="math_number">
            <title name="NUM">1</title>
          </block>
        </value>
      </block>
      <block type="draw_pen"></block>
      <block type="draw_line_style_pattern"></block>
      <block type="sticker"/>/block>
    </category>
    <category name="Color">
      <block id="draw-color" type="draw_colour">
        <value name="COLOUR">
          <block type="colour_picker"></block>
        </value>
      </block>
      <block id="draw-color" type="draw_colour">
        <value name="COLOUR">
          <block type="colour_random"></block>
        </value>
      </block>
      <block id="draw-color" type="draw_colour">
        <value name="COLOUR">
          <block type="colour_rgb">
            <value name="RED"><block type="math_number"><title name="NUM">255</title></block></value>
            <value name="GREEN"><block type="math_number"><title name="NUM">255</title></block></value>
            <value name="BLUE"><block type="math_number"><title name="NUM">255</title></block></value>
          </block>
        </value>
      </block>
      <block id="alpha" type="alpha">
        <value name="VALUE">
          <block type="math_number_dropdown">
            <title name="NUM" config="100,90,80,70,60,50,40,30,20,10,0">100</title>
          </block>
        </value>
      </block>
    </category>
    <category name="Category">
      <block type="category"></block>
    </category>
    <category name="Functions" custom="PROCEDURE">
    </category>
    <category name="Prebuilt">
      <block type="draw_a_triangle"></block>
      <block type="create_a_circle"></block>
      <block type="create_a_circle_size"></block>
      <block type="create_a_snowflake_branch"></block>
      <block type="draw_a_square_custom"></block>
      <block type="draw_a_house"></block>
      <block type="draw_a_flower"></block>
      <block type="draw_a_snowflake"></block>
      <block type="draw_a_snowman"></block>
      <block type="draw_a_hexagon"></block>
      <block type="draw_a_star"></block>
      <block type="draw_a_robot"></block>
      <block type="draw_a_rocket"></block>
      <block type="draw_a_planet"></block>
      <block type="draw_a_rhombus"></block>
      <block type="draw_upper_wave"></block>
      <block type="draw_lower_wave"></block>
      <block type="create_snowflake_dropdown"></block>
    </category>
    <category name="Loops">
      <block type="controls_for_counter">
        <value name="FROM">
          <block type="math_number">
            <title name="NUM">1</title>
          </block>
        </value>
        <value name="TO">
          <block type="math_number">
            <title name="NUM">100</title>
          </block>
        </value>
        <value name="BY">
          <block type="math_number">
            <title name="NUM">10</title>
          </block>
        </value>
      </block>
      <block type="controls_repeat">
        <title name="TIMES">4</title>
      </block>
      <block type="controls_repeat_dropdown">
        <title name="TIMES" config="3-10">???</title>
      </block>
      <block type="controls_repeat_ext">
        <value name="TIMES"></value>
        <statement name="DO"></statement>
      </block>
    </category>
    <category name="Logic">
      <block type="controls_if" inline="false">
        <value name="IF0">
          <block type="logic_compare" inline="true">
            <title name="OP">EQ</title>
          </block>
        </value>
      </block>
    </category>
    <category name="Math">
      <block type="math_number"></block>
      <block type="math_number_dropdown">
        <title name="NUM" config="1-10">5</title>
      </block>
      <block type="math_arithmetic" inline="true"></block>
      <block type="math_random_int">
        <value name="FROM">
          <block type="math_number">
            <title name="NUM">1</title>
          </block>
        </value>
        <value name="TO">
          <block type="math_number">
            <title name="NUM">100</title>
          </block>
        </value>
      </block>
      <block type="math_random_float"></block>
    </category>
    <category name="Text">
      <block type="text"></block>
    </category>
    <category name="Variables" custom="VARIABLE"></category>
    <category name="Picker">
      <block type="pick_one"></block>
    </category>
    XML
  end

  def k1_blocks_category
    <<-XML.chomp
    <category name="K1 Simplified">
#{k1_blocks}
    </category>
    XML
  end

  def k1_blocks
    <<-XML.chomp
      <block type="controls_repeat_simplified">
        <title name="TIMES">5</title>
      </block>
      <block type="controls_repeat_simplified_dropdown">
        <title name="TIMES" config="3-10">3</title>
      </block>
      <block type="draw_colour_simple"></block>
      <block type="draw_line_style_pattern"></block>
      <block type="simple_move_up"></block>
      <block type="simple_move_down"></block>
      <block type="simple_move_right"></block>
      <block type="simple_move_left"></block>
      <block type="simple_move_up_length"></block>
      <block type="simple_move_down_length"></block>
      <block type="simple_move_right_length"></block>
      <block type="simple_move_left_length"></block>
      <block type="simple_jump_up"></block>
      <block type="simple_jump_down"></block>
      <block type="simple_jump_right"></block>
      <block type="simple_jump_left"></block>
    XML
  end

  def strip_block(block, toolbox_block=false, create_for_toolbox=false)
    stripped_block = block.dup
    stripped_block.xpath(STRIPPED_NODES_XPATH).remove
    stripped_block['type'] = stripped_block['type'].chomp '_dropdown' if toolbox_block
    STRIPPED_ATTRS.each {|attr| stripped_block.remove_attribute(attr)} unless create_for_toolbox
    stripped_block.content = stripped_block.content.strip
    return create_for_toolbox ? stripped_block : stripped_block.to_xml
  end

  def strip_toolbox_block(block)
    strip_block block, true
  end

  def create_toolbox_block(block)
    strip_block block, false, true
  end

  def blocks_match?(toolbox_block, solution_block)
    stripped_solution_block = strip_block(solution_block)
    # Return true for either an exact match, or a block in the solution with the
    # corresponding *_dropdown block in the toolbox
    stripped_solution_block == strip_block(toolbox_block) ||
      stripped_solution_block == strip_toolbox_block(toolbox_block)
  end

  # Add blocks to the toolbox that appear in the solution, but aren't already
  # in the toolbox
  def add_missing_toolbox_blocks
    toolbox = Nokogiri::XML(properties['toolbox_blocks'])
    toolbox_blocks = toolbox.xpath('//block')
    Nokogiri::XML(properties['solution_blocks']).xpath('//block').each do |block|
      next if IGNORED_SOLUTION_BLOCK_ATTRS.any? {|kvpair| block.attr(kvpair[0]) == kvpair[1]}

      next if toolbox_blocks.any? do |toolbox_block|
        blocks_match? toolbox_block, block
      end

      # Solution block does not appear in the toolbox, add it
      toolboxified_block = create_toolbox_block block
      if toolbox.xpath('//category').empty?
        toolbox.root.add_child toolboxified_block
      else
        category = toolbox.xpath('//category[@name=\'NEW BLOCKS\']').first ||
          toolbox.xpath('//category').last.add_next_sibling(NEW_CATEGORY_XML).first
        category.add_child toolboxified_block
      end
      toolbox_blocks.push toolboxified_block
    end
    properties['toolbox_blocks'] =
      toolbox.to_xml save_with: Blockly::XML_OPTIONS
  end

end
