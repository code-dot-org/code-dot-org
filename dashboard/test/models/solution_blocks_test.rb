require 'test_helper'

class SolutionBlocksTest < ActiveSupport::TestCase
  setup do
    @empty_toolbox_xml = <<XML
XML
    @toolbox_with_category_xml = <<XML
<xml>
  <category name="example"/>
</xml>
XML
    @toolbox_with_new_category_xml = <<XML
<xml>
  <category name="NEW BLOCKS"/>
</xml>
XML
    @solution_xml = <<XML
<xml>
  <block type="when_run" deletable="false" movable="false">
    <next>
      <block type="draw_move_by_constant">
        <title name="DIR">moveForward</title>
        <title name="VALUE">100</title>
      </block>
    </next>
  </block>
</xml>
XML
    @non_editable_solution_xml = <<XML
<xml>
  <block type="when_run" deletable="false" movable="false">
    <next>
      <block type="draw_move_by_constant" editable="false">
        <title name="DIR">moveForward</title>
        <title name="VALUE">100</title>
      </block>
    </next>
  </block>
</xml>
XML
    @draw_block_xml = <<XML
<block type="draw_move_by_constant">
  <title name="DIR">moveForward</title>
  <title name="VALUE">100</title>
</block>
XML
    @draw_block_with_id_foo_xml = <<XML
<block type="draw_move_by_constant" id="foo">
  <title name="DIR">moveForward</title>
  <title name="VALUE">100</title>
</block>
XML
    @draw_block_with_id_bar_xml = <<XML
<block type="draw_move_by_constant" id="bar">
  <title name="DIR">moveForward</title>
  <title name="VALUE">100</title>
</block>
XML
    @draw_block_with_inline_xml = <<XML
<block type="draw_move_by_constant" inline="true">
  <title name="DIR">moveForward</title>
  <title name="VALUE">100</title>
</block>
XML
    @draw_block_with_next_xml = <<XML
<block type="draw_move_by_constant" inline="true">
  <title name="DIR">moveForward</title>
  <title name="VALUE">100</title>
  <next>
    <block type="draw_move_by_constant" inline="true">
      <title name="DIR">moveForward</title>
      <title name="VALUE">100</title>
    </block>
  </next>
</block>
XML
    @draw_100_block_xml = <<XML
<block type="draw_move" inline="true">
  <title name="DIR">moveForward</title>
  <value name="VALUE">
    <block type="math_number">
      <title name="NUM">100</title>
    </block>
  </value>
</block>
XML

    @draw_50_block_xml = <<XML
<block type="draw_move" inline="true">
  <title name="DIR">moveForward</title>
  <value name="VALUE">
    <block type="math_number">
      <title name="NUM">50</title>
    </block>
  </value>
</block>
XML
    @value_100_block_xml = <<XML
<block type="math_number">
  <title name="NUM">100</title>
</block>
XML

    @value_50_block_xml = <<XML
<block type="math_number">
  <title name="NUM">50</title>
</block>
XML
    @draw_with_dropdown_xml = <<XML
<block type="draw_move_by_constant_dropdown">
  <title name="DIR">moveForward</title>
  <title name="VALUE" config="50,100,150,200,300">50</title>
</block>
XML

    @controls_repeat_simplified_xml = <<XML
<block type="controls_repeat">
  <title name="TIMES">5</title>
</block>
XML

    @controls_repeat_simplified_dropdown_xml = <<XML
<block type="controls_repeat_dropdown">
  <title name="TIMES" config="3-10">???</title>
