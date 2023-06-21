# == Schema Information
#
# Table name: programming_classes
#
#  id                                  :bigint           not null, primary key
#  programming_environment_id          :integer
#  programming_environment_category_id :integer
#  key                                 :string(255)
#  name                                :string(255)
#  content                             :text(65535)
#  fields                              :text(65535)
#  examples                            :text(65535)
#  tips                                :text(65535)
#  syntax                              :string(255)
#  external_documentation              :string(255)
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#
# Indexes
#
#  index_programming_classes_on_key_and_category_id                 (key,programming_environment_category_id) UNIQUE
#  index_programming_classes_on_key_and_programming_environment_id  (key,programming_environment_id) UNIQUE
#
class ProgrammingClass < ApplicationRecord
  include CurriculumHelper
  include Rails.application.routes.url_helpers

  belongs_to :programming_environment, optional: true
  belongs_to :programming_environment_category, optional: true
  has_many :programming_methods, -> {order(:position)}, dependent: :destroy

  validates_uniqueness_of :key, scope: :programming_environment_id, case_sensitive: false
  validate :validate_key_format

  after_destroy :remove_serialization

  def self.properties_from_file(path, content)
    expression_config = JSON.parse(content)

    environment_name = File.basename(File.dirname(path))
    programming_environment = ProgrammingEnvironment.find_by(name: environment_name)
    throw "Cannot find ProgrammingEnvironment #{environment_name}" unless programming_environment
    env_category = programming_environment.categories.find_by_key(expression_config['category_key'])
    expression_config.symbolize_keys.except(:category_key).merge(
      {
        programming_environment_id: programming_environment.id,
        programming_environment_category_id: env_category&.id
      }
    )
  end

  def self.seed_all
    removed_records = all.pluck(:id)
    Dir.glob(Rails.root.join("config/programming_classes/**/*.json")).each do |path|
      removed_records -= [ProgrammingClass.seed_record(path)]
    end
    where(id: removed_records).destroy_all
  end

  def self.seed_record(file_path)
    properties = properties_from_file(file_path, File.read(file_path))
    programming_class = ProgrammingClass.find_or_initialize_by(key: properties[:key], programming_environment_id: properties[:programming_environment_id])
    programming_class.assign_attributes(properties.except(:methods))
    programming_class.save! if programming_class.changed?
    # Now iterate through the method configs and create/update those entries
    programming_class.programming_methods =
      properties[:methods].map do |method_config|
        method = ProgrammingMethod.find_or_initialize_by(programming_class_id: programming_class.id, key: method_config['key'])
        method.seed_in_progress = true
        method.update!(method_config)
        method
      end
    programming_class.id
  end

  def file_path
    Rails.root.join("config/programming_classes/#{programming_environment.name}/#{key.parameterize(preserve_case: false)}.json")
  end

  def serialize
    serialization = {
      category_key: programming_environment_category&.key
    }.merge(attributes.except('id', 'programming_environment_id', 'programming_environment_category_id', 'created_at', 'updated_at').sort.to_h)
    serialization[:methods] = programming_methods.map(&:serialize)
    serialization
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    object_to_serialize = serialize
    directory_name = File.dirname(file_path)
    FileUtils.mkdir_p(directory_name)
    File.write(file_path, JSON.pretty_generate(object_to_serialize))
  end

  def remove_serialization
    return unless Rails.application.config.levelbuilder_mode
    FileUtils.rm_f(file_path)
  end

  def summarize_for_edit
    {
      id: id,
      key: key,
      name: name || '',
      content: content || '',
      examples: parsed_examples,
      fields: parsed_fields,
      methods: programming_methods,
      tips: tips || '',
      syntax: syntax || '',
      externalDocumentation: external_documentation || '',
      categoryKey: programming_environment_category&.key || '',
      showUrl: programming_environment_programming_class_path(programming_environment.name, key)
    }
  end

  def summarize_for_all_code_docs
    {
      id: id,
      key: key,
      name: name,
      environmentId: programming_environment.id,
      environmentTitle: programming_environment.title,
      categoryName: programming_environment_category&.name,
      editPath: edit_programming_class_url(self)
    }
  end

  def summarize_for_show
    {
      id: id,
      key: key,
      name: name,
      content: content,
      examples: parsed_examples,
      fields: parsed_fields,
      tips: tips,
      syntax: syntax,
      externalDocumentation: external_documentation,
      categoryKey: programming_environment_category&.key || '',
      color: programming_environment_category&.color || '',
      category: programming_environment_category&.name || '',
      methods: summarize_programming_methods
    }
  end

  def summarize_for_navigation
    {
      key: key,
      name: name,
      syntax: syntax,
      link: programming_environment_programming_class_path(programming_environment.name, key)
    }
  end

  def summarize_programming_methods
    # Create a list of the top level programming methods, i.e. the
    # ones without overload_of set
    methods = []
    programming_methods.each do |m|
      next if m.overload_of.present?
      methods += [m.summarize_for_show]
    end
    methods
  end

  def self.get_from_cache(programming_environment_name, key)
    cache_key = "programming_class/#{programming_environment_name}/#{key}"
    Rails.cache.fetch(cache_key, force: !Unit.should_cache?) do
      env = ProgrammingEnvironment.find_by_name(programming_environment_name)
      ProgrammingClass.includes([:programming_environment, :programming_environment_category, :programming_methods]).find_by(programming_environment_id: env.id, key: key)
    end
  end

  private def parsed_examples
    examples.blank? ? [] : JSON.parse(examples)
  end

  private def parsed_fields
    fields.blank? ? [] : JSON.parse(fields)
  end
end
