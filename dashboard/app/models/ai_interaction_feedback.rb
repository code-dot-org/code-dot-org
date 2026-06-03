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
  export_to_analytics

  data_classification(
    id: :public,
    user_id: :public,
    level_id: :public,
    script_id: :public,
    thumbs_up: :public,
    school_year: :restricted,
    metadata: :restricted,
    ai_interaction_type: :restricted,
    ai_interaction_id: :public,
    created_at: :public,
    updated_at: :public,
  )

  belongs_to :ai_interaction, polymorphic: true
end
