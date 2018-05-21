require 'test_helper'

class BlockTest < ActiveSupport::TestCase
  test 'Block writes to and loads back from file' do
    block = create :block
    json_before = block.to_pretty_json
    block.destroy
    base_path = "config/blocks/#{block.level_type}/#{block.name}"

    Block.load_block "#{base_path}.json"

    seeded_block = Block.find_by(name: block.name)
    assert_equal json_before, seeded_block.to_pretty_json

    seeded_block.destroy
    File.delete "#{base_path}.json"
    File.delete "#{base_path}.js"
    Dir.rmdir "config/blocks/fakeLevelType"
  end
end
