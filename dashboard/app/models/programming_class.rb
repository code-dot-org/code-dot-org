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

  belongs_to :programming_environment
  belongs_to :programming_environment_category
  has_many :programming_methods, -> {order(:position)}, dependent: :destroy

  validates_uniqueness_of :key, scope: :programming_environment_id, case_sensitive: false
  validate :validate_key_format

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
    FileUtils.mkdir_p(directory_name) unless File.exist?(directory_name)
    File.write(file_path, JSON.pretty_generate(object_to_serialize))
  end

  def remove_serialization
    return unless Rails.application.config.levelbuilder_mode
    File.delete(file_path) if File.exist?(file_path)
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
      categoryKey: programming_environment_category&.key || ''
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
      category: programming_environment_category&.name || ''
    }
  end

  def summarize_for_navigation
    {
      key: key,
      name: name,
      syntax: syntax,
      link: "/programming_classes/#{id}"
    }
  end

  private

  def parsed_examples
    examples.blank? ? [] : JSON.parse(examples)
  end

  def parsed_fields
    fields.blank? ? [] : JSON.parse(fields)
  end
end
