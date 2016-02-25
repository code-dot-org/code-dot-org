require 'test_helper'

class ArtistTest < ActiveSupport::TestCase
  setup do
    @empty_toolbox_xml = <<XML
<xml>
</xml>
XML
    @toolbox_with_draw_constant_xml = <<XML
<xml>
  <block type="draw_move_by_constant"/>
</xml>
XML
    @toolbox_with_draw_constant_id_xml = <<XML
<xml>
  <block type="draw_move_by_constant" id="foo"/>
</xml>
XML
    @toolbox_with_draw_xml = <<XML
<xml>
  <block type="draw_move"/>
</xml>
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
    @toolbox_with_draw_dropdown_xml = <<XML
<xml>
  <block type="draw_move_by_constant_dropdown">
    <title name="DIR">moveForward</title>
    <title name="VALUE" config="50,100,150,200,300">50</title>
  </block>
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
    @solution_with_id_xml = <<XML
<xml>
  <block type="when_run" deletable="false" movable="false">
    <next>
      <block type="draw_move_by_constant" id="bar">
        <title name="DIR">moveForward</title>
        <title name="VALUE">100</title>
      </block>
    </next>
  </block>
</xml>
XML
    @solution_with_inline_xml = <<XML
<xml>
  <block type="when_run" deletable="false" movable="false">
    <next>
      <block type="draw_move_by_constant" inline="true">
        <title name="DIR">moveForward</title>
        <title name="VALUE">100</title>
      </block>
    </next>
  </block>
</xml>
XML
    @solution_with_next_xml = <<XML
<xml>
  <block type="when_run" deletable="false" movable="false">
    <next>
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
    </next>
  </block>
</xml>
XML
    @solution_with_non_constant_draw_xml = <<XML
<xml>
  <block type="when_run" deletable="false" movable="false">
    <next>
      <block type="draw_move" inline="true">
        <title name="DIR">moveForward</title>
        <value name="VALUE">
          <block type="math_number">
            <title name="NUM">100</title>
          </block>
        </value>
        <next>
          <block type="draw_move" inline="true">
            <title name="DIR">moveForward</title>
            <value name="VALUE">
              <block type="math_number">
                <title name="NUM">50</title>
              </block>
            </value>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>
XML
  end

  def make_level(toolbox_xml, solution_xml)
    level = Artist.new
    level.properties['toolbox_blocks'] = toolbox_xml
    level.properties['solution_blocks'] = solution_xml
    level
  end

  def assert_blocktype_in_toolbox(level, type, occurrances=1)
    blocks = Nokogiri::XML(level.properties['toolbox_blocks']).xpath("//block[@type=\"#{type}\"]")
    assert_equal occurrances, blocks.length
  end

  test 'add missing block' do
    level = make_level(@empty_toolbox_xml, @solution_xml)
    level.add_missing_toolbox_blocks
    assert_blocktype_in_toolbox level, "draw_move_by_constant"
  end

  test 'do not add already present block' do
    level = make_level(@toolbox_with_draw_constant_xml, @solution_xml)
    level.add_missing_toolbox_blocks
    assert_equal @toolbox_with_draw_constant_xml, level.properties['toolbox_blocks']
  end

  test 'do not add non-editable solution blocks' do
    level = make_level(@empty_toolbox_xml, @non_editable_solution_xml)
    level.add_missing_toolbox_blocks
    assert_equal @empty_toolbox_xml, level.properties['toolbox_blocks']
  end

  test 'do not add duplicate blocks because of differing ids' do
    level = make_level(@toolbox_with_draw_constant_id_xml, @solution_with_id_xml)
    level.add_missing_toolbox_blocks
    assert_equal @toolbox_with_draw_constant_id_xml, level.properties['toolbox_blocks']
  end

  test 'do not add duplicate blocks because of differing inline attribute' do
    level = make_level(@toolbox_with_draw_constant_xml, @solution_with_inline_xml)
    level.add_missing_toolbox_blocks
    assert_equal @toolbox_with_draw_constant_xml, level.properties['toolbox_blocks']
  end

  test 'do not add duplicate blocks because of next child node' do
    level = make_level(@toolbox_with_draw_constant_xml, @solution_with_next_xml)
    level.add_missing_toolbox_blocks
    assert_equal @toolbox_with_draw_constant_xml, level.properties['toolbox_blocks']
  end

  test 'do not add duplicate blocks for differing title values' do
    level = make_level(@empty_toolbox_xml, @solution_with_non_constant_draw_xml)
    level.add_missing_toolbox_blocks
    assert_blocktype_in_toolbox level, 'draw_move'
  end

  test 'do not add jump/move_by_constant blocks if *_dropdown version is already present' do
    level = make_level(@toolbox_with_draw_dropdown_xml, @solution_xml)
    level.add_missing_toolbox_blocks
    assert_equal @toolbox_with_draw_dropdown_xml, level.properties['toolbox_blocks']
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
