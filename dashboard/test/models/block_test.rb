require 'test_helper'

class BlockTest < ActiveSupport::TestCase
  test 'Block writes to and loads back from file' do
    block = create :block
    json_before = block.block_options
    block.destroy
    base_path = "config/blocks/#{block.level_type}/#{block.name}"

    Block.load_block "#{base_path}.json"

    seeded_block = Block.find_by(name: block.name)
    assert_equal json_before, seeded_block.block_options
    assert_equal block.level_type, seeded_block.level_type
    assert_equal block.helper_code, seeded_block.helper_code

    seeded_block.destroy
    File.delete "#{base_path}.json"
    File.delete "#{base_path}.js"
    Dir.rmdir "config/blocks/fakeLevelType"
  end

  test 'Block writes to and loads back from file without helper code' do
    block = create :block, helper_code: nil
    json_before = block.block_options
    block.destroy
    base_path = "config/blocks/#{block.level_type}/#{block.name}"

    Block.load_block "#{base_path}.json"

    seeded_block = Block.find_by(name: block.name)
    assert_equal json_before, seeded_block.block_options
    assert_equal block.level_type, seeded_block.level_type
    assert_nil seeded_block.helper_code

    seeded_block.destroy
    File.delete "#{base_path}.json"
    Dir.rmdir "config/blocks/fakeLevelType"
  end
end
