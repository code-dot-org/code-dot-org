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
  include MultiFileSeeded

  before_save :write_file
  before_destroy :delete_file
  validates_uniqueness_of :name

  def block_options
    {
      name: name,
      category: category,
      config: JSON.parse(config),
      helperCode: helper_code,
    }
  end

  CONFIG_DIRECTORY = 'blocks'
  SUBDIRECTORY_ATTRIBUTES = [:level_type]
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
      level_type: File.basename(File.dirname(path)),
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
