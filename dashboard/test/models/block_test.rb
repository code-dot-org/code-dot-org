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
    json_before = block.block_options
    block.delete
    base_path = "config/blocks/#{block.pool}/#{block.name}"

    Block.load_record "#{base_path}.json"

    seeded_block = Block.find_by(name: block.name)
    assert_equal json_before, seeded_block.block_options
    assert_equal block.pool, seeded_block.pool
    assert_equal block.helper_code, seeded_block.helper_code

    seeded_block.destroy
  end

  test 'Block writes to and loads back from file without helper code' do
    block = create :block, helper_code: nil
    json_before = block.block_options
    block.delete
    base_path = "config/blocks/#{block.pool}/#{block.name}"

    Block.load_record "#{base_path}.json"

    seeded_block = Block.find_by(name: block.name)
    assert_equal json_before, seeded_block.block_options
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
    refute_nil Block.find_by(name: new_block.name)
  end

  test 'Renaming a block deletes the old files' do
    block = create :block, helper_code: '// Comment comment comment'
    old_file_path = block.file_path
    old_js_path = block.js_path
    assert File.exist? old_file_path
    assert File.exist? old_js_path

    block.name = block.name + '_the_great'
    block.save

    assert(Block.for(block.pool).any? {|b| b[:name] == block.name})
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
    assert(Block.for.any? {|b| b[:pool] == Block::DEFAULT_POOL})
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
end
