# == Schema Information
#
# Table name: ai_interaction_feedbacks
#
#  id                  :bigint           not null, primary key
#  user_id             :integer          not null
#  level_id            :integer
#  script_id           :integer
#  thumbs_up           :boolean
#  school_year         :string(255)
#  metadata            :json
#  ai_interaction_type :string(255)      not null
#  ai_interaction_id   :bigint           not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_ai_interaction_feedbacks_on_ai_interaction  (ai_interaction_type,ai_interaction_id)
#
class AiInteractionFeedback < ApplicationRecord
  belongs_to :ai_interaction, polymorphic: true
end
