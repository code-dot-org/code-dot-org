# == Schema Information
#
# Table name: programming_environments
#
#  id         :bigint           not null, primary key
#  name       :string(255)      not null
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  published  :boolean          default(FALSE), not null
#
# Indexes
#
#  index_programming_environments_on_name  (name) UNIQUE
#
class ProgrammingEnvironment < ApplicationRecord
  include SerializedProperties
  include Rails.application.routes.url_helpers

  NAME_CHAR_RE = /[a-z0-9\-]/
  NAME_RE = /\A#{NAME_CHAR_RE}+\Z/
  validates_format_of :name, with: NAME_RE, message: "must contain only lowercase alphanumeric characters and dashes; got \"%{value}\"."

  validates_uniqueness_of :name, case_sensitive: false

  alias_attribute :categories, :programming_environment_categories
  has_many :programming_environment_categories, -> {order(:position)}, dependent: :destroy
  has_many :programming_expressions, dependent: :destroy

  after_destroy :remove_serialization

  # @attr [String] editor_language - Type of editor one of the following: 'text-based', 'droplet', 'blockly'
  serialized_attrs %w(
    editor_language
    block_pool_name
    title
    description
    image_url
    project_url
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

  def file_path
    Rails.root.join("config/programming_environments/#{name.parameterize}.json")
  end

  def serialize
    env_hash = {name: name, published: published}.merge(properties.sort.to_h)
    env_hash.merge(categories: programming_environment_categories.map(&:serialize))
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode

    File.write(file_path, JSON.pretty_generate(serialize))
  end

  def remove_serialization
    return unless Rails.application.config.levelbuilder_mode

    File.delete(file_path) if File.exist?(file_path)
  end

  def summarize_for_lesson_edit
    {id: id, name: name}
  end

  def summarize_for_edit
    {
      name: name,
      title: title,
      published: published,
      imageUrl: image_url,
      projectUrl: project_url,
      description: description,
      editorLanguage: editor_language,
      blockPoolName: block_pool_name,
      categories: categories.map(&:serialize_for_edit),
      showPath: programming_environment_path(name)
    }
  end

  def summarize_for_show
    {
      title: title,
      description: description,
      projectUrl: project_url,
      categories: categories.select {|c| c.programming_expressions.count > 0}.map(&:summarize_for_environment_show)
    }
  end

  def summarize_for_index
    {
      name: name,
      title: title,
      imageUrl: image_url,
      description: description,
      showPath: programming_environment_path(name)
    }
  end
end
