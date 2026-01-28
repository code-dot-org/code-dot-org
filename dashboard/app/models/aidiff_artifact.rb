# == Schema Information
#
# Table name: aidiff_artifacts
#
#  id               :bigint           not null, primary key
#  type             :string(255)
#  content          :json
#  title            :string(255)
#  aidiff_thread_id :bigint           not null
#  user_id          :bigint           not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_aidiff_artifacts_on_aidiff_thread_id  (aidiff_thread_id)
#  index_aidiff_artifacts_on_user_id           (user_id)
#
class AidiffArtifact < ApplicationRecord
  belongs_to :aidiff_thread
  belongs_to :user
  has_many :aidiff_artifact_associations, dependent: :destroy
  has_many :lessons, through: :aidiff_artifact_associations
  has_many :units, through: :aidiff_artifact_associations
  has_many :unit_groups, through: :aidiff_artifact_associations
  has_many :sections, through: :aidiff_artifact_associations

  accepts_nested_attributes_for :aidiff_artifact_associations, allow_destroy: true

  def summarize
    {
      id: id,
      title: title,
      updated_at: updated_at,
      type: type,
      content: content,
      aidiff_artifact_associations: aidiff_artifact_associations&.map(&:summarize),
      # TODO: make specific to artifact type (e.g. exit ticket vs lesson hook)
      url: "/aidiff_artifacts/#{id}"
    }
  end

  def summarize_with_associations
    summarize.merge(
      {
        lessons: lessons&.map(&:summarize_for_rubric_edit),
        units: units&.map(&:summarize_for_rollup),
        courses: unit_groups&.map(&:summarize_short),
        sections: sections&.map(&:summarize_for_participant),
      }
    )
  end
end
