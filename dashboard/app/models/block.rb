# == Schema Information
#
# Table name: blocks
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  level_type  :string(255)
#  category    :text(65535)
#  config      :text(65535)
#  helper_code :text(65535)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Block < ApplicationRecord
  after_save :write_block_files
  validates_uniqueness_of :name, scope: [:level_type]

  def block_options
    {
      name: name,
      category: category,
      config: JSON.parse(config),
      helperCode: helper_code,
    }
  end

  def write_block_files
    FileUtils.mkdir_p "config/blocks/#{level_type}"
    block_path = Rails.root.join "config/blocks/#{level_type}/#{name}.json"
    File.write block_path, to_pretty_json

    return unless helper_code
    js_path = Rails.root.join "config/blocks/#{level_type}/#{name}.js"
    File.write js_path, helper_code
  end

  def to_pretty_json
    to_json(true)
  end

  def to_json(pretty=false)
    hash = {
      name: name,
      level_type: level_type,
      category: category,
      config: JSON.parse(config),
    }
    return JSON.pretty_generate hash if pretty
    hash.to_json
  end

  def self.load_blocks
    Dir.glob(Rails.root.join('config/blocks/**/*.json')).sort.each do |json_path|
      load_block json_path
    end
  end

  def self.load_block(json_path)
    block_config = JSON.parse(File.read(json_path))

    block_name = File.basename(json_path, '.json')
    level_type = File.basename(File.dirname(json_path))
    raise "#{block_name}.json has the wrong block name" unless block_name == block_config['name']
    raise "#{level_type}/#{block_name}.json is in the wrong folder" unless level_type == block_config['level_type']

    helper_code = nil
    js_path = Rails.root.join("config/blocks/#{level_type}/#{block_name}.js")
    if File.exist? js_path
      helper_code = File.read js_path
    end
    key_props = {
      name: block_config['name'],
      level_type: block_config['level_type'],
    }
    block_props = {
      category: block_config['category'],
      config: block_config['config'].to_json,
    }
    block_props[:helper_code] = helper_code if helper_code
    block = Block.find_by key_props
    block ||= Block.new key_props
    block.update_attributes block_props
  end
end
