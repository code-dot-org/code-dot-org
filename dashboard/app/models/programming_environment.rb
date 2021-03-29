# == Schema Information
#
# Table name: programming_environments
#
#  id         :bigint           not null, primary key
#  name       :string(255)      not null
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_programming_environments_on_name  (name) UNIQUE
#
class ProgrammingEnvironment < ApplicationRecord
  include SerializedProperties

  validates_uniqueness_of :name

  has_many :programming_expressions

  # @attr [String] editor_type - Type of editor one of the following: 'text-based', 'droplet', 'blockly'
  serialized_attrs %w(
    editor_type
  )

  def self.properties_from_file(content)
    environment_config = JSON.parse(content)
    {
      name: environment_config['name'],
      editor_type: environment_config['editorType']
    }
  end

  def self.seed_all(glob="config/programming_environments/*.json")
    removed_records = all.pluck(:name)
    Dir.glob(Rails.root.join(glob)).each do |path|
      removed_records -= [ProgrammingEnvironment.seed_record(path)]
    end
    where(name: removed_records).destroy_all
  end

  def self.seed_record(file_path)
    properties = properties_from_file(File.read(file_path))
    environment = ProgrammingEnvironment.find_or_initialize_by(name: properties[:name])
    environment.update! properties
    environment.name
  end

  def summarize_for_lesson_edit
    {id: id, name: name}
  end
end
