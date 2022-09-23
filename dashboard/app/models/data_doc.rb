# == Schema Information
#
# Table name: data_docs
#
#  id         :bigint           not null, primary key
#  key        :string(255)      not null
#  name       :string(255)
#  content    :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_data_docs_on_key   (key) UNIQUE
#  index_data_docs_on_name  (name)
#
class DataDoc < ApplicationRecord
  include CurriculumHelper

  validates_uniqueness_of :key, case_sensitive: false
  validate :validate_key_format

  def file_path
    Rails.root.join("config/data_docs/#{key}.json")
  end

  def serialize
    {
      key: key,
      name: name,
      content: content
    }
  end

  # writes data doc to a seed file in the config directory
  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    directory_name = File.dirname(file_path)
    Dir.mkdir(directory_name) unless File.exist?(directory_name)
    File.write(file_path, JSON.pretty_generate(serialize))
  end

  def remove_serialization
    return unless Rails.application.config.levelbuilder_mode
    File.delete(file_path) if File.exist?(file_path)
  end
end
