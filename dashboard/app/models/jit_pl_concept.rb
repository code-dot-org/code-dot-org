# == Schema Information
#
# Table name: jit_pl_concepts
#
#  id           :bigint           not null, primary key
#  name         :string(255)
#  display_name :string(255)
#  properties   :text(65535)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
class JitPlConcept < ApplicationRecord
  include SerializedProperties

  has_many :jit_pl_exemplars, dependent: :destroy
  has_many :jit_pl_misconceptions, dependent: :destroy
  has_and_belongs_to_many :resources, join_table: :jit_pl_concepts_resources
  has_and_belongs_to_many :lessons, join_table: :jit_pl_concepts_lessons
  has_and_belongs_to_many :rubrics, join_table: :jit_pl_concepts_rubrics

  validates_uniqueness_of :name, case_sensitive: false

  serialized_attrs %w(
    text_content
  )

  def serialize
    {
      id: id,
      name: name,
      display_name: display_name,
      text_content: text_content,
      resources: resources.map(&:summarize_for_lesson_edit),
      misconceptions: jit_pl_misconceptions.map(&:serialize),
    }
  end

  def file_path
    Rails.root.join("config/jit_pl_concepts/#{name}.json")
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    FileUtils.mkdir_p(File.dirname(file_path))
    File.write(file_path, JSON.pretty_generate({
                                                 name: name,
                                                 display_name: display_name,
                                                 text_content: text_content,
                                                 resources: resources.map {|r| {key: r.key, name: r.name, url: r.url, properties: r.properties.sort.to_h}},
                                                 jit_pl_concepts_resources: resources.map {|r| {seeding_key: {'concept.name' => name, 'resource.key' => r.key}}},
                                                 misconceptions: jit_pl_misconceptions.map do |m|
                                                   {
                                                     name: m.name,
                                                     text_content: m.text_content,
                                                     resources: m.resources.map {|r| {key: r.key, name: r.name, url: r.url, properties: r.properties.sort.to_h}},
                                                     jit_pl_misconceptions_resources: m.resources.map {|r| {seeding_key: {'misconception.name' => m.name, 'resource.key' => r.key}}},
                                                   }
                                                 end,
                                               }
                                              )
    )
  end

  def remove_serialization
    return unless Rails.application.config.levelbuilder_mode
    FileUtils.rm_f(file_path)
  end

  def self.seed_all(dashboard_root = '.')
    records_to_be_removed = all.pluck(:id)
    Dir.glob(Rails.root.join("#{dashboard_root}/config/jit_pl_concepts/**/*.json")).each do |path|
      records_to_be_removed -= [JitPlConcept.seed_record(path)]
    end
    where(id: records_to_be_removed).destroy_all
  end

  def self.properties_from_file(content)
    config = JSON.parse(content)
    {
      name: config['name'],
      display_name: config['display_name'],
      text_content: config['text_content'],
      resources: config['resources'] || [],
      jit_pl_concepts_resources: config['jit_pl_concepts_resources'] || [],
      misconceptions: config['misconceptions'] || [],
    }
  end

  def self.jit_pl_course_version
    UnitGroup.find_by(name: 'just-in-time-pl')&.course_version
  end

  def self.seed_record(file_path)
    properties = properties_from_file(File.read(file_path))
    concept = JitPlConcept.find_or_initialize_by(name: properties[:name])
    concept.update! properties.slice(:name, :display_name, :text_content)

    jit_pl_course_version = self.jit_pl_course_version
    properties[:resources].each do |resource_data|
      resource = Resource.find_or_initialize_by(key: resource_data['key'], course_version: jit_pl_course_version)
      resource.update!(name: resource_data['name'], url: resource_data['url'], properties: resource_data['properties'])
    end

    resource_keys = properties[:jit_pl_concepts_resources].map {|r| r['seeding_key']['resource.key']}
    concept.resources = Resource.where(key: resource_keys, course_version: jit_pl_course_version)

    seeded_misconception_names = []
    properties[:misconceptions].each do |m_data|
      misconception = JitPlMisconception.find_or_initialize_by(name: m_data['name'], jit_pl_concept: concept)
      misconception.update!(text_content: m_data['text_content'])
      seeded_misconception_names << m_data['name']

      (m_data['resources'] || []).each do |resource_data|
        resource = Resource.find_or_initialize_by(key: resource_data['key'], course_version: jit_pl_course_version)
        resource.update!(name: resource_data['name'], url: resource_data['url'], properties: resource_data['properties'])
      end

      m_resource_keys = (m_data['jit_pl_misconceptions_resources'] || []).map {|r| r['seeding_key']['resource.key']}
      misconception.resources = Resource.where(key: m_resource_keys, course_version: jit_pl_course_version)
    end

    concept.jit_pl_misconceptions.where.not(name: seeded_misconception_names).destroy_all

    concept.id
  end
end
