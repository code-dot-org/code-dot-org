# == Schema Information
#
# Table name: skills
#
#  id                  :bigint           not null, primary key
#  description         :string(255)      not null
#  evaluation_criteria :text(65535)
#  concept             :string(255)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  key                 :string(255)      not null
#
# Indexes
#
#  index_skills_on_key  (key) UNIQUE
#
class Skill < ApplicationRecord
  validates :description, presence: true

  has_and_belongs_to_many :levels, join_table: 'levels_skills', dependent: :delete_all

  before_destroy do
    levels.each do |level|
      level.remove_skill_key(key)
    end
  end

  after_destroy :delete_serialized_file

  def serialize
    {
      key: key,
      concept: concept,
      description: description,
      evaluation_criteria: evaluation_criteria
    }
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    file_path = Rails.root.join("config/skills/#{key}.json")
    object_to_serialize = serialize
    File.write(file_path, JSON.pretty_generate(object_to_serialize) + "\n")
  end

  def self.seed_all(root_dir: Rails.root, glob: "config/skills/*.json")
    Dir.glob(root_dir.join(glob)).each do |path|
      Skill.seed_record(path)
    end
  end

  def self.properties_from_file(content)
    config = JSON.parse(content)
    config.symbolize_keys
  end

  def self.seed_record(file_path)
    properties = properties_from_file(File.read(file_path))
    skill = Skill.find_or_initialize_by(key: properties[:key])
    skill.update! properties
    skill.key
  end

  def delete_serialized_file
    return unless Rails.application.config.levelbuilder_mode
    file_path = Rails.root.join("config/skills/#{key}.json")
    FileUtils.rm_f(file_path)
  end
end
