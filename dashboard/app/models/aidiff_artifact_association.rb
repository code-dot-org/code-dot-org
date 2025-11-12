# == Schema Information
#
# Table name: aidiff_artifact_associations
#
#  id                 :bigint           not null, primary key
#  association_type   :string(255)      not null
#  aidiff_artifact_id :bigint           not null
#  section_id         :bigint
#  lesson_id          :bigint
#  unit_id            :bigint
#  unit_group_id      :bigint
#
# Indexes
#
#  index_aidiff_artifact_associations_on_aidiff_artifact_id  (aidiff_artifact_id)
#  index_aidiff_artifact_associations_on_lesson_id           (lesson_id)
#  index_aidiff_artifact_associations_on_section_id          (section_id)
#  index_aidiff_artifact_associations_on_unit_group_id       (unit_group_id)
#  index_aidiff_artifact_associations_on_unit_id             (unit_id)
#
class AidiffArtifactAssociation < ApplicationRecord
  belongs_to :aidiff_artifact
  belongs_to :section, optional: true
  belongs_to :lesson, optional: true
  belongs_to :unit, optional: true
  belongs_to :unit_group, optional: true

  validates :association_type, inclusion: {in: SharedConstants::AI_DIFF_ASSOCIATION.values}

  def summarize
    summary = {
      id: id,
      association_type: association_type
    }
    case association_type
    when SharedConstants::AI_DIFF_ASSOCIATION[:LESSON]
      summary[:lesson_id] = lesson_id
    when SharedConstants::AI_DIFF_ASSOCIATION[:UNIT]
      summary[:unit_id] = unit_id
    when SharedConstants::AI_DIFF_ASSOCIATION[:COURSE]
      summary[:unit_group_id] = unit_group_id
    when SharedConstants::AI_DIFF_ASSOCIATION[:SECTION]
      summary[:section_id] = section_id
    end

    summary
  end

end
