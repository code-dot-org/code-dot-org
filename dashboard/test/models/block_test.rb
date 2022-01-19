require 'test_helper'

class BlockTest < ActiveSupport::TestCase
  setup do
    create :block, pool: Block::DEFAULT_POOL
  end

  teardown do
    FileUtils.rm_rf "config/blocks/fakeLevelType"
    FileUtils.rm_rf "config/blocks/otherFakeLevelType"
    FileUtils.rm_rf "config/blocks/#{Block::DEFAULT_POOL}"
  end

  test 'Block writes to and loads back from file' do
    block = create :block
    json_before = block.block_options(false)
    block.delete
    base_path = "config/blocks/#{block.pool}/#{block.name}"

    Block.load_record "#{base_path}.json"

    seeded_block = Block.find_by(name: block.name)
    assert_equal json_before, seeded_block.block_options(false)
    assert_equal block.pool, seeded_block.pool
    assert_equal block.helper_code, seeded_block.helper_code

    seeded_block.destroy
  end

  test 'Block writes to and loads back from file without helper code' do
    block = create :block, helper_code: nil
    json_before = block.block_options(false)
    block.delete
    base_path = "config/blocks/#{block.pool}/#{block.name}"

    Block.load_record "#{base_path}.json"

    seeded_block = Block.find_by(name: block.name)
    assert_equal json_before, seeded_block.block_options(false)
    assert_equal block.pool, seeded_block.pool
    assert_nil seeded_block.helper_code

    seeded_block.destroy
  end

  test 'Block deletes files after being destroyed' do
    block = create :block
    assert File.exist? "config/blocks/#{block.pool}/#{block.name}.json"
    assert File.exist? "config/blocks/#{block.pool}/#{block.name}.js"
    block.destroy
    refute File.exist? "config/blocks/#{block.pool}/#{block.name}.json"
    refute File.exist? "config/blocks/#{block.pool}/#{block.name}.js"
    assert_empty Dir.glob("config/blocks/fakeLevelType/*")
  end

  test 'load_records destroys old blocks' do
    old_block = create :block
    new_block = create :block
    File.delete old_block.file_path

    Block.load_records('config/blocks/fakeLevelType/*.json')

    assert_nil Block.find_by(name: old_block.name)
    assert_not_nil Block.find_by(name: new_block.name)
  end

  test 'Renaming a block deletes the old files' do
    block = create :block, helper_code: '// Comment comment comment'
    old_file_path = block.file_path
    old_js_path = block.js_path
    assert File.exist? old_file_path
    assert File.exist? old_js_path

    block.name = block.name + '_the_great'
    block.save

    assert Block.for(false, block.pool).any? {|b| b[:name] == block.name}
    refute File.exist? old_file_path
    refute File.exist? old_js_path
  end

  test 'Removing helper code deletes the helper code file' do
    block = create :block, helper_code: '// Comment comment comment'
    old_file_path = block.file_path
    old_js_path = block.js_path
    assert File.exist? old_file_path
    assert File.exist? old_js_path

    block.helper_code = ''
    block.save

    assert File.exist? old_file_path
    refute File.exist? old_js_path
  end

  test 'always includes blocks from the default pool' do
    assert Block.for(false).any? {|b| b[:pool] == Block::DEFAULT_POOL}
  end

  test 'file_path works for unmodified and modified blocks' do
    block = create :block
    name = block.name
    original_path = Rails.root.join("config/blocks/fakeLevelType/#{name}.json")
    assert_equal original_path, block.file_path_was
    assert_equal original_path, block.file_path

    new_name = name + '_the_great'
    block.name = new_name
    assert_equal original_path, block.file_path_was
    assert_equal Rails.root.join("config/blocks/fakeLevelType/#{new_name}.json"), block.file_path

    block.pool = 'otherFakeLevelType'
    assert_equal original_path, block.file_path_was
    assert_equal Rails.root.join("config/blocks/otherFakeLevelType/#{new_name}.json"), block.file_path
  end

  test 'blocks are translated if should_localize is true' do
    block_to_translate = create(
      :block,
      pool: "TestPool",
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
      }.to_json,
      helper_code: nil
    )

    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          block_to_translate.name => {
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

    translated_block =
      {
        name: block_to_translate.name,
        pool: "TestPool",
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
      }

    localized_blocks = Block.for(true, 'TestPool')

    assert_equal translated_block, localized_blocks.select {|b| b[:name] == block_to_translate.name}[0]

    # ensure block wasn't altered
    block_to_translate.reload
    assert_equal "cat {TIMESTAMP} {COLOR}", JSON.parse(block_to_translate.config)['blockText']
  end

  test 'option that contains a period in the key is translated' do
    block_to_translate = create(
      :block,
      pool: "TestPool",
      category: "Events",
      config:
      {
        "color" => [140, 1, 0.74],
        "func" => "selectLevel",
        "blockText" => "check the {LEVEL}",
        "args" => [
          {"name" => "LEVEL", "options" => [["Whole", "LEVELS.Whole"], ["Half", "LEVELS.Half"]]}
        ],
        "eventBlock" => true
      }.to_json,
      helper_code: nil
    )

    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          block_to_translate.name => {
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

    translated_block =
      {
        name: block_to_translate.name,
        pool: "TestPool",
        category: "Events",
        config:
          {
            "color" => [140, 1, 0.74],
            "func" => "selectLevel",
            "blockText" => "vérifier la {LEVEL}",
            "args" => [
              {"name" => "LEVEL", "options" => [["Entier", "LEVELS.Whole"], ["Moitié", "LEVELS.Half"]]}
            ],
            "eventBlock" => true
          },
        helperCode: nil
      }

    localized_blocks = Block.for(true, 'TestPool')

    assert_equal translated_block, localized_blocks.select {|b| b[:name] == block_to_translate.name}[0]
  end

  test 'does not return a translated string if block text does not exist' do
    block_to_translate = create(
      :block,
      pool: "TestPool",
      category: "Events",
      config:
      {
        "color" => [140, 1, 0.74],
        "func" => "atSelectColor",
        "args" => [
          {"name" => "TIMESTAMP", "type" => "Number", "field" => true},
          {"name" => "COLOR", "options" => [["red", "red"], ["blue", "blue"]]}
        ],
        "eventBlock" => true
      }.to_json,
      helper_code: nil
    )

    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          block_to_translate.name => {
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

    translated_block = [
      {
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
      }
    ]

    localized_blocks = Block.for(true, 'TestPool')
    localized_block = localized_blocks.select {|b| b[:name] == block_to_translate.name}[0]
    assert_not_equal localized_block, translated_block
  end

  test 'does not return translated strings when I18n translation does not exist' do
    block_to_translate = create(
      :block,
      pool: "TestPool",
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
      }.to_json,
      helper_code: nil
    )

    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "blocks" => {
          block_to_translate.name => {
            "text" => "kat {TIMESTAMP} {COLOR}",
            "options" => {
              "COLOR" => {
                "red": "",
                "blue": "",
              }
            }
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    translated_block =
      {
        name: block_to_translate.name,
        pool: "TestPool",
        category: "Events",
        config:
          {
            "color" => [140, 1, 0.74],
            "func" => "atSelectColor",
            "blockText" => "kat {TIMESTAMP} {COLOR}",
            "args" => [
              {"name" => "TIMESTAMP", "type" => "Number", "field" => true},
              {"name" => "COLOR", "options" => [["", "red"], ["", "blue"]]}
            ],
            "eventBlock" => true
          },
        helperCode: nil
      }

    localized_blocks = Block.for(true, 'TestPool')

    assert_not_equal translated_block, localized_blocks.select {|b| b[:name] == block_to_translate.name}[0]
  end
end
