require 'test_helper'
require 'json'

class BlocklyTest < ActiveSupport::TestCase
  setup do
    @toolbox_xml = <<~XML
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
    @category_xml = <<~XML
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

    @category_xml_fields = <<~XML
      <xml>
        <category name="Category1">
        <block type="controls_repeat_simplified">
          <field name="TIMES">5</field>
        </block>
        </category>

        <category name="Category2">
        <block type="controls_repeat_simplified">
          <field name="TIMES">5</field>
        </block>
        </category>

        <category name="Functions" custom="PROCEDURE"/>
        <category name="Variables" custom="VARIABLE"/>
      </xml>
    XML

    @toolbox_xml_fields = <<~XML
      <xml>
        <block type="category">
          <field name="CATEGORY">Category1</field>
        </block>
        <block type="controls_repeat_simplified">
          <field name="TIMES">5</field>
        </block>

        <block type="category">
          <field name="CATEGORY">Category2</field>
        </block>
        <block type="controls_repeat_simplified">
          <field name="TIMES">5</field>
        </block>

        <block type="custom_category">
          <field name="CUSTOM">PROCEDURE</field>
        </block>

        <block type="custom_category">
          <field name="CUSTOM">VARIABLE</field>
        </block>
      </xml>
    XML

    @xml = <<~XML
      <xml>
        <block type="simple_move_up"/>
        <block type="simple_move_down"/>
        <block type="simple_move_right"/>
        <block type="simple_move_left"/>
      </xml>
    XML
    @blocks_outside_category_xml = <<~XML
      <xml>
        <category name="Default">
          <block type="simple_move_up"/>
        </category>
        <category name="Example">
          <block type="simple_move_down"/>
        </category>
      </xml>
    XML
    @blocks_in_default_category_xml = <<~XML
      <xml>
        <block type="simple_move_up"/>
        <block type="category">
          <title name="CATEGORY">Example</title>
        </block>
        <block type="simple_move_down"/>
      </xml>
    XML
  end

  test 'field_or_title' do
    no_fields_or_titles = Nokogiri::XML('<xml><block type="block1"></block></xml>', &:noblanks)
    assert_equal "title", Blockly.field_or_title(no_fields_or_titles)

    fields = Nokogiri::XML('<xml><block type="block2"><field name="value">Example</field></block></xml>', &:noblanks)
    assert_equal "field", Blockly.field_or_title(fields)

    titles = Nokogiri::XML('<xml><block type="block3"><title name="value">Example</title></block></xml>', &:noblanks)
    assert_equal "title", Blockly.field_or_title(titles)

    both = Nokogiri::XML('<xml><block type="block4"><title name="value">Example</title><field name="value2">Example</field></block></xml>', &:noblanks)
    exception = assert_raises(Exception) {Blockly.field_or_title(both)}
    assert_equal("unexpected error: XML contains both field and title elements", exception.message)
  end

  test 'count xml blocks' do
    assert_equal 4, Blockly.count_xml_blocks(@xml)
  end

  test 'convert toolbox to category' do
    assert_equal_xml @category_xml, Blockly.convert_toolbox_to_category(@toolbox_xml)
    assert_equal_xml @category_xml_fields, Blockly.convert_toolbox_to_category(@toolbox_xml_fields)
  end

  test 'convert category to toolbox' do
    assert_equal_xml @toolbox_xml, Blockly.convert_category_to_toolbox(@category_xml)
    assert_equal_xml @toolbox_xml_fields, Blockly.convert_category_to_toolbox(@category_xml_fields)
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
    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "DanceLab_atSelectColor" => {
            "text" => "kat {TIMESTAMP} {COLOR}",
            "options" => {
              "COLOR" => {
                red: "rood",
                blue: "blauw",
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
    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "DanceLab_atSelectColor" => {
            "text" => "kat {TIMESTAMP} {COLOR}",
            "options" => {
              "COLOR" => {
                red: "rood",
                blue: "blauw",
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
    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "DanceLab_atSelectColor" => {
            "text" => "kat {TIMESTAMP} {COLOR}",
            "options" => {
              "COLOR" => {
                red: "red",
                blue: "blue",
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
    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "DanceLab_atSelectColor" => {
            "text" => "kat {TIMESTAMP} {COLOR}",
            "options" => {
              "COLOR" => {
                red: "rood",
                blue: "blauw",
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

    refute_equal localized_custom_block, translated_block
  end

  test 'does not return translated strings when I18n translation does not exist' do
    test_locale = :'es-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "DanceLab_atSelectCostume" => {
            "text" => "actor {TYPE} {COSTUME}",
            "options" => {
              "COSTUME" => {
                hat: "",
                shirt: "",
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

    refute_equal localized_custom_block, translated_block
  end

  test 'option that contains a period in the key is translated' do
    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          "ThunderCats_atSelectStrengthLevel" => {
            "text" => "vérifier la {LEVEL}",
            "options" => {
              "LEVEL" => {
                'LEVELS.Whole': "Entier",
                'LEVELS.Half': "Moitié",
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
    test_locale = :'es-MX'
    level_name = 'test_localize_authored_hints'

    I18n.locale = test_locale
    custom_i18n = {
      'data' => {
        'authored_hints' => {
          level_name => {
            first: "first test markdown",
            second: "second test markdown",
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    level = Level.create(
      name: level_name,
      level_num: 'custom',
      type: 'Maze',
      authored_hints: JSON.generate(
        [
          {hint_markdown: "first english markdown", hint_id: "first"},
          {hint_markdown: "second english markdown", hint_id: "second"},
        ]
      )
    )

    localized_hints = JSON.parse(level.localized_authored_hints)

    assert_equal localized_hints[0]["hint_markdown"], "first test markdown"
    assert_equal localized_hints[0]["tts_url"], "https://tts.code.org/rosa22k/180/100/1889ea7b2140fc1aef28a2145df32fbb/test_localize_authored_hints.mp3"

    assert_equal localized_hints[1]["hint_markdown"], "second test markdown"
    assert_equal localized_hints[1]["tts_url"], "https://tts.code.org/rosa22k/180/100/62885e459602efbd236f324c4796acc9/test_localize_authored_hints.mp3"
  end

  test 'localizes authored hints with embedded behavior block' do
    DCDO.stubs(:get).with(Blockly::BLOCKLY_I18N_IN_TEXT_DCDO_KEY, false).returns(true)
    DCDO.stubs(:get).with(I18nStringUrlTracker::I18N_STRING_TRACKING_DCDO_KEY, false).returns(false)
    DCDO.stubs(:get).with(TextToSpeech::UPDATED_TTS_PATH_DCDO_KEY, false).returns(true)
    test_locale = :'es-MX'
    level_name = 'test_localize_authored_hints_with_embedded_behavior_block'
    hint = <<~HINT
      oración de muestra: <xml><block type="gamelab_addBehaviorSimple" uservisible="false"><value name="SPRITE"><block type="gamelab_getAllSprites"></block></value><value name="BEHAVIOR"><block type="gamelab_behavior_get"><mutation></mutation><title name="VAR">wandering</title></block></value></block></xml>.

      El <xml><block type="sprite_parameter_get"><title name="VAR">this sprite</title></block></xml> bloque
      This block is found in the **Behaviors** category of the toolbox.
    HINT

    I18n.locale = test_locale
    custom_i18n = {
      'data' => {
        'authored_hints' => {
          level_name => {
            first: hint,
          }
        },
        behavior_names: {
          level_name => {
            wandering: "deambulando",
          }
        }
      },
      behaviors: {
        this_sprite: "Este sprite"
      },
    }

    I18n.backend.store_translations test_locale, custom_i18n
    I18n.backend.store_translations :en, behaviors: {this_sprite: "this sprite"}

    level = Level.create(
      name: level_name,
      level_num: 'custom',
      type: 'Maze',
      authored_hints: JSON.generate(
        [
          {hint_markdown: hint, hint_id: "first"},
        ]
      )
    )

    localized_hints = JSON.parse(level.localized_authored_hints)

    expected_translated_hint = hint.gsub("wandering", "deambulando").gsub("this sprite", "Este sprite")
    assert_equal expected_translated_hint, localized_hints[0]["hint_markdown"]
  end

  test 'localized_placeholder_text_blocks' do
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
    localized_block_xml = level.localized_placeholder_text_blocks(block_xml)

    # Expected result is an one-line XML, in which the original string
    # has been replaced by a localized string.
    block_xml_cleaned = block_xml.strip.gsub(/\s*\n\s*/, '')
    expected_localized_block_xml = block_xml_cleaned.gsub(original_str, localized_str)

    assert_equal expected_localized_block_xml, localized_block_xml
  end

  test 'placeholder text is localized within markdown' do
    DCDO.stubs(:get).with(Blockly::BLOCKLY_I18N_IN_TEXT_DCDO_KEY, false).returns(true)
    DCDO.stubs(:get).with(I18nStringUrlTracker::I18N_STRING_TRACKING_DCDO_KEY, false).returns(false)
    level_name = 'test_localize_markdown_placeholder_text'
    test_locale = 'vi-VN'
    original_str = 'Hello'
    localized_str = 'Xin Chao'

    # Create a simple blockly level markdown string containing the
    # original string.
    markdown = <<~HTML
      Test [link](https://code.org)
      <xml><block type="gamelab_printText"><value name="TEXT"><block type="text"><title name="TEXT">#{original_str}</title></block></value></block></xml>
    HTML

    # Add translation mapping to the I18n backend
    custom_i18n = {
      'data' => {
        'placeholder_texts' => {
          level_name => {
            # Must generate the string key in the same way it is created in
            # the get_i18n_strings function in sync-in.rb script.
            Digest::MD5.hexdigest(original_str) => localized_str
          }
        },
        "short_instructions" => {
          level_name => markdown
        },
        "long_instructions" => {
          level_name => markdown
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n

    level = create(
      :level,
      :blockly,
      name: level_name,
      level_num: 'custom',
      short_instructions: markdown,
      long_instructions: markdown
    )

    localized_markdown = level.localized_blockly_in_text(markdown)

    # Expected result is markdown in which the original string
    # has been replaced by a localized string. Newlines should be
    # maintained.
    expected_localized_markdown = markdown.gsub(original_str, localized_str)

    assert_equal expected_localized_markdown, level.localized_blockly_level_options({})['shortInstructions']
    assert_equal expected_localized_markdown, level.localized_blockly_level_options({})['longInstructions']
    assert_equal expected_localized_markdown, localized_markdown
  end

  test 'placeholder text is localized within markdown with malformed HTML' do
    DCDO.stubs(:get).with(Blockly::BLOCKLY_I18N_IN_TEXT_DCDO_KEY, false).returns(true)
    DCDO.stubs(:get).with(I18nStringUrlTracker::I18N_STRING_TRACKING_DCDO_KEY, false).returns(false)
    # This test was created because we ran into an issue when translating blocks in markdown text
    # where the text had malformed HTML, for example missing closing tag or orphaned closing tags.
    level_name = 'test_localize_markdown_placeholder_text_with_bad_html'
    test_locale = 'es-ES'
    original_str = 'Hello'
    localized_str = 'Hola mundo'
    # Create a simple blockly level markdown string containing the
    # original string.
    markdown = <<~HTML
      Test [link](https://code.org)
      <img src="example.com/example.png">
      <img src="example.com/example2.png">
      </div>
      <xml><block type="gamelab_printText"><value name="TEXT"><block type="text"><title name="TEXT">#{original_str}</title></block></value></block></xml>
    HTML

    # Add translation mapping to the I18n backend
    custom_i18n = {
      'data' => {
        'placeholder_texts' => {
          level_name => {
            # Must generate the string key in the same way it is created in
            # the get_i18n_strings function in sync-in.rb script.
            Digest::MD5.hexdigest(original_str) => localized_str
          }
        },
        "short_instructions" => {
          level_name => markdown
        },
        "long_instructions" => {
          level_name => markdown
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n

    level = create(
      :level,
      :blockly,
      name: level_name,
      level_num: 'custom',
      short_instructions: markdown,
      long_instructions: markdown
    )

    localized_markdown = level.localized_blockly_in_text(markdown)

    # Expected result is markdown in which the original string
    # has been replaced by a localized string. Newlines should be
    # maintained.
    expected_localized_markdown = markdown.gsub(original_str, localized_str)

    assert_equal expected_localized_markdown, level.localized_blockly_level_options({})['shortInstructions']
    assert_equal expected_localized_markdown, level.localized_blockly_level_options({})['longInstructions']
    assert_equal expected_localized_markdown, localized_markdown
  end

  test 'handles bad authored hint localization data' do
    test_locale = :'te-ST'
    level_name = 'test_localize_authored_hints'
    I18n.locale = test_locale

    level = Level.create(
      name: level_name,
      user: create(:user),
      type: 'Maze',
      authored_hints: JSON.generate(
        [
          {hint_markdown: "first english markdown", hint_id: "first"},
          {hint_markdown: "second english markdown", hint_id: ""},
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

  test 'localizes default behavior blocks' do
    test_locale = 'te-ST'
    level_name = 'test localize default behavior blocks'
    original_this_sprite_str = 'this sprite'
    original_description_str = 'move a sprite, changing its direction randomly'
    localized_this_sprite_str = 'test sprite'
    localized_name_str = 'test wandering'
    localized_description_str = 'test wandering description'
    level = create(
      :level,
      :blockly,
      name: level_name,
    )

    # Add translation mapping to the I18n backend
    custom_i18n = {
      'behaviors' => {
        'this_sprite' => localized_this_sprite_str
      },
      'data' => {
        'behavior_names' => {
          level.name => {
            'wandering' => localized_name_str
          }
        },
        'behavior_descriptions' => {
          level.name => {
            'wandering' => localized_description_str
          }
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n

    # Create a simple blockly level XML structure containing the
    # original string, then localize the XML structure.
    block_xml = <<~XML
      <block type="behavior_definition" deletable="false" movable="false" editable="false">
        <mutation>
          <arg name="this sprite" type="Sprite"/>
          <description>move a sprite, changing its direction randomly</description>
        </mutation>
        <title name="NAME" id="wandering">wandering</title>
      </block>
    XML
    localized_block_xml = level.localized_function_blocks(block_xml)
    parsed_xml = Nokogiri::XML(block_xml, &:noblanks)

    # Replacing using xpath because we only want to replace the content. `id` should be untouched
    parsed_xml.xpath("//title[@id='wandering']").first.content = localized_name_str
    expected_localized_block_xml = parsed_xml.serialize(save_with: Blockly::XML_OPTIONS)

    expected_localized_block_xml.gsub!(original_this_sprite_str, localized_this_sprite_str)
    expected_localized_block_xml.gsub!(original_description_str, localized_description_str)
    expected_localized_block_xml.strip!.gsub!(/\s*\n\s*/, '')

    assert_equal expected_localized_block_xml, localized_block_xml
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
    test_locale = :'te-ST'
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

  test 'remove_counter_mutations' do
    counter_mutation_xml = <<~XML
      <xml>
        <block type="category">
          <title name="CATEGORY">Category1</title>
        </block>
        <block type="controls_for_counter" inline="true">
          <mutation counter="counter"/>
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
      </xml>
    XML
    updated_xml_string = Blockly.remove_counter_mutations(counter_mutation_xml)
    updated_xml = Nokogiri::XML(updated_xml_string, &:noblanks)
    assert_equal updated_xml.xpath('//mutation').count, 0
  end

  test 'other mutation blocks are not removed' do
    counter_mutation_xml = <<~XML
      <xml>
        <block type="category">
          <title name="CATEGORY">Category1</title>
        </block>
        <block type="procedures_callnoreturn">
          <mutation name="draw pinwheel"/>
        </block>
      </xml>
    XML
    updated_xml_string = Blockly.remove_counter_mutations(counter_mutation_xml)
    updated_xml = Nokogiri::XML(updated_xml_string, &:noblanks)
    assert_equal updated_xml.xpath('//mutation').count, 1
  end

  test 'localizes loop blocks' do
    test_locale = 'te-ST'
    level_name = 'test localize loop blocks'
    original_variable_str = 'counter'
    localized_variable_str = 'contador'
    level = create(
      :level,
      :blockly,
      name: level_name,
    )

    # Add translation mapping to the I18n backend
    custom_i18n = {
      'data' => {
        'variable_names' => {
          original_variable_str => localized_variable_str
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n

    # Create a simple blockly level XML structure containing the
    # original string, then localize the XML structure.
    block_xml = <<~XML
      <block type="controls_for">
        <title name="VAR">counter</title>
        <value name="FROM">
          <block type="math_number">
            <title name="NUM">1</title>
          </block>
        </value>
        <value name="TO">
          <block type="math_number">
            <title name="NUM">10</title>
          </block>
        </value>
        <value name="BY">
          <block type="math_number">
            <title name="NUM">1</title>
          </block>
        </value>
      </block>
    XML

    # Localized output to be tested
    localized_block_xml = level.localized_loop_blocks(block_xml)

    # Expected output
    parsed_xml = Nokogiri::XML(block_xml, &:noblanks)
    expected_localized_block_xml = parsed_xml.serialize(save_with: Blockly::XML_OPTIONS)
    expected_localized_block_xml.gsub!(original_variable_str, localized_variable_str)
    expected_localized_block_xml.strip!.gsub!(/\s*\n\s*/, '')

    assert_equal expected_localized_block_xml, localized_block_xml
  end

  test 'localizes math_change blocks' do
    test_locale = 'te-ST'
    level_name = 'test localize math change blocks'
    original_variable_str = 'counter'
    localized_variable_str = 'contador'
    level = create(
      :level,
      :blockly,
      name: level_name,
    )

    # Add translation mapping to the I18n backend
    custom_i18n = {
      'data' => {
        'variable_names' => {
          original_variable_str => localized_variable_str
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n

    # Create a simple blockly level XML structure containing the
    # original string, then localize the XML structure.
    # A snippet of: https://studio.code.org/s/coursef-2021/lessons/12/levels/5
    block_xml = <<~XML
      <block type="maze_move">
        <title name="DIR">moveForward</title>
        <next>
          <block type="controls_repeat_ext">
            <value name="TIMES">
              <block type="variables_get">
                <title name="VAR">counter</title>
              </block>
            </value>
            <statement name="DO">
              <block type="maze_honey"/>
            </statement>
            <next>
              <block type="maze_turn">
                <title name="DIR">turnLeft</title>
                <next>
                  <block type="math_change">
                    <title name="VAR">counter</title>
                    <value name="DELTA">
                      <block type="math_number">
                        <title name="NUM">1</title>
                      </block>
                    </value>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    XML

    # Localized output to be tested
    localized_block_xml = level.localized_remaining_variable_blocks(block_xml)

    # Expected output
    parsed_xml = Nokogiri::XML(localized_block_xml, &:noblanks)
    assert_equal parsed_xml.at_xpath('//block[@type="math_change"]/*[@name="VAR"]').content, localized_variable_str
  end

  test 'localizes gamelab_textVariableJoin blocks' do
    test_locale = 'te-ST'
    level_name = 'test localize gamelab_textVariableJoin blocks'
    original_variable_str = 'name'
    localized_variable_str = 'nombre'
    level = create(
      :level,
      :blockly,
      name: level_name,
    )

    # Add translation mapping to the I18n backend
    custom_i18n = {
      'data' => {
        'variable_names' => {
          original_variable_str => localized_variable_str
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n

    # Create a simple blockly level XML structure containing the
    # original string, then localize the XML structure.
    # A snippet of: https://studio.code.org/s/coursef-2022/lessons/7/levels/1
    block_xml = <<~XML
      <block type="gamelab_whenPromptAnswered">
        <value name="VAR">
          <block type="variables_get">
            <title name="VAR">name</title>
          </block>
        </value>
        <next>
          <block type="gamelab_printText">
            <value name="TEXT">
              <block type="gamelab_textJoin">
                <title name="TEXT1">Hello </title>
                <value name="TEXT2">
                  <block type="gamelab_textVariableJoin">
                    <title name="VAR">name</title>
                    <value name="TEXT2">
                      <block type="text">
                        <title name="TEXT">!</title>
                      </block>
                    </value>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </next>
      </block>
    XML

    # Localized output to be tested
    localized_block_xml = level.localized_remaining_variable_blocks(block_xml)

    # Expected output
    parsed_xml = Nokogiri::XML(localized_block_xml, &:noblanks)
    assert_equal parsed_xml.at_xpath('//block[@type="gamelab_textVariableJoin"]/*[@name="VAR"]').content, localized_variable_str
  end

  test 'localizes studio_ask blocks' do
    test_locale = 'te-ST'
    level_name = 'test localize studio_ask blocks'
    original_variable_str = 'name'
    localized_variable_str = 'nombre'
    level = create(
      :level,
      :blockly,
      name: level_name,
    )

    # Add translation mapping to the I18n backend
    custom_i18n = {
      'data' => {
        'variable_names' => {
          original_variable_str => localized_variable_str
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n

    # Create a simple blockly level XML structure containing the
    # original string, then localize the XML structure.
    # A snippet of: https://studio.code.org/s/coursef-2017/lessons/17/levels/5
    block_xml = <<~XML
      <block type="when_run" deletable="false">
        <next>
          <block type="studio_ask" can_disconnect_from_parent="false">
            <title name="TEXT">What be yer name?</title>
            <title name="VAR">name</title>
            <next>
              <block type="studio_saySpriteParams" inline="true" can_disconnect_from_parent="false">
                <title name="SPRITE">1</title>
                <value name="TEXT">
                  <block type="variables_get" editable="false" can_disconnect_from_parent="false">
                    <title name="VAR">name</title>
                  </block>
                </value>
                <next>
                  <block type="studio_saySpriteParams" inline="true">
                    <title name="SPRITE">0</title>
                    <value name="TEXT">
                      <block type="text_join_simple" inline="false" inputcount="3">
                        <value name="ADD0">
                          <block type="text">
                            <title name="TEXT">It be a pleasure, </title>
                          </block>
                        </value>
                        <value name="ADD2">
                          <block type="text">
                            <title name="TEXT">.</title>
                          </block>
                        </value>
                      </block>
                    </value>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
      <block type="variables_get">
        <title name="VAR">name</title>
      </block>
    XML

    # Localized output to be tested
    localized_block_xml = level.localized_remaining_variable_blocks(block_xml)

    # Expected output
    parsed_xml = Nokogiri::XML(localized_block_xml, &:noblanks)
    assert_equal parsed_xml.at_xpath('//block[@type="studio_ask"]/*[@name="VAR"]').content, localized_variable_str
  end

  test 'localizes long_instructions when present' do
    test_locale = 'te-ST'
    level_name = 'test localize long_instructions'
    level = create(
      :level,
      :blockly,
      name: level_name,
      long_instructions: 'original long instructions'
    )

    custom_i18n = {
      'data' => {
        'long_instructions' => {
          level_name => 'translated long instructions'
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n

    assert_equal 'translated long instructions', level.localized_long_instructions
  end

  test 'localizes long_instructions and removes escaped backticks when present' do
    test_locale = 'te-ST'
    level_name = 'test localize long_instructions'
    level = create(
      :level,
      :blockly,
      name: level_name,
      long_instructions: 'original long instructions with [`block`](#bloc)'
    )

    custom_i18n = {
      'data' => {
        'long_instructions' => {
          level_name => 'translated long instructions with [\`block\`](#bloc)'
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n

    assert_equal 'translated long instructions with [`block`](#bloc)', level.localized_long_instructions
  end

  test 'localizes start_libraries when i18n_library is present' do
    test_locale = 'te-ST'
    level_name = 'test localize start_libraries'
    i18n_library_name = 'i18n_library_test'
    level = create(
      :level,
      :blockly,
      name: level_name,
      )
    # Add translation mapping to the I18n backend
    custom_i18n_libraries = {
      'data' => {
        'start_libraries' => {
          level_name => {
            i18n_library_name => {
              test_key_1: 'localized_string_1'
            }
          }
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n_libraries
    # Create a start_libraries JSON structure containing a translatable library and a non-translatable library.
    start_libraries = JSON.generate(
      [{name: i18n_library_name,
        description: "Test Library that gets translated",
        source: "var TRANSLATIONTEXT = {\n \"test_key_1\": \"expected_string_1\",\n \"test_key_2\": \"expected_string_2\"\n};\n\n//This library is translated\nfunction someFunction(key) {\n return TRANSLATIONTEXT[key];\n}\n"},
       {name: "non_translated_library",
        description: "Test Library that does not get translated",
        source: "var TRANSLATIONTEXT = {\n \"not_translated_key\": \"not_translated_string\"\n};\n\n//This library is not translated\nfunction someFunction(key) {\n return TRANSLATIONTEXT[key];\n}\n"}]
    )

    # Localized output to be tested
    localized_start_libraries = level.localized_start_libraries(start_libraries)

    # Expected output
    expected_localized_library = JSON.generate(
      [{name: i18n_library_name,
        description: "Test Library that gets translated",
        source: "var TRANSLATIONTEXT = {\n  \"test_key_1\": \"localized_string_1\",\n  \"test_key_2\": \"expected_string_2\"\n};\n\n//This library is translated\nfunction someFunction(key) {\n return TRANSLATIONTEXT[key];\n}\n"},
       {name: "non_translated_library",
        description: "Test Library that does not get translated",
        source: "var TRANSLATIONTEXT = {\n \"not_translated_key\": \"not_translated_string\"\n};\n\n//This library is not translated\nfunction someFunction(key) {\n return TRANSLATIONTEXT[key];\n}\n"}]
    )
    assert_equal expected_localized_library, localized_start_libraries
  end

  test 'does not localize start_libraries when there is not an i18n library' do
    test_locale = 'te-ST'
    level_name = 'test localize start_libraries'
    i18n_library_name = 'i18n_library_test'
    level = create(
      :level,
      :blockly,
      name: level_name,
      )
    # Add translation mapping to the I18n backend
    custom_i18n_libraries = {
      'data' => {
        'start_libraries' => {
          level_name => {
            i18n_library_name => {
              test_key_1: 'localized_string_1'
            }
          }
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n_libraries
    # Create a start_libraries blockly level JSON structure containing the
    # a translatable library and a non-translatable library.
    start_libraries = JSON.generate(
      [{name: "non_translated_library",
        description: "Test Library that does not get translated",
        source: "var TRANSLATIONTEXT = {\n \"not_translated_key\": \"not_translated_string\"\n};\n\n//This library is not translated\nfunction someFunction(key) {\n return TRANSLATIONTEXT[key];\n}\n"}]
    )

    # Localized output to be tested
    localized_start_libraries = level.localized_start_libraries(start_libraries)

    # Expected output
    expected_localized_library = JSON.generate(
      [{name: "non_translated_library",
        description: "Test Library that does not get translated",
        source: "var TRANSLATIONTEXT = {\n \"not_translated_key\": \"not_translated_string\"\n};\n\n//This library is not translated\nfunction someFunction(key) {\n return TRANSLATIONTEXT[key];\n}\n"}]
    )
    assert_equal expected_localized_library, localized_start_libraries
  end

  test 'get_localized_property returns property translation when level should be localized' do
    level = Blockly.new(name: 'expected-blockly-level', failure_message_override: 'expected_failure_message_override')

    level.stubs(:should_localize?).returns(true)

    I18n.expects(:t).with('expected-blockly-level', scope: [:data, 'failure_message_override'], default: nil, smart: true).once.returns('expected-blockly-level-property-translation')

    assert_equal 'expected-blockly-level-property-translation', level.get_localized_property('failure_message_override')
  end

  test 'get_localized_property returns nil when level should not be localized' do
    level = Blockly.new(name: 'expected-blockly-level', failure_message_override: 'expected_failure_message_override')

    level.stubs(:should_localize?).returns(false)

    I18n.expects(:t).with('expected-blockly-level', scope: [:data, 'failure_message_override'], default: nil, smart: true).never

    assert_nil level.get_localized_property('failure_message_override')
  end

  test 'get_localized_property returns nil when value is nil' do
    level = Blockly.new(name: 'expected-blockly-level', failure_message_override: nil)

    level.stubs(:should_localize?).returns(true)

    I18n.expects(:t).with('expected-blockly-level', scope: [:data, 'failure_message_override'], default: nil, smart: true).never

    assert_nil level.get_localized_property('failure_message_override')
  end

  test 'localized_failure_message_override returns failure_message_override property translation' do
    level = Blockly.new

    level.expects(:get_localized_property).with('failure_message_override').once.returns('expected_failure_message_override_translation')

    assert_equal 'expected_failure_message_override_translation', level.localized_failure_message_override
  end
end
