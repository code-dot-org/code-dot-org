# == Schema Information
#
# Table name: ai_tutor_interactions
#
#  id                 :bigint           not null, primary key
#  user_id            :integer          not null
#  level_id           :integer
#  script_id          :integer
#  ai_model_version   :string(255)
#  type               :string(255)
#  project_id         :string(255)
#  project_version_id :string(255)
#  prompt             :text(16777215)
#  status             :string(255)
#  ai_response        :text(16777215)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_ai_tutor_interactions_on_level_id   (level_id)
#  index_ai_tutor_interactions_on_script_id  (script_id)
#  index_ai_tutor_interactions_on_user_id    (user_id)
#  index_ati_user_level_script               (user_id,level_id,script_id)
#
class AiTutorInteraction < ApplicationRecord
  self.inheritance_column = nil

  belongs_to :user
  belongs_to :level, optional: true
  belongs_to :script, optional: true
  validates :type, inclusion: {in: SharedConstants::AI_TUTOR_TYPES.values}
  validates :status, inclusion: {in: SharedConstants::AI_TUTOR_INTERACTION_STATUS.values}
  has_many :feedbacks, class_name: 'AiTutorInteractionFeedback', dependent: :destroy
end
