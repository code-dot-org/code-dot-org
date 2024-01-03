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

  def to_param
    key
  end

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
    FileUtils.mkdir_p(directory_name)
    File.write(file_path, JSON.pretty_generate(serialize))
  end

  def remove_serialization
    return unless Rails.application.config.levelbuilder_mode
    FileUtils.rm_f(file_path)
  end

  # creates and deletes records to match all the seed files
  def self.seed_all
    # collect all existing docs, and for each json file,
    # seed the data doc and remove it from the removed_records
    records_to_be_removed = all.pluck(:id)
    Dir.glob(Rails.root.join("config/data_docs/**/*.json")).each do |path|
      records_to_be_removed -= [DataDoc.seed_record(path)]
    end
    # the remaining ids that were not seeded should be removed
    where(id: records_to_be_removed).destroy_all
  end

  # parses a seed file and generates a hash of the data doc
  def self.properties_from_file(content)
    config = JSON.parse(content)
    {
      key: config['key'],
      name: config['name'],
      content: config['content'],
    }
  end

  # returns the local id of the data doc that was created/updated
  def self.seed_record(file_path)
    properties = properties_from_file(File.read(file_path))
    data_doc = DataDoc.find_or_initialize_by(
      key: properties[:key],
    )
    data_doc.update! properties
    data_doc.id
  end
end
