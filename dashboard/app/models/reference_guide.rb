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

  validates_uniqueness_of :slug, scope: :course_version_id

  def serialize
    {
      id: id,
      name: name,
      slug: slug,
      course_version_id: course_version_id,
      content: content,
      order: order
    }
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    file_path = Rails.root.join("config/reference_guides/#{slug}.json")
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
    {
      id: config['id'],
      name: config['name'],
      course_version_id: config['course_version_id'],
      slug: config['slug'],
      content: config['content'],
      order: config['order']
    }
  end

  def self.seed_record(file_path)
    properties = properties_from_file(File.read(file_path))
    environment = ReferenceGuide.find_or_initialize_by(id: properties[:id])
    environment.update! properties
    environment.id
  end
end