</block>
XML

    @toolbox_doc = Nokogiri::XML '<xml></xml>'
    @solution_doc = Nokogiri::XML '<xml></xml>'
    @level = Blockly.new
  end

  def make_level(toolbox_xml, solution_xml)
    level = Blockly.new
    level.properties['toolbox_blocks'] = toolbox_xml
    level.properties['solution_blocks'] = solution_xml
    level
  end

  def make_toolbox_node(xml)
    @toolbox_doc.root.add_child(xml).first
  end

  def make_solution_node(xml)
    @solution_doc.root.add_child(xml).first
  end

  def assert_blocktype_in_toolbox(level, type, occurrances=1)
    blocks = Nokogiri::XML(level.properties['toolbox_blocks']).xpath("//block[@type=\"#{type}\"]")
    assert_equal occurrances, blocks.length
  end

  test 'identical blocks match' do
    toolbox_block = make_toolbox_node @draw_block_xml
    solution_block = make_solution_node @draw_block_xml
    assert @level.blocks_match? toolbox_block, solution_block
  end

  test 'blocks with different IDs match' do
    toolbox_block = make_toolbox_node @draw_block_with_id_foo_xml
    solution_block = make_solution_node @draw_block_with_id_bar_xml
    assert @level.blocks_match? toolbox_block, solution_block
  end

  test 'blocks with different inline attribute match' do
    toolbox_block = make_toolbox_node @draw_block_xml
    solution_block = make_solution_node @draw_block_with_inline_xml
    assert @level.blocks_match? toolbox_block, solution_block
  end

  test 'blocks with different next nodes match' do
    toolbox_block = make_toolbox_node @draw_block_xml
    solution_block = make_solution_node @draw_block_with_next_xml
    assert @level.blocks_match? toolbox_block, solution_block
  end

  test 'blocks called with different values match' do
    toolbox_block = make_toolbox_node @draw_50_block_xml
    solution_block = make_solution_node @draw_100_block_xml
    assert @level.blocks_match? toolbox_block, solution_block
  end

  test 'math_value blocks with different values match' do
    toolbox_block = make_toolbox_node @value_50_block_xml
    solution_block = make_solution_node @value_100_block_xml
    assert @level.blocks_match? toolbox_block, solution_block
  end

  test '*_constant blocks match themselves' do
    toolbox_block = make_toolbox_node @draw_block_xml
    solution_block = make_solution_node @draw_block_xml
    assert @level.blocks_match? toolbox_block, solution_block
  end

  test '*_constant_dropdown blocks match themselves' do
    toolbox_block = make_toolbox_node @draw_with_dropdown_xml
    solution_block = make_solution_node @draw_with_dropdown_xml
    assert @level.blocks_match? toolbox_block, solution_block
  end

  test '*_dropdown blocks match themselves' do
    toolbox_block = make_toolbox_node @controls_repeat_simplified_dropdown_xml
    solution_block = make_solution_node @controls_repeat_simplified_dropdown_xml
    assert @level.blocks_match? toolbox_block, solution_block
  end

  test '*_constant_dropdown blocks in the toolbox match *_constant blocks in the solution' do
    toolbox_block = make_toolbox_node @draw_with_dropdown_xml
    solution_block = make_solution_node @draw_block_xml
    assert @level.blocks_match? toolbox_block, solution_block
  end

  test '*_constant_dropdown blocks in the solution do not match *_constant blocks in the toolbox' do
    toolbox_block = make_toolbox_node @draw_block_xml
    solution_block = make_solution_node @draw_with_dropdown_xml
    refute @level.blocks_match? toolbox_block, solution_block
  end

  test '*_dropdown blocks in the toolbox match corresponding non-dropdown blocks in the solution' do
    toolbox_block = make_toolbox_node @controls_repeat_simplified_dropdown_xml
    solution_block = make_solution_node @controls_repeat_simplified_xml
    assert @level.blocks_match? toolbox_block, solution_block
  end

  test '*_dropdown blocks in the solution do not match corresponding non-dropdown blocks in toolbox' do
    toolbox_block = make_toolbox_node @controls_repeat_simplified_xml
    solution_block = make_solution_node @controls_repeat_simplified_dropdown_xml
    refute @level.blocks_match? toolbox_block, solution_block
  end

  test 'add missing block' do
    level = make_level(@empty_toolbox_xml, @solution_xml)
    level.add_missing_toolbox_blocks
    assert_blocktype_in_toolbox level, "draw_move_by_constant"
  end

  test 'do not add non-editable solution blocks' do
    level = make_level(@empty_toolbox_xml, @non_editable_solution_xml)
    level.add_missing_toolbox_blocks
    assert_equal @empty_toolbox_xml, level.properties['toolbox_blocks']
  end

  test 'create "NEW CATEGORY" if adding a block and using categories' do
    level = make_level(@toolbox_with_category_xml, @solution_xml)
    level.add_missing_toolbox_blocks
    toolbox = Nokogiri::XML(level.properties['toolbox_blocks'])
    assert_equal 1, toolbox.xpath('//category[@name="NEW BLOCKS"]').length
    new_category = toolbox.xpath('//category[@name="NEW BLOCKS"]').first
    assert_equal 1, new_category.xpath('//block[@type="draw_move_by_constant"]').length
  end

  test 'reuse existing "NEW CATEGORY" if possible' do
    level = make_level(@toolbox_with_new_category_xml, @solution_xml)
    level.add_missing_toolbox_blocks
    toolbox = Nokogiri::XML(level.properties['toolbox_blocks'])
    assert_equal 1, toolbox.xpath('//category').length
    new_category = toolbox.xpath('//category[@name="NEW BLOCKS"]').first
    assert_equal 1, new_category.xpath('//block[@type="draw_move_by_constant"]').length
  end

  test 'do not create category if toolbox does not use categories' do
    level = make_level(@empty_toolbox_xml, @solution_xml)
    level.add_missing_toolbox_blocks
    toolbox = Nokogiri::XML(level.properties['toolbox_blocks'])
    assert toolbox.xpath('//category[@name="NEW BLOCKS"]').empty?
  end
end
