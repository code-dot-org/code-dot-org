require 'test_helper'
require 'json'

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
    xml_a = Nokogiri::XML.parse(a, &:noblanks).to_xml
    xml_b = Nokogiri::XML.parse(b, &:noblanks).to_xml
    assert_equal xml_a, xml_b
  end

  test 'block XML contains no blank nodes' do
    level = Level.create(short_instructions: 'test', type: 'Artist', start_blocks: @xml)
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

  def create_custom_block(name, pool, block_text, args, category: 'Events')
    [{
      name: name,
      pool: pool,
      category: category,
      config:
      {
        "blockText" => block_text,
        "args" => args,
      },
      helperCode: nil
    }]
  end

  test 'localized shared_blocks' do
    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "DanceLab_atSelectColor" => {
            "text" => "kat {TIMESTAMP} {COLOR}",
            "options" => {
              "COLOR" => {
                "red": "rood",
                "blue": "blauw",
              }
            }
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    level = create(:level, :blockly, level_num: 'level1_2_3')

    custom_block =
      [{
        name: "DanceLab_atSelectColor",
        pool: "SelectColor",
        category: "Events",
        config:
        {
          "color" => [140, 1, 0.74],
          "func" => "atSelectColor",
          "blockText" => "cat {TIMESTAMP} {COLOR}",
          "args" => [
            {"name" => "TIMESTAMP", "type" => "Number", "field" => true},
            {"name" => "COLOR", "options" => [["red", "red"], ["blue", "blue"]]}
          ],
          "eventBlock" => true
        },
        helperCode: nil
      }]

    translated_block =
      [{
        name: "DanceLab_atSelectColor",
        pool: "SelectColor",
        category: "Events",
        config:
          {
            "color" => [140, 1, 0.74],
            "func" => "atSelectColor",
            "blockText" => "kat {TIMESTAMP} {COLOR}",
            "args" => [
              {"name" => "TIMESTAMP", "type" => "Number", "field" => true},
              {"name" => "COLOR", "options" => [["rood", "red"], ["blauw", "blue"]]}
            ],
            "eventBlock" => true
          },
        helperCode: nil
      }]

    localized_custom_block = level.localized_shared_blocks(custom_block)

    assert_equal localized_custom_block, translated_block
  end

  test 'original object is not mutated' do
    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "DanceLab_atSelectColor" => {
            "text" => "kat {TIMESTAMP} {COLOR}",
            "options" => {
              "COLOR" => {
                "red": "rood",
                "blue": "blauw",
              }
            }
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    level = create(:level, :blockly, level_num: 'level1_2_3')

    custom_block =
      [{
        name: "DanceLab_atSelectColor",
        pool: "SelectColor",
        category: "Events",
        config:
        {
          "color" => [140, 1, 0.74],
          "func" => "atSelectColor",
          "blockText" => "cat {TIMESTAMP} {COLOR}",
          "args" => [
            {"name" => "TIMESTAMP", "type" => "Number", "field" => true},
            {"name" => "COLOR", "options" => [["red", "red"], ["blue", "blue"]]}
          ],
          "eventBlock" => true
        },
        helperCode: nil
      }]

    level.localized_shared_blocks(custom_block)
    assert_equal custom_block[0][:config]["blockText"], "cat {TIMESTAMP} {COLOR}"
  end

  test 'nil is returned if level_objects is blank' do
    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "DanceLab_atSelectColor" => {
            "text" => "kat {TIMESTAMP} {COLOR}",
            "options" => {
              "COLOR" => {
                "red": "red",
                "blue": "blue",
              }
            }
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    level = create(:level, :blockly, level_num: 'level1_2_3')

    custom_block = []

    localized_custom_block = level.localized_shared_blocks(custom_block)

    assert_nil localized_custom_block
  end

  test 'does not return a translated string if block text does not exist' do
    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "DanceLab_atSelectColor" => {
            "text" => "kat {TIMESTAMP} {COLOR}",
            "options" => {
              "COLOR" => {
                "red": "rood",
                "blue": "blauw",
              }
            }
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    level = create(:level, :blockly, level_num: 'level1_2_3')

    custom_block =
      [{
        name: "DanceLab_atSelectColor",
        pool: "SelectColor",
        category: "Events",
        config:
          {
            "color" => [140, 1, 0.74],
            "func" => "atSelectColor",
            "eventBlock" => true
          },
        helperCode: nil
      }]

    translated_block =
      [{
        name: "DanceLab_atSelectColor",
        pool: "SelectColor",
        category: "Events",
        config:
          {
            "color" => [140, 1, 0.74],
            "func" => "atSelectColor",
            "blockText" => "kat {TIMESTAMP} {COLOR}",
            "args" => [
              {"name" => "TIMESTAMP", "type" => "Number", "field" => true},
              {"name" => "COLOR", "options" => [["red", "red"], ["blue", "blue"]]}
            ],
            "eventBlock" => true
          },
        helperCode: nil
      }]

    localized_custom_block = level.localized_shared_blocks(custom_block)

    assert_not_equal localized_custom_block, translated_block
  end

  test 'does not return translated strings when I18n translation does not exist' do
    test_locale = :"es-ST"
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "DanceLab_atSelectCostume" => {
            "text" => "actor {TYPE} {COSTUME}",
            "options" => {
              "COSTUME" => {
                "hat": "",
                "shirt": "",
              }
            }
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    level = create(:level, :blockly, level_num: 'level1_2_3')

    custom_block =
      [{
        name: "DanceLab_atSelectColor",
        pool: "SelectColor",
        category: "Events",
        config:
          {
            "color" => [140, 1, 0.74],
            "func" => "atSelectColor",
            "blockText" => "actor {TIMESTAMP} {COLOR}",
            "args" => [
              {"name" => "TYPE", "type" => "Number", "field" => true},
              {"name" => "COSTUME", "options" => [["hat", "hat"], ["shirt", "shirt"]]}
            ],
            "eventBlock" => true
          },
        helperCode: nil
      }]

    translated_block =
      [{
        name: "DanceLab_atSelectColor",
        pool: "SelectColor",
        category: "Events",
        config:
          {
            "color" => [140, 1, 0.74],
            "func" => "atSelectColor",
            "blockText" => "actor {TYPE} {COSTUME}",
            "args" => [
              {"name" => "TYPE", "type" => "Number", "field" => true},
              {"name" => "COSTUME", "options" => [["hat", ""], ["shirt", ""]]}
            ],
            "eventBlock" => true
          },
        helperCode: nil
      }]

    localized_custom_block = level.localized_shared_blocks(custom_block)

    assert_not_equal localized_custom_block, translated_block
  end

  test 'option that contains a period in the key is translated' do
    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "ThunderCats_atSelectStrengthLevel" => {
            "text" => "vérifier la {LEVEL}",
            "options" => {
              "LEVEL" => {
                "LEVELS.Whole": "Entier",
                "LEVELS.Half": "Moitié",
              }
            }
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    level = create(:level, :blockly, level_num: 'level1_2_3')

    test_custom_block = create_custom_block(
      "ThunderCats_atSelectStrengthLevel", "SelectStrengthLevel",
      "check the {LEVEL}",
      [
        {"name" => "LEVEL", "options" => [["Whole", "LEVELS.Whole"], ["Half", "LEVELS.Half"]]}
      ],
    )

    translated_block = create_custom_block(
      "ThunderCats_atSelectStrengthLevel", "SelectStrengthLevel",
      "vérifier la {LEVEL}",
      [
        {"name" => "LEVEL", "options" => [["Entier", "LEVELS.Whole"], ["Moitié", "LEVELS.Half"]]}
      ]
    )

    localized_custom_block = level.localized_shared_blocks(test_custom_block)

    assert_equal localized_custom_block, translated_block
  end

  test 'localizes authored hints' do
    test_locale = :"te-ST"
    level_name = 'test_localize_authored_hints'

    I18n.locale = test_locale
    custom_i18n = {
      'data' => {
        'authored_hints' => {
          level_name => {
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

  test 'localized_blocks_with_placeholder_texts' do
    test_locale = 'vi-VN'
    original_str = 'Hello'
    localized_str = 'Xin Chao'
    level = create :level, :blockly

    # Add translation mapping to the I18n backend
    custom_i18n = {
      'data' => {
        'placeholder_texts' => {
          level.name => {
            # Must generate the string key in the same way it is created in
            # the get_i18n_strings function in sync-in.rb script.
            Digest::MD5.hexdigest(original_str) => localized_str
          }
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n

    # Create a simple blockly level XML structure containing the
    # original string, then localize the XML structure.
    block_xml = <<~XML
      <GamelabJr>
        <blocks>
          <start_blocks>
            <xml>
              <block type="gamelab_printText">
                <value name="TEXT">
                  <block type="text">
                    <title name="TEXT">#{original_str}</title>
                  </block>
                </value>
              </block>
              <block type="studio_ask">
                <title name="TEXT">#{original_str}</title>
              </block>
              <block type="studio_showTitleScreen">
                <title name="TITLE">#{original_str}</title>
                <title name="TEXT">#{original_str}</title>
              </block>
            </xml>
          </start_blocks>
        </blocks>
      </GamelabJr>
    XML
    localized_block_xml = level.localized_blocks_with_placeholder_texts(block_xml)

    # Expected result is an one-line XML, in which the original string
    # has been replaced by a localized string.
    block_xml_cleaned = block_xml.strip.gsub(/\s*\n\s*/, '')
    expected_localized_block_xml = block_xml_cleaned.gsub(original_str, localized_str)

    assert_equal expected_localized_block_xml, localized_block_xml
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
          {"hint_markdown": "second english markdown", "hint_id": ""},
        ]
      )
    )

    custom_i18n = {
      'data' => {
        'authored_hints' => {
          "#{level_name}_authored_hint" => {
            first: nil,
            second: nil
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    assert_equal level.authored_hints, level.localized_authored_hints
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

  test 'summarize_for_lesson_show uses translated instructions' do
    custom_i18n = {
      "data" => {
        "short_instructions" => {
          "TestLevel" => "translated short instructions"
        },
        "long_instructions" => {
          "TestLevel" => "translated long instructions"
        }
      }
    }
    test_locale = :"te-ST"
    I18n.locale = test_locale
    level = create(
      :level,
      name: 'TestLevel',
      type: 'Maze',
      long_instructions: 'long instructions',
      short_instructions: 'short instructions',
      game_id: Game.by_name('Maze')
    )
    I18n.backend.store_translations test_locale, custom_i18n
    summary = level.summarize_for_lesson_show(false)
    assert_equal 'translated long instructions', summary[:longInstructions]
    assert_equal 'translated short instructions', summary[:shortInstructions]
  end
end
