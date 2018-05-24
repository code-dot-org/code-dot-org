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
  validates_uniqueness_of :name

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
    File.write block_path, file_json

    return unless helper_code
    js_path = Rails.root.join "config/blocks/#{level_type}/#{name}.js"
    File.write js_path, helper_code
  end

  def file_json
    JSON.pretty_generate(
      {
        category: category,
        config: JSON.parse(config),
      }
    )
  end

  def self.load_blocks
    LevelLoader.for_each_file('config/blocks/**/*.json') do |json_path|
      load_block json_path
    end
  end

  def self.load_block(json_path)
    block_config = JSON.parse(File.read(json_path))

    block_name = File.basename(json_path, '.json')
    level_type = File.basename(File.dirname(json_path))

    helper_code = nil
    js_path = Rails.root.join("config/blocks/#{level_type}/#{block_name}.js")
    if File.exist? js_path
      helper_code = File.read js_path
    end
    Block.find_or_initialize_by(
      {
        name: block_name,
        level_type: level_type,
      }
    ).tap do |block|
      block.update(
        {
          category: block_config['category'],
          config: block_config['config'].to_json,
        }
      )
      block.update(helper_code: helper_code) if helper_code
    end
  end
end
