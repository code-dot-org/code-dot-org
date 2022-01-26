require 'fileutils'

# == Schema Information
#
# Table name: reference_guides
#
#  id                :bigint           not null, primary key
#  display_name      :string(255)
#  key               :string(255)      not null
#  course_version_id :integer          not null
#  content           :text(65535)
#  position          :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
class ReferenceGuide < ApplicationRecord
  belongs_to :course_version

  validates_uniqueness_of :key, scope: :course_version_id

  def serialize
    {
      display_name: display_name,
      key: key,
      course_version_key: course_version.key,
      course_offering_key: course_version.course_offering.key,
      content: content,
      position: position
    }
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    course_key = "#{course_version.course_offering.key}_#{course_version.key}"
    file_path = Rails.root.join("config/reference_guides/#{course_key}/#{key}.json")
    object_to_serialize = serialize
    dirname = File.dirname(file_path)
    unless File.directory?(dirname)
      FileUtils.mkdir_p(dirname)
    end
    File.write(file_path, JSON.pretty_generate(object_to_serialize))
  end

  def self.seed_all
    removed_records = all.pluck(:id)
    Dir.glob(Rails.root.join("config/reference_guides/**/*.json")).each do |path|
      puts path
      removed_records -= [ReferenceGuide.seed_record(path)]
    end
    where(id: removed_records).destroy_all
  end

  def self.properties_from_file(content)
    config = JSON.parse(content)
    course_version_id = CourseOffering.find_by(key: config['course_offering_key']).
      course_versions.where(key: config['course_version_key']).last.id
    {
      display_name: config['display_name'],
      course_version_id: course_version_id,
      key: config['key'],
      content: config['content'],
      position: config['position']
    }
  end

  def self.seed_record(file_path)
    properties = properties_from_file(File.read(file_path))
    reference_guide = ReferenceGuide.find_or_initialize_by(
      key: properties[:key],
      course_version_id: properties[:course_version_id]
    )
    reference_guide.update! properties
    reference_guide.id
  end
end
