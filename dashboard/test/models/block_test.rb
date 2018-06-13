require 'test_helper'

class BlockTest < ActiveSupport::TestCase
  teardown do
    FileUtils.rm_rf "config/blocks/fakeLevelType"
  end

  test 'Block writes to and loads back from file' do
    block = create :block
    json_before = block.block_options
    block.delete
    base_path = "config/blocks/#{block.level_type}/#{block.name}"

    Block.load_block "#{base_path}.json"

    seeded_block = Block.find_by(name: block.name)
    assert_equal json_before, seeded_block.block_options
    assert_equal block.level_type, seeded_block.level_type
    assert_equal block.helper_code, seeded_block.helper_code

    seeded_block.destroy
  end

  test 'Block writes to and loads back from file without helper code' do
    block = create :block, helper_code: nil
    json_before = block.block_options
    block.delete
    base_path = "config/blocks/#{block.level_type}/#{block.name}"

    Block.load_block "#{base_path}.json"

    seeded_block = Block.find_by(name: block.name)
    assert_equal json_before, seeded_block.block_options
    assert_equal block.level_type, seeded_block.level_type
    assert_nil seeded_block.helper_code

    seeded_block.destroy
  end

  test 'Block deletes files after being destroyed' do
    block = create :block
    assert File.exist? "config/blocks/#{block.level_type}/#{block.name}.json"
    assert File.exist? "config/blocks/#{block.level_type}/#{block.name}.js"
    block.destroy
    refute File.exist? "config/blocks/#{block.level_type}/#{block.name}.json"
    refute File.exist? "config/blocks/#{block.level_type}/#{block.name}.js"
    assert_empty Dir.glob("config/blocks/fakeLevelType/*")
  end

  test 'load_blocks destroys old blocks' do
    old_block = create :block
    new_block = create :block
    File.delete old_block.json_path

    Block.load_blocks

    assert_nil Block.find_by(name: old_block.name)
    assert_not_nil Block.find_by(name: new_block.name)
  end

  test 'Renaming a block deletes the old files' do
    block = create :block, helper_code: '// Comment comment comment'
    old_json_path = block.json_path
    old_js_path = block.js_path
    assert File.exist? old_json_path
    assert File.exist? old_js_path

    block.name = block.name + '_the_great'
    block.save

    refute File.exist? old_json_path
    refute File.exist? old_js_path
  end
end
