require 'test_helper'

class LevelTest < ActiveSupport::TestCase
  setup do
    @toolbox_xml = <<XML
<xml>
  <block type="category">
    <title name="CATEGORY">Category1</title>
  </block>
  <block type="controls_repeat_simplified">
    <title name="TIMES">5</title>
  </block>
  <block type="simple_move_up"></block>
  <block type="simple_move_down"></block>
  <block type="simple_move_right"></block>
  <block type="simple_move_left"></block>

  <block type="category">
    <title name="CATEGORY">Category2</title>
  </block>
  <block type="controls_repeat_simplified">
    <title name="TIMES">5</title>
  </block>
  <block type="simple_move_up"></block>
  <block type="simple_move_down"></block>
  <block type="simple_move_right"></block>
  <block type="simple_move_left"></block>

  <block type="category">
    <title name="CATEGORY">Functions</title>
  </block>

  <block type="category">
    <title name="CATEGORY">Variables</title>
  </block>
</xml>
XML
    @category_xml = <<XML
<xml>
  <category name="Category1">
  <block type="controls_repeat_simplified">
    <title name="TIMES">5</title>
  </block>
  <block type="simple_move_up"/>
  <block type="simple_move_down"/>
  <block type="simple_move_right"/>
  <block type="simple_move_left"/>
  </category>

  <category name="Category2">
  <block type="controls_repeat_simplified">
    <title name="TIMES">5</title>
  </block>
  <block type="simple_move_up"/>
  <block type="simple_move_down"/>
  <block type="simple_move_right"/>
  <block type="simple_move_left"/>
  </category>

  <category name="Functions" custom="PROCEDURE"/>
  <category name="Variables" custom="VARIABLE"/>
</xml>
XML
    @xml = <<XML
<xml>
  <block type="simple_move_up"/>
  <block type="simple_move_down"/>
  <block type="simple_move_right"/>
  <block type="simple_move_left"/>
</xml>
XML
    @blocks_outside_category_xml = <<XML
<xml>
  <category name="Default">
    <block type="simple_move_up"/>
  </category>
  <category name="Example">
    <block type="simple_move_down"/>
  </category>
</xml>
XML
    @blocks_in_default_category_xml = <<XML
<xml>
  <block type="simple_move_up"/>
  <block type="category">
    <title name="CATEGORY">Example</title>
  </block>
  <block type="simple_move_down"/>
</xml>
XML
  end

  test 'convert toolbox to category' do
    assert_equal_xml @category_xml, Blockly.convert_toolbox_to_category(@toolbox_xml)
  end

  test 'convert category to toolbox' do
    assert_equal_xml @toolbox_xml, Blockly.convert_category_to_toolbox(@category_xml)
  end

  test 'blocks placed outside a category are placed in a default category' do
    assert_equal_xml @blocks_outside_category_xml, Blockly.convert_toolbox_to_category(@blocks_in_default_category_xml)
  end

  test 'skip conversion when category not present' do
    assert_equal_xml @xml, Blockly.convert_toolbox_to_category(@xml)
    assert_equal_xml @xml, Blockly.convert_category_to_toolbox(@xml)
  end

  def assert_equal_xml(a, b)
    assert_equal Nokogiri::XML.parse(a) {|config| config.noblanks}.to_xml,
      Nokogiri::XML.parse(b) {|config| config.noblanks}.to_xml
  end

  test 'block XML contains no blank nodes' do
    level = Level.create(instructions: 'test', type: 'Artist', start_blocks: @xml)
    assert_equal Nokogiri::XML.parse(level.start_blocks).serialize(save_with: Blockly::XML_OPTIONS),
      Nokogiri::XML.parse(level.start_blocks, &:noblanks).serialize(save_with: Blockly::XML_OPTIONS)
  end

  test 'converts from and to XML level format' do
    name = 'Test level convert'
    level = Level.load_custom_level_xml(File.read(File.join(self.class.fixture_path, 'test_level.xml')), name)
    xml = level.to_xml
    xml2 = Level.load_custom_level_xml(xml, name).to_xml
    level.destroy
    assert_equal xml, xml2
  end

  test 'Load old level format, create new level format' do
    name = '2-3 Artist 1 new'
    level = Level.load_custom_level(name)
    xml = level.to_xml
    level.destroy
    level = Level.load_custom_level_xml(xml, name)
    xml2 = level.to_xml
    assert_equal xml, xml2
  end

end
