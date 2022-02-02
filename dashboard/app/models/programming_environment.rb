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

  validates_uniqueness_of :name, case_sensitive: false

  alias_attribute :categories, :programming_environment_categories
  has_many :programming_environment_categories, dependent: :destroy
  has_many :programming_expressions, dependent: :destroy

  # @attr [String] editor_type - Type of editor one of the following: 'text-based', 'droplet', 'blockly'
  serialized_attrs %w(
    editor_type
    block_pool_name
    title
    description
    image_url
  )

  def self.properties_from_file(content)
    environment_config = JSON.parse(content)
    environment_config.symbolize_keys
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
    environment.update! properties.except(:categories)
    environment.categories = properties[:categories].map do |category_config|
      category = ProgrammingEnvironmentCategory.find_or_initialize_by(programming_environment_id: environment.id, key: category_config['key'])
      category.update! category_config
      category
    end
    environment.name
  end

  def serialize
    env_hash = {name: name}.merge(properties.sort.to_h)
    env_hash.merge(categories: programming_environment_categories.map(&:serialize))
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode

    file_path = Rails.root.join("config/programming_environments/#{name.parameterize}.json")
    File.write(file_path, JSON.pretty_generate(serialize))
  end

  def summarize_for_lesson_edit
    {id: id, name: name}
  end

  def summarize_for_edit
    {
      name: name,
      title: title,
      imageUrl: image_url,
      description: description,
      editorType: editor_type,
      categories: categories
    }
  end

  def category_options
    programming_expressions.pluck(:category).uniq
  end
end
