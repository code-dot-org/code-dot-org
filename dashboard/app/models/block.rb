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
  after_destroy :delete_block_files
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
    delete_block_files(level_type_was, name_was) if name_changed? || level_type_changed?
    FileUtils.mkdir_p "config/blocks/#{level_type}"
    File.write json_path, file_json

    return unless helper_code.try(:present?)
    File.write js_path, helper_code
  end

  def delete_block_files(old_level_type=level_type, old_name=name)
    File.delete json_path if File.exist? json_path(old_level_type, old_name)
    File.delete js_path if File.exist? js_path(old_level_type, old_name)
  end

  def file_json
    JSON.pretty_generate(
      {
        category: category,
        config: JSON.parse(config),
      }
    )
  end

  def js_path(type=level_type, block_name=name)
    Rails.root.join "config/blocks/#{type}/#{block_name}.js"
  end

  def json_path(type=level_type, block_name=name)
    Rails.root.join "config/blocks/#{type}/#{block_name}.json"
  end

  def self.load_blocks
    block_names = []
    LevelLoader.for_each_file('config/blocks/**/*.json') do |json_path|
      block_names << load_block(json_path)
    end
    Block.where.not(name: block_names).destroy_all
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
    block = Block.find_or_initialize_by(
      name: block_name,
      level_type: level_type,
    )
    block.category = block_config['category']
    block.config = block_config['config'].to_json
    block.helper_code = helper_code
    block.save!
    block.name
  end
end
