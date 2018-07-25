# == Schema Information
#
# Table name: blocks
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  pool        :string(255)      default(""), not null
#  category    :string(255)
#  config      :text(65535)
#  helper_code :text(65535)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Block < ApplicationRecord
  include MultiFileSeeded
  after_save {@@all_pool_names = nil}

  def self.all_pool_names
    @@all_pool_names ||= Block.distinct.pluck(:pool)
  end

  def self.for(*types)
    types.map {|type| Block.load_and_cache_by_pool(type)}.flatten.compact
  end

  def self.load_and_cache_by_pool(pool)
    if Block.all_pool_names.include? pool
      Rails.cache.fetch("blocks/#{pool}", force: !Script.should_cache?) do
        Block.where(pool: pool).map(&:block_options)
      end
    end
  end

  def block_options
    {
      name: name,
      pool: pool,
      category: category,
      config: JSON.parse(config),
      helperCode: helper_code,
    }
  end

  CONFIG_DIRECTORY = 'blocks'
  SUBDIRECTORY_ATTRIBUTES = [:pool]
  EXTENSION = 'json'

  def file_content
    JSON.pretty_generate(
      {
        category: category,
        config: JSON.parse(config),
      }
    )
  end

  def self.properties_from_file(path, content)
    block_config = JSON.parse(content)
    js_path = Pathname.new(path).sub_ext('.js')
    helper_code = File.exist?(js_path) ? File.read(js_path) : nil
    {
      name: File.basename(path, ".#{EXTENSION}"),
      pool: File.basename(File.dirname(path)),
      category: block_config['category'],
      config: block_config['config'].to_json,
      helper_code: helper_code,
    }
  end

  def write_additional_files
    File.write js_path, helper_code if helper_code.try(:present?)
  end

  def delete_additional_files
    File.delete js_path_was if File.exist? js_path_was
  end

  def js_path(old=false)
    Pathname.new(file_path(old)).sub_ext('.js')
  end

  def js_path_was
    js_path(true)
  end
end
