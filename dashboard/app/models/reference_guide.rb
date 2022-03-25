# == Schema Information
#
# Table name: reference_guides
#
#  id                         :bigint           not null, primary key
#  key                        :string(255)      not null
#  course_version_id          :bigint           not null
#  parent_reference_guide_key :string(255)
#  display_name               :string(255)
#  content                    :text(65535)
#  position                   :integer          not null
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#
# Indexes
#
#  index_reference_guides_on_course_version_id_and_key         (course_version_id,key) UNIQUE
#  index_reference_guides_on_course_version_id_and_parent_key  (course_version_id,parent_reference_guide_key)
#
class ReferenceGuide < ApplicationRecord
  include CurriculumHelper

  belongs_to :course_version
  validates_uniqueness_of :key, scope: :course_version_id
  validate :validate_key_format

  def course_offering_version
    "#{course_version.course_offering.key}-#{course_version.key}"
  end

  def children
    ReferenceGuide.where(course_version_id: course_version_id, parent_reference_guide_key: key)
  end

  def serialize
    {
      key: key,
      course_version_key: course_version.key,
      course_offering_key: course_version.course_offering.key,
      parent_reference_guide_key: parent_reference_guide_key,
      display_name: display_name,
      content: content,
      position: position
    }
  end

  # writes reference guide to a seed file in the config directory
  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    file_path = Rails.root.join("config/reference_guides/#{course_offering_version}/#{key}.json")
    object_to_serialize = serialize
    dirname = File.dirname(file_path)
    unless File.directory?(dirname)
      FileUtils.mkdir_p(dirname)
    end
    File.write(file_path, JSON.pretty_generate(object_to_serialize))
  end

  # runs through all seed files, creating and deleting records to match the seed files
  def self.seed_all
    # collect all existing ids
    removed_records = all.pluck(:id)
    Dir.glob(Rails.root.join("config/reference_guides/**/*.json")).each do |path|
      # for each file, seed the reference guide and remove from the original set the found ids
      # (new ids won't change anything)
      removed_records -= [ReferenceGuide.seed_record(path)]
    end
    # the remaining ids that were not seeded should be removed
    where(id: removed_records).destroy_all
  end

  # parses a seed file and generates a hash with the course version mapped
  def self.properties_from_file(content)
    config = JSON.parse(content)
    course_version_id = CourseOffering.find_by(key: config['course_offering_key'])&.
      course_versions&.where(key: config['course_version_key'])&.last&.id
    {
      key: config['key'],
      course_version_id: course_version_id,
      parent_reference_guide_key: config['parent_reference_guide_key'],
      display_name: config['display_name'],
      content: config['content'],
      position: config['position']
    }
  end

  # returns the local id of the reference guide that was created/updated
  def self.seed_record(file_path)
    properties = properties_from_file(File.read(file_path))
    reference_guide = ReferenceGuide.find_or_initialize_by(
      key: properties[:key],
      course_version_id: properties[:course_version_id]
    )
    reference_guide.update! properties
    reference_guide.id
  end

  def summarize_for_show
    {
      display_name: display_name,
      content: content
    }
  end

  def summarize_for_index
    {
      key: key,
      parent_reference_guide_key: parent_reference_guide_key,
      display_name: display_name,
      position: position
    }
  end

  def summarize_for_edit
    {
      key: key,
      course_version_name: course_offering_version,
      parent_reference_guide_key: parent_reference_guide_key,
      display_name: display_name,
      content: content
    }
  end
end
