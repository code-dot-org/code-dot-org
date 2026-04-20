# == Schema Information
#
# Table name: json_videos
#
#  id                  :bigint           not null, primary key
#  key                 :string(255)      not null
#  description         :text(65535)
#  s3_uri              :string(255)      not null
#  labs                :json
#  json_schema_version :integer          not null
#  audience            :string(255)      not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_json_videos_on_key  (key) UNIQUE
#

class JSONVideo < ApplicationRecord
  has_and_belongs_to_many :objectives, join_table: :json_video_objectives

  validates :key, presence: true, uniqueness: true
  validates :s3_uri, presence: true
  validates :json_schema_version, presence: true
  validates :audience, presence: true

  def self.seed_all(root_dir: Rails.root, glob: "config/json_videos/*.json")
    Dir.glob(root_dir.join(glob)).each do |path|
      seed_record(path)
    rescue => exception
      CDO.log.error "Failed to seed json video #{path}: #{exception.message}"
    end
  end

  def self.properties_from_file(content)
    JSON.parse(content).symbolize_keys
  end

  def self.seed_record(file_path)
    properties = properties_from_file(File.read(file_path))
    objective_keys = Array(properties.delete(:objective_keys))

    video = find_or_initialize_by(key: properties[:key])
    video.update!(properties)

    video.objectives = Objective.where(key: objective_keys)

    video.key
  end
end
