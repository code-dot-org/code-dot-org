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
  has_and_belongs_to_many :jit_pl_concepts, join_table: :jit_pl_concepts_json_videos
  has_and_belongs_to_many :jit_pl_misconceptions, join_table: :jit_pl_misconceptions_json_videos
  has_and_belongs_to_many :jit_pl_exemplars, join_table: :jit_pl_exemplars_json_videos

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

  def summarize
    {
      id: id,
      key: key,
      description: description,
      audience: audience,
    }
  end

  def file_path
    Rails.root.join("config/json_videos/#{key}.json")
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    FileUtils.mkdir_p(File.dirname(file_path))
    File.write(
      file_path,
      JSON.pretty_generate(
        key: key,
        description: description,
        s3_uri: s3_uri,
        labs: labs || [],
        json_schema_version: json_schema_version,
        audience: audience,
        objective_keys: objectives.map(&:key),
      )
    )
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
