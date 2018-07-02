require 'test_helper'

class BlocklyTest < ActiveSupport::TestCase
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

  <block type="custom_category">
    <title name="CUSTOM">PROCEDURE</title>
  </block>

  <block type="custom_category">
    <title name="CUSTOM">VARIABLE</title>
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

  test 'count xml blocks' do
    assert_equal 4, Blockly.count_xml_blocks(@xml)
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
    assert_equal Nokogiri::XML.parse(a, &:noblanks).to_xml,
      Nokogiri::XML.parse(b, &:noblanks).to_xml
  end

  test 'block XML contains no blank nodes' do
    level = Level.create(instructions: 'test', type: 'Artist', start_blocks: @xml)
    assert_equal Nokogiri::XML.parse(level.start_blocks).serialize(save_with: Blockly::XML_OPTIONS),
      Nokogiri::XML.parse(level.start_blocks, &:noblanks).serialize(save_with: Blockly::XML_OPTIONS)
  end

  test 'Block base url is correct with blank and specified asset_host' do
    ActionController::Base.stubs(:asset_host).returns(nil)
    assert_equal '/blockly/', Blockly.base_url

    ActionController::Base.stubs(:asset_host).returns('')
    assert_equal '/blockly/', Blockly.base_url

    ActionController::Base.stubs(:asset_host).returns('test-studio.code.org')
    assert_equal '//test-studio.code.org/blockly/', Blockly.base_url
  end

  test 'converts from and to XML level format' do
    name = 'Test level convert'
    level = LevelLoader.load_custom_level_xml(File.read(File.join(self.class.fixture_path, 'test_level.xml')), Level.new(name: name))
    xml = level.to_xml
    xml2 = LevelLoader.load_custom_level_xml(xml, Level.new(name: name.next)).to_xml
    level.destroy
    assert_equal xml, xml2
  end

  test 'localizes authored hints' do
    test_locale = :"te-ST"
    level_name = 'test_localize_authored_hints'

    I18n.locale = test_locale
    custom_i18n = {
      'data' => {
        'authored_hints' => {
          "#{level_name}_authored_hint" => {
            "first": "first test markdown",
            "second": "second test markdown",
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    level = Level.create(
      name: level_name,
      user: create(:user),
      type: 'Maze',
      authored_hints: JSON.generate(
        [
          {"hint_markdown": "first english markdown", "hint_id": "first"},
          {"hint_markdown": "second english markdown", "hint_id": "second"},
        ]
      )
    )

    localized_hints = JSON.parse(level.localized_authored_hints)

    assert_equal localized_hints[0]["hint_markdown"], "first test markdown"
    assert_equal localized_hints[0]["tts_url"], "https://tts.code.org/sharon22k/180/100/1889ea7b2140fc1aef28a2145df32fbb/test_localize_authored_hints.mp3"

    assert_equal localized_hints[1]["hint_markdown"], "second test markdown"
    assert_equal localized_hints[1]["tts_url"], "https://tts.code.org/sharon22k/180/100/62885e459602efbd236f324c4796acc9/test_localize_authored_hints.mp3"
  end

  test 'handles bad authored hint localization data' do
    test_locale = :"te-ST"
    level_name = 'test_localize_authored_hints'
    I18n.locale = test_locale

    level = Level.create(
      name: level_name,
      user: create(:user),
      type: 'Maze',
      authored_hints: JSON.generate(
        [
          {"hint_markdown": "first english markdown", "hint_id": "first"},
          {"hint_markdown": "second english markdown", "hint_id": "second"},
        ]
      )
    )

    custom_i18n = {
      'data' => {
        'authored_hints' => {
          "#{level_name}_authored_hint" => []
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    assert_nil level.localized_authored_hints

    custom_i18n = {
      'data' => {
        'authored_hints' => {
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    assert_nil level.localized_authored_hints
  end

  test 'uses_droplet for StudioEC levels' do
    level = Level.new(
      name: 'test studioEC level',
      type: 'Blockly',
      game: Game.studio_ec,
    )

    assert level.uses_droplet?
  end

  test 'does not use droplet for maze levels' do
    level = Level.new(
      name: 'test studioEC level',
      type: 'Blockly',
      game_id: Game.by_name('Maze'),
    )

    refute level.uses_droplet?
  end
end
